module.exports = function(reply, code, e) {
  if (process.env.DEBUG != 'false') {
    console.log(e);
  }

  reply().code(code);
};
