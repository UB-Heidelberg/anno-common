'use strict';

const trustedDebugIpAddrs = [
  '::ffff:127.0.0.1',
  '127.0.0.1',
];


const EX = function fallbackErrorHandler(err, req, resp, next) {
  // ATTN: This function must declare exactly 4 arguments in order to
  //       make express detect it is meant as an error handler.

  console.error(err);
  resp.status(err.code || 500);
  resp.header('Content-Type', 'text/plain; charset=UTF-8');
  resp.send('Internal Server Error\n');

  const ip = String(req._remoteAddress || '');
  if (trustedDebugIpAddrs.includes(ip)) {
    resp.send('\n' + err.stack + '\n');
  }

  resp.end();
  next();
};

module.exports = EX;
