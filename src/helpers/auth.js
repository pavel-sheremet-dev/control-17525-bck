const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const createHashPassword = async password => {
  try {
    const hashPassword = await bcryptjs.hash(
      password,
      parseInt(process.env.ROUNDS) ?? 10,
    );
    return hashPassword;
  } catch (error) {
    throw new Error('something went wrong.');
  }
};

const comparePassword = async (password, requiredPassword) => {
  try {
    const isValidPassword = await bcryptjs.compare(password, requiredPassword);
    return isValidPassword;
  } catch (error) {
    throw new Error('something went wrong');
  }
};

const createToken = user => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  return jwt.sign({ uid: user.id, permissions: [user.subscription] }, secret, {
    expiresIn,
  });
};

exports.auth = { createHashPassword, comparePassword, createToken };
