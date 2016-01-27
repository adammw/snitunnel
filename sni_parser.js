var debug = require('debug')('snitunnel:sni-parser');
var tlsParser = require('./tls_parser');

function connectionHandler(serverSocket, socketReadyCallback) {
  // TODO: socket timeouts
  var headerLength = null;
  var serverName = null;
  serverSocket.on('readable', function headerListener() {
    if (headerLength === null) {
      var tlsHeader = serverSocket.read(tlsParser.TLS_HEADER_LEN);
      if (tlsHeader === null) return;
      headerLength = tlsParser.parseHeader(tlsHeader);
      // TODO: proper parsers
      if (headerLength <= 0) {
        serverSocket.end();
        return;
      };
    }
    if (serverName === null) {
      var tlsHandshake = serverSocket.read(headerLength);
      if (tlsHandshake === null) return;
      serverName = tlsParser.parseHandshake(tlsHandshake);
      if (typeof serverName != 'string') {
        socket.end();
        return;
      }
      debug('found server name extension: %s', serverName);
      serverSocket.removeListener('readable', headerListener);

      socketReadyCallback({ serverName: serverName }, serverSocket, tlsHeader, tlsHandshake);
    }
  });
}

module.exports = connectionHandler;
