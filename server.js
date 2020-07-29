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

let users = ["Nik", "User"];
const Router = require('koa-router');
const router = new Router();
let masMes = "";
let masMesReplaced = "";
router.get('/names', async (ctx) => {
  if (!users.includes(ctx.request.query.name)) {
    users.push(ctx.request.query.name);
    ctx.body = true;
  } else {
    ctx.body = false;
  }
});

router.get('/all', async (ctx) => {
  ctx.body = users;
});

app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 7070;
const WS = require('ws');
const server = http.createServer(app.callback());
const wsServer = new WS.Server({
  server
});
wsServer.on('connection', (ws, req) => {
  const errCallback = (err) => {
    if (err) {}
  }
  ws.on('message', msg => {
    let msgJSON = JSON.parse(msg);
    if (msgJSON.mes !== undefined) {
      let date = new Date;
      masMes += `<p data-id=${msgJSON.name} style='font-size:10px; text-align: left'>` + msgJSON.name + ", " + date.toISOString().split('T')[0] + " " + date.getHours() + ":" + date.getMinutes() + "</p>" + `<p class='pMes' data-id=${msgJSON.name}>` + msgJSON.mes + "</p>" + "<br>";
    }
    setInterval(() => {
      ws.send(masMes.toString(), errCallback);
    }, 1000);
  });
});
server.listen(port);