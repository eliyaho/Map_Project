// App.js
import React, { useState } from 'react';
import { BrowserRouter, Route, Router, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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
