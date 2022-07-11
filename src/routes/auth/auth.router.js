const { Router } = require('express');
const { schema } = require('./auth.model');
const { controller } = require('./auth.controller');
const { middlewares } = require('./auth.middlewares');
const { commonMiddlwares } = require('../../helpers');

const { validateRequest, catchError } = commonMiddlwares;
const { authhorize } = middlewares;

const router = Router();

router.post(
  '/signup',
  validateRequest(schema.signup),
  catchError(controller.signUp),
);

router.get('/verify/:verificationToken', catchError(controller.verifyUser));

router.post(
  '/verify',
  validateRequest(schema.verify),
  catchError(controller.sendVerifyEmail),
);

router.post(
  '/login',
  validateRequest(schema.signing),
  catchError(controller.signIn),
);

router.post('/logout', authhorize(), catchError(controller.signOut));

router.get('/current', authhorize(), catchError(controller.getCurrentUser));

router.get('/google', catchError(controller.googleAuth));
router.get('/google-redirect', catchError(controller.googleRedirect));

exports.authRouter = router;
