var _ = require('lodash');
var debug = require('debug')('snitunnel:tunnel-mapping');
var tunnelMappings = [];

function TunnelMapping(params) {
  this.enabled = true;
  this.name = null;
  this.domain = null;
  this.tunnel = null;
  this.networks = null;
  this.update(params);
}

TunnelMapping.prototype.asJSON = function() {
  var json = _.pick(this, ['name', 'domain', 'tunnel', 'networks', 'enabled']);
  json.id = tunnelMappings.indexOf(this);
  return json;
};

TunnelMapping.prototype.update = function(params, cb) {
  _.extend(this, _.pick(params, ['name', 'domain', 'tunnel', 'networks', 'enabled']));
  this.domainMatch = new RegExp(`^${this.domain}$`, 'i');
  _.isFunction(cb) && cb(null, this);
};

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
      return map.enabled && map.domainMatch.test(params.serverName) && (map.networks.indexOf(params.clientAddress) !== -1);
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
