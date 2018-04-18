require('./config/config.js');

const path = require('path');
const http = require('http');
const moment = require('moment');
const express = require('express');
const socketIO = require('socket.io');
const fs = require('fs');
const _ = require('lodash');
//const port = process.env.PORT || 4000;
const port = process.env.PORT;
const publicPath = path.join(__dirname,'../public');
const bodyParser = require('body-parser');
//const { ObjectID,mongodb } = require('mongodb');
var db = require('mongodb');
var mkdirp = require('mkdirp');
var siofu = require("socketio-file-upload");
var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Talk } = require('./models/talk');
var { Message } = require('./models/message');
var { Image } = require('./models/image');
var { Post } = require('./models/post');
var { Contact } = require('./models/contact');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));
app.use(siofu.router);

var files = {};

io.on('connection',(socket) => {
  // user signup and login
  // ---------------------------------------------------
  socket.on('user-signup',(params,callback) => {
    var body = _.pick(params,['email','name','password']);

    var message = new Message({
      from:'me',
      to:'me',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      content:'Test',
    });
    var user = new User({
      email: body.email,
      name: body.name,
      password: body.password,
      contacts:[{name:'me',messages:[message]}],
    });

    user.save().then((user) => {
      callback(user);
    }).catch((e) => {
      callback(e.errmsg);
    });
  });

  socket.on('user-login',(params,callback) => {
    var body = _.pick(params,['email','password']);

    User.findOne({
      email: body.email,
      password: body.password,
    }).then((user) => {
      if(user !== null) {
        callback(user);
      } else {
        callback('username and password does not match');
      }
    }, (err) => {
      //console.log(1);
      callback('username and password does not match');
    });
  });
  // ---------------------------------------------------


  // user initialize
  // ---------------------------------------------------
  // get chat message
  socket.on('user-init',(params,callback) => {
    var id = params.id;
    socket.join(id); // define user id
    User.findOne({
      _id: id,
    }).then((user) => {
      var conList = [];
      var contacts = user.contacts;
      for(var i = 0; i < contacts.length; i++) {
        if(contacts[i]['name'] === 'me') {
          Talk.findOne({
            owner:user.name,
            chatter:user._id,
          }).then((me) => {
            conList.push({
              name: user.name,
              id: user._id,
              unread:me? me.unread : [],
              read:me? me.read : [],
            });
            if(conList.length === contacts.length) {
              callback(conList);
            }
          });
        } else {
          User.findOne({
            _id: contacts[i]['name']
          }).then((friend) => {
            Talk.findOne({
              owner: id,
              chatter:friend._id
            }).then((talk) => {
              conList.push({
                name: friend.name,
                id: friend._id,
                unread:talk? talk.unread : [],
                read:talk? talk.read: [],
              });
              if(conList.length === contacts.length) {
                callback(conList);
              }
            });
          });
        }
      }
    })
  });

  socket.on("get-noti",(params,callback) => {
    var id = params.id;
    Contact.find({
      to: id
    }).then((msg) => {
      if(msg.length === 0) {
        callback(msg);
      } else {
        var infos = []; var cnt = 0;
        for(var i = 0; i < msg.length; i++) {
          User.findOne({
            _id: msg[i].from
          }).then((user) => {
            var info = {
              type: 'new-friend',
              id: user._id,
              name: user.name,
            };
            infos.push(info);
            cnt++;
            if(cnt === msg.length) {
              //console.log(infos);
              callback(infos);
            }
          })
        }
      }
    })
  });

  // ---------------------------------------------------

  // user chat
  // ---------------------------------------------------
  socket.on("user-message",(params,callback) => {
    var from = params.id[0];
    var to = params.id[1];
    var content = params.message;
    var time = moment().format('YYYY-MM-DD HH:mm:ss');

    var message = new Message({
      from:from,
      to:to,
      time: time,
      content:content
    });

    User.findOne({
      _id: from
    }).then((user) => {
      socket.broadcast.to(to).emit("new-message",{
        from:message.from,
        to:message.to,
        time:message.time,
        content:message.content,
        _id: message._id
      });
    })

    // save to db
    callback(message);

    Talk.findOneAndUpdate(
      {owner:from,chatter:to},
      {$push:{read:{$each:[message],$position:0}}}
    ).then((talk) => {
      if(!talk) {
        var talk_1 = new Talk({
          owner: from,
          chatter: to,
          read: [message],
          unread:[],
        });
        talk_1.save().then((talk) => {
          var talk_2 = new Talk({
            owner: to,
            chatter: from,
            read:[],
            unread:[message],
          });
          talk_2.save();
        }).catch((err) => {
          console.log(err);
        })
      } else {
        Talk.findOneAndUpdate(
          {owner:to,chatter:from},
          {$push:{unread:{$each:[message],$position:0}}}
        ).then((talk) => {
        })
      }
    });
  });

  socket.on("read-message",(params,callback) => {
    var owner = params.owner;
    var chatter = params.chatter;
    Talk.findOne({
      owner:owner,
      chatter:chatter
    }).then((talk) => {
      var unRead = talk.unread;
      var id = talk._id;
      Talk.findOneAndUpdate(
        {_id: id},
        {
          $push:{read:{$each:unRead,$position:0}},
          $set:{unread:[]}
        }
      ).then((talk) => {
        console.log(talk);
        callback();
      })
    })
  });

  // ---------------------------------------------------


  // user contact management
  // ---------------------------------------------------
  socket.on('searchContact',(params,callback) => {
    var keyword = params.keyword;
    User.find({
      $or: [
        {"name":new RegExp(keyword,'gi')},
      ]
    }).then((users)=>{
      var infos = [];
      for(var i = 0; i < users.length; i++) {
        var user = _.pick(users[i],['email','name','_id']);
        infos.push(user);
      }
      callback(infos);
    })
  });

  socket.on('add-contact',(params,callback) => {
    Contact.findOne({
      from: params.from,
      to: params.to
    }).then((contact) => {
      var id = contact.from;
      User.findOne({
        _id: id
      }).then((user) => {
        //console.log(user);
        callback();
        //socket.broadcast.to(contact.to).emit('new-contact',{_id:user._id,name:user.name,email:user.email});
      });
    }).catch((no) => {
      var contact = new Contact({
        from: params.from,
        to: params.to,
      });
      contact.save().then((contact) => {
        var id = contact.from;
        User.findOne({
          _id: id
        }).then((user) => {
          //console.log(user);
          callback();
          socket.broadcast.to(contact.to).emit('new-contact',{_id:user._id,name:user.name,email:user.email});
        });
      })
    });
  });

  socket.on('new-contact-confirm',(params,callback) => {
    var id1 = params.from;
    var id2 = params.to;

    User.findOneAndUpdate(
      {_id: id1},
      {
        $push: {contacts:{messages:[],name:id2}}
      }
    ).then((user1) => {
      // notifiy id1 to add new friend
      User.findOne({
        _id:id2,
      }).then((user) => {
        console.log("1",user)
        socket.emit("new-contact-added",{id:user._id,name:user.name});
      });

      User.findOneAndUpdate(
        {_id: id2},
        {
          $push: {contacts:{name:id1,messages:[]}}
        }
      ).then((user2) => {
        User.findOne({
          _id:id1,
        }).then((user) => {
          console.log("2",user);
          socket.broadcast.to(id2).emit("new-contact-added",{id:user._id,name:user.name});
        })

        // request finished, delete corresponding record
        Contact.find({
          $or: [
            {from: id1,to: id2},
            {to: id1,from: id2},
          ]
        }).remove().exec();
      })
    });
  });

  socket.on('new-contact-reject',(params,callback) => {
    var id1 = params.from;
    var id2 = params.to;

    Contact.find({
      $or: [
        {from: id1,to: id2},
        {to: id1,from: id2},
      ]
    }).remove().exec();

    callback();
  });
  // ---------------------------------------------------

  // user post
  // ---------------------------------------------------
  var uploader = new siofu();

  uploader.dir = path.join(__dirname,'./uploads');
  uploader.listen(socket);

  uploader.on("saved", function(event) {
    var fileList = files[socket.id]? files[socket.id] : [];
    fileList.push(event.file.pathName);
    files[socket.id] = fileList;
  });

  uploader.on("error", function(event) {
    console.log(event);
  });

  socket.on('img-complete',(params,callback) => {
    callback();
  });

  socket.on("new-post",(params,callback) => {
    var owner = params.id;
    var time = params.time;
    var text = params.text;
    var images = [];

    var path = params.path;
    var filesList = files[socket.id]? files[socket.id] : [];
    for(var i = 0; i < filesList.length; i++) {
      var a = new Image;
      a.img.data = fs.readFileSync(filesList[i]);
      a.img.contentType = 'image/png';
      images.push(a);
    }

    var post = new Post({
      owner: owner,
      time: time,
      text: text,
      images: images,
    });

    post.save().then((post) => {
      //console.log(post);
    })
  });

  socket.on('get-post',(params,callback) => {
    var id = params.id;
    Post.find({
      owner: id,
    }).then((posts) => {
      var infos = {};
      for(var i = 0; i < posts.length; i++) {
        var postId = posts[i]._id;
        infos[postId] = {};
        infos[postId]['time'] = posts[i]['time'];
        infos[postId]['owner'] = posts[i]['owner'];
        infos[postId]['text'] = posts[i]['text']? posts[i]['text'] :"";
        infos[postId]['images'] = [];
        if(posts[i]['images'].length !== 0) {
          var tmpImages = posts[i]['images'];
          var images = [];
          for(var j = 0; j < tmpImages.length; j++) {
            images.push({
              image: true,
              buffer: tmpImages[j]['img']['data'].toString('base64')
            });
          }
          infos[postId]['images'] = images;
        }
      }

      callback(infos);
    });
  });

  // ---------------------------------------------------

  socket.on('disconnect',() => {
    //console.log('Disconnected from client');
  });
});

server.listen(port, () => {
  console.log(`Started up at port ${port}`);
});
