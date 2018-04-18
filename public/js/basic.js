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
