const path = require('path');
const program = require('commander');

program
  .version('0.1.0');

program
  .command('start <path>')
  .description('start web server')
  .option('-p, --port <n>', 'web server port (default: 3000)', parseInt)
  .action(function(projectsPath, options){
    if (options.port !== undefined) {
      process.env.PORT = options.port;
    }

    if (path.isAbsolute(projectsPath)) {
      process.env.PROJECTS_DIR = projectsPath;
    } else {
      process.env.PROJECTS_DIR = require('path').resolve(process.cwd(), projectsPath);
    }

    const server = require('.');

    server.start(() => {
      console.log('Server running at:', server.info.uri);
    });
  });

program
  .command('setup <path>')
  .description('setup projects directory')
  .action(function(path){
    require('../scripts/setup')(path);
  });

program.parse(process.argv);

module.exports = program;
