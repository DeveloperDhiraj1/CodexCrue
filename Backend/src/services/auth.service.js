const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { signAccessToken } = require('../utils/auth');

class AuthService {
  async registerUser(userData) {
    const { name, email, password } = userData;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw Object.assign(new Error('Email already registered.'), { statusCode: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'learner',
      isVerified: false
    });

    return user;
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid email or password.'), { statusCode: 401 });
    }

    if (!user.isActive || !user.isVerified) {
      throw Object.assign(new Error('Account is inactive or unverified.'), { statusCode: 403 });
    }
    const token = signAccessToken(user);

    return { token, user };
  }
}

module.exports = new AuthService();
