const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET environment variable is required in production.');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'queueless_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const verifyGoogleToken = async (idToken) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, 'Google Authentication is not configured on the server (GOOGLE_CLIENT_ID missing).');
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ApiError(401, 'Invalid Google ID token payload.');
    }
    return payload;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired Google ID token: ' + err.message);
  }
};

const registerOwner = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'OWNER',
    status: 'ACTIVE',
    authProvider: 'LOCAL',
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
    },
    token,
  };
};

const loginOwner = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Account is inactive or suspended.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      authProvider: user.authProvider,
      lastLoginAt: user.lastLoginAt,
    },
    token,
  };
};

const googleAuthOwner = async ({ credential, accessToken } = {}) => {
  if (!credential && !accessToken) {
    throw new ApiError(400, 'Either Google credential (ID token) or accessToken is required.');
  }

  let payload = null;

  if (credential) {
    payload = await verifyGoogleToken(credential);
  } else if (accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        payload = await response.json();
      }
    } catch (fetchErr) {
      console.error('[Google UserInfo Fetch Error]', fetchErr.message);
    }
  }

  if (!payload || !payload.email) {
    throw new ApiError(401, 'Unable to extract profile from Google account.');
  }

  const { sub: googleId, email, name, picture } = payload;
  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({
    $or: [{ googleId }, { email: normalizedEmail }],
  });

  let isNewUser = false;

  if (user) {
    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account is inactive or suspended.');
    }

    if (!user.googleId) user.googleId = googleId;
    if (!user.avatar && picture) user.avatar = picture;
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    isNewUser = true;
    user = await User.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      googleId,
      avatar: picture || null,
      authProvider: 'GOOGLE',
      role: 'OWNER',
      status: 'ACTIVE',
      lastLoginAt: new Date(),
    });
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      authProvider: user.authProvider,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    },
    token,
    isNewUser,
  };
};

const getOwnerById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    authProvider: user.authProvider,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
};

module.exports = {
  generateToken,
  registerOwner,
  loginOwner,
  googleAuthOwner,
  getOwnerById,
};
