const db = require('../config/database');
const { generateToken } = require('../utils/jwt');

const authService = {
  async register(userData) {
    const { username, email, password, avatar } = userData;

    const existingUser = await db.User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    const user = await db.User.create({
      username,
      email,
      password,
      avatar: avatar || '👤'
    });

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    };
  },

  async login(email, password) {
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    };
  },

  async getProfile(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  async updateProfile(userId, updateData) {
    const user = await db.User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const { username, avatar } = updateData;

    if (username && username !== user.username) {
      const existingUser = await db.User.findOne({
        where: { username }
      });

      if (existingUser) {
        throw new Error('Username already taken');
      }
      user.username = username;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar
    };
  }
};

module.exports = authService;
