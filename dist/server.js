'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cookpad = require('./cookpad');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var api = (0, _express2.default)();

app.use(_express2.default.static(_path2.default.resolve(__dirname, '../public')));

app.get('/:id', function (_, response) {
  response.sendFile(_path2.default.resolve(__dirname, '../public/index.html'));
});

app.use('/api', api);

// Routing

api.get('/search', function (request, response) {
  (0, _cookpad.search)(request.query).then(function (result) {
    return response.json(result);
  }).catch(function () {
    return response.json([]);
  });
});

api.get('/recipe/:id', function (request, response) {
  (0, _cookpad.fetchRecipe)(request.params.id).then(function (result) {
    return response.json(result);
  }).catch(function () {
    return response.json({});
  });
});

// Launch

app.listen(process.env.PORT || 3000);