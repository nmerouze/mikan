const program = require('commander');

program
  .version('0.1.0');

program
  .command('start <path>', { isDefault: true })
  .description('start web server')
  .option('-p, --port <n>', 'web server port (default: 3000)', parseInt)
  .action(function(path, options){
    process.env.PORT = options.port;
    process.env.PROJECTS_DIR = require('path').join(process.cwd(), path);

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
