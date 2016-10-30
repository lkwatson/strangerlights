var contactForm = document.getElementById("contact-upsidedown-form");
var contactInput = document.getElementById("contact-form-message");

//On hitting the submit button, send to server
contactForm.addEventListener("submit", function(f){
  
  f.preventDefault();
  var message = contactInput.value;
  
  if (message.match(/^\s+$/) || message.length == 0) { //if only spaces present, tell the user
    document.getElementById("message-user-error-spaces").style.display = "block";
  }else if(message.length > 25) {
    document.getElementById("message-user-error-toolong").style.display = "block";
  }else if(testForNaughtyStuff(message)) {
    document.getElementById("message-user-error-naughty").style.display = "block";
  }else{//if the message is okay, send it
  
    var req = new XMLHttpRequest();
    
    //callback for state changes (load, error, etc.)
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
        if(req.status == 200) {
          console.log(req.response);
          contactInput.value = "";
          getMessageQueue();
        }else{
          if(req.status == 429) {
            document.getElementById("message-user-error-limiter").style.display = "block";
          }
          console.log(req.response);
        }
      }
    };
    
    req.open('POST', 'https://upsidedown.strangerlights.com/willareyouthere', true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    req.send("message="+message);
    
  }
  
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
      console.log(req);
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
    
    var newRow = table.insertRow(i+1);
    newRow.classList.add(classToAdd);
    
    var msgCell = newRow.insertCell(0);
    var stsCell = newRow.insertCell(1);
    var ageCell = newRow.insertCell(2);
    msgCell.innerHTML = data[i].message;
    stsCell.innerHTML = tableText;
    ageCell.innerHTML = dateObj.toTimeString().split(' ')[0] + " - " + dateObj.toDateString().split(' ')[1] + " " + dateObj.toDateString().split(' ')[2];
  }
}

function testForNaughtyStuff(string) {
  //These are all naughty words that we don't want to be posted publically
  //While this code can be circumvented, it's mainly intended for gracefully 
  //telling the user to be more polite. This code is also active on the server side
  
  //Note that for a variety of reasons, the naughty words in question have 
  //been shifted with a caesar cipher.
  
  var naughtyWords = ["kzhp", "kzh", "xmny", "yny", "hqnytwnx", "{flnsf", "snljw", "snlf", "ujsnx", "mtqthfzxy", "oj|", "ywzru", "mnqfw~", "hqnsyts", "gttgx", "fwxj", "gnyhm", "gfxyfwi", "gtsjw", "gzyy", "hthp", "htts", "hzr", "hzsy", "inqit", "jofhzqfyj", "kfl", "kflty", "kflty", "khzp", "kjqqfy", "kzp", "mtws~", "on", "on", "qfgnf", "rfxyjwgfyj", "rfxyjwgfynts", "twlfxr", "umzp", "unxx", "utws", "uzxx~", "wjyfwi", "xj}", "xjrjs", "xrjlrf", "{zq{f", "|fsp", "|mtwj", "mnyqjw", "sfn", "gtrg", "lzs", "snll", "mfwi", "inhp", "xzhp", "uwjlsfsy","hmtij","yzwsjw","khp","szy","fsfq","myqjw","myqw","mws~","k{hp","gyhm"];
  var naughtyWordsWRepeat = ["fxx","snlljw", "snllf","snll","ppp","lf~"];
  //uncomment to create a new Caesar array
  /*
  newArray = []
  for(j = 0; j < naughtyWords.length; j++) {
    newArray[j] = caesar(naughtyWords[j],5);
  }
  */
  //console.log(caesar("test",5))
  
  stringWhole = string.toLowerCase().replace(/\s/g, '');
  string = string.toLowerCase().replace(/\s/g, '').replace(/(.)\1{1,}/g, '$1');
  console.log(string);
  
  for(j = 0; j < naughtyWords.length; j++) {
    var wordToTest = caesar(naughtyWords[j],-5);
    
    if(string.indexOf(wordToTest) >= 0) {
      console.log(wordToTest);
      return true;
      break;
    }
  }
  for(k = 0; k < naughtyWordsWRepeat.length; k++) {
    var wordToTest = caesar(naughtyWordsWRepeat[k],-5);
    
    if(stringWhole.indexOf(wordToTest) >= 0) {
      console.log(wordToTest);
      return true;
      break;
    }
  }
  
  return false;
}

function caesar(str,shift) {
  result = '';
  for (i = 0; i < str.length; i++) {
    ccode = (str[i].charCodeAt()) + shift;
    result += String.fromCharCode(ccode);
  }
  return result;
}

contactInput.addEventListener('keyup', function(event) {
  document.getElementById("message-user-error-toolong").style.display = "none";
  document.getElementById("message-user-error-spaces").style.display = "none";
  document.getElementById("message-user-error-naughty").style.display = "none";
  document.getElementById("message-user-error-limiter").style.display = "none";
  
  if (!contactInput.value.match(/[A-Za-z ]+/)) {
    contactInput.value = contactInput.value.replace(/[^A-Za-z ]+/g, '');
  }
});

getMessageQueue();
setInterval(function(){ getMessageQueue(); }, 5000);