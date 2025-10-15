import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    placingObjectType: null,
  },
  reducers: {
    setPlacingObjectType: (state, action) => {
      state.placingObjectType = action.payload;
    },
  },
});

export const { setPlacingObjectType } = uiSlice.actions;
export default uiSlice.reducer;
