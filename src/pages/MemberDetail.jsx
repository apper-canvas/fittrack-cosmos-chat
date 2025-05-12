import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import memberService from '../services/memberService';
import paymentService from '../services/paymentService';
import { setCurrentMember, setLoading, setError, updateMember, clearCurrentMember } from '../store/slices/membersSlice';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentMember, isLoading, error } = useSelector(state => state.members);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState(null);
  const [memberPayments, setMemberPayments] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const BackIcon = getIcon('ArrowLeft');
  const EditIcon = getIcon('Edit');
  const SaveIcon = getIcon('Save');
  const UserIcon = getIcon('User');
  const CheckIcon = getIcon('CheckCircle');
  const XIcon = getIcon('X');
  const CreditCardIcon = getIcon('CreditCard');
  const PhoneIcon = getIcon('Phone');
  const MailIcon = getIcon('Mail');
  const AlertTriangleIcon = getIcon('AlertTriangle');
  
  useEffect(() => {
    const fetchMemberData = async () => {
      dispatch(setLoading(true));
      try {
        const data = await memberService.fetchMemberById(id);
        dispatch(setCurrentMember(data));
        setEditedMember(data);
        
        // Fetch member payments
        const paymentsData = await paymentService.fetchPaymentsByMember(id);
        setMemberPayments(paymentsData);
      } catch (error) {
        console.error("Failed to fetch member details:", error);
        dispatch(setError("Failed to fetch member details. Please try again."));
        toast.error("Failed to fetch member details. Please try again.");
      }
    };
    
    fetchMemberData();
    
    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentMember());
    };
  }, [dispatch, id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMember({
      ...editedMember,
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
    
    if (!editedMember.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!editedMember.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!editedMember.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(editedMember.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!editedMember.phone?.trim()) {
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
    
    setIsSubmitting(true);
    try {
      // Update member data
      const memberData = {
        ...editedMember,
        Name: `${editedMember.firstName} ${editedMember.lastName}`
      };
      
      const updatedMember = await memberService.updateMember(memberData);
      dispatch(updateMember(updatedMember));
      
      setIsEditing(false);
      toast.success('Member information updated successfully!');
    } catch (error) {
      console.error("Failed to update member:", error);
      toast.error("Failed to update member information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setEditedMember(currentMember);
    setFormErrors({});
    setIsEditing(false);
  };
  
  const handleCheckIn = async () => {
    if (!currentMember || currentMember.checkedIn) return;
    
    try {
      const updatedMember = await memberService.checkInMember(currentMember.Id);
      dispatch(updateMember(updatedMember));
      toast.success(`${currentMember.firstName} ${currentMember.lastName} has been checked in!`);
    } catch (error) {
      console.error("Failed to check in member:", error);
      toast.error("Failed to check in member. Please try again.");
    }
  };
  
  if (isLoading || !currentMember) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">Error Loading Member</h3>
        <p className="text-surface-600 dark:text-surface-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/members')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Back to Members
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <Link 
          to="/members"
          className="inline-flex items-center text-surface-600 dark:text-surface-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <BackIcon className="h-4 w-4 mr-1" />
          Back to Members
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center">
                <UserIcon className="h-6 w-6 mr-2 text-primary" />
                {currentMember.firstName} {currentMember.lastName}
              </h1>
              
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    <EditIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                
                {!currentMember.checkedIn && (
                  <button
                    onClick={handleCheckIn}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Check In</span>
                  </button>
                )}
              </div>
            </div>
            
            {isEditing ? (
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
                      value={editedMember.firstName || ''}
                      onChange={handleInputChange}
                      className={`input ${formErrors.firstName ? 'border-red-500 dark:border-red-500' : ''}`}
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
                      value={editedMember.lastName || ''}
                      onChange={handleInputChange}
                      className={`input ${formErrors.lastName ? 'border-red-500 dark:border-red-500' : ''}`}
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
                      value={editedMember.email || ''}
                      onChange={handleInputChange}
                      className={`input ${formErrors.email ? 'border-red-500 dark:border-red-500' : ''}`}
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
                      value={editedMember.phone || ''}
                      onChange={handleInputChange}
                      className={`input ${formErrors.phone ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="membershipType" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Membership Type
                    </label>
                    <select
                      id="membershipType"
                      name="membershipType"
                      value={editedMember.membershipType || 'standard'}
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
                      value={editedMember.emergencyContact || ''}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <SaveIcon className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      currentMember.checkedIn 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300'
                    }`}>
                      {currentMember.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentMember.membershipType === 'premium' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {currentMember.membershipType === 'premium' ? 'Premium Membership' : 'Standard Membership'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MailIcon className="h-5 w-5 text-surface-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">Email</h3>
                      <p className="text-surface-900 dark:text-white">{currentMember.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-surface-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">Phone</h3>
                      <p className="text-surface-900 dark:text-white">{currentMember.phone}</p>
                    </div>
                  </div>
                  
                  {currentMember.emergencyContact && (
                    <div className="flex items-start">
                      <AlertTriangleIcon className="h-5 w-5 text-surface-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">Emergency Contact</h3>
                        <p className="text-surface-900 dark:text-white">{currentMember.emergencyContact}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
                  <div className="flex items-start">
                    <div className="bg-surface-100 dark:bg-surface-700 rounded-full p-2 mr-3">
                      <CreditCardIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-surface-900 dark:text-white">Membership Details</h3>
                      <p className="text-surface-600 dark:text-surface-400 text-sm">
                        Expiry Date: {currentMember.expiryDate || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="card h-full">
            <h2 className="text-lg font-semibold mb-4 text-surface-900 dark:text-white flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
              Payment History
            </h2>
            
            <div className="space-y-4">
              {memberPayments.length > 0 ? (
                memberPayments.map((payment, index) => (
                  <motion.div
                    key={payment.Id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                  >
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <CreditCardIcon className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-surface-900 dark:text-white">${payment.amount}</p>
                        <span className="text-xs text-surface-500">{payment.date}</span>
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        {payment.paymentMethod || 'Unknown method'} {payment.description ? `- ${payment.description}` : ''}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-surface-500 dark:text-surface-400">
                  No payment records found
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Link
                to={`/payments/new?memberId=${currentMember.Id}`}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Record New Payment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}