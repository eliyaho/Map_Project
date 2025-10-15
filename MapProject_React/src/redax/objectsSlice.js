import { createSlice } from '@reduxjs/toolkit';

const objectsSlice = createSlice({
  name: 'objects',
  initialState: {
    list: [],
    selectedObjectId: null,
  },
  reducers: {
    setObjects: (state, action) => {
      state.list = action.payload;
    },
    addObject: (state, action) => {
      state.list.push(action.payload);
    },
    removeObject: (state, action) => {
      state.list = state.list.filter(obj => obj.id !== action.payload);
    },
    clearObjects: (state) => {
      state.list = [];
    },
    setSelectedObjectId: (state, action) => {
      state.selectedObjectId = action.payload;
    },
  },
});

export const {
  setObjects,
  addObject,
  removeObject,
  clearObjects,
  setSelectedObjectId,
} = objectsSlice.actions;

export default objectsSlice.reducer;
