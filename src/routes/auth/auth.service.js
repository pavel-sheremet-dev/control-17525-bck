const uuid = require('uuid').v4;
const {
  NotFound,
  BadRequest,
  Forbidden,
  Gone,
  PreconditionFailed,
} = require('http-errors');
const { auth, mailService } = require('../../helpers');
const { User } = require('./auth.model');

class AuthService {
  async signUp(reqParams, baseUrl) {
    const { email, password } = reqParams;
    const hashPassword = await auth.createHashPassword(password);

    const verificationToken = uuid();

    const user = await User.create({
      ...reqParams,
      password: hashPassword,
      verificationToken,
    });

    mailService.sendVerificationEmail(email, baseUrl, verificationToken);

    return user;
  }

  async verifyUser(verificationToken) {
    const user = await User.findOne({ verificationToken });

    if (!user)
      throw new Gone(
        'Verification link is not valid, expired or has already been use',
      );

    await User.updateOne(
      { verificationToken },
      { verificationToken: null, verified: true },
    );

    return user.email;
  }

  async sendVerifyEmail(email, baseUrl) {
    const user = await User.findOne({ email });

    if (!user)
      throw new NotFound(
        `User with email '${email}' was not found. Please check email or sign up`,
      );

    if (user.verified)
      throw new BadRequest('Verification has already been passed');

    mailService.sendVerificationEmail(email, baseUrl, user.verificationToken);

    return user.email;
  }

  async signIn({ email, password }) {
    const user = await User.findOne({ email });
    if (!user)
      throw new NotFound('User not found. Please check email or sign up');

    const isValidPassword = await auth.comparePassword(password, user.password);

    if (!isValidPassword) throw new Forbidden('Email or password is wrong');

    if (!user.verified) {
      throw new PreconditionFailed('User was not verified ');
    }

    const token = auth.createToken(user);

    await User.findByIdAndUpdate(
      user.id,
      { token },
      {
        new: true,
        runValidators: true,
      },
    );

    return { user, token };
  }

  signIn = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user)
      throw new NotFound('User not found. Please check email or sign up');

    const isValidPassword = await auth.comparePassword(password, user.password);

    if (!isValidPassword) throw new Forbidden('Password is wrong');

    const token = auth.createToken(user);

    await User.findByIdAndUpdate(
      user.id,
      { token },
      {
        new: true,
        runValidators: true,
      },
    );

    return { user, token };
  };

  async signOut(id) {
    return await User.findByIdAndUpdate(id, { token: null });
  }

  async getCurrentUser(id) {
    const user = await User.findById(id);
    if (!user) throw new NotFound('User not found');
    return user;
  }
}

exports.service = new AuthService();
