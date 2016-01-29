require('.');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const server = require('../src');

lab.experiment('GET /path*', () => {
  const headers = { 'Host': 'idrinktea.dev' };

  lab.test('succeeds', done => {
    const options = {
      method: 'GET',
      url: '/foo.txt',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(200);
      Code.expect(res.result).to.equal('bar\n');
      done();
    });
  });

  lab.test('fails', done => {
    const options = {
      method: 'GET',
      url: '/nothing.txt',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(404);
      done();
    });
  });

});
