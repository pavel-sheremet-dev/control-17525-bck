const queryString = require('query-string');
const axios = require('axios');

const { serialize } = require('./auth.serialize');
const { service } = require('./auth.service');
const { config } = require('../../config');
const { auth } = require('../../helpers');

class AuthController {
  async signUp(req, res) {
    const user = await service.signUp(req.body, req.baseUrl);
    res.status(201).send(serialize.user(user));
  }

  async verifyUser(req, res) {
    const userEmail = await service.verifyUser(req.params.verificationToken);
    res
      .status(200)
      .send({ message: `User '${userEmail}' has been successfully verified` });
  }

  async sendVerifyEmail(req, res) {
    const userEmail = await service.sendVerifyEmail(
      req.body.email,
      req.baseUrl,
    );
    res
      .status(200)
      .send({ message: `Verification email has been sent to '${userEmail}'` });
  }

  async signIn(req, res) {
    const user = await service.signIn(req.body);
    res.status(200).send(serialize.signInResponce(user));
  }

  async signOut(req, res) {
    await service.signOut(req.user.id);
    res.status(204).send();
  }

  async getCurrentUser(req, res) {
    const user = await service.getCurrentUser(req.user.id);
    res.status(200).send(serializeUser(user));
  }

  async googleAuth(req, res) {
    const stringifiedParams = queryString.stringify({
      client_id: config.getEnvVars().GOOGLE_CLIENT_ID,
      redirect_uri: `${
        config.getEnvVars().SERVER_BASE_URL
      }/api/users/google-redirect`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });
    return res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`,
    );
  }

  async googleRedirect(req, res) {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const urlObj = new URL(fullUrl);
    const urlParams = queryString.parse(urlObj.search);
    const code = urlParams.code;
    const tokenData = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id: config.getEnvVars().GOOGLE_CLIENT_ID,
        client_secret: config.getEnvVars().GOOGLE_CLIENT_SECRET,
        redirect_uri: `${
          config.getEnvVars().SERVER_BASE_URL
        }/api/users/google-redirect`,
        grant_type: 'authorization_code',
        code,
      },
    });
    const userData = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${tokenData.data.access_token}`,
      },
    });

    let resToken;
    const email = userData.data.email;
    const user = await User.findOne({ email });

    if (!user) {
      const hashPassword = await auth.createHashPassword(email);

      const userCreate = await User.create({
        name: userData.data.name,
        email,
        password: hashPassword,
        verified: true,
        verificationToken: true,
      });
      const tokenNew = auth.createToken(userCreate);
      const { token } = await User.findByIdAndUpdate(
        userCreate._id,
        { token: tokenNew },
        {
          new: true,
          runValidators: true,
        },
      );
      resToken = token;
    } else {
      const tokenNew = auth.createToken(user);
      const { token } = await User.findByIdAndUpdate(
        user.id,
        { token: tokenNew },
        {
          new: true,
          runValidators: true,
        },
      );
      resToken = token;
    }
    return res.redirect(
      `${config.getEnvVars().FRONTEND_URL}/api/users/oauth/${resToken}`,
    );
  }
}

exports.controller = new AuthController();
