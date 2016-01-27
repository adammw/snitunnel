var debug = require('debug')('snitunnel:http-vhost-app');
var http = require('http');
var url = require('url');
var TunnelMapping = require('./models/tunnel_mapping');

module.exports = function(req, res) {
  var urlOpts = url.parse(req.url);
  var host = req.headers.host;
  var port = 80;
  var match;
  if ((match = /(.+):(\d+)/.exec(host))) {
    host = match[1];
    port = parseInt(match[2]);
  }
  urlOpts.method = req.method;
  urlOpts.headers = req.headers;

  var clientAddress = req.socket.remoteAddress;
  debug('Received HTTP request for %s from %s', host, clientAddress);

  TunnelMapping.findWhere({ serverName: host, clientAddress: clientAddress }, function(err, mapping) {
    if (err) { debug('err', err); res.statusCode = 500; return res.end(); }

    var tunnel = (mapping && mapping.tunnel) || 'direct://';
    debug('Using %s tunnel for request to %s', tunnel, host);

    if (tunnel.indexOf('http://') == 0) {
      var match = /^http:\/\/(.+?):(\d+)/.exec(tunnel);
      urlOpts.hostname = match[1];
      urlOpts.port = match[2];
      urlOpts.path = 'http://' + req.headers.host + urlOpts.path;
    } else {
      urlOpts.hostname = host;
      urlOpts.port = port;
    }
    var tunnelRequest = http.request(urlOpts, function(tunnelResponse) {
      res.writeHead(tunnelResponse.statusCode, tunnelResponse.statusMessage, tunnelResponse.headers);
      tunnelResponse.pipe(res);
    });
    req.pipe(tunnelRequest);
  });
};
