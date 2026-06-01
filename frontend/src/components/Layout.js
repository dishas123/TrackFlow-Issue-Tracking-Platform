import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/dashboard">TrackFlow</Link>
        </div>
        <div className="navbar-links">
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/projects" className={isActive('/projects') ? 'active' : ''}>
            Projects
          </Link>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            Profile
          </Link>
        </div>
        <div className="navbar-actions">
          <button onClick={toggleDarkMode} className="theme-toggle">
            {isDark ? '☀️' : '🌙'}
          </button>
          <div className="user-info">
            <span className="user-avatar">{user?.avatar || '👤'}</span>
            <span className="user-name">{user?.username}</span>
          </div>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
