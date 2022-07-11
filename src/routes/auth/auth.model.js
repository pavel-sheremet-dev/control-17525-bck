const mongoose = require('mongoose');
const errors = require('http-errors');
const joi = require('joi');

class JoiAuthSchema {
  signup = joi.object({
    name: joi
      .string()
      .pattern(/[A-Za-zА-Яа-яґҐЁёІіЇїЄє'’ʼ\s-]{3,30}/)
      .required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  signing = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  verify = joi.object({
    email: joi.string().email().required(),
  });
}

const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    token: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  },
  { timestamps: true },
);

const schemaErrorHandlingMiddlware = (error, doc, next) => {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(
      new errors[409](
        `User with email "${error.keyValue.email}" already exist`,
      ),
    );
  } else {
    next();
  }
};

usersSchema.post(['save', 'findOneAndUpdate'], schemaErrorHandlingMiddlware);

exports.schema = new JoiAuthSchema();
exports.User = mongoose.model('User', usersSchema, 'users');
