class Config {
  getEnvVars() {
    return {
      PORT: process.env.PORT ?? 3000,
      CORS: process.env.CORS ?? '*',
      getLoggerFormat: env => (env === 'development' ? 'dev' : 'short'),
      MONGO_URI: process.env.MONGO_URI,
      ROUNDS: process.env.ROUNDS,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_SECRET: process.env.JWT_SECRET,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      SENDGRID_SENDER: process.env.SENDGRID_SENDER,
      SERVER_BASE_URL: process.env.SERVER_BASE_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      FRONTEND_URL: process.env.FRONTEND_URL,
    };
  }
}

exports.config = new Config();
