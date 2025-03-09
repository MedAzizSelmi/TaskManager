import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/dashboard"} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated && user?.role !== 'admin' ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={isAuthenticated && user?.role !== 'admin' ? <TaskList /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="/admin/dashboard" element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
