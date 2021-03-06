const koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const render = require('./lib/render');

const app = new koa();
const router = Router();

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
  rolling: true, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: true, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));

app.use(logger());
app.use(serve(__dirname+'/views'));
app.use(serve(__dirname+'/public'));
app.use(bodyparser());
app.use(router.routes());
app.context.render = render;

router.get('/', async function (ctx, next) {
  ctx.body = await ctx.render('login');
});

router.get('/home', async function (ctx, next){
  if(ctx.session.views=="apple"){
    ctx.body = await ctx.render('apple',{
      date:Math.floor((new Date().getTime()-new Date("2015-10-07T00:00:00.000Z").getTime())/86400000)
    });
  }else{
    ctx.redirect('/');
  }
});

router.post('/home', async function (ctx, next) {
  console.log(ctx.session.views);
  if(ctx.request.body.email == "sheng-love-ru@titan.com" && ctx.request.body.password == "iloveyou"){
    if(ctx.request.body.checkbox=="remember-me"){
      if(ctx.session.views!="apple"){
        CONFIG.maxAge = 86400000;
        ctx.session.views = "apple";
      }
      ctx.redirect('/home');
    }else{
      CONFIG.maxAge = 6000;
      ctx.session.views = "apple";
      ctx.redirect('/home');
    }
  }else{
    ctx.redirect('/');
  }
});



app.listen(3000,function(){
  console.log("listening port on 3000");
});
