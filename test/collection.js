require('.');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const server = require('../src');

lab.experiment('GET /a/:collection', () => {
  const headers = { 'Host': 'idrinktea.dev' };

  lab.test('/a/teas', done => {
    const options = {
      method: 'GET',
      url: '/a/teas',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(200);
      Code.expect(res.result).to.deep.equal({teas:[{ name: 'sencha', type: 'green' },{ name: 'darjeeling', type: 'red' }]});
      done();
    });
  });

  lab.test('/a/teas?where={"name":"darjeeling"}', done => {
    const options = {
      method: 'GET',
      url: '/a/teas?where={"name":"darjeeling"}',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(200);
      Code.expect(res.result).to.deep.equal({teas:[{ name: 'darjeeling', type: 'red' }]});
      done();
    });
  });

  lab.test('/a/articles', done => {
    const options = {
      method: 'GET',
      url: '/a/articles',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(200);
      Code.expect(res.result).to.deep.equal({articles:[{ title: 'foo', content: '<p>bar</p>\n' }]});
      done();
    });
  });

  lab.test('/a/nothing', done => {
    const options = {
      method: 'GET',
      url: '/a/nothing',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('/a/errors', done => {
    const options = {
      method: 'GET',
      url: '/a/errors',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(500);
      done();
    });
  });

  lab.test('/a/pieces', done => {
    const options = {
      method: 'GET',
      url: '/a/pieces',
      headers: headers
    };

    server.inject(options, res => {
      Code.expect(res.statusCode).to.equal(500);
      done();
    });
  });

});
