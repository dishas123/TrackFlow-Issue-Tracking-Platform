const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'projects',
    timestamps: true
  });

  Project.associate = function(models) {
    Project.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    Project.hasMany(models.Issue, {
      foreignKey: 'projectId',
      as: 'issues',
      onDelete: 'CASCADE'
    });
    Project.hasMany(models.ActivityLog, {
      foreignKey: 'projectId',
      as: 'activities'
    });
  };

  return Project;
};
