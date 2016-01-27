var _ = require('lodash');
var debug = require('debug')('snitunnel:control-app');
var bodyParser = require('body-parser');
var express = require('express');
var TunnelMapping = require('./models/tunnel_mapping');

var app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// delete
app.delete('/api/mappings/:id', function(req, res) {
  TunnelMapping.destroy(req.params.id, function(err) {
    if (err) { return res.status(500).json({ error: err }) };
    res.sendStatus(200);
  });
});

// create
app.post('/api/mappings', function(req, res) {
  TunnelMapping.create(req.body, function(err, map) {
    if (err) { return res.status(422).json({ error: err }) };
    res.status(201).json({ mapping: map.asJSON() });
  });
});

// show
app.get('/api/mappings/:id', function(req, res) {
  res.json(TunnelMapping.find(req.params.id, function(err, mapping) {
    if (err) { return res.status(500).json({ error: err }) };
    res.json({ mapping: mapping.asJSON() });
  }));
});

// index
app.get('/api/mappings', function(req, res) {
  res.json(TunnelMapping.all(function(err, mappings) {
    if (err) { return res.status(500).json({ error: err }) };
    res.json({ mappings: mappings.map((map) => { return map.asJSON() }) });
  }));
});

module.exports = app;
