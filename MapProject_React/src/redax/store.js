import { configureStore } from '@reduxjs/toolkit';
import polygonsReducer from './polygonsSlice';
import objectsReducer from './objectsSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    polygons: polygonsReducer,
    objects: objectsReducer,
    ui: uiReducer,
  },
});

export default store;
