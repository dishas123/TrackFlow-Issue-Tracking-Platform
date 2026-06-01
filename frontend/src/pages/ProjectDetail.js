import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    dueDate: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id, filters]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/issues', {
        ...formData,
        projectId: parseInt(id)
      });
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        dueDate: ''
      });
      fetchProject();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, editFormData);
      setShowEditModal(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }
    try {
      await api.delete(`/issues/${issueId}`);
      fetchProject();
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      Low: 'badge-low',
      Medium: 'badge-medium',
      High: 'badge-high',
      Critical: 'badge-critical'
    };
    return classes[priority] || '';
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      Open: 'badge-open',
      'In Progress': 'badge-in-progress',
      Review: 'badge-review',
      Done: 'badge-done'
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  const filteredIssues = project.issues.filter(issue => {
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.search && !issue.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="project-detail">
      <div className="project-header">
        <div>
          <h1>{project.name}</h1>
          <p className="project-description">{project.description || 'No description'}</p>
        </div>
        <div className="project-actions">
          <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
            Edit Project
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + New Issue
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="input"
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="input"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Done">Done</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="input"
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="issues-list">
        {filteredIssues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No issues found</h2>
            <p>Create your first issue to get started</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="issue-card">
              <div className="issue-header">
                <h3>
                  <a href={`/issues/${issue.id}`}>{issue.title}</a>
                </h3>
                <div className="issue-badges">
                  <span className={`badge ${getStatusBadgeClass(issue.status)}`}>
                    {issue.status}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>
              </div>
              <p className="issue-description">
                {issue.description || 'No description'}
              </p>
              <div className="issue-footer">
                <div className="issue-meta">
                  {issue.assignee && (
                    <span className="assignee">
                      {issue.assignee.avatar} {issue.assignee.username}
                    </span>
                  )}
                  {issue.dueDate && (
                    <span className="due-date">
                      Due: {new Date(issue.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteIssue(issue.id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Issue</h2>
            <form onSubmit={handleCreateIssue} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <form onSubmit={handleUpdateProject} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="input"
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
