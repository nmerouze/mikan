'use strict';

const fs = require('fs');
const path = require('path');

const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const sift = require('sift');

const err = require('./error');
const setProject = require('./common').setProject;
const parseMdFiles = require('./common').parseMdFiles;
const fileNotFoundError = require('./common').fileNotFoundError;

Promise.promisifyAll(fs);

module.exports = {
  method: 'POST',
  path: '/a/login',
  handler: (req, reply) => {
    const ctx = {};

    setProject(req.info.hostname)
    .then(project => {
      ctx.project = project;
      ctx.userDirPath = path.join(ctx.project.path, 'users');
      return fs.readdirAsync(ctx.userDirPath);
    })
    .then(fileNames => {
      return parseMdFiles(ctx.userDirPath, fileNames);
    })
    .then(users => {
      const user = sift({ email: req.payload.user.email }, users)[0];

      if (user === undefined || user.password !== req.payload.user.password) {
        return err(reply, 401, new Error('Unauthorized'));
      }

      const token = jwt.sign({ email: user.email }, 'abcabc');
      reply({ user: { token: token } });
    })
    .catch(fileNotFoundError, e => {
      err(reply, 401, new Error('Unauthorized'));
    })
    .catch(e => err(reply, 500, e));
  }
};
