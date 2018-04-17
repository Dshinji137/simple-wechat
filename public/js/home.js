//var socket = io();
var socket = io.connect();
var section = 1;
var allContacts = {};
var unRead = {};
var read = {};
var userId = "";
var chatId = "";
var postOpen = false;
var imageNum = 0;
var input = [];
var counter = 0;
var newContact = [];
var newNotifications = [];

var containerWidth = window.innerWidth-150;
var backgroundWidth = window.innerWidth-250;
var backgroundHeight = '300px';
document.getElementsByClassName('posts-container')[0].style.width = containerWidth.toString()+'px';
document.getElementsByClassName('posts-background')[0].style.width = backgroundWidth.toString()+'px';

var uploader = new SocketIOFileUpload(socket);
//document.getElementById('post-img').addEventListener("click",uploader.prompt,false);
//console.log(input.length);
//uploader.listenOnSubmit(document.getElementById("submit-post"),document.getElementById("post-img"));
// Do something when a file is uploaded:

uploader.addEventListener("complete", function(event){
  if(event.success) {
    counter++;
    if(counter === input.length) {
      socket.emit('img-complete',{id:userId},() => {
        counter = 0;
        input = [];

        var id = userId;
        var time = moment().format('YYYY-MM-DD HH:mm');
        var text = document.getElementById('post-text').value;
        socket.emit('new-post',{id:id,time:time,text:text},() => {
          console.log('post-saved');
        });

      });
    }
  }
});

function getUserId() {
  var url = window.location.href;
  return url.split("?")[1].split("=")[1];
}

function scrollToBottom() {
  // Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');
  // Height
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight+scrollTop+newMessageHeight+lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

function scrollToBottom2() {
  var div = document.getElementById("chat-frame");
  div.scrollTop = div.scrollHeight;
}

function toggleSection(id) {
  section = id;
  for(var i = 1; i <= 4; i++) {
    document.getElementsByClassName('glyphicon')[i-1].style.color = i === section? 'green':'black';
    document.getElementsByClassName('section-container')[i-1].style.display = i === section? 'block':'none';
  }

  if(id === 3) {
    document.getElementById("notication-count").innerHTML = (newNotifications.length).toString();
  }
}

function togglePost() {
  postOpen = !postOpen;
  document.getElementById('new-post').style.display = postOpen? 'flex' : 'none';
  document.getElementById('preview-image-container').style.display = postOpen? 'flex' : 'none';
  document.getElementsByClassName('post-tool')[0].style.display = postOpen? 'block' : 'none';
}

function uploadImage() {
  var inputId = "post-img-"+imageNum.toString();
  document.getElementById(inputId).click();
}

function submitPost() {
  if(input.length > 0) {
    var files = [];
    for(var i = 0; i < input.length; i++) {
      files.push(input[i].files[0]);
    }
    uploader.submitFiles(files);
  } else {
    var id = userId;
    var time = moment().format('YYYY-MM-DD HH:mm');
    var text = document.getElementById('post-text').value;
    socket.emit('new-post',{id:id,time:time,text:text},() => {
      console.log('post-saved');
    });
  }
}

function imageTest() {
  socket.emit('image',{},(infos) => {
    var ctx = document.getElementById('canvas');
    var image = new Image();
    image.src = "data:image/jpg;base64,"+infos;
    ctx.appendChild(image);
  })
}
/*
socket.on('image',(infos) => {
  console.log(infos);
  var ctx = document.getElementById('canvas');
  var image = new Image();
  image.src = "data:image/jpg;base64,"+infos.buffer;
  ctx.appendChild(image);
});
*/

function getPost() {
  socket.emit('get-post',{id:userId},(infos) => {

    for(var key in infos) {
      var post = document.createElement('div');
      var name = document.createElement('div');
      var text = document.createElement('div');
      var sepa = document.createElement('hr');
      post.className = 'post-show';
      name.innerHTML = allContacts[infos[key]['owner']];
      text.innerHTML = infos[key]['text'];
      var images = document.createElement('div');

      if(infos[key]['images'].length > 0) {
        images.className = 'post-image-container';
        for(var i = 0; i < infos[key]['images'].length; i++) {
          var image = new Image();
          image.src = "data:image/jpg;base64,"+infos[key]['images'][i].buffer;
          image.className = 'post-image';
          images.appendChild(image);
        }
      }

      post.appendChild(name);
      post.appendChild(text);
      post.appendChild(images);
      post.appendChild(sepa);

      document.getElementById('posts-show').appendChild(post);
    }
  })
}

function imagePreview() {
  var previewImgContainer = document.getElementById('preview-image-container');
  var inputId = 'post-img-'+imageNum.toString();
  input.push(document.getElementById(inputId));
  var uploadFile = document.getElementById(inputId).files[0];
  var readerObj  =  new FileReader();
  readerObj.onloadend = function () {
    var previewImg = document.createElement("div");
    previewImg.id = 'pre-image'+imageNum.toString();
    previewImg.style.width = '120px'; previewImg.style.height = '120px';
    previewImg.style.marginRight = '15px';
    previewImg.style.backgroundImage  = "url("+ readerObj.result+")";
    previewImg.style.backgroundSize = "100% 100%";

    var newInput = document.getElementById(inputId).cloneNode(true);
    //console.log(newInput);
    newInput.id = 'post-img-'+(imageNum+1).toString();
    var uploadContainer = document.getElementById('upload-container');
    uploadContainer.appendChild(newInput);

    previewImgContainer.appendChild(previewImg);

    imageNum += 1;
  }

  if (uploadFile) {
    readerObj.readAsDataURL(uploadFile);
  } else {
    //previewImg.style.backgroundImage  = "";
  }
}

socket.on('connect', function() {
  userId = getUserId();

  socket.emit('user-init',{id:userId},function(msg) {
    document.getElementById("users").innerHTML = "";
    //console.log(msg);
    msg.forEach((user) => {
      var div = document.createElement("div");
      var count = document.createElement("div");
      count.id = "count-"+user.id;
      count.innerHTML = "0";
      count.className = "unread-button";

      var btn = document.createElement("input");
      btn.value = user.name;
      btn.type = "button";
      btn.onclick = function () {
        if(chatId != user.id) {
          chatId = user.id;
          document.getElementsByClassName("chat__footer")[0].style.display = "flex";
          document.getElementsByClassName("chat_tool")[0].style.display = "block";
          document.getElementById('count-'+user.id).style.display = "none";

          document.getElementById("messages").innerHTML = "";
          var template = jQuery("#message-template").html();

          var readMessage = read[chatId];
          if(readMessage && readMessage.length > 0) {
            for(var i = readMessage.length-1; i >= 0; i--) {
              var html = Mustache.render(template, {
                message: readMessage[i].content,
                from: allContacts[readMessage[i].from],
                time: readMessage[i].time
              });
              jQuery('#messages').append(html);
            }

          }

          var unreadMessage = unRead[chatId];
          if(unreadMessage && unreadMessage.length > 0) {
            for(var i = unreadMessage.length-1; i >= 0; i--) {
              var html = Mustache.render(template, {
                message: unreadMessage[i].content,
                from: allContacts[unreadMessage[i].from],
                time: unreadMessage[i].time
              });
              jQuery('#messages').append(html);
            }


            unreadMessage = unreadMessage.concat(readMessage);
            read[chatId] = unreadMessage;
            unRead[chatId] = [];

            socket.emit('read-message',{owner:userId,chatter:chatId},() => {})
          }

          scrollToBottom2();
        }
      }
      div.appendChild(btn);
      div.appendChild(count);
      document.getElementById("users").appendChild(div);

      allContacts[user.id] = user.name;
      document.getElementById('name').innerHTML = user.name;
      read[user.id] = user.read;
      unRead[user.id] = user.unread;
      if(user.unread.length > 0) {
        var count = document.getElementById("count-"+user.id);
        count.innerHTML = unRead[user.id].length > 9? "9+" : unRead[user.id].length;
        count.style.display = "inline-block";
      }
    });
  });
});

socket.on('new-message',(message) => {
  var id = message.from;
  if(chatId === id) {
    var template = jQuery("#message-template").html();
    var html = Mustache.render(template, {
      message: message.content,
      from: allContacts[message.from],
      time: message.time
    });
    jQuery('#messages').append(html);
    scrollToBottom2();
    var newMessage = [message];
    var readMessage = read[chatId]? read[chatId]:[];
    newMessage = newMessage.concat(readMessage);
    read[chatId] = newMessage;
    socket.emit('read-message',{owner:userId,chatter:chatId},() => {})
  } else {
    var unreadMessage = unRead[id]? unRead[id] : [];
    var newMessage = [message];
    newMessage = newMessage.concat(unreadMessage);
    unRead[id] = newMessage;

    var count = document.getElementById("count-"+id)
    count.innerHTML = unRead[id].length > 9? "9+" : unRead[id].length;
    count.style.display = "inline-block";
  }
});

socket.on("new-contact",(infos) => {
  newNotifications.push({
    type:'new-friend',
    id: infos._id,
    name: infos.name,
  });

  jQuery('#notifications').html("");

  newNotifications.forEach((notification) => {
    var template = jQuery("#new-friend-template").html();
    var html = Mustache.render(template, {
      username: notification.name,
      id: notification.id.toString(),
    });
    jQuery('#notifications').append(html);
  })
})

socket.on('disconnect', function() {
  //console.log('Disconnected from server');
});

function send() {
  var txarea = document.getElementById('message');
  var time = moment(moment()).format('YYYY-MM-DD HH:mm:ss');
  var message = txarea.value;
  if(message.trim().length > 0) {
    var template = jQuery("#message-template").html();
    var html = Mustache.render(template, {
      message: message,
      from: allContacts[userId],
      time: time
    });
    jQuery('#messages').append(html);
    scrollToBottom2();
    socket.emit("user-message",{id:[userId,chatId],message:message},(message) => {
      var newMessage = [message];
      var readMessage = read[chatId]? read[chatId] : [];
      newMessage = newMessage.concat(readMessage);
      read[chatId] = newMessage;

      txarea.value = "";
    })
  }
}

function addContact(index) {
  var info = newContact[index];
  socket.emit("add-contact",{from:userId,to:info._id});
}

function approveContact(id) {
  socket.emit('new-contact-confirm',{from:userId,to:id});
}

function ignoreContact(ind) {
  console.log(ind);
}

jQuery('#search-friend').on("submit",function(e) {
  e.preventDefault();

  var keyword = jQuery('[name=keyword]').val();
  socket.emit('searchContact',{
    keyword: keyword
  },(list) => {
    newContact = [];
    jQuery("#search-results").html("");
    list.forEach((user) => {
      if(allContacts[user._id] === undefined) {
        newContact.push(user);
        var template = jQuery("#contact-template").html();
        var html = Mustache.render(template, {
          username: user.name,
          id: (newContact.length-1).toString(),
        });
        jQuery('#search-results').append(html);
      }
    })
  });
});

/*
jQuery('#message-form').on('submit',function(e) {
  e.preventDefault();

  var messageTextbox = jQuery('[name=message]');

  socket.emit('createMessage',{
    text: messageTextbox.val()
  }, function() {
    // empty string
    messageTextbox.val('');
  });
});


var locationButton = jQuery('#send-location');
locationButton.on('click',function() {
  if(!navigator.geolocation) {
    return alert('Geolocation not supported by your browser');
  }

  locationButton.attr('disabled','disabled').text('Sending location...');

  navigator.geolocation.getCurrentPosition(function(position) {
    locationButton.removeAttr('disabled').text('Send location');
    socket.emit('createLocationMessage',{
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  }, function() {
    locationButton.removeAttr('disabled').text('Send location');
    alert('Unable to fetch location');
  })
});
*/
