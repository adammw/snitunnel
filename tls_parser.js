var debug = require('debug')('snitunnel:tls-parser');

// TLS Parsing Code ported from sniproxy
// https://github.com/dlundquist/sniproxy/blob/master/src/tls.c
// Under BSD License

const TLS_HEADER_LEN = 5;
const TLS_HANDSHAKE_CONTENT_TYPE = 0x16;
const TLS_HANDSHAKE_TYPE_CLIENT_HELLO = 0x01;

function parse_tls_header(data) {
  if (data.length < TLS_HEADER_LEN)
    return -1;

  if (data[0] & 0x80 && data[2] == 1) {
    debug("Received SSL 2.0 Client Hello which can not support SNI.");
    return -2;
  }

  var tls_content_type = data[0];
  if (tls_content_type != TLS_HANDSHAKE_CONTENT_TYPE) {
    debug("Request did not begin with TLS handshake.");
    return -5;
  }

  var tls_version_major = data[1];
  var tls_version_minor = data[2];
  if (tls_version_major < 3) {
    debug("Received SSL %d.%d handshake which which can not support SNI.",
          tls_version_major, tls_version_minor);
    return -2;
  }

  /* return TLS record length */
  return data.readUInt16BE(3);
};

function parse_tls_handshake(data) {
  if (data[0] != TLS_HANDSHAKE_TYPE_CLIENT_HELLO) {
    debug("Not a client hello");
    return -5;
  }

  /* Skip fixed length records:
     1	Handshake Type
     3	Length
     2	Version (again)
     32	Random
   */
  var pos = 38;

  /* Session ID */
  var sessionIDLength = data[pos];
  pos += 1 + sessionIDLength;

  /* Cipher Suites */
  var ciperSuiteLength = data.readUInt16BE(pos);
  pos += 2 + ciperSuiteLength;

  /* Compression Methods */
  var compressionMethodsLength = data[pos];
  pos += 1 + compressionMethodsLength;

  // if (pos == data.length && tls_version_major == 3 && tls_version_minor == 0) {
  //   debug("Received SSL 3.0 handshake without extensions");
  //   return -2;
  // }

  /* Extensions */
  var extensionsLength = data.readUInt16BE(pos);
  return parse_extensions(data.slice(pos + 2));
}

function parse_extensions(data) {
  var pos = 0;
  while((pos + 4) < data.length) {
    var extensionHeader = data.readUInt16BE(pos); pos += 2;
    var extensionLength = data.readUInt16BE(pos); pos += 2;
    if (extensionHeader == 0x0000) {
      return parse_server_name_extension(data.slice(pos, pos + extensionLength));
    }
    pos += extensionLength;
  }
  return -2;
}

function parse_server_name_extension(data) {
  var pos = 2;
  while((pos + 3) < data.length) {
    var nameType = data[pos]; pos += 1;
    var nameLength = data.readUInt16BE(pos); pos += 2;
    switch(nameType) {
      case 0x00: /* host_name */
        return data.slice(pos, pos + nameLength).toString();
      default:
        debug('Unknown server name extension name type: %d', nameType);
    }
    pos += nameLength;
  }
  return -2;
}

module.exports = {
  TLS_HEADER_LEN: TLS_HEADER_LEN,
  parseHeader: parse_tls_header,
  parseHandshake: parse_tls_handshake
}
