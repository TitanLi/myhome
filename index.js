const koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const TTSClient = require('itri-tts');
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
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));

app.use(logger());
app.use(serve(__dirname+'/views'));
app.use(serve(__dirname+'/public'));
app.use(bodyparser());
app.use(router.routes());
app.context.render = render;

const tts = new TTSClient("Lisheng0706", "Q3SeD");
var options = {
  TTStext: '您好，我是Angela',
  TTSSpeaker: 'Bruce',  // Bruce, Theresa, Angela, default = Bruce
  volume: 100,          // 0 ~ 100, default = 100
  speed: 0,             // -10 ~ 10, default = 0
  outType: 'wav',       // wav, flv
  PitchLevel: 0,        // -10 ~ 10, default = 0
  PitchSign: 0,         // 0, 1, 2, default = 0
  PitchScale: 5         // 0 ~ 20, default = 5
}

router.get('/', async function (ctx, next) {
  ctx.body = await ctx.render('login');
});

router.get('/home', async function (ctx, next) {
  console.log(ctx.session.views);
  if(ctx.session.views==undefined && ctx.query.email == "sheng-love-ru@titan.com" && ctx.query.password == "iloveyou"){
    if(ctx.query.checkbox=="remember-me"){
      ctx.session.views = "apple";
    }
    ctx.body = await ctx.render('apple',{
      date:Math.floor((new Date().getTime()-new Date("2015-10-07T06:00:00.000Z").getTime())/86400000)
    });
  }else if (ctx.session.views=="apple") {
    options.TTStext = "我愛蔡宛儒";

    //Create audio file .wav
    await new Promise (function(resolve,reject){
      tts.ConvertAdvancedText(options, function (err, result) {
        if (err) throw err
        if (result.resultString == "success"){
          //Get convert ID
          convertID = parseInt(result.resultConvertID);
          status = "";
          resolve();
        }
      });
    });

    //Waiting itri tts create audio
    while (status != "completed") {
      //Get audio .wav url
      await new Promise (function(resolve,reject){
        tts.GetConvertStatus(convertID, function (err, result) {
          if (err) throw err
          if (result.resultString == "success"){
            url = result.resultUrl;
            status = result.status;
            resolve();
          }
        });
      });
    }
    ctx.body = await ctx.render('apple',{
      date:Math.floor((new Date().getTime()-new Date("2015-10-07T06:00:00.000Z").getTime())/86400000),
      url:url
    });
  }else{
    ctx.redirect('/');
  }
});



app.listen(3000,function(){
  console.log("listening port on 3000");
});
