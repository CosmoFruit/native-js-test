'use strict'

//модель данных
var user = { };

//режим отправки
var transport = 0;
var xhr;
var socket;
var sse;

//Проверка поддержки Вебсокет
if (!window.WebSocket) {
	document.getElementById("b-w").classList.remove("active");
	document.getElementById("b-w").setAttribute('disabled', 'disabled');
	document.getElementById("allert-w").classList.remove("hidden");	
}

XHR();


function XHR () { 
	document.getElementById("b-xhr").classList.add("active");
	document.getElementById("b-w").classList.remove("active");
	document.getElementById("b-sse").classList.remove("active");
	document.getElementById("b-push").removeAttribute('disabled');

	transport = 0;	
}

function WS () { 
	document.getElementById("b-xhr").classList.remove("active");
	document.getElementById("b-w").classList.add("active");
	document.getElementById("b-sse").classList.remove("active");
	document.getElementById("b-push").setAttribute('disabled', 'disabled');

	// создать подключение
	transport = 1;
	log("Устанавливается Websocket соединение...");
	socket = new WebSocket("ws://localhost:8081");
	log("Websocket соединени установлено!");
	
	// обработчик входящих сообщений Websocket
	socket.onmessage = function(event) {
		var incomingMessage = event.data;
		log("Websocket принято сообщение: "+incomingMessage); 
		pushForm(incomingMessage);
	};	
}

function SSE () { 
	document.getElementById("b-xhr").classList.remove("active");
	document.getElementById("b-w").classList.remove("active");
	document.getElementById("b-sse").classList.add("active");
	document.getElementById("b-push").setAttribute('disabled', 'disabled');

	transport = 2;
}

// отправить сообщение из формы pullform
document.forms.pullform.onsubmit = function() {
	
	log("Подготовка к отправке. Валидация формы...");
	var errFlag = false;
	
	for (var i=0; i < this.elements.length-2; i++) {
		resetError(this.elements[i].parentNode);
      	if (!this.elements[i].value) {
        	showError(this.elements[i].parentNode, 'Укажите данные.');
        	errFlag = true;
      	} else if (this.elements[i].value.length > 15 ) {
        	showError(this.elements[i].parentNode, 'Длина не более 15 символов.');
        	errFlag = true;
      	} else {
      		user[i] = this.elements[i].value;
      	}
    }

    resetError(this.age.parentNode);
      if ( !this.age.value ) {
        	showError( this.age.parentNode, 'Укажите возраст.' );
        	errFlag = true;
      } else if ( this.age.value <18 || this.age.value >50 ) {
        	showError( this.age.parentNode, 'От 18 до 50.' );
        	errFlag = true;
      } else {
      		user[i]= this.age.value;
      }

    if (errFlag) {
    	log("ERROR. Валидация не пройдена!");
    	return false;
    }

    var data = JSON.stringify(user);

    switch (transport) { 
    	case 0: {
    		log("XHR POST отправлен..."); 
    		xhr = new XMLHttpRequest();
			xhr.open("POST", '/pull', true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    		xhr.send(data);
    		xhr.onreadystatechange = function() {
  				if (xhr.readyState != 4) {
  					log("Ожидаем ответа сервера...")
  					return false;
  				}  	
  				if (xhr.status)	{		
  					log("Статус ответа: "+xhr.status + ': ' + xhr.statusText);
  					log("Тело ответа: "+xhr.responseText);
  					pushForm(xhr.responseText);
  				} else {
  					log("Сервер не отвечает...");
  				}
			}
    	}; break;
    	case 1: {     		
  			log("Websocket отправлено сообщение: "+data); 
  			socket.send(data);
    	} ; break;
    	case 2: { } ; break;
    }
  	
  	return false;
};

// отправить запрос обновление данных pushform
document.forms.pushform.onsubmit = function() {
	return false;
}

// вывод принятых данных в форму pushform
function pushForm(message) {	
	var data = JSON.parse(message);
	var form = document.forms.pushform;

	for (var i=0; i < form.elements.length-1; i++) {
		form.elements[i].value = data[i];
	}
 }

 // логирование событий + вывод ошибок в textarea#log
function log(message) {
	var log = document.getElementById("log");
	var time = new Date ();
	log.value +=time.getHours()+":"+time.getMinutes()+":"+time.getSeconds()+"  "+message+"\n";
	log.scrollTop = log.scrollHeight;
}

//показ ошибки валидации формы pullform
function showError(container, errorMessage) {
    container.classList.add("error");
    var msgElem = document.createElement('span');
    msgElem.className = "error-message";
    msgElem.innerHTML = errorMessage;
    container.appendChild(msgElem);
}

//удаление ошибки валидации формы pullform
function resetError(container) {
    container.classList.remove("error");
    if (container.lastChild.className == "error-message") {
        container.removeChild(container.lastChild);
    }
}
