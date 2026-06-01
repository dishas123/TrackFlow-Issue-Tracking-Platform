import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = {
  Open: '#3b82f6',
  'In Progress': '#f59e0b',
  Review: '#8b5cf6',
  Done: '#10b981',
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, statusRes, priorityRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts/status'),
        api.get('/dashboard/charts/priority'),
        api.get('/dashboard/activity')
      ]);

      setStats(statsRes.data.data);
      
      const statusArray = Object.entries(statusRes.data.data).map(([name, value]) => ({ name, value }));
      setStatusData(statusArray);
      
      const priorityArray = Object.entries(priorityRes.data.data).map(([name, value]) => ({ name, value }));
      setPriorityData(priorityArray);
      
      setActivities(activityRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/projects/new" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalIssues}</div>
            <div className="stat-label">Total Issues</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔵</div>
          <div className="stat-info">
            <div className="stat-value">{stats.openIssues}</div>
            <div className="stat-label">Open Issues</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.completedIssues}</div>
            <div className="stat-label">Completed Issues</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <div className="stat-value">{stats.highPriorityIssues}</div>
            <div className="stat-label">High Priority Issues</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Issues by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Issues by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {activities.length === 0 ? (
            <p className="no-activity">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">{activity.user?.avatar || '👤'}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{activity.user?.username}</strong> {activity.action}
                    {activity.issue && <span> issue "{activity.issue.title}"</span>}
                    {activity.project && <span> in project "{activity.project.name}"</span>}
                  </div>
                  <div className="activity-time">
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
