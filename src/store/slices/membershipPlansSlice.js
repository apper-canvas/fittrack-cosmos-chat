import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  membershipPlans: [],
  isLoading: false,
  error: null
};

export const membershipPlansSlice = createSlice({
  name: 'membershipPlans',
  initialState,
  reducers: {
    setMembershipPlans: (state, action) => {
      state.membershipPlans = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addMembershipPlan: (state, action) => {
      state.membershipPlans.push(action.payload);
    },
    updateMembershipPlan: (state, action) => {
      const index = state.membershipPlans.findIndex(plan => plan.Id === action.payload.Id);
      if (index !== -1) {
        state.membershipPlans[index] = action.payload;
      }
    },
    deleteMembershipPlan: (state, action) => {
      state.membershipPlans = state.membershipPlans.filter(plan => plan.Id !== action.payload);
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
  setMembershipPlans, 
  addMembershipPlan, 
  updateMembershipPlan, 
  deleteMembershipPlan, 
  setLoading, 
  setError 
} = membershipPlansSlice.actions;

export default membershipPlansSlice.reducer;