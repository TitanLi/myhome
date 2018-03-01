const koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const render = require('./lib/render');

const app = koa();
const router = new Router();

app.keys = ['apple'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));

app.use(logger());
app.use(serve(__dirname+'/views'));
app.use(serve(__dirname+'/public'));
app.use(bodyparser());
app.use(router.middleware());

router.get('/', function * () {
  this.body = yield render('login');
});

router.get('/home', function * (){
  if(this.session.views=="apple"){
    this.body = yield render('apple',{
      date:Math.floor((new Date().getTime()-new Date("2015-10-07T00:00:00.000Z").getTime())/86400000)
    });
  }else{
    this.redirect('/');
  }
});
router.post('/home', function * () {
  if(this.request.body.email == "sheng-love-ru@titan.com" && this.request.body.password == "iloveyou"){
    if(this.request.body.checkbox=="remember-me"){
      if(this.session.views!="apple"){
        CONFIG.maxAge = 86400000;
        this.session.views = "apple";
      }
    }else{
      CONFIG.maxAge = 6000;
      this.session.views = "apple";
    }
    this.redirect('/home');
  }else{
    this.redirect('/');
  }
});

var server = app.listen(3000, function() {
var port = server.address().port;
  console.log("App now running on port", port);
});
