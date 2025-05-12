import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import membersReducer from './slices/membersSlice';
import activitiesReducer from './slices/activitiesSlice';
import membershipPlansReducer from './slices/membershipPlansSlice';
import classSchedulesReducer from './slices/classSchedulesSlice';
import paymentsReducer from './slices/paymentsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    members: membersReducer,
    activities: activitiesReducer,
    membershipPlans: membershipPlansReducer,
    classSchedules: classSchedulesReducer,
    payments: paymentsReducer,
  },
});