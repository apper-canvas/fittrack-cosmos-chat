import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payments: [],
  isLoading: false,
  error: null
};

export const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action) => {
      state.payments = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addPayment: (state, action) => {
      state.payments.push(action.payload);
    },
    updatePayment: (state, action) => {
      const index = state.payments.findIndex(payment => payment.Id === action.payload.Id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
    deletePayment: (state, action) => {
      state.payments = state.payments.filter(payment => payment.Id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    }
  }
});

export const { 
  setPayments, 
  addPayment, 
  updatePayment, 
  deletePayment, 
  setLoading, 
  setError 
} = paymentsSlice.actions;

export default paymentsSlice.reducer;