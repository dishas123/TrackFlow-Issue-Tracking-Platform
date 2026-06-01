const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of entity: issue, project, etc.'
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID of the entity'
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'activity_logs',
    timestamps: true
  });

  ActivityLog.associate = function(models) {
    ActivityLog.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
    ActivityLog.belongsTo(models.Issue, {
      foreignKey: 'issueId',
      as: 'issue'
    });
    ActivityLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return ActivityLog;
};
