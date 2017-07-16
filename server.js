var express         = require('express');
var path            = require('path'); 
var logger      = require('morgan');
var bodyParser    = require('body-parser');
var app       = express();
var WebSocketServer = new require('ws');


// подключенные клиенты
var clients = {};

// сообщение
var data;

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});
webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);

    for(var key in clients) {
      clients[key].send(message);
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});


// обычный сервер  на порту 8080
app.use(logger('dev')); // выводит все запросы со статусами в консоль
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(express.static(path.join(__dirname, "")));

app.post('/pull', function(req, res, next) {      
      res.json(req.body);
      console.log(req.body);
});

app.listen(8080, function(){
  console.log("Server started at ports: 8080, 8081 ...");
});



