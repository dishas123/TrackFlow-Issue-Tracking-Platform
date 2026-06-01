const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING(50),
      defaultValue: '👤',
      comment: 'Emoji avatar for user'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = function(models) {
    User.hasMany(models.Project, {
      foreignKey: 'ownerId',
      as: 'ownedProjects'
    });
    User.hasMany(models.Issue, {
      foreignKey: 'assigneeId',
      as: 'assignedIssues'
    });
    User.hasMany(models.Issue, {
      foreignKey: 'reporterId',
      as: 'reportedIssues'
    });
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });
    User.hasMany(models.ActivityLog, {
      foreignKey: 'userId',
      as: 'activities'
    });
  };

  return User;
};
