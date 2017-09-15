'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchRecipe = exports.search = undefined;

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _jsdom = require('jsdom');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = 'https://cookpad.com/';

var endpoints = {
  search: '/s/post',
  recipe: '/recipe'

  /**
   * @param {string} endpoint
   * @param {Object} queries
   * @return {string}
   */
};var createUrl = function createUrl(endpoint, queries) {
  return _url2.default.resolve(host, endpoint) + '?' + _querystring2.default.encode(queries);
};

/**
 * @param {string} html
 * @return {Object}
 */
var parseHtmlResponse = function parseHtmlResponse(html) {
  return new _jsdom.JSDOM(html).window;
};

/**
 * @param {string} body
 * @return {Object}
 */
var parseSearchResponse = function parseSearchResponse(body) {
  var window = parseHtmlResponse(body);

  var recipes = window.document.getElementsByClassName('recipe-preview');

  var result = [];

  for (var i = 0; i < recipes.length; i++) {
    var recipe = recipes[i];

    // Professional recipes don't hold author information. Skip !
    if (recipe.attributes[1] === undefined) continue;

    var id = recipe.children[0].id.split('_').pop();
    var title = recipe.children[1].children[0].textContent.replace(/\n/g, '');
    var authorId = recipe.attributes[1].textContent;
    var authorName = recipe.children[1].children[1].children[1].textContent;
    var description = recipe.children[1].children[3].textContent.slice(1, -1);
    var image = recipe.children[0].children[0].children[0].src;
    result.push({
      id: id,
      title: title,
      description: description,
      image: image,
      user: {
        id: authorId,
        screen_name: authorName
      }
    });
  }

  return result;
};

/**
 * @param {Object} queries
 * @return {Object} Promise object
 */
var search = function search(queries) {
  return new Promise(function (resolve, reject) {
    if (queries.keyword === undefined && queries.purpose === undefined) reject();

    // Endpoint

    var endpoint = createUrl(endpoints.search, queries);

    console.log(endpoint);

    // Get request

    _request2.default.get(endpoint, function (error, response, body) {
      if (error) reject(error);

      if (response.statusCode < 200 || 299 < response.statusCode) reject();

      var result = parseSearchResponse(body);

      resolve(result);
    });
  });
};

/**
 * @param {string} recipeId
 * @return {Object} Promise object
 */
var fetchRecipe = function fetchRecipe(recipeId) {
  return new Promise(function (resolve, reject) {
    try {
      if (recipeId === undefined) reject();

      _request2.default.get(_url2.default.resolve(host, endpoints.recipe + '/' + recipeId), function (error, response, html) {
        if (error) reject(error);

        if (response.statusCode < 200 || 299 < response.statusCode) reject();

        var document = new _jsdom.JSDOM(html).window.document;

        var recipe = document.getElementById('recipe');

        var ingredients_list = document.getElementById('ingredients_list');
        var materials = [];
        for (var i = 0; i < ingredients_list.children.length; i++) {
          var splited = ingredients_list.children[i].textContent.slice(1, -1).split('\n');
          var material = splited[0];
          var amount = splited[1];
          materials.push({
            material: material,
            amount: amount
          });
        }

        var _steps = document.getElementById('steps');
        var steps = [];
        for (var _i = 0; _i < _steps.children.length; _i++) {
          if (_steps.children[_i].children.length !== 0) {
            var image = '';
            try {
              image = _steps.children[_i].children[0].children[1].children[0].children[0].children[0].attributes['data-large-photo'].textContent;
            } catch (e) {
              // pass
            }
            steps.push({ text: _steps.children[_i].children[0].textContent.slice(10, -3), image: image });
          }
        }

        var recipe_id_and_published_date = document.getElementById('recipe_id_and_published_date').children;
        var recipeId = recipe_id_and_published_date[0].textContent.slice(1, -1).split(':').pop().replace(' ', '');
        var publishDate = recipe_id_and_published_date[1].textContent.split(':').pop().replace(' ', '').slice(0, -1);
        var updateDate = recipe_id_and_published_date[2].textContent.split(':').pop().replace(' ', '').slice(0, -1);

        var data = {
          id: recipeId,
          steps: steps,
          publishDate: publishDate,
          updateDate: updateDate,
          materials: materials,
          title: recipe.children[3].children[0].children[0].textContent.slice(1, -1),
          image: recipe.children[3].children[1].children[0].src,
          // largeImage: recipe.children[3].children[1].children[0].attributes['data-large-photo'].textContent,
          description: document.getElementById('description').children[0].textContent.slice(1, -1),
          advice: document.getElementById('advice').textContent.slice(1, -1),
          history: document.getElementById('history').textContent.slice(1, -1),
          user: {
            id: document.getElementById('recipe_author_info_wrapper').children[1].href.split('/').pop(),
            icon: document.getElementById('recipe_author_info_wrapper').children[0].src,
            screen_name: document.getElementById('recipe_author_info_wrapper').children[1].textContent
          }
        };

        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Exports

exports.search = search;
exports.fetchRecipe = fetchRecipe;