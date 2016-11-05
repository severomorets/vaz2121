var five = require("johnny-five");
var board = new five.Board();

Pin  = require('./config.js').Pin();

board.on("ready", function() {
  for(var numPin in Pin){
    initPort(this,numPin)
  }


});


function initPort($this,numPin){
  Pin[numPin].val = 0;
  if (Pin[numPin].type=="D_IN")
  {
    Pin[numPin].port = new five.Sensor.Digital(Pin[numPin].pin);
    Pin[numPin].port.on("change", function() {
      Pin[numPin].val = this.value
        console.log(Pin[numPin].pin+" = "+Pin[numPin].val);
        sendClient()
      });
  }
  if (Pin[numPin].type=="A_IN")
  {
    Pin[numPin].port = new five.Sensor(Pin[numPin].pin);

    Pin[numPin].port.on("change", function() {
      Pin[numPin].val = this.value
        console.log(Pin[numPin].pin+" = "+Pin[numPin].val);
        sendClient()
      });
  }
  if (Pin[numPin].type=="A_IN_PULSE")
  {

    Pin[numPin].port = new five.Proximity({
      controller: "SRF10",
      pin: Pin[numPin].pin
    });


    Pin[numPin].port.on("change", function() {
      Pin[numPin].val = this.value
      Pin[numPin].val = {
        inches:this.inches,
        cm:this.cm
      }
      sendClient()
      console.log("inches: ", this.inches);
      console.log("cm: ", this.cm);
      });
  }

}
function sendClient(){
  for (var key in clients) {
    var val = {}
    for(var numPin in Pin){
      val[numPin] = {pin:Pin[numPin].pin,val:Pin[numPin].val,name:Pin[numPin].name}
    }
    clients[key].send(JSON.stringify(val));
  }
}
var WebSocketServer = new require('ws');

// подключенные клиенты
clients = [];

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
  port: 8081
});

webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;

  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);


  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});
