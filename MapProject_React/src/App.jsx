import React, { useState } from 'react';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import MapPage from './Component/Map/MapPage';

const App = () => {
  return (
      <BrowserRouter>     
       <Routes>
              <Route element={<MapPage/>} path='/'/>
        </Routes>
      </BrowserRouter>
  );
};

export default App;
