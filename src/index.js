'use strict';
const hapi = require('hapi');
const server = new hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.route(require('./login'));
server.route(require('./collection'));

module.exports = server;
