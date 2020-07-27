const http = require('http');
const Koa = require('koa');
const {
  streamEvents
} = require('http-event-stream');
const uuid = require('uuid');
const app = new Koa();

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };
  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({
      ...headers
    });
    try {
      return await next();
    } catch (e) {
      e.headers = {
        ...e.headers,
        ...headers
      };
      throw e;
    }
  }
  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUD, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});

const mas = ["action", "action", "freekick", "action", "goal", "freekick", "action", "freekick", "action", "freekick"];
// const masTotal =[];
let coin = 0;  
const Router = require('koa-router');
const router = new Router();

function action() {
  return mas[Math.floor(Math.random() * 10)];
}

router.get('/sse', async (ctx) => {
  coin = 0;
  const masTotal =[];
  streamEvents(ctx.req, ctx.res, {
    async fetch(lastEventId) {
      return [];
    },

    stream(sse) {
        const interval = setInterval(() => {
          console.log(coin);
          if (coin < 50) {
            let d = action();
            if(d==="freekick"){
              d='&#10071'+ '&#10071'+d;
            } else if(d==="goal"){
              d='&#9917'+d;
            } 
            let date = new Date;
            masTotal.push("<p style='font-size:10px'>"+date.toISOString().split('T')[0]+" "+date.getHours()+":"+date.getMinutes()+"</p>"+"<p>"+d+"</p>"+"<br>");
          sse.sendEvent({
            data: masTotal
          });
          coin++;
          return () => clearInterval(interval);
        }
        else { 
          return;
        }
        }, 1000);
    }
  });
  ctx.respond = false;
});
app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);