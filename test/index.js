const path = require('path');
const supertest = require('co-supertest');
const expect = require('chai').expect;

require('co-mocha');
const test = it;

process.env.PROJECTS_DIR = path.join(__dirname, 'fixtures');

const app = require('../src');
const req = supertest.agent(app.listen());
const headers = { Host: 'idrinktea.dev' };

test('/a/teas renders json from csv', function *() {
  const res = yield req.get('/a/teas').set(headers).end();
  expect(res.status).to.equal(200);
  expect(res.body).to.deep.equal({teas:[{ name: 'sencha', type: 'green' },{ name: 'darjeeling', type: 'red' }]});
});

test('/a/teas with where param filters data', function *() {
  const res = yield req.get('/a/teas?where={"name":"darjeeling"}').set(headers).end();
  expect(res.status).to.equal(200);
  expect(res.body).to.deep.equal({teas:[{ name: 'darjeeling', type: 'red' }]});
});

test('/a/articles renders json from markdown', function *() {
  const res = yield req.get('/a/articles').set(headers).end();
  expect(res.status).to.equal(200);
  expect(res.body).to.deep.equal({articles:[{ title: 'foo', content: '<p>bar</p>\n' }]});
});

test('/a/nothing returns 404 error', function *() {
  const res = yield req.get('/a/nothing').set(headers).end();
  expect(res.status).to.equal(404);
});

test('/a/errors returns 500 error', function *() {
  const res = yield req.get('/a/errors').set(headers).end();
  expect(res.status).to.equal(500);
});

test('/a/pieces returns 500 error', function *() {
  const res = yield req.get('/a/pieces').set(headers).end();
  expect(res.status).to.equal(500);
});


test('/a/login returns user token', function *() {
  const body = { user: { email: 'nicolas@example.com', password: 'password' } };
  const postHeaders = headers;
  postHeaders['Accept'] = 'application/json';

  const res = yield req.post('/a/login').send(body).set(postHeaders).end();
  expect(res.status).to.equal(200);
  expect(res.body.user.token).to.be.a('string');
});

test('login fails with invalid email', function *() {
  const body = { user: { email: 'nico@example.com', password: 'password' } };
  const postHeaders = headers;
  postHeaders['Accept'] = 'application/json';

  const res = yield req.post('/a/login').send(body).set(postHeaders).end();
  expect(res.status).to.equal(401);
});

test('login fails with invalid password', function *() {
  const body = { user: { email: 'nicolas@example.com', password: 'nopass' } };
  const postHeaders = headers;
  postHeaders['Accept'] = 'application/json';

  const res = yield req.post('/a/login').send(body).set(postHeaders).end();
  expect(res.status).to.equal(401);
});
