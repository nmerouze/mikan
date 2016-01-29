'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const Promise = require('bluebird');
const sift = require('sift');

const err = require('./error');

const setProject = require('./common').setProject;
const parseMdFiles = require('./common').parseMdFiles;
const fileNotFoundError = require('./common').fileNotFoundError;

Promise.promisifyAll(fs);

function parseCsvFile(doc) {
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

function filter(where, v) {
  try {
    return sift(JSON.parse(where), v);
  } catch (e) {
    return v;
  }
}

module.exports = {
  method: 'GET',
  path: '/a/{collection}',
  handler: (req, reply) => {
    const ctx = {};

    function read(project) {
      ctx.collectionPath = path.join(project.path, 'content', req.params.collection);

      return fs.readdirAsync(ctx.collectionPath)
             .catch(fileNotFoundError, e => {
               return fs.readFileAsync(`${ctx.collectionPath}.csv`, 'utf8');
             })
    }

    function parse(v) {
      if (Array.isArray(v)) {
        return parseMdFiles(ctx.collectionPath, v);
      } else {
        return parseCsvFile(v);
      }
    }

    function render(v) {
      reply({ [req.params.collection]: filter(req.query.where, v) });
    }

    setProject(req.info.hostname)
    .then(read)
    .then(parse)
    .then(render)
    .catch(fileNotFoundError, e => {
      err(reply, 404, new Error(`Collection "${req.params.collection}" not found.`));
    })
    .catch(e => {
      err(reply, 500, e);
    });
  }
};
