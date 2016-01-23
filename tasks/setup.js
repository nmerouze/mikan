const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const projectsPath = path.join(__dirname, '../projects');
const newProjectPath = path.join(projectsPath, 'newProject');

fs.mkdirSync(projectsPath);
fs.mkdirSync(newProjectPath);
fs.mkdirSync(path.join(newProjectPath, 'content'));
fs.mkdirSync(path.join(newProjectPath, 'users'));

crypto.randomBytes(32, (err, buf) => {
  if (err) throw err;

  fs.writeFileSync(path.join(projectsPath, 'index.js'), `const secretKey = '${buf.toString('hex')}';

module.exports = {
  newProject: {
    domains: ['localhost'],
    secretKey: secretKey
  }
};
  `);
});

fs.writeFileSync(path.join(newProjectPath, 'users', 'admin.md'), `---
email: admin@example.com
password:
roles: [admin]
---

User biography goes here.
`);
