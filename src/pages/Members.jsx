import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import memberService from '../services/memberService';
import { setMembers, setLoading, setError, addMember, updateMember, deleteMember } from '../store/slices/membersSlice';

export default function Members() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showCheckInConfirmation, setShowCheckInConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipType: 'standard',
    emergencyContact: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { members, isLoading, error } = useSelector(state => state.members);
  
  const SearchIcon = getIcon('Search');
  const UserPlusIcon = getIcon('UserPlus');
  const CheckIcon = getIcon('CheckCircle');
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash');
  const XIcon = getIcon('X');
  const RefreshIcon = getIcon('RefreshCw');
  
  useEffect(() => {
    const fetchMembersData = async () => {
      dispatch(setLoading(true));
      try {
        const data = await memberService.fetchMembers();
        dispatch(setMembers(data));
      } catch (error) {
        console.error("Failed to fetch members:", error);
        dispatch(setError("Failed to fetch members. Please try again."));
        toast.error("Failed to fetch members. Please try again.");
      }
    };
    
    fetchMembersData();
  }, [dispatch]);
  
  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCheckIn = (member) => {
    setSelectedMember(member);
    setShowCheckInConfirmation(true);
  };
  
  const confirmCheckIn = async () => {
    if (!selectedMember) return;
    
    try {
      const updatedMember = await memberService.checkInMember(selectedMember.Id);
      dispatch(updateMember(updatedMember));
      toast.success(`${selectedMember.firstName} ${selectedMember.lastName} has been checked in!`);
    } catch (error) {
      console.error("Failed to check in member:", error);
      toast.error("Failed to check in member. Please try again.");
    } finally {
      setShowCheckInConfirmation(false);
      setSelectedMember(null);
    }
  };
  
  const handleDelete = (member) => {
    setSelectedMember(member);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    try {
      await memberService.deleteMember(selectedMember.Id);
      dispatch(deleteMember(selectedMember.Id));
      toast.success(`${selectedMember.firstName} ${selectedMember.lastName} has been deleted.`);
    } catch (error) {
      console.error("Failed to delete member:", error);
      toast.error("Failed to delete member. Please try again.");
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedMember(null);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember({
      ...newMember,
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
    
    if (!newMember.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!newMember.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!newMember.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(newMember.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!newMember.phone.trim()) {
      errors.phone = 'Phone number is required';
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
      // Calculate expiry date (1 year from now)
      const today = new Date();
      const expiryDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
      
      // Create member data object
      const memberData = {
        Name: `${newMember.firstName} ${newMember.lastName}`,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        email: newMember.email,
        phone: newMember.phone,
        membershipType: newMember.membershipType,
        emergencyContact: newMember.emergencyContact,
        checkedIn: false,
        expiryDate
      };
      
      const createdMember = await memberService.createMember(memberData);
      dispatch(addMember(createdMember));
      
      // Reset form and close modal
      setNewMember({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        membershipType: 'standard',
        emergencyContact: ''
      });
      setShowAddModal(false);
      
      toast.success('New member registered successfully!');
    } catch (error) {
      console.error("Failed to create member:", error);
      toast.error("Failed to register member. Please try again.");
    }
  };
  
  const refreshData = async () => {
    dispatch(setLoading(true));
    try {
      const data = await memberService.fetchMembers();
      dispatch(setMembers(data));
      toast.success("Members data refreshed!");
    } catch (error) {
      console.error("Failed to refresh members:", error);
      dispatch(setError("Failed to refresh members. Please try again."));
      toast.error("Failed to refresh members. Please try again.");
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Members
          </h1>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg transition-colors hover:bg-primary-dark"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Member</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg transition-colors hover:bg-surface-200 dark:hover:bg-surface-600 disabled:opacity-70"
            >
              <RefreshIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-surface-400" />
          </div>
          <input
            type="text"
            placeholder="Search members by name or email..."
            className="pl-10 input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Membership</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.Id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-surface-900 dark:text-white">
                            {member.firstName} {member.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-surface-600 dark:text-surface-400">
                          {member.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.checkedIn 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300'
                          }`}>
                            {member.checkedIn ? 'Checked In' : 'Not Checked In'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.membershipType === 'premium' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {member.membershipType === 'premium' ? 'Premium' : 'Standard'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-surface-500 dark:text-surface-400">
                          {member.expiryDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleCheckIn(member)}
                              disabled={member.checkedIn}
                              className={`p-1 rounded-full transition-colors ${
                                member.checkedIn
                                  ? 'text-surface-400 cursor-not-allowed'
                                  : 'text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30'
                              }`}
                              title={member.checkedIn ? 'Already Checked In' : 'Check In'}
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <Link
                              to={`/members/${member.Id}`}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                              title="Edit"
                            >
                              <EditIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-surface-500 dark:text-surface-400">
                        {searchQuery ? 'No members found matching your search.' : 'No members found. Add members to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Check-in confirmation modal */}
      <AnimatePresence>
        {showCheckInConfirmation && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-surface-800 rounded-lg shadow-lg max-w-md w-full p-6"
            >
              <div className="text-center mb-4">
                <div className="mx-auto mb-4 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20">
                  <CheckIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-surface-900 dark:text-white">
                  Confirm Check-In
                </h3>
                <p className="text-surface-600 dark:text-surface-400 mt-2">
                  Are you sure you want to check in <span className="font-medium">{selectedMember.firstName} {selectedMember.lastName}</span>?
                </p>
              </div>
              <div className="flex space-x-3 mt-5">
                <button
                  className="flex-1 px-4 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  onClick={() => setShowCheckInConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  onClick={confirmCheckIn}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirmation && selectedMember && (
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
                  Are you sure you want to delete <span className="font-medium">{selectedMember.firstName} {selectedMember.lastName}</span>? This action cannot be undone.
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
      
      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-surface-800 rounded-lg shadow-lg max-w-2xl w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-surface-900 dark:text-white">
                  Add New Member
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700 transition-colors"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newMember.firstName}
                      onChange={handleInputChange}
                      className={`input ${formErrors.firstName ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="Enter first name"
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newMember.lastName}
                      onChange={handleInputChange}
                      className={`input ${formErrors.lastName ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="Enter last name"
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newMember.email}
                      onChange={handleInputChange}
                      className={`input ${formErrors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={newMember.phone}
                      onChange={handleInputChange}
                      className={`input ${formErrors.phone ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="Enter phone number"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="membershipType" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Membership Type
                  </label>
                  <select
                    id="membershipType"
                    name="membershipType"
                    value={newMember.membershipType}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={newMember.emergencyContact}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Name and phone number of emergency contact"
                  />
                </div>
                
                <div className="flex justify-end pt-2">
                  <div className="flex space-x-3">
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
                      <UserPlusIcon className="h-4 w-4" />
                      <span>Add Member</span>
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}