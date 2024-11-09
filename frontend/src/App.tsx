import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Import Routes and Route
import Login from './Login';
import Dashboard from './Dashboard';  // Example protected route

const App: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path='/register' element={<Dashboard/>}/>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;

