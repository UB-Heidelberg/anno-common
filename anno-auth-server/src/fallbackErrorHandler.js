'use strict';

const EX = function fallbackErrorHandler(err, req, resp) {
  console.error(err);
  resp.header('Content-Type', 'text/plain; charset=UTF-8');
  resp.status(err.code || 400);
  resp.send(err.message);
  resp.end();
};

module.exports = EX;
