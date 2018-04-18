function addContact(index) {
  var info = newContact[index];
  socket.emit("add-contact",{from:userId,to:info._id},()=>{
    document.getElementById("noti-"+index).innerHTML = "request has been sent";
    document.getElementById(index).disabled = true;
  });
}

function approveContact(id) {
  socket.emit('new-contact-confirm',{from:userId,to:id});

}

function ignoreContact(id) {
  socket.emit("new-contact-reject",{from:userId,to:id}, ()=> {
    newNotifications = newNotifications.filter(t => t.type!=="new-friend" || t.id!==id);
    refreshNotification();
  })
}

function refreshNotification() {
  jQuery('#notifications').html("");
  newNotifications.forEach((notification) => {
    var template = jQuery("#new-friend-template").html();
    var html = Mustache.render(template, {
      username: notification.name,
      id: notification.id.toString(),
    });
    jQuery('#notifications').append(html);
  });

  var icon = document.getElementById("noti-count");
  if(newNotifications.length > 0) {
    icon.innerHTML = newNotifications.length.toString();
    icon.style.display = "block";
  } else {
    icon.style.display = "none";
  }

  document.getElementById("notication-count").innerHTML =
  newNotifications.length>9? "9+" : newNotifications.length.toString();
}

function addContactToList(user) {
  var users = document.getElementById("users");

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
      countUnread();
    }
  }

  div.appendChild(btn);
  div.appendChild(count);
  document.getElementById("users").appendChild(div);
}

socket.on("new-contact",(infos) => {
  newNotifications.push({
    type:'new-friend',
    id: infos._id,
    name: infos.name,
  });

  refreshNotification();
})

socket.on("new-contact-added",(infos) => {
  var id = infos.id;
  var name =infos.name;
  allContacts[id] = name;

  //console.log(infos);

  newNotifications = newNotifications.filter(t => t.type!=="new-friend" || t.id!==id);
  refreshNotification();

  addContactToList(infos);
})

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
          noti: "noti-"+(newContact.length-1).toString(),
        });
        jQuery('#search-results').append(html);
      }
    })
  });
});

socket.on('disconnect', function() {
  //console.log('Disconnected from server');
});
