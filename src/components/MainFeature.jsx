import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';

export default function MainFeature() {
  const [viewMode, setViewMode] = useState('checkin'); // 'checkin' or 'register'
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Form states for new member registration
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipType: 'standard',
    emergencyContact: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Icon declarations
  const SearchIcon = getIcon('Search');
  const CheckIcon = getIcon('CheckCircle');
  const UserPlusIcon = getIcon('UserPlus');
  const UsersIcon = getIcon('Users');
  const XIcon = getIcon('X');
  const EditIcon = getIcon('Edit');
  const SaveIcon = getIcon('Save');
  const ArrowRightIcon = getIcon('ArrowRight');
  
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setMembers([
        { id: 1, firstName: 'John', lastName: 'Doe', checkedIn: false, membershipType: 'premium', expiryDate: '2024-06-15' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', checkedIn: true, membershipType: 'standard', expiryDate: '2024-04-22' },
        { id: 3, firstName: 'Michael', lastName: 'Johnson', checkedIn: false, membershipType: 'premium', expiryDate: '2024-05-10' },
        { id: 4, firstName: 'Emily', lastName: 'Davis', checkedIn: false, membershipType: 'standard', expiryDate: '2024-03-30' },
        { id: 5, firstName: 'Robert', lastName: 'Brown', checkedIn: true, membershipType: 'premium', expiryDate: '2024-07-05' },
        { id: 6, firstName: 'Sarah', lastName: 'Wilson', checkedIn: false, membershipType: 'standard', expiryDate: '2024-05-18' },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredMembers = members.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCheckIn = (member) => {
    setSelectedMember(member);
    setShowConfirmation(true);
  };

  const confirmCheckIn = () => {
    if (!selectedMember) return;
    
    // Update the member's check-in status
    const updatedMembers = members.map(m => 
      m.id === selectedMember.id ? { ...m, checkedIn: true } : m
    );
    
    setMembers(updatedMembers);
    setShowConfirmation(false);
    setSelectedMember(null);
    
    toast.success(`${selectedMember.firstName} ${selectedMember.lastName} has been checked in!`);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    // Generate random ID for the new member
    const newId = Math.max(...members.map(m => m.id), 0) + 1;
    
    // Calculate expiry date (1 year from now)
    const today = new Date();
    const expiryDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
    
    // Create new member object
    const memberToAdd = {
      id: newId,
      firstName: newMember.firstName,
      lastName: newMember.lastName,
      checkedIn: false,
      membershipType: newMember.membershipType,
      expiryDate
    };
    
    // Update members state
    setMembers([...members, memberToAdd]);
    
    // Reset form
    setNewMember({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      membershipType: 'standard',
      emergencyContact: ''
    });
    
    toast.success('New member registered successfully!');
  };

  return (
    <div className="card h-full">
      {/* Tab navigation */}
      <div className="flex border-b border-surface-200 dark:border-surface-700 mb-4">
        <button
          className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2
                     ${viewMode === 'checkin' 
                         ? 'text-primary border-b-2 border-primary' 
                         : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'}`}
          onClick={() => setViewMode('checkin')}
        >
          <UsersIcon className="h-4 w-4" />
          <span>Member Check-in</span>
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2
                     ${viewMode === 'register' 
                         ? 'text-primary border-b-2 border-primary' 
                         : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'}`}
          onClick={() => setViewMode('register')}
        >
          <UserPlusIcon className="h-4 w-4" />
          <span>Register New Member</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'checkin' ? (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 input"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Membership</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Expiry Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-medium text-surface-900 dark:text-white">
                                {member.firstName} {member.lastName}
                              </div>
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
                              <button 
                                onClick={() => handleCheckIn(member)}
                                disabled={member.checkedIn}
                                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                  member.checkedIn 
                                    ? 'bg-surface-100 text-surface-400 dark:bg-surface-800 cursor-not-allowed' 
                                    : 'bg-primary text-white hover:bg-primary-dark'
                                }`}
                              >
                                {member.checkedIn ? 'Already In' : 'Check In'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-surface-500 dark:text-surface-400">
                            No members found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Check-in confirmation modal */}
                {showConfirmation && selectedMember && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
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
                          className="flex-1 px-4 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600"
                          onClick={() => setShowConfirmation(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                          onClick={confirmCheckIn}
                        >
                          Confirm
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <SaveIcon className="h-4 w-4" />
                  <span>Register Member</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}