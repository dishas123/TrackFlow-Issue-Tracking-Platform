const db = require('../config/database');
const { Op } = db.Sequelize;

const dashboardService = {
  async getDashboardStats(userId) {
    const totalProjects = await db.Project.count({
      where: { ownerId: userId }
    });

    const totalIssues = await db.Issue.count({
      include: [{
        model: db.Project,
        as: 'project',
        where: { ownerId: userId }
      }]
    });

    const openIssues = await db.Issue.count({
      where: { status: 'Open' },
      include: [{
        model: db.Project,
        as: 'project',
        where: { ownerId: userId }
      }]
    });

    const completedIssues = await db.Issue.count({
      where: { status: 'Done' },
      include: [{
        model: db.Project,
        as: 'project',
        where: { ownerId: userId }
      }]
    });

    const highPriorityIssues = await db.Issue.count({
      where: { 
        priority: { [Op.in]: ['High', 'Critical'] }
      },
      include: [{
        model: db.Project,
        as: 'project',
        where: { ownerId: userId }
      }]
    });

    return {
      totalProjects,
      totalIssues,
      openIssues,
      completedIssues,
      highPriorityIssues
    };
  },

  async getIssuesByStatus(userId) {
    const issues = await db.Issue.findAll({
      attributes: ['status'],
      include: [{
        model: db.Project,
        as: 'project',
        where: { ownerId: userId }
      }]
    });

    const statusCount = {
      Open: 0,
      'In Progress': 0,
      Review: 0,
      Done: 0
    };

    issues.forEach(issue => {
      if (statusCount.hasOwnProperty(issue.status)) {
        statusCount[issue.status]++;
      }
    });

    return statusCount;
  },

  async getIssuesByPriority(userId) {
    const issues = await db.Issue.findAll({
      attributes: ['priority'],
      include: [{
        model: db.Project,
        as: 'project',
        where: { ownerId: userId }
      }]
    });

    const priorityCount = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };

    issues.forEach(issue => {
      if (priorityCount.hasOwnProperty(issue.priority)) {
        priorityCount[issue.priority]++;
      }
    });

    return priorityCount;
  },

  async getRecentActivity(userId) {
    const activities = await db.ActivityLog.findAll({
      where: { userId },
      include: [
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
      limit: 10
    });

    return activities;
  }
};

module.exports = dashboardService;
