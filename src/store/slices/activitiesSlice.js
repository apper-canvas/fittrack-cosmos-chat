import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activities: [],
  isLoading: false,
  error: null
};

export const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setActivities: (state, action) => {
      state.activities = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addActivity: (state, action) => {
      state.activities.push(action.payload);
    },
    updateActivity: (state, action) => {
      const index = state.activities.findIndex(activity => activity.Id === action.payload.Id);
      if (index !== -1) {
        state.activities[index] = action.payload;
      }
    },
    deleteActivity: (state, action) => {
      state.activities = state.activities.filter(activity => activity.Id !== action.payload);
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
  setActivities, 
  addActivity, 
  updateActivity, 
  deleteActivity, 
  setLoading, 
  setError 
} = activitiesSlice.actions;

export default activitiesSlice.reducer;