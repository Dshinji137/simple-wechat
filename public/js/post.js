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

socket.on('disconnect', function() {
  //console.log('Disconnected from server');
});
