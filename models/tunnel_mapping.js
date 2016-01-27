var _ = require('lodash');
var debug = require('debug')('snitunnel:tunnel-mapping');
var tunnelMappings = [];

function TunnelMapping(params) {
  _.extend(this, _.pick(params, ['domain', 'tunnel', 'networks']));
  this.domainMatch = new RegExp(`^${this.domain}$`, 'i');
}

TunnelMapping.prototype.asJSON = function() {
  var json = _.pick(this, ['domain', 'tunnel', 'networks']);
  json.id = tunnelMappings.indexOf(this);
  return json;
}

module.exports = {
  all: function(cb) {
    cb(null, tunnelMappings);
  },
  find: function(i, cb) {
    debug('find(%d)', i);
    cb(null, tunnelMappings[i]);
  },
  findWhere: function(params, cb) {
    debug('findWhere(%j)', params);
    cb(null, tunnelMappings.find((map) => {
      return map.domainMatch.test(params.serverName) && (map.networks.indexOf(params.clientAddress) !== -1);
    }));
  },
  create: function(params, cb) {
    debug('create(%j)', params);
    var map = new TunnelMapping(params);
    tunnelMappings.push(map);
    _.isFunction(cb) && cb(null, map);
  },
  destroy: function(i, cb) {
    tunnelMappings.splice(i, 1);
    cb(null);
  }
}
