const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const { authRouter } = require('./routes/auth/auth.router');
const { config } = require('./config');

const STATIC_DIR = require('path').resolve('../static');

class Server {
  constructor() {
    this.app = null;
  }

  start() {
    this.initSever();
    this.initConfig();
    this.initDataBase();
    this.initMailService();
    this.initMiddlewares();
    this.initRoutes();
    this.initErrorHandling();
    this.startListening();
  }

  initSever() {
    this.app = express();
  }

  initConfig() {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
  }

  async initDataBase() {
    const { MONGO_URI } = config.getEnvVars();
    try {
      await mongoose.connect(MONGO_URI);
      console.log('Database successfully connected');
    } catch (error) {
      console.log('Database error connection');
      process.exit(1);
    }
  }

  initMailService() {
    sgMail.setApiKey(config.getEnvVars().SENDGRID_API_KEY);
  }

  initMiddlewares() {
    this.app.use(express.json({ limit: '200kb' }));
    this.configureLogger();
    this.configureCors();
    this.configureApiDocs();
    this.app.use('/static', express.static(STATIC_DIR));
  }

  initRoutes() {
    this.app.use('/api/users', authRouter);
  }

  initErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).send({ message: 'Page Not found' });
    });

    this.app.use((err, req, res, next) => {
      const statusCode = err.status ?? 500;
      res.status(statusCode).send(err.message);
    });
  }

  startListening() {
    this.app.listen(process.env.PORT, err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Server works on PORT: ${process.env.PORT}`);
    });
  }

  configureLogger() {
    const { getLoggerFormat } = config.getEnvVars();
    const loggerFormat = getLoggerFormat(this.app.get('env'));
    this.app.use(morgan(loggerFormat));
  }

  configureCors() {
    const { CORS } = config.getEnvVars();
    this.app.use(cors({ origin: CORS }));
  }

  configureApiDocs() {
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
  }
}

exports.Server = Server;
