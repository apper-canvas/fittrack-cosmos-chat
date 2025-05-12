import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import getIcon from '../utils/iconUtils';
import classScheduleService from '../services/classScheduleService';
import { setClassSchedules, setLoading, setError, addClassSchedule, updateClassSchedule, deleteClassSchedule } from '../store/slices/classSchedulesSlice';

export default function Schedule() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newClass, setNewClass] = useState({
    Name: '',
    className: '',
    instructor: '',
    startTime: '',
    endTime: '',
    capacity: 10
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { classSchedules, isLoading, error } = useSelector(state => state.classSchedules);
  
  const CalendarPlusIcon = getIcon('CalendarPlus');
  const RefreshIcon = getIcon('RefreshCw');
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash');
  const XIcon = getIcon('X');
  const CalendarIcon = getIcon('Calendar');
  const UsersIcon = getIcon('Users');
  const ClockIcon = getIcon('Clock');
  
  useEffect(() => {
    const fetchClassSchedules = async () => {
      dispatch(setLoading(true));
      try {
        const data = await classScheduleService.fetchClassSchedules();
        dispatch(setClassSchedules(data));
      } catch (error) {
        console.error("Failed to fetch class schedules:", error);
        dispatch(setError("Failed to fetch class schedules. Please try again."));
        toast.error("Failed to fetch class schedules. Please try again.");
      }
    };
    
    fetchClassSchedules();
  }, [dispatch]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass({
      ...newClass,
      [name]: value
    });
    
    // Clear error for this field when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!newClass.className.trim()) {
      errors.className = 'Class name is required';
    }
    
    if (!newClass.instructor.trim()) {
      errors.instructor = 'Instructor name is required';
    }
    
    if (!newClass.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!newClass.endTime) {
      errors.endTime = 'End time is required';
    } else if (newClass.startTime && new Date(newClass.endTime) <= new Date(newClass.startTime)) {
      errors.endTime = 'End time must be after start time';
    }
    
    if (!newClass.capacity || newClass.capacity <= 0) {
      errors.capacity = 'Capacity must be greater than zero';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      // Format class data
      const classData = {
        ...newClass,
        Name: newClass.className
      };
      
      if (editMode && selectedClass) {
        // Update existing class
        const updatedClass = await classScheduleService.updateClassSchedule({
          ...classData,
          Id: selectedClass.Id
        });
        dispatch(updateClassSchedule(updatedClass));
        toast.success('Class updated successfully!');
      } else {
        // Create new class
        const createdClass = await classScheduleService.createClassSchedule(classData);
        dispatch(addClassSchedule(createdClass));
        toast.success('Class scheduled successfully!');
      }
      
      // Reset form and close modal
      setNewClass({
        Name: '',
        className: '',
        instructor: '',
        startTime: '',
        endTime: '',
        capacity: 10
      });
      setShowAddModal(false);
      setEditMode(false);
      setSelectedClass(null);
    } catch (error) {
      console.error("Failed to save class:", error);
      toast.error("Failed to save class. Please try again.");
    }
  };
  
  const handleEdit = (classSchedule) => {
    setSelectedClass(classSchedule);
    setNewClass({
      Name: classSchedule.Name,
      className: classSchedule.className || classSchedule.Name,
      instructor: classSchedule.instructor || '',
      startTime: classSchedule.startTime ? format(new Date(classSchedule.startTime), "yyyy-MM-dd'T'HH:mm") : '',
      endTime: classSchedule.endTime ? format(new Date(classSchedule.endTime), "yyyy-MM-dd'T'HH:mm") : '',
      capacity: classSchedule.capacity || 10
    });
    setEditMode(true);
    setShowAddModal(true);
  };
  
  const handleDelete = (classSchedule) => {
    setSelectedClass(classSchedule);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedClass) return;
    
    try {
      await classScheduleService.deleteClassSchedule(selectedClass.Id);
      dispatch(deleteClassSchedule(selectedClass.Id));
      toast.success(`Class "${selectedClass.className || selectedClass.Name}" has been deleted.`);
    } catch (error) {
      console.error("Failed to delete class:", error);
      toast.error("Failed to delete class. Please try again.");
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedClass(null);
    }
  };
  
  const refreshSchedule = async () => {
    dispatch(setLoading(true));
    try {
      const data = await classScheduleService.fetchClassSchedules();
      dispatch(setClassSchedules(data));
      toast.success("Class schedule refreshed!");
    } catch (error) {
      console.error("Failed to refresh class schedules:", error);
      dispatch(setError("Failed to refresh class schedules. Please try again."));
      toast.error("Failed to refresh class schedules. Please try again.");
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not set';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateTimeString;
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Class Schedule
          </h1>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditMode(false);
                setSelectedClass(null);
                setNewClass({
                  Name: '',
                  className: '',
                  instructor: '',
                  startTime: '',
                  endTime: '',
                  capacity: 10
                });
                setShowAddModal(true);
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg transition-colors hover:bg-primary-dark"
            >
              <CalendarPlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Class</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshSchedule}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg transition-colors hover:bg-surface-200 dark:hover:bg-surface-600 disabled:opacity-70"
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : classSchedules.length > 0 ? (
            classSchedules.map((classSchedule) => (
              <motion.div
                key={classSchedule.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:border-primary transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    {classSchedule.className || classSchedule.Name}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(classSchedule)}
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                      title="Edit"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(classSchedule)}
                      className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-surface-500 mr-2" />
                    <span className="text-surface-700 dark:text-surface-300">
                      {classSchedule.instructor || 'No instructor assigned'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-surface-500 mr-2" />
                    <span className="text-surface-700 dark:text-surface-300">
                      {formatDateTime(classSchedule.startTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-surface-500 mr-2" />
                    <span className="text-surface-700 dark:text-surface-300">
                      {formatDateTime(classSchedule.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-surface-200 dark:border-surface-700">
                    <span className="text-sm text-surface-600 dark:text-surface-400">
                      Capacity:
                    </span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {classSchedule.capacity} spots
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 card p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-surface-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No Classes Scheduled</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6">Get started by adding a new class to the schedule.</p>
              <button
                onClick={() => {
                  setEditMode(false);
                  setSelectedClass(null);
                  setNewClass({
                    Name: '',
                    className: '',
                    instructor: '',
                    startTime: '',
                    endTime: '',
                    capacity: 10
                  });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Add First Class
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Class Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-lg shadow-lg max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-surface-900 dark:text-white">
                  {editMode ? 'Edit Class' : 'Add New Class'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700 transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Class Name*
                  </label>
                  <input
                    type="text"
                    id="className"
                    name="className"
                    value={newClass.className}
                    onChange={handleInputChange}
                    className={`input ${formErrors.className ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Yoga, Spinning, etc."
                  />
                  {formErrors.className && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.className}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="instructor" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Instructor*
                  </label>
                  <input
                    type="text"
                    id="instructor"
                    name="instructor"
                    value={newClass.instructor}
                    onChange={handleInputChange}
                    className={`input ${formErrors.instructor ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Instructor name"
                  />
                  {formErrors.instructor && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.instructor}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Start Time*
                    </label>
                    <input
                      type="datetime-local"
                      id="startTime"
                      name="startTime"
                      value={newClass.startTime}
                      onChange={handleInputChange}
                      className={`input ${formErrors.startTime ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {formErrors.startTime && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.startTime}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      End Time*
                    </label>
                    <input
                      type="datetime-local"
                      id="endTime"
                      name="endTime"
                      value={newClass.endTime}
                      onChange={handleInputChange}
                      className={`input ${formErrors.endTime ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {formErrors.endTime && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.endTime}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Capacity*
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={newClass.capacity}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className={`input ${formErrors.capacity ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {formErrors.capacity && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.capacity}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <CalendarPlusIcon className="h-4 w-4" />
                    <span>{editMode ? 'Update Class' : 'Schedule Class'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirmation && selectedClass && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-surface-800 rounded-lg shadow-lg max-w-md w-full p-6"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-4 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                  <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-surface-900 dark:text-white">
                  Confirm Deletion
                </h3>
                <p className="text-surface-600 dark:text-surface-400 mt-2">
                  Are you sure you want to delete <span className="font-medium">{selectedClass.className || selectedClass.Name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 mt-5">
                <button
                  className="flex-1 px-4 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}