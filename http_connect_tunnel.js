var debug = require('debug')('snitunnel:http-connect-tunnel');
var http = require('http');

module.exports = {
  connect: function(port, host, tunnelPort, tunnelHost, cb) {
    var req = http.request({
      host: tunnelHost,
      port: tunnelPort,
      method: 'CONNECT',
      path: `${host}:${port}`
    });
    req.on('connect', cb);
    req.on('response', cb);
    req.end();
  }
}
