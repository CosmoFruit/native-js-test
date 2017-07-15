if (!window.WebSocket) {
	document.getElementById("b-w").classList.remove("active");
	document.getElementById("b-w").setAttribute('disabled', 'disabled');
	document.getElementById("allert-w").classList.remove("hidden");	
}

function XRH () { }
function WS () { }
function SSE () { }


// создать подключение
var socket = new WebSocket("ws://localhost:8081");

// отправить сообщение из формы pullform
document.forms.pullform.onsubmit = function() {
  var outgoingMessage = this.firstname.value+this.lastname.value+this.patronymic.value+this.age.value;
  socket.send(outgoingMessage);
  return false;
};

// обработчик входящих сообщений
socket.onmessage = function(event) {
  var incomingMessage = event.data;
  showMessage(incomingMessage); 
};

// вывод сообщений от сервера в textarea#log
function showMessage(message) {
  document.getElementById("log").value +=message+"\n";
}
