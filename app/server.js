/*----- SERVER -----*/

// Modules
const Koa = require('koa');
const koaStatic = require('koa-static');
const render = require('koa-ejs');
const path = require('path');
const passport = require('./passport');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const router = require('./router');
const config = require('../config/config');
const server = new Koa();

// 
server.keys = [config.koaSecret];

server.use(session({}, server));

// Render Settings
render(server, {
  root: path.join(__dirname, '../view'),
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: true
});

// Middlewares
server.use(passport.initialize());
server.use(passport.session());
server.use(router.routes());
server.use(router.allowedMethods());
server.use(koaStatic('./public'));
server.use(bodyParser());

// Exporting module server on line 14
module.exports = server;
