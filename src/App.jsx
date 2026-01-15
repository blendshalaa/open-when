import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateLetter from './pages/CreateLetter';
import ViewLetter from './pages/ViewLetter';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CreateLetter />} />
          <Route path="/letter/:token" element={<ViewLetter />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
