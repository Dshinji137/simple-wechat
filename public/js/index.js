var socket = io();
var user = {};

function toggle(id) {
  if(id == 1) {
    document.getElementById('sign-up').style.display = 'block';
    document.getElementsByClassName('select-btn')[0].style.backgroundColor = '#1F4C69';
    document.getElementsByClassName('select-btn')[0].style.color = 'white';
    document.getElementById('log-in').style.display = 'none';
    document.getElementsByClassName('select-btn')[1].style.backgroundColor = 'white';
    document.getElementsByClassName('select-btn')[1].style.color = 'black';
  } else {
    document.getElementById('sign-up').style.display = 'none';
    document.getElementsByClassName('select-btn')[0].style.backgroundColor = 'white';
    document.getElementsByClassName('select-btn')[0].style.color = 'black';
    document.getElementById('log-in').style.display = 'block';
    document.getElementsByClassName('select-btn')[1].style.backgroundColor = '#1F4C69';
    document.getElementsByClassName('select-btn')[1].style.color = 'white';
  }
}


var signup = document.getElementById("sign-up");
signup.addEventListener("submit",(e) => {
  e.preventDefault();
  var email = document.getElementById("signup-email").value;
  var name = document.getElementById("signup-username").value;
  var pw = document.getElementById("signup-password").value;
  if(typeof(name) == 'string' && name.trim().length > 0 && typeof(pw) == 'string' && pw.trim().length >= 6) {
      socket.emit('user-signup',{email:email,name:name,password:pw},function(msg) {
        if(typeof(msg) === 'string') {
          if(msg.includes('duplicate key error')) {
            document.getElementById('signup-error-msg').innerHTML = "This is a registered account";
          }
        } else {
          document.getElementById('signup-error-msg').innerHTML = "";
          var url = window.location.href+'home.html?id='+msg._id;
          window.location.href = url;
        }
      });
  } else {
    alert("invalid name or room");
  }
});

var login = document.getElementById("log-in");
login.addEventListener("submit",(e) => {
  e.preventDefault();
  var email = document.getElementById("login-email").value;
  var pw = document.getElementById("login-password").value;

  socket.emit('user-login',{email:email,password:pw},function(msg) {
    if(typeof(msg) == 'string') {
      if(msg.includes('does not match')) {
        document.getElementById('login-error-msg').innerHTML = "Username and Password does not match";
      }
    } else {
      document.getElementById('login-error-msg').innerHTML = "";
      var url = window.location.href + 'home.html?id=' + msg._id;
      window.location.href = url;
      //
    }
  });
});
