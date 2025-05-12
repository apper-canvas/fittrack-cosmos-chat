import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  classSchedules: [],
  isLoading: false,
  error: null
};

export const classSchedulesSlice = createSlice({
  name: 'classSchedules',
  initialState,
  reducers: {
    setClassSchedules: (state, action) => {
      state.classSchedules = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addClassSchedule: (state, action) => {
      state.classSchedules.push(action.payload);
    },
    updateClassSchedule: (state, action) => {
      const index = state.classSchedules.findIndex(schedule => schedule.Id === action.payload.Id);
      if (index !== -1) {
        state.classSchedules[index] = action.payload;
      }
    },
    deleteClassSchedule: (state, action) => {
      state.classSchedules = state.classSchedules.filter(schedule => schedule.Id !== action.payload);
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
  setClassSchedules, 
  addClassSchedule, 
  updateClassSchedule, 
  deleteClassSchedule, 
  setLoading, 
  setError 
} = classSchedulesSlice.actions;

export default classSchedulesSlice.reducer;