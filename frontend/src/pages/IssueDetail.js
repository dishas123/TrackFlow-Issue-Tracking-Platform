import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import './IssueDetail.css';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    dueDate: ''
  });
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const response = await api.get(`/issues/${id}`);
      setIssue(response.data.data);
      setEditFormData({
        title: response.data.data.title,
        description: response.data.data.description || '',
        priority: response.data.data.priority,
        status: response.data.data.status,
        dueDate: response.data.data.dueDate ? response.data.data.dueDate.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching issue:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/issues/${id}`, editFormData);
      setShowEditModal(false);
      fetchIssue();
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post('/comments', {
        content: commentText,
        issueId: parseInt(id)
      });
      setCommentText('');
      fetchIssue();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    try {
      await api.delete(`/comments/${commentId}`);
      fetchIssue();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
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
    return <div className="loading">Loading issue...</div>;
  }

  return (
    <div className="issue-detail">
      <div className="issue-header">
        <Link to={`/projects/${issue.project.id}`} className="back-link">
          ← Back to Project
        </Link>
        <div className="header-actions">
          <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
            Edit Issue
          </button>
        </div>
      </div>

      <div className="issue-main">
        <div className="issue-info">
          <h1>{issue.title}</h1>
          
          <div className="issue-meta">
            <div className="meta-item">
              <span className="meta-label">Status:</span>
              <span className={`badge ${getStatusBadgeClass(issue.status)}`}>
                {issue.status}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Priority:</span>
              <span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>
                {issue.priority}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Reporter:</span>
              <span className="user">
                {issue.reporter.avatar} {issue.reporter.username}
              </span>
            </div>
            {issue.assignee && (
              <div className="meta-item">
                <span className="meta-label">Assignee:</span>
                <span className="user">
                  {issue.assignee.avatar} {issue.assignee.username}
                </span>
              </div>
            )}
            {issue.dueDate && (
              <div className="meta-item">
                <span className="meta-label">Due Date:</span>
                <span>{new Date(issue.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-label">Created:</span>
              <span>{new Date(issue.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="issue-description">
            <h3>Description</h3>
            <p>{issue.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="comments-section">
          <h3>Comments ({issue.comments.length})</h3>
          
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="input"
              rows="3"
            />
            <button type="submit" className="btn btn-primary" disabled={!commentText.trim()}>
              Add Comment
            </button>
          </form>

          <div className="comments-list">
            {issue.comments.length === 0 ? (
              <p className="no-comments">No comments yet</p>
            ) : (
              issue.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <span className="comment-avatar">{comment.user.avatar}</span>
                    <span className="comment-user">{comment.user.username}</span>
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Issue</h2>
            <form onSubmit={handleUpdateIssue} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
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
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
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
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  className="input"
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

export default IssueDetail;
