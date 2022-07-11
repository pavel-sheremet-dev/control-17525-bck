const { Server } = require('./server');

const startServer = () => {
  new Server().start();
}

exports.startServer = startServer
