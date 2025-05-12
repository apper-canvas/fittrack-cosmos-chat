import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import getIcon from '../utils/iconUtils';
import paymentService from '../services/paymentService';
import memberService from '../services/memberService';
import { setPayments, setLoading, setError, addPayment, deletePayment } from '../store/slices/paymentsSlice';
import { setMembers } from '../store/slices/membersSlice';

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [members, setMembersList] = useState([]);
  const [newPayment, setNewPayment] = useState({
    memberId: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'credit',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const location = useLocation();
  const dispatch = useDispatch();
  const { payments, isLoading, error } = useSelector(state => state.payments);
  
  const CreditCardIcon = getIcon('CreditCard');
  const RefreshIcon = getIcon('RefreshCw');
  const SearchIcon = getIcon('Search');
  const PlusIcon = getIcon('Plus');
  const TrashIcon = getIcon('Trash');
  const XIcon = getIcon('X');
  const DollarSignIcon = getIcon('DollarSign');
  const CalendarIcon = getIcon('Calendar');
  const CreditCardIcon2 = getIcon('CreditCard');
  const ClipboardIcon = getIcon('Clipboard');
  
  useEffect(() => {
    const fetchPayments = async () => {
      dispatch(setLoading(true));
      try {
        const data = await paymentService.fetchPayments();
        dispatch(setPayments(data));
        
        // Fetch members for the dropdown
        const membersData = await memberService.fetchMembers();
        setMembersList(membersData);
        dispatch(setMembers(membersData));
        
        // Check if we were directed here with a member ID
        const params = new URLSearchParams(location.search);
        const memberId = params.get('memberId');
        if (memberId) {
          setNewPayment(prev => ({ ...prev, memberId }));
          setShowAddModal(true);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        dispatch(setError("Failed to fetch payments. Please try again."));
        toast.error("Failed to fetch payments. Please try again.");
      }
    };
    
    fetchPayments();
  }, [dispatch, location.search]);
  
  const filteredPayments = payments.filter(payment => {
    const memberName = payment.member ? 
      `${payment.member.firstName || ''} ${payment.member.lastName || ''}`.toLowerCase() : 
      '';
    const description = (payment.description || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return memberName.includes(query) || description.includes(query);
  });
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({
      ...newPayment,
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
    
    if (!newPayment.memberId) {
      errors.memberId = 'Member is required';
    }
    
    if (!newPayment.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(newPayment.amount)) || Number(newPayment.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }
    
    if (!newPayment.date) {
      errors.date = 'Date is required';
    }
    
    if (!newPayment.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
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
      // Format payment data
      const member = members.find(m => m.Id.toString() === newPayment.memberId.toString());
      const paymentData = {
        Name: `Payment from ${member ? member.firstName + ' ' + member.lastName : 'Unknown Member'}`,
        memberId: newPayment.memberId,
        amount: newPayment.amount,
        date: newPayment.date,
        paymentMethod: newPayment.paymentMethod,
        description: newPayment.description
      };
      
      const createdPayment = await paymentService.createPayment(paymentData);
      dispatch(addPayment(createdPayment));
      
      // Reset form and close modal
      setNewPayment({
        memberId: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'credit',
        description: ''
      });
      setShowAddModal(false);
      
      toast.success('Payment recorded successfully!');
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment. Please try again.");
    }
  };
  
  const handleDelete = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedPayment) return;
    
    try {
      await paymentService.deletePayment(selectedPayment.Id);
      dispatch(deletePayment(selectedPayment.Id));
      toast.success('Payment deleted successfully.');
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment. Please try again.");
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedPayment(null);
    }
  };
  
  const refreshPayments = async () => {
    dispatch(setLoading(true));
    try {
      const data = await paymentService.fetchPayments();
      dispatch(setPayments(data));
      toast.success("Payments refreshed!");
    } catch (error) {
      console.error("Failed to refresh payments:", error);
      dispatch(setError("Failed to refresh payments. Please try again."));
      toast.error("Failed to refresh payments. Please try again.");
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'credit': return 'Credit Card';
      case 'cash': return 'Cash';
      case 'bank transfer': return 'Bank Transfer';
      default: return method;
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white">
            Payments
          </h1>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg transition-colors hover:bg-primary-dark"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Record Payment</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshPayments}
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
            placeholder="Search payments by member name or description..."
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <tr key={payment.Id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-surface-900 dark:text-white">
                            {payment.member ? `${payment.member.firstName} ${payment.member.lastName}` : 'Unknown Member'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-green-600 dark:text-green-400">
                            ${Number(payment.amount).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-surface-600 dark:text-surface-400">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-surface-600 dark:text-surface-400 max-w-xs truncate">
                          {payment.description || 'No description'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleDelete(payment)}
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
                        {searchQuery ? 'No payments found matching your search.' : 'No payments found. Record payments to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Payment Modal */}
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
                  Record Payment
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
                  <label htmlFor="memberId" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Member*
                  </label>
                  <select
                    id="memberId"
                    name="memberId"
                    value={newPayment.memberId}
                    onChange={handleInputChange}
                    className={`input ${formErrors.memberId ? 'border-red-500 dark:border-red-500' : ''}`}
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member.Id} value={member.Id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                  {formErrors.memberId && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.memberId}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Amount ($)*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSignIcon className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      value={newPayment.amount}
                      onChange={handleInputChange}
                      className={`pl-10 input ${formErrors.amount ? 'border-red-500 dark:border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.amount}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newPayment.date}
                      onChange={handleInputChange}
                      className={`pl-10 input ${formErrors.date ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                  </div>
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Payment Method*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCardIcon2 className="h-5 w-5 text-surface-400" />
                    </div>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={newPayment.paymentMethod}
                      onChange={handleInputChange}
                      className={`pl-10 input ${formErrors.paymentMethod ? 'border-red-500 dark:border-red-500' : ''}`}
                    >
                      <option value="credit">Credit Card</option>
                      <option value="cash">Cash</option>
                      <option value="bank transfer">Bank Transfer</option>
                    </select>
                  </div>
                  {formErrors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.paymentMethod}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Description
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClipboardIcon className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={newPayment.description}
                      onChange={handleInputChange}
                      className="pl-10 input"
                      placeholder="Monthly membership fee, etc."
                    />
                  </div>
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
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Record Payment</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirmation && selectedPayment && (
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
                  Are you sure you want to delete this payment record? This action cannot be undone.
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