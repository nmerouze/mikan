'use strict';
const hapi = require('hapi');
const server = new hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.register(require('inert'), err => {
  if (err) throw err;

  server.route(require('./login'));
  server.route(require('./collection'));
  server.route(require('./static'));
});

module.exports = server;
