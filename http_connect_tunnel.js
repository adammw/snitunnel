var debug = require('debug')('snitunnel:http-connect-tunnel');
var http = require('http');

module.exports = {
  connect: function(port, host, tunnelUrl, cb) {
    var tunnel = new URL(tunnelUrl);
    var requestParams = {
      headers: {},
      host: tunnel.host,
      port: tunnel.port || 80,
      method: 'CONNECT',
      path: `${host}:${port}`
    };

    if (tunnel.username) {
      var auth = `${tunnel.username}:${tunnel.password}`
      requestParams.headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`
    }

    var req = http.request(requestParams);
    req.on('connect', cb);
    req.on('response', cb);
    req.end();
  }
}
