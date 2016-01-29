const path = require('path');
const setProject = require('./common').setProject;

module.exports = {
  method: 'GET',
  path: '/{path*}',
  handler: function (req, reply) {
    setProject(req.info.hostname)
    .then(project => {
      const filePath = path.resolve(project.path, 'static', req.params.path);
      reply.file(filePath);
    });
  }
};
