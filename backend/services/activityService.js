const db = require('../config/database');

const activityService = {
  async getActivities(userId, filters = {}) {
    const { projectId, limit = 20 } = filters;

    const where = { userId };

    if (projectId) {
      where.projectId = projectId;
    }

    const activities = await db.ActivityLog.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: db.Issue,
          as: 'issue',
          attributes: ['id', 'title'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    return activities;
  },

  async getProjectActivities(projectId, userId) {
    const project = await db.Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const activities = await db.ActivityLog.findAll({
      where: { projectId },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: db.Issue,
          as: 'issue',
          attributes: ['id', 'title'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    return activities;
  }
};

module.exports = activityService;
