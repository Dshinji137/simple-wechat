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

    countUnread();
  }
});

function countUnread() {
  var cnt = 0;
  for(var id in unRead) {
    cnt += unRead[id].length;
  }

  if(cnt > 0) {
    document.getElementById("msg-count").innerHTML = cnt>9? "9+" : cnt.toString();
    document.getElementById("msg-count").style.display = "block";
  } else {
    document.getElementById("msg-count").style.display = "none";
  }
}

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

socket.on('disconnect', function() {
  //console.log('Disconnected from server');
});
