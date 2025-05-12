import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  currentMember: null,
  isLoading: false,
  error: null
};

export const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentMember: (state, action) => {
      state.currentMember = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    updateMember: (state, action) => {
      const index = state.members.findIndex(member => member.Id === action.payload.Id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
      if (state.currentMember && state.currentMember.Id === action.payload.Id) {
        state.currentMember = action.payload;
      }
    },
    deleteMember: (state, action) => {
      state.members = state.members.filter(member => member.Id !== action.payload);
      if (state.currentMember && state.currentMember.Id === action.payload) {
        state.currentMember = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    }
  }
});

export const { 
  setMembers, 
  setCurrentMember, 
  addMember, 
  updateMember, 
  deleteMember, 
  setLoading, 
  setError,
  clearCurrentMember 
} = membersSlice.actions;

export default membersSlice.reducer;