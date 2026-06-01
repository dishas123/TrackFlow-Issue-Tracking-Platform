const db = require('../config/database');
const { Op } = db.Sequelize;

const issueService = {
  async createIssue(issueData, userId) {
    const { title, description, priority, status, dueDate, projectId, assigneeId } = issueData;

    const project = await db.Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    if (assigneeId) {
      const assignee = await db.User.findByPk(assigneeId);
      if (!assignee) {
        throw new Error('Assignee not found');
      }
    }

    const issue = await db.Issue.create({
      title,
      description,
      priority: priority || 'Medium',
      status: status || 'Open',
      dueDate,
      projectId,
      assigneeId,
      reporterId: userId
    });

    await db.ActivityLog.create({
      action: 'created',
      description: `Issue "${title}" was created`,
      entityType: 'issue',
      entityId: issue.id,
      projectId,
      issueId: issue.id,
      userId
    });

    return this.getIssueById(issue.id, userId);
  },

  async getIssues(projectId, userId, filters = {}) {
    const project = await db.Project.findByPk(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const where = { projectId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Issue.findAndCountAll({
      where,
      include: [
        {
          model: db.User,
          as: 'assignee',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: db.User,
          as: 'reporter',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      issues: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  },

  async getIssueById(issueId, userId) {
    const issue = await db.Issue.findByPk(issueId, {
      include: [
        {
          model: db.Project,
          as: 'project',
          attributes: ['id', 'name', 'ownerId']
        },
        {
          model: db.User,
          as: 'assignee',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: db.User,
          as: 'reporter',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: db.Comment,
          as: 'comments',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'username', 'avatar']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    return issue;
  },

  async updateIssue(issueId, updateData, userId) {
    const issue = await db.Issue.findByPk(issueId, {
      include: [{ model: db.Project, as: 'project' }]
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const oldStatus = issue.status;
    const oldPriority = issue.priority;
    const oldAssigneeId = issue.assigneeId;

    const { title, description, priority, status, dueDate, assigneeId } = updateData;

    if (title) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (priority) issue.priority = priority;
    if (status) issue.status = status;
    if (dueDate !== undefined) issue.dueDate = dueDate;
    if (assigneeId !== undefined) issue.assigneeId = assigneeId;

    await issue.save();

    if (status && status !== oldStatus) {
      await db.ActivityLog.create({
        action: 'status_changed',
        description: `Issue status changed from "${oldStatus}" to "${status}"`,
        entityType: 'issue',
        entityId: issue.id,
        projectId: issue.projectId,
        issueId: issue.id,
        userId
      });
    }

    if (priority && priority !== oldPriority) {
      await db.ActivityLog.create({
        action: 'priority_changed',
        description: `Issue priority changed from "${oldPriority}" to "${priority}"`,
        entityType: 'issue',
        entityId: issue.id,
        projectId: issue.projectId,
        issueId: issue.id,
        userId
      });
    }

    if (assigneeId !== undefined && assigneeId !== oldAssigneeId) {
      const assignee = assigneeId ? await db.User.findByPk(assigneeId) : null;
      const assigneeName = assignee ? assignee.username : 'unassigned';
      await db.ActivityLog.create({
        action: 'assigned',
        description: `Issue assigned to ${assigneeName}`,
        entityType: 'issue',
        entityId: issue.id,
        projectId: issue.projectId,
        issueId: issue.id,
        userId
      });
    }

    await db.ActivityLog.create({
      action: 'updated',
      description: `Issue "${issue.title}" was updated`,
      entityType: 'issue',
      entityId: issue.id,
      projectId: issue.projectId,
      issueId: issue.id,
      userId
    });

    return this.getIssueById(issueId, userId);
  },

  async deleteIssue(issueId, userId) {
    const issue = await db.Issue.findByPk(issueId, {
      include: [{ model: db.Project, as: 'project' }]
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const issueTitle = issue.title;
    const projectId = issue.projectId;
    await issue.destroy();

    await db.ActivityLog.create({
      action: 'deleted',
      description: `Issue "${issueTitle}" was deleted`,
      entityType: 'issue',
      entityId: issueId,
      projectId,
      userId
    });

    return { message: 'Issue deleted successfully' };
  }
};

module.exports = issueService;
