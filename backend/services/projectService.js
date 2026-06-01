const db = require('../config/database');

const projectService = {
  async createProject(projectData, userId) {
    const { name, description } = projectData;

    const project = await db.Project.create({
      name,
      description,
      ownerId: userId
    });

    await db.ActivityLog.create({
      action: 'created',
      description: `Project "${name}" was created`,
      entityType: 'project',
      entityId: project.id,
      projectId: project.id,
      userId
    });

    return project;
  },

  async getProjects(userId) {
    const projects = await db.Project.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: db.Issue,
          as: 'issues',
          attributes: ['id', 'status', 'priority']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return projects.map(project => {
      const projectData = project.toJSON();
      const issueStats = {
        total: projectData.issues.length,
        open: projectData.issues.filter(i => i.status === 'Open').length,
        inProgress: projectData.issues.filter(i => i.status === 'In Progress').length,
        review: projectData.issues.filter(i => i.status === 'Review').length,
        done: projectData.issues.filter(i => i.status === 'Done').length
      };
      return {
        ...projectData,
        issueStats
      };
    });
  },

  async getProjectById(projectId, userId) {
    const project = await db.Project.findByPk(projectId, {
      include: [
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: db.Issue,
          as: 'issues',
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
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    return project;
  },

  async updateProject(projectId, updateData, userId) {
    const project = await db.Project.findByPk(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const { name, description } = updateData;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    await db.ActivityLog.create({
      action: 'updated',
      description: `Project "${project.name}" was updated`,
      entityType: 'project',
      entityId: project.id,
      projectId: project.id,
      userId
    });

    return project;
  },

  async deleteProject(projectId, userId) {
    const project = await db.Project.findByPk(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const projectName = project.name;
    await project.destroy();

    await db.ActivityLog.create({
      action: 'deleted',
      description: `Project "${projectName}" was deleted`,
      entityType: 'project',
      entityId: projectId,
      projectId: projectId,
      userId
    });

    return { message: 'Project deleted successfully' };
  }
};

module.exports = projectService;
