var debug = require('debug')('snitunnel:sni-app');
var net = require('net');
var sniParser = require('./sni_parser');
var httpConnectTunnel = require('./http_connect_tunnel');
var TunnelMapping = require('./models/tunnel_mapping');

function connectionHandler(req, serverSocket, header, handshake) {
  var connectionHandler = function(clientSocket, head) {
    if (head) {
      serverSocket.write(head);
    }
    clientSocket.write(header);
    clientSocket.write(handshake);
    serverSocket.pipe(clientSocket).pipe(serverSocket);
  };

  var clientAddress = serverSocket.remoteAddress;
  debug('received connection for %s from %s', req.serverName, clientAddress);

  TunnelMapping.findWhere({ serverName: req.serverName, clientAddress: clientAddress }, function(err, mapping) {
    if (err) { debug('err', err); serverSocket.disconnect(); return; }

    var tunnel = (mapping && mapping.tunnel) || 'direct://';
    debug('Using %s tunnel for connection to %s', tunnel, req.serverName);

    if (tunnel.indexOf('http://') == 0) {
      httpConnectTunnel.connect(443, req.serverName, tunnel, function(res, clientSocket, head) {
        debug('HTTP Tunnel Status Code %d %s', res.statusCode, res.statusMessage);
        if (clientSocket) {
          connectionHandler(clientSocket, head);
        } else {
          res.end();
          serverSocket.disconnect();
        }
      });
    } else {
      var clientSocket = net.connect(443, req.serverName, function() {
        connectionHandler(clientSocket);
      });
    }
  });
}

module.exports = function(socket) {
  sniParser(socket, connectionHandler);
};
