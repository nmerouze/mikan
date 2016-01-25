require('.');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const server = require('../src');

lab.experiment('POST /a/login', () => {
  const headers = { 'Host': 'idrinktea.dev', 'Content-Type': 'application/json' };

  lab.test('succeeds', done => {
    const options = {
      method: 'POST',
      url: '/a/login',
      payload: { user: { email: 'nicolas@example.com', password: 'password' } },
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(200);
      Code.expect(res.result.user.token).to.be.a.string();
      done();
    });
  });

  lab.test('fails with invalid email', done => {
    const options = {
      method: 'POST',
      url: '/a/login',
      payload: { user: { email: 'invalid@example.com', password: 'password' } },
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(401);
      done();
    });
  });

  lab.test('fails with invalid password', done => {
    const options = {
      method: 'POST',
      url: '/a/login',
      payload: { user: { email: 'nicolas@example.com', password: 'invalid' } },
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(401);
      done();
    });
  });

});
