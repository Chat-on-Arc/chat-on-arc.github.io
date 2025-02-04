import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, set, ref, onValue, get, child, update, onChildAdded, remove, onChildRemoved, query, limitToLast} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js";
var uid;
var msg_date;
var new_user_uid;
var display_name;
var channel_name;
var button;
var photoURL;
var people_typing = [];
var index;
const searchParams = new URLSearchParams(window.location.search);
const channel_id = searchParams.get('channel_id');
 const firebaseConfig = {
  apiKey: "AIzaSyC5oq9fyPeoo8jVU-N07gYhjt2kFEBGqA8",
  authDomain: "arc-by-insight.firebaseapp.com",
  projectId: "arc-by-insight",
  storageBucket: "arc-by-insight.appspot.com",
  messagingSenderId: "1073428960179",
  appId: "1:1073428960179:web:c61897786f1d2ba05131c6",
  measurementId: "G-47T814R2SK"
};
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);
  const dbRef = ref(getDatabase());
  const messaging = getMessaging(app);

function logout() {
  signOut(auth).then(() => {
  console.log("User is signed out.");
  window.location.href = "login.html";
  }).catch((error) => {
  // An error happened.
  });
}
function email_exists(e,data) {
  console.log(data);
  let user_list = Object.keys(data);
console.log(user_list);
  for(let n = 0; n < user_list.length; n++) {
console.log(user_list[n]);
   let user_email = data[user_list[n]].basic_info.email;
    console.log(user_email);
   console.log(e);
   if(user_email === e) {
     new_user_uid = user_list[n];
     console.log("Match found!");
     return true;
   }
   else {
    continue;
   }
  }
return false;
}
window.logout = logout;
function submit() {
var members;
let added_email = document.getElementById("email").value;
var match;
get(child(dbRef, "/users/")).then((snapshot) => {
	let data = snapshot.val();
	match = email_exists(added_email,data);
	console.log(match);
	if(match === true) {
 get(child(dbRef, "/channel/" + channel_id + "/members/members")).then((snapshot) => {
   let data = snapshot.val();
if (data != null) {
   members = data.members;
   members.push(added_email);
   console.log(members);
   set(ref(database, "/channel/" + channel_id + "/members/members"), members);
   set(ref(database, "/users/" + new_user_uid + "/channels/" + channel_id), {name: channel_name});
   cancel();
   document.getElementById("success").innerHTML = "Successfully added " + added_email;
}
else {
	members = [];
   	members.push(added_email);
   	console.log(members);
   	set(ref(database, "/channel/" + channel_id + "/members/members"), members);
   	set(ref(database, "/users/" + new_user_uid + "/channels/" + channel_id), {name: channel_name});
   	cancel();
   	document.getElementById("success").innerHTML = "Successfully added " + added_email;
	
}
 });
}
 else {
  var div = document.getElementById("manage_users");
  let error = document.createElement("p");
  let error_text = document.createTextNode("The user " + added_email + " does not exist.");
  error.appendChild(error_text);
  error.style.color = "red";
  div.appendChild(error);
 }
});

 
}
window.submit = submit;

function cancel() {
 var div = document.getElementById("manage_users");
 div.style.visibility = "hidden";
 div.innerHTML = "";
}
window.cancel = cancel;

function manage_users() {
 var div = document.getElementById("manage_users");
  div.style.visibility = "visible";
  div.innerHTML = "<div style='padding: 10px;'>" + 
  "<h1>Add a member</h1>" + 
  "<h4>Email</h4>" + 
  "<input type='text' id='email'></input>" + 
  '<button onclick="submit()">Submit</button>'+
  '<button onclick="cancel()">Cancel</button>'+
  '<div><h1>Members</h1>'+
'<table id="members_list"><tbody></tbody></table></div>'+
  '</div>';
get(child(dbRef, "/channel/" + channel_id + "/members/members")).then((snapshot) => {
	let table = document.getElementById("members_list");
	let data = snapshot.val();
	console.log(data);
	if (data != null) {
	for(let n = 0; n < data.length; n++) {
			var row = table.insertRow(-1);
			var cell = row.insertCell(-1);
			var name = document.createElement("p");
			name.style.color = "white";
			var nameNode = document.createTextNode(data[n]);
			name.append(nameNode);
			cell.append(name);
			let delete_cell = row.insertCell(-1);
			let delete_button = document.createElement("button");
			let delete_icon = document.createElement("img");
			delete_icon.setAttribute("src","./assets/delete_icon.png");
			delete_icon.setAttribute("width","50px");
			delete_button.setAttribute("onclick","delete(" + data[n] + ")");
			delete_button.appendChild(delete_icon);
			delete_cell.appendChild(delete_button);
			let admin_cell = row.insertCell(-1);
			let set_admin = document.createElement("button");
			set_admin.setAttribute("onclick","admin()");
			let admin_btn_text = document.createTextNode("Make admin");
			set_admin.appendChild(admin_btn_text);
			admin_cell.appendChild(set_admin);
		
	}
	}
	else {
		var row = table.insertRow(-1);
		var cell = row.insertCell(-1);	
		var text = document.createTextNode("There are no non-admin members.");
		cell.appendChild(text);
	}
});
}
window.manage_users = manage_users;

function unsubscribe() {
	get(child(dbRef, "/push/users/" + uid + "/tokens/tokens")).then((snapshot) => {
		let data = snapshot.val();
		console.log(data);
		set(ref(database,"/push/unsubscribe/" + uid), {token: data, channel_id: channel_id});
		document.getElementById("arc-push").innerHTML = "Enable notifications";
		document.getElementById("arc-push").setAttribute("onclick","requestPermission()");
	});
}
window.unsubscribe = unsubscribe;
function requestPermission() {
  get(child(dbRef,"/push/users/" + uid + "/tokens/")).then((snapshot) => {
	let data = snapshot.val();
	console.log(data);
	let tokens = data.tokens;
	set(ref(database,"/push/tokens/" + uid), {
		tokens: tokens,
		channel: channel_id,
	});
	document.getElementById("arc-push").innerHTML = "Disable notifications";
	document.getElementById("arc-push").setAttribute("onclick","unsubscribe()");

  });
  get(child(dbRef,"/channel/" + channel_id + "/push/push")).then((snapshot) => {
	let data = snapshot.val();
	if (data != null) {
		data.push(uid);
	}
	else {
		data = [];
		data.push(uid);
	}
	set(ref(database,"/channel/" + channel_id + "/push/"), {push: data});
  });
}
window.requestPermission = requestPermission; 



function get_date() {
	msg_date = new Date(); 
  console.log(msg_date); 
	let month = msg_date.getMonth();
	if(month < 10) {
		String(month);
		month = "0" + month;
	}
	else {
		String(month);
	}
	let day = msg_date.getDate();
	if(day < 10) {
		String(day);
		day = "0" + day;
	}
	else {
		String(day);
	}
	let hours = msg_date.getHours();
	if(hours < 10) {
		String(hours);
		hours = "0" + hours;
	}
	else {
		String(hours);
	}
	let minutes = msg_date.getMinutes();
	if(minutes < 10) {
		String(minutes);
		minutes = "0" + minutes;
	}
	else {
		String(minutes);
	}
	let seconds = msg_date.getSeconds();
	if(seconds < 10) {
		String(seconds);
		seconds = "0" + seconds;
	}
	else {
		String(seconds);
	}
  	return String(msg_date.getFullYear()) + month + day + hours + minutes + seconds;
}
function start_upload() {
	let div = document.getElementById("upload");
	div.innerHTML = "";
	let input = document.createElement("input");
	input.setAttribute("type","file");
	input.setAttribute("accept","image/*");
	input.setAttribute("id","file");
	div.appendChild(input);
	let submit_button = document.createElement("button");
	submit_button.addEventListener("onclick",() => {
		let file = document.getElementById("file").files;
	for(let n = 0; n < file.length; n++) {
		let path = "channel/" + channel_id + "/" + file[n].name;
		upload_image(path,file[n]);
		send(path, "image");
		let div = document.getElementById("upload");
		div.innerHTML = '<input type="text" id="messagebox" value="Type here"><button onclick="send()">Send</button><button onclick="start_upload()">Upload</button>';
	} 
	});
	
	let submit_button_text = document.createTextNode("Submit");
	submit_button.appendChild(submit_button_text);
	div.appendChild(submit_button);
}
window.start_upload = start_upload;
function send(msg, type) {
	console.log(msg);
	console.log(type); 
  	let message_id = Math.floor(Math.random()*1000000);
  	message_id = message_id + 1000000;
  	// let content = document.getElementById("messagebox").value;
  	document.getElementById("messagebox").value = "";
  	msg_date = new Date(); 
  	console.log(msg_date); 
  	let msg_date_2 = String(msg_date);
  	let send_date = get_date();
  	let data = {
	  type: type,
	  channel_name: channel_name,
	  creator: uid,
	  displayName: display_name,
	  content: msg,
	  date: msg_date_2,
	  channel_id: channel_id,
	  photoURL: photoURL,
  	};
  set(ref(database, "/channel/" + channel_id + "/messages/" + send_date + message_id), data);
  set(ref(database, "/push/messages/" + send_date + message_id),data);
}
window.send = send;

var running_listener = false;
var interval;
var run_time = 0;
function typing_check() {
	if(run_time == 0) {
		console.log("Run time check passed");
		run_time += 1;
	}
	else {
		let typing_ref = ref(database, "/channel/" + channel_id + "/typing/" + uid);
		remove(typing_ref);
		console.log("Typing check killed");
		running_listener = false;
		clearInterval(interval);
	}
}
function type_event(e) {
	if(e.key == "Enter") {
		let msg = document.getElementById("messagebox").value;
		console.log(msg);
		send(msg, "text");
	}
	else if (running_listener == false) {
			console.log("Starting listener");
			let updates = {};
			let data = {typing: uid};
			updates['/channel/' + channel_id + "/typing/" + uid] = data;
			update(dbRef, updates);
			running_listener = true;
	}
	else {
		run_time = 0;
		clearInterval(interval);
		interval = setInterval(typing_check,2000);
		console.log("Interval set");
	}
}


async function append_people_typing(list) {
	let people_typing_msg = "";
	let row = document.getElementById("typing-row");
	console.log(list);
	if(list.length > 0) {
		for(let n = 0; n < list.length; n++) {
			await get(child(dbRef, "users/" + list[n] + "/basic_info")).then((snapshot) => {
				let data = snapshot.val();
				let type_name = data.displayName;
				if (list.length > 1) {
					people_typing_msg += type_name + ",";
				}
				else {
					people_typing_msg = type_name + " is typing...";
				}
			});
		}
		if(list.length == 1) {
			row.innerHTML = people_typing_msg;
		}
		else {
			row.innerHTML = people_typing_msg + " are typing...";
		}
	}
	else {
		row.innerHTML = "";
	}
}

function get_name(e) {
	let data = e.val();
	return data.displayName;
}

function manage_direct() {
	var div = document.getElementById("manage_users");
  	div.style.visibility = "visible";
  	div.innerHTML = "<div style='padding: 10px;'>" + 
  "<button onclick='block()'>Block this user</button></div>";
}
window.manage_direct = manage_direct;
async function arc_direct(e) {
	let data = e.val();
	let people = data.people;
	let other_uid = data[0];
	document.getElementById("channel_name").innerHTML = get(child(dbRef,"/users/" + other_uid + "/basic_info")).then(get_name);
    document.getElementById("title").innerHTML = get(child(dbRef,"/users/" + other_uid + "/basic_info")).then(get_name);
	document.getElementById("arc-push").remove();
	set(ref(database, "/push/channels/" + channel_id), {channel_id: channel_id, push: true});
	let manage_button = document.getElementById("manage_button");
	manage_button.innerHTML = "Manage this conversation";
	manage_button.setAttribute("onclick","manage_direct()")

}
function load_prev(e) {
	console.log(e);
}

function insert_load_more() {
	let message_box = document.getElementById("msg-contain");
	let button = document.createElement("button");
	button.setAttribute("onclick", "load_prev("+index+")");
	button.appendChild(document.createTextNode("Load previous messages"));
	message_box.appendChild(button);
}

function listen_for_new_msg() {
	var message_ref = query(ref(database, "/channel/" + channel_id + "/messages/"), limitToLast(50));
    onChildAdded(message_ref, (snapshot) => {
	  console.log("ref triggered")
      	let message = snapshot.val();
      	let message_box = document.getElementById("msg-contain");
      	get(child(dbRef, "/users/" + message.creator + "/basic_info")).then((snapshot2) => {
		let user_data = snapshot2.val();
        let date = new Date(message.date);
        let datetime = " | on " + String(date.getMonth()+1) + "/" + String(date.getDate()) + "/" + String(date.getFullYear()) + " at " + String(date.getHours()) + ":" + String(date.getMinutes());
        let box = document.createElement("div");
        box.setAttribute("class","message");
        let username_entry = document.createElement("h4");
        let textNode = document.createTextNode(user_data.displayName + datetime);
        username_entry.appendChild(textNode);
        box.appendChild(username_entry);
		if (message.type == "text" || message.type == null) {
        	let content = document.createElement("p");
        	let textNode2 = document.createTextNode(message.content);
        	content.appendChild(textNode2);
        	box.appendChild(content);
		message_box.appendChild(box);
		message_box.scrollTop = message_box.scrollHeight - message_box.clientHeight;
		}
		else if (message.type == "image") {
			let path = message.content;
			download_image(box, message_box, path);
		}
    	});
    });
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log(user);
    uid = user.uid;
    display_name = user.displayName;
	photoURL = user.photoURL;
	index = 50;
	if(photoURL != null) {
		setPicture(photoURL);
	}
    document.getElementById("username").innerHTML = user.displayName;
	get(child(dbRef, '/channel/' + channel_id + '/basic_data')).then((snapshot) => {
		console.log(snapshot.val());
		let data = snapshot.val();
		if(data.type != null) {
			get(child(dbRef,"/push/direct/" + uid + "/conversations/" + channel_id)).then(arc_direct);
		}
	});
   get(child(dbRef, '/channel/' + channel_id + '/messages')).then((snapshot) => {
      let data =  snapshot.val();
	if (data != null) {
       		console.log(data);
		let input = document.getElementById("messagebox");
		input.addEventListener("keydown",type_event);
		let send_button = document.getElementById("send-button");
		send_button.addEventListener("onclick", () => {
			let msg = input.value;
			send(msg,"text");
		});
	}
	   else {
		let message_box = document.getElementById("msg-contain");
		message_box.innerHTML = "<p>This is the start of this channel!</p>";
	   }
	}).catch((error) => {
		console.log(error);
     document.getElementById("main").innerHTML = "<h1>Error</h1><br><p>There was an error loading this channel.</p><a href='./dashboard.html'>Return to dashboard</a>";
	});
	get(child(dbRef,"/push/users/" + uid + "/tokens")).then((token_check) => {
		if(token_check != null) {
			get(child(dbRef,"/channel/" + channel_id + "/push/push/")).then((snapshot) => {
				let data = snapshot.val();
				if(data.includes(uid)) {
					requestPermission();
				}
			});
			}
			else {
			let push_button = document.getElementById("arc-push");
			push_button.remove();
			}
	});

    var data_ref = ref(database, "/channel/" + channel_id + "/basic_data/");
    onValue(data_ref, (snapshot) => {
      let data = snapshot.val();
	  if(data.name != "DM conversation") {
      	document.getElementById("channel_name").innerHTML = data.name;
      	document.getElementById("title").innerHTML = data.name;
	  }
	  channel_name = data.name;
    });
	listen_for_new_msg()
	var chat_type_ref = ref(database, "/channel/" + channel_id + "/typing/");
	onChildAdded(chat_type_ref, (snapshot) => {
		let data = snapshot.val();
		data = Object.values(data);
		people_typing.push(data[0]);
		append_people_typing(people_typing);
	});
	onChildRemoved(chat_type_ref, (snapshot) => {
		let data = snapshot.val();
		data = Object.values(data);
		let index = people_typing.indexOf(data[0]);
		people_typing.splice(index,1);
		append_people_typing(people_typing);
	});
	    
    // ...
  } else {
    window.location.href = "index.html";
    // ...
  }
});
