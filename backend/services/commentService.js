const db = require('../config/database');

const commentService = {
  async addComment(commentData, userId) {
    const { content, issueId } = commentData;

    const issue = await db.Issue.findByPk(issueId, {
      include: [{ model: db.Project, as: 'project' }]
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const comment = await db.Comment.create({
      content,
      issueId,
      userId
    });

    await db.ActivityLog.create({
      action: 'comment_added',
      description: `Comment added to issue "${issue.title}"`,
      entityType: 'issue',
      entityId: issueId,
      projectId: issue.projectId,
      issueId,
      userId
    });

    return comment;
  },

  async getComments(issueId, userId) {
    const issue = await db.Issue.findByPk(issueId, {
      include: [{ model: db.Project, as: 'project' }]
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.project.ownerId !== userId) {
      throw new Error('Access denied');
    }

    const comments = await db.Comment.findAll({
      where: { issueId },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    return comments;
  },

  async deleteComment(commentId, userId) {
    const comment = await db.Comment.findByPk(commentId, {
      include: [
        {
          model: db.Issue,
          as: 'issue',
          include: [{ model: db.Project, as: 'project' }]
        }
      ]
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.issue.project.ownerId !== userId && comment.userId !== userId) {
      throw new Error('Access denied');
    }

    await comment.destroy();

    return { message: 'Comment deleted successfully' };
  }
};

module.exports = commentService;
