import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { logout } = useAuth();

  return (
    <nav className="navigation">
      <div className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
          Tasks
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          Profile
        </NavLink>
      </div>
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    </nav>
  );
};

export default Navigation;
