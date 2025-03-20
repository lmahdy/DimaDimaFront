import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Welcome from './components/Welcome';
import Notes from './components/Notes';
import Planning from './components/Planning'; // ✅ Added Planning import

const isAuthenticated = () => !!localStorage.getItem('userEmail'); // Check if user is logged in

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/register" />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/welcome" element={isAuthenticated() ? <Welcome /> : <Navigate to="/login" />} />
                <Route path="/notes" element={isAuthenticated() ? <Notes /> : <Navigate to="/login" />} />
                <Route path="/planification" element={isAuthenticated() ? <Planning /> : <Navigate to="/login" />} /> {/* ✅ Added Planning Route */}
            </Routes>
        </Router>
    );
}

export default App;
