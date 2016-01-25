const server = require('./src');

server.start(() => {
  console.log('Server running at:', server.info.uri);
});
