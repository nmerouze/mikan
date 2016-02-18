const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = function(projectsPath) {
  const newProjectPath = path.join(projectsPath, 'newProject');

  fs.mkdirSync(projectsPath);
  fs.mkdirSync(newProjectPath);
  fs.mkdirSync(path.join(newProjectPath, 'content'));
  fs.mkdirSync(path.join(newProjectPath, 'users'));
  fs.mkdirSync(path.join(newProjectPath, 'static'));

  crypto.randomBytes(32, (err, buf) => {
    if (err) throw err;

    fs.writeFileSync(path.join(projectsPath, 'index.js'), `const secretKey = '${buf.toString('hex')}';

// Replace localhost by a real domain name in production
// You can use Pow or Anvil to get multiple domain names on a development machine
module.exports = {
  newProject: {
    domains: ['localhost'],
    secretKey: secretKey
  }
};
`);
  });

  fs.writeFileSync(path.join(newProjectPath, 'content', 'links.csv'), `url,description
https://www.nicolasmerouze.com/mikan,Homepage of Mikan CMS
http://localhost:3000/a/links,Link to access these links
`);

  fs.mkdirSync(path.join(newProjectPath, 'content', 'posts'));
  fs.writeFileSync(path.join(newProjectPath, 'content', 'posts', 'hello-world.md'), `---
title: Hello World
---

This is a hello world post. You can access the posts collection with endpoint http://localhost:3000/a/posts.
`);

  fs.writeFileSync(path.join(newProjectPath, 'users', 'admin.md'), `---
email: admin@example.com
password:
roles: [admin]
---

User biography goes here.
`);

  fs.writeFileSync(path.join(newProjectPath, 'static', 'test.txt'), `
You can access this file with the following URL: http://localhost:3000/test.txt
`);
}
