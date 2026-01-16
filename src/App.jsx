import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateCollection from './pages/CreateCollection';
import ViewCollection from './pages/ViewCollection';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CreateCollection />} />
          <Route path="/:token" element={<ViewCollection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
