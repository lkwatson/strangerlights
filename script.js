var contactForm = document.getElementById("contact-upsidedown-form");

//On hitting the submit button, send to server
contactForm.addEventListener("submit", function(f){
  
  f.preventDefault();
  var message = document.getElementById("contact-form-message").value;
  
  var req = new XMLHttpRequest();
  
  //callback for state changes (load, error, etc.)
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        console.log(req.response);
        getMessageQueue();
      }else{
        console.log(req.response);
      }
    }
  };
  
  req.open('POST', 'https://upsidedown.strangerlights.com/willareyouthere', true);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  req.send("message="+message);
  
}, false);

//get the message queue to show on the main page
function getMessageQueue() {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://upsidedown.strangerlights.com/messagequeue', true);
  
  req.onload = function() {
    if (req.status > 199 && req.status < 400) {
      // Success!
      var data = JSON.parse(req.response);
      console.log(data);
      console.log(data.length)
      populateMessageQueueTable(data);
    } else {
      console.log(req)
    }
  };
  req.onerror = function() {
    console.log("Connection error");
  };
  
  req.send();
}

function populateMessageQueueTable(data) {
  var table = document.getElementById("message-queue-table");
  
  //clear all rows except the top one
  for (var i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
  
  for (i = 0; i < data.length; i++) {

    switch (data[i].displayed) {
    case 'true':
      var classToAdd = 'tb-highlight-shown'
      break;
    case 'now':
      var classToAdd = 'tb-highlight-showing'
      break;
    case 'false':
      var classToAdd = 'tb-highlight-toshow'
      break;
    }
    
    var newRow = table.insertRow(i+1)
    newRow.classList.add(classToAdd);
    var msgCell = newRow.insertCell(0);
    var stsCell = newRow.insertCell(1);
    var ageCell = newRow.insertCell(2);
    msgCell.innerHTML = data[i].message;
    stsCell.innerHTML = data[i].displayed;
    ageCell.innerHTML = data[i].dateSent;
  }
}

getMessageQueue();