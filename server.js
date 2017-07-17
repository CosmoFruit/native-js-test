var express         = require('express');
var path            = require('path'); 
var logger      = require('morgan');
var bodyParser    = require('body-parser');
var app       = express();
var WebSocketServer = new require('ws');


var clients = {};
var data = '{"0": "нет текущих данных."}';
var keepAlive;

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});

  webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  var lastdata;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);
    data = lastdata = message;

    for(var key in clients) {
      clients[key].send(message);
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });


  var checkData = setInterval(function(){
      if (data!==lastdata) {
        lastdata=data;
        for(var key in clients) clients[key].send(lastdata);
      }
    }, 3000);
});

// обычный сервер  на порту 8080
app.use(logger('dev')); // выводит все запросы со статусами в консоль
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, "")));

app.post('/pull', function(req, res, next) {      
      res.json(req.body);
      console.log(req.body);
      data = JSON.stringify(req.body);
});

app.get('/push', function(req, res, next) {      
      res.json(JSON.parse(data));
});

app.get('/push/sse', function(req, res, next){
    res.writeHead(200, {
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    });

    console.log("SSE соединение открыто...");
    keepAlive = setInterval(function(){
      console.log('SSE writing: ' + data);
      res.write('retry: '+ 3000 +' \n\n' + 'data: '+ data +' \n\n');
    }, 5000);

    var serverTimeOut = setInterval(function(){
        res.end();
        clearInterval(keepAlive);
        clearInterval(serverTimeOut);
        console.log("SSE соединение закрыто сервером по таймауту.");
    }, 30000);
});

app.get('/push/close', function(req, res, next){
      clearInterval(keepAlive);
      console.log("SSE соединение закрыто клиентом.");
      res.json();
 });

app.listen(8080, function(){
  console.log("Server started at ports: 8080, 8081 ...");
});



