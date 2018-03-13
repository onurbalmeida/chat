"use strict";

const WebSocketServer = require('ws').Server;
const redis = require("redis");
const redisSub = redis.createClient();
const redisPub = redis.createClient();

const server = require('http').createServer(
  require('ecstatic')({root: `${__dirname}/www`})
);

const wss = new WebSocketServer({server: server});

wss.on('connection', ws => {
  wss.clientID = GetIdClient(wss.clients);
  console.log('Client '+ wss.clientID +' connected');
  ws.on('message', msg => {
    console.log(wss.clientID + `Message: ${msg}`);
    redisPub.publish('chat_messages', msg);
  });
});

redisSub.subscribe('chat_messages');
redisSub.on('message', (channel, msg) => {
  wss.clients.forEach((client) => {
    client.send(msg);
  });
});

function GetIdClient(data)
{
    var count = 0;

    wss.clients.forEach(() => {
        count++;
      });

    return count;
}

server.listen(process.argv[2] || 8082);