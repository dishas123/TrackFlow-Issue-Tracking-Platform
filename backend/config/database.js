const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import and initialize models
const User = require('../models/User')(sequelize);
const Project = require('../models/Project')(sequelize);
const Issue = require('../models/Issue')(sequelize);
const Comment = require('../models/Comment')(sequelize);
const ActivityLog = require('../models/ActivityLog')(sequelize);

// Initialize associations
User.associate && User.associate({ Project, Issue, Comment, ActivityLog });
Project.associate && Project.associate({ User, Issue, ActivityLog });
Issue.associate && Issue.associate({ Project, User, Comment, ActivityLog });
Comment.associate && Comment.associate({ Issue, User });
ActivityLog.associate && ActivityLog.associate({ Project, Issue, User });

const db = {
  sequelize,
  Sequelize,
  User,
  Project,
  Issue,
  Comment,
  ActivityLog
};

module.exports = db;
