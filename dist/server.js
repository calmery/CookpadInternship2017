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

app.get('/demo', function (_, response) {
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
  if (request.params.id === '99999') {
    response.json({
      id: '1715052',
      publishDate: '12/04/17',
      updateDate: '17/04/10',
      materials: [{ material: 'さつまいも', amount: '150ｇ' }, { material: '卵', amount: '2個' }, { material: 'ごま', amount: '大さじ３' }, { material: 'マヨネーズ', amount: '大さじ１' }, { material: 'お酢', amount: '大さじ１' }, { material: '醤油', amount: '大さじ1/2' }],
      image: 'https://img.cpcdn.com/recipes/1715052/280/745ea77289c5d10333d8215902605a9c.jpg?u=2335344&p=1334597882',
      description: '600れぽ＆ニュース掲載❀感謝♪\nメイン材料たった２つ！\n胡麻の風味が全体を包み、卵と薩摩芋のほっこりコラボです♡＾＾',
      advice: '下準備さえできていればすぐにできる簡単レシピです＾＾薩摩芋は温かいうちに調味料に漬け込む事で、味が良く馴染みます＾＾お子さんにもきっと食べ易いと思います。お好みでマスタードやブラックペッパーでアレンジ下さい。',
      history: '胡麻を一杯とりたいと思った事がきっかけです。',
      user: {
        id: '2335344',
        image: 'https://img.cpcdn.com/users/2335344/22x22c/a0b09b0bb06f3c4a6c542f629ee99d3b.jpg?u=2335344&p=1452946902',
        screen_name: '時花菜'
      },
      title: '簡単☆薩摩芋と茹で卵のほっこりサラダ',
      steps: [{ text: '鍋に卵を入れる', image: 'resources/recipe/recipe_01.jpg' }, { text: '卵がかぶるくらいの量の水を入れる', image: 'resources/recipe/recipe_02.jpg' }, { text: '15分ゆでる', image: 'resources/recipe/recipe_03.jpg' }, { text: '流水で卵を冷やす', image: 'resources/recipe/recipe_04.jpg' }, { text: 'すり鉢でごまを擦る', image: 'resources/recipe/recipe_05.jpg' }, { text: 'さつまいもは一口サイズに切る', image: 'resources/recipe/recipe_06.gif' }, { text: '切ったさつまいもをレンジで6分温める', image: 'resources/recipe/recipe_07.jpg' }, { text: 'ボールにマヨネーズ・お酢・醤油を入れる', image: 'resources/recipe/recipe_08.jpg' }, { text: '混ぜる', image: 'resources/recipe/recipe_09.png' }, { text: '温めたさつまいもを加えて馴染ませる', image: 'resources/recipe/recipe_10.jpg' }, { text: '擦ったごまを加え，充分に混ぜる', image: 'resources/recipe/recipe_11.jpg' }, { text: 'ゆで卵の殻をむく', image: 'resources/recipe/recipe_12.jpg' }, { text: 'ゆで卵をちぎってボールの中に入れる', image: 'resources/recipe/recipe_13.jpg' }, { text: 'ざっくり混ぜる', image: 'resources/recipe/recipe_14.jpg' }, { text: 'できあがり！！', image: 'resources/recipe/recipe_15.jpg' }] });
  } else {
    (0, _cookpad.fetchRecipe)(request.params.id).then(function (result) {
      return response.json(result);
    }).catch(function () {
      return response.json({});
    });
  }
});

// Launch

app.listen(process.env.PORT || 3000);