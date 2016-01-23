'use strict';
const app = require('koa')();
const router = require('koa-router')();
const body = require('koa-parse-json');
const path = require('path');
const fs = require('co-fs');
const sift = require('sift');

function err(ctx, e, status) {
  console.log(e);
  ctx.status = status;
}

function escapeYaml(str) {
  if (typeof str !== 'string') {
    throw new TypeError('str is required!');
  }

  return str.replace(/\n(\t+)/g, (match, tabs) => {
    let result = '\n';

    for (let i = 0, len = tabs.length; i < len; i++){
      result += '  ';
    }

    return result;
  });
}

function filter(where, v) {
  if (typeof where === 'object') {
    return sift(where, v);
  }

  try {
    return sift(JSON.parse(where), v);
  } catch (e) {
    return v;
  }
}

function parseMarkdown(doc) {
  return new Promise((resolve, reject) => {
    const yaml = require('js-yaml');
    const marked = require('marked');

    const rFrontMatter = /^(-{3,}|;{3,})\n([\s\S]+?)\n\1(?:$|\n([\s\S]*)$)/;
    const match = doc.match(rFrontMatter);
    const data = yaml.load(escapeYaml(match[2]), {});

    if (typeof data !== 'object') {
      return reject(new Error('YAML parsing problem.'));
    }

    marked(match[3] || '', (err, content) => {
      if (err) {
        return reject(err);
      } else {
        data.content = content;
        resolve(data);
      }
    });
  });
}

function *setProject(next) {
  const projectsPath = process.env.PROJECTS_DIR || path.join(__dirname, '../projects');
  const projects = require(projectsPath);
  const projectName = Object.keys(projects).find(k => projects[k].domains.indexOf(this.request.hostname) != -1);

  this.project = projects[projectName];
  this.project.name = projectName;
  this.project.path = path.join(projectsPath, projectName);

  yield next;
}

function *read(next) {
  const collectionPath = path.join(this.project.path, 'content', this.params.collection);

  if (yield fs.exists(collectionPath)) {
    try {
      const files = yield fs.readdir(collectionPath);
      const filePaths = files.map(file => path.join(collectionPath, file));
      this.data = yield filePaths.map(filePath => fs.readFile(filePath, 'utf8'));
      yield next;
    } catch(e) {
      err(this, e, 500);
    }

    return;
  }

  if (yield fs.exists(`${collectionPath}.csv`)) {
    try {
      this.data = yield fs.readFile(`${collectionPath}.csv`, 'utf8');
      yield next;
    } catch(e) {
      err(this, e, 500);
    }

    return;
  }

  err(this, new Error(`Collection "${this.params.collection}" not found.`), 404);
}

function *parse(next) {
  function parseCSV(doc) {
    return new Promise((resolve, reject) => {
      const csv = require('csv');

      csv.parse(doc, (err, result) => {
        if (err) {
          return reject(err);
        }

        const data = result.slice(1).map((item) => {
          const o = {};
          result[0].forEach((key, i) => { o[key] = item[i] });
          return o;
        });

        resolve(data);
      });
    });
  }

  if (Array.isArray(this.data)) {
    try {
      this.data = yield this.data.map(doc => parseMarkdown(doc));
      yield next;
    } catch(e) {
      err(this, e, 500);
    }

    return;
  }

  if (typeof this.data === 'string') {
    try {
      this.data = yield parseCSV(this.data);
      yield next;
    } catch(e) {
      err(this, e, 500);
    }

    return;
  }

  err(this, new Error(`Data type was "${typeof this.data}" instead of array or string.`), 500);
}

function *render() {
  this.body = { [this.params.collection]: filter(this.request.query.where, this.data) };
}

router.post('/a/login', setProject, body(), function *() {
  const jwt = require('jsonwebtoken');

  const userDirPath = path.join(this.project.path, 'users');

  if (yield fs.exists(userDirPath)) {
    try {
      const userDir = yield fs.readdir(userDirPath);
      const userPaths = userDir.map(userPath => path.join(userDirPath, userPath));
      const users = yield userPaths.map(userPath => fs.readFile(userPath, 'utf8'));
      const parsedUsers = yield users.map(doc => parseMarkdown(doc));
      const user = sift({ email: this.request.body.user.email }, parsedUsers)[0];
      if (user === undefined || user.password !== this.request.body.user.password) {
        return err(this, new Error('Unauthorized.'), 401);
      }

      const token = jwt.sign({ email: user.email }, 'abcabc');
      this.body = { user: { token: token } };
    } catch(e) {
      return err(this, e, 500);
    }
  }

  err(this, new Error('Unauthorized.'), 401);
});

router.get('/a/:collection', setProject, read, parse, render);

app
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app;
