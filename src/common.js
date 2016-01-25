'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

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

module.exports = {
  setProject(hostname) {
    return new Promise(resolve => {
      const projectsPath = process.env.PROJECTS_DIR || path.join(__dirname, '../projects');
      const projects = require(projectsPath);
      const projectName = Object.keys(projects).find(k => projects[k].domains.indexOf(hostname) != -1);

      const project = projects[projectName];
      project.name = projectName;
      project.path = path.join(projectsPath, projectName);

      resolve(project);
    });
  },

  parseMdFiles(dirPath, fileNames) {
    const filePaths = fileNames.map(file => path.join(dirPath, file));
    return Promise.all(filePaths.map(filePath => fs.readFileAsync(filePath, 'utf8')))
           .then(files => {
             return Promise.all(files.map(file => parseMarkdown(file)));
           })
  },

  fileNotFoundError(e) {
    return e.code === 'ENOENT';
  }
}
