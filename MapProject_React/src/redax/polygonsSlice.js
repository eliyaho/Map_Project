import { createSlice } from '@reduxjs/toolkit';

const polygonsSlice = createSlice({
  name: 'polygons',
  initialState: {
    list: [],
    tempVertices: [],
    drawingMode: false,
    selectedPolygonId: null,
    error: null,
  },
  reducers: {
    setPolygons: (state, action) => {
      state.list = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    addPolygon: (state, action) => {
      state.list.push(action.payload);
    },
    removePolygon: (state, action) => {
      state.list = state.list.filter(p => p._id !== action.payload);
    },
    setDrawingMode: (state, action) => {
      state.drawingMode = action.payload;
    },
    setTempVertices: (state, action) => {
      state.tempVertices = action.payload;
    },
    setSelectedPolygonId: (state, action) => {
      state.selectedPolygonId = action.payload;
    },
    clearTempVertices: (state) => {
      state.tempVertices = [];
    },
    fetchPolygonsPending: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    fetchPolygonsFulfilled: (state, action) => {
      state.list = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    fetchPolygonsRejected: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const {
  setPolygons,
  addPolygon,
  removePolygon,
  setDrawingMode,
  setTempVertices,
  setSelectedPolygonId,
  clearTempVertices,
  fetchPolygonsPending,
  fetchPolygonsFulfilled,
  fetchPolygonsRejected,
} = polygonsSlice.actions;

export default polygonsSlice.reducer;
