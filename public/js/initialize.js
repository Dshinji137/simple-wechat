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
          var myMsgTemplate = jQuery("#my-message").html();
          var otherMsgTemplate = jQuery("#other-message").html();

          var readMessage = read[chatId];
          if(readMessage && readMessage.length > 0) {
            for(var i = readMessage.length-1; i >= 0; i--) {
              var template = readMessage[i].from === userId? myMsgTemplate:otherMsgTemplate;
              var html = Mustache.render(template, {
                message: readMessage[i].content,
                //from: allContacts[readMessage[i].from],
                //time: readMessage[i].time
              });
              jQuery('#messages').append(html);
            }
          }

          var unreadMessage = unRead[chatId];
          if(unreadMessage && unreadMessage.length > 0) {
            for(var i = unreadMessage.length-1; i >= 0; i--) {
              //console.log(unreadMessage[i]);
              var template = unreadMessage[i].from === userId? myMsgTemplate:otherMsgTemplate;
              var html = Mustache.render(template, {
                message: unreadMessage[i].content,
                //from: allContacts[unreadMessage[i].from],
                //time: unreadMessage[i].time
              });
              jQuery('#messages').append(html);
            }


            unreadMessage = unreadMessage.concat(readMessage);
            read[chatId] = unreadMessage;
            unRead[chatId] = [];

            socket.emit('read-message',{owner:userId,chatter:chatId},() => {})
          }

          scrollToBottom2();
          countUnread();
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
      countUnread();
    });
  });

  socket.emit("get-noti",{id:userId},function(msg) {
    msg.forEach((message) => {
      newNotifications.push(message);
    });

    refreshNotification();
  });

});

socket.on('disconnect', function() {
  //console.log('Disconnected from server');
});
