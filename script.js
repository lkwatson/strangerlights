var contactForm = document.getElementById("contact-upsidedown-form");
var contactInput = document.getElementById("contact-form-message");

//On hitting the submit button, send to server
contactForm.addEventListener("submit", function(f){
  
  f.preventDefault();
  var message = contactInput.value;
  
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
      var tableText  = 'Just shown'
      break;
    case 'now':
      var classToAdd = 'tb-highlight-showing'
      var tableText  = 'Showing now'
      break;
    case 'false':
      var classToAdd = 'tb-highlight-toshow'
      var tableText  = 'To be shown'
      break;
    }
    
    dateObj = new Date(Date.parse(data[i].dateSent));
    
    var newRow = table.insertRow(i+1)
    newRow.classList.add(classToAdd);
    
    var msgCell = newRow.insertCell(0);
    var stsCell = newRow.insertCell(1);
    var ageCell = newRow.insertCell(2);
    msgCell.innerHTML = data[i].message;
    stsCell.innerHTML = tableText;
    ageCell.innerHTML = dateObj.toTimeString().split(' ')[0] + " - " + dateObj.toDateString().split(' ')[1] + " " + dateObj.toDateString().split(' ')[2];
  }
}

contactInput.addEventListener('keyup', function(event) {
  if (!contactInput.value.match(/[A-Za-z ]+$/)) {
    contactInput.value = contactInput.value.replace(/[^A-Za-z ]+$/g, '');
  }
});

getMessageQueue();