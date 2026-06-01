const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Issue = sequelize.define('Issue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      defaultValue: 'Medium',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Open', 'In Progress', 'Review', 'Done'),
      defaultValue: 'Open',
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      }
    },
    assigneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'issues',
    timestamps: true
  });

  Issue.associate = function(models) {
    Issue.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
    Issue.belongsTo(models.User, {
      foreignKey: 'assigneeId',
      as: 'assignee'
    });
    Issue.belongsTo(models.User, {
      foreignKey: 'reporterId',
      as: 'reporter'
    });
    Issue.hasMany(models.Comment, {
      foreignKey: 'issueId',
      as: 'comments',
      onDelete: 'CASCADE'
    });
    Issue.hasMany(models.ActivityLog, {
      foreignKey: 'issueId',
      as: 'activities'
    });
  };

  return Issue;
};
