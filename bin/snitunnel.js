#!/usr/bin/env node
var net = require('net');
var http = require('http');
var debug = require('debug')('snitunnel');
var controlApp = require('../control_app');
var httpVhostApp = require('../http_vhost_app');
var sniProxyApp = require('../sni_proxy_app');

var controlServer = http.createServer(controlApp);
controlServer.listen(3000, '0.0.0.0', function(s) {
  var addr = controlServer.address();
  console.log('Control Server listening on %s %s:%d', addr.family, addr.address, addr.port);
});

var httpVhostServer = http.createServer(httpVhostApp);
httpVhostServer.listen(80, '0.0.0.0', function() {
  var addr = httpVhostServer.address();
  console.log('HTTP VHost Server listening on %s %s:%d', addr.family, addr.address, addr.port);
});

var sniProxyServer = net.createServer(sniProxyApp);
sniProxyServer.listen(443, '0.0.0.0', function() {
  var addr = sniProxyServer.address();
  console.log('SNI Proxy Server listening on %s %s:%d', addr.family, addr.address, addr.port);
});
