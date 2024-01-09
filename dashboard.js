
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, set, ref, onValue, get, child, push } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
var uid;
var user_email;

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

function logout() {
  signOut(auth).then(() => {
  console.log("User is signed out.");
  window.location.href = "login.html";
  }).catch((error) => {
  // An error happened.
  });
}
window.logout = logout;
function submit() {
 var channel_id = Math.floor(Math.random()*99999);
 let admin = [user_email];   
 let name = document.getElementById("name").value;
 set(ref(database, "/channel/" + channel_id + "/members/"),{admin: admin});
 set(ref(database, "/channel/" + channel_id + "/basic_data"), {name: name});
 set(ref(database, "users/" + uid + "/channels/" + channel_id), {type: "owner"});
 var url = new URL("https://jcamille2023.github.io/arc/channel");
 url.searchParams.append('channel_id', channel_id);
 console.log(url);
 window.location.href = url;
}
window.submit = submit;

function join(e) {
 var url = new URL("https://chat-on-arc.github.io/channel");
 url.searchParams.append('channel_id', e);
 console.log(url);
 window.location.href = url;
}
window.join = join;

function cancel() {
 var div = document.getElementById("add-arcs");
 div.style.visibility = "hidden";
 div.innerHTML = "";
}
window.cancel = cancel;

function create_an_arc() {
 var div = document.getElementById("add-arcs");
  div.style.visibility = "visible";
  div.innerHTML = "<div style='padding: 10px;'>" + 
  "<h1>Create an arc</h1>" + 
  "<h4>Name</h4>" + 
  "<input type='text' id='name'></input>" + 
  '<button onclick="submit()">Submit</button>'+
  '<button onclick="cancel()">Cancel</button>'+
  '</div>';
   
}
window.create_an_arc = create_an_arc;
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
     let new_user_uid = user_list[n];
     console.log("Match found!");
     return new_user_uid;
   }
   else {
    continue;
   }
  }
return false;
}
var other_uid;
var direct_id;
async function direct_async(vuser, nuser, e) {
  set(ref(database, "/push/direct/" + vuser + "/conversations/" + direct_id), {people: [vuser, nuser]});
  let token_key = push(child(ref(database, "/push/tokens/"), 'tokens')).key;
  let data = e.val()
  let token = data.token;
  set(ref(database, "/push/tokens/" + token_key), {token: token, channel: String(direct_id)})
}

async function get_uid(e) {
  let data = e.val();
  let email = document.getElementById("email-input").value;
  other_uid = email_exists(email, data);
  if (other_uid != false) {
   return other_uid;
  }
  else {
    var div = document.getElementById("add-arcs");
    let error = document.createElement("p");
    let error_text = document.createTextNode("The user " + added_email + " does not exist.");
    error.appendChild(error_text);
    error.style.color = "red";
    div.appendChild(error);
  }
}

async function create_direct() {
  direct_id = Math.floor(Math.random()*99999);
  let other_uid = await get(child(dbRef, "/users/")).then(get_uid);
  await get(child(dbRef,"/push/direct/" + uid + "/conversations/")).then((snapshot) => {
    let conversations = snapshot.val();
    for (conversation in conversations) {
      console.log(conversation);
      let list = conversations[conversation].people;
      if (list.includes(other_uid)) {
        join(conversation);
        break;
      }
      else {
        continue;
      }
    }
  });
  await get(child(dbRef, "/push/users/" + uid)).then(direct_async(uid,other_uid));
  await get(child(dbRef, "/push/users/" + other_uid)).then(direct_async(other_uid,uid));
  console.log("Registration complete!")
  submit_direct(direct_id);
}
window.create_direct = create_direct;
function submit_direct(id) {
  let other_email = document.getElementById("email-input").value;
  let admin = [user_email, other_email];   
  set(ref(database, "/channel/" + id + "/members/"),{admin: admin});
  set(ref(database, "/channel/" + id + "/basic_data"), {name: "DM conversation"});
  var url = new URL("https://chat-on-arc.github.io/channel");
  url.searchParams.append('channel_id', id);
  console.log(url);
  window.location.href = url;
 }

function new_direct() {
  var div = document.getElementById("add-arcs");
  div.style.visibility = "visible";
  div.innerHTML = "<div style='padding: 10px;'>" + 
  "<h1>New conversation</h1>" + 
  "<h4>User email</h4>" + 
  "<input type='text' id='email-input'></input>" + 
  '<button onclick="create_direct()">Submit</button>'+
  '<button onclick="cancel()">Cancel</button>'+
  '</div>';
}
window.new_direct = new_direct;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log(user);
    uid = user.uid;
    user_email = user.email;
    document.getElementById("username").innerHTML = user.displayName;
    document.getElementById("user-greeting").innerHTML = "Hi, " + user.displayName + "!";
    let basic_info = {
     displayName: user.displayName,
     email: user.email,
    };
   if(user.email == "milesport@outlook.com") {
    document.getElememtById("main").innerHTML = "<p>Fatal error: Massive fucking forehead detected.</p><a href='javascript:logout()'>Sign out</a>";
   }
   else {
   set(ref(database, "users/" + uid + "/basic_info"), basic_info);
    var arcs_ref = ref(database, "users/" + uid + "/channels/");
    onValue(arcs_ref, (snapshot) => {
     let data = snapshot.val();
     console.log(data);
     let arc_table = document.getElementById("channels-table");
     if(data != null) {
      arc_table.innerHTML = "";
      for(let n = 0; n < Object.keys(data).length; n++) {
        let arc_number = Object.keys(data)[n];
        get(child(dbRef, '/channel/' + arc_number + "/basic_data")).then((snapshot) => {
        let arc_data = snapshot.val()
        let arc = document.createElement("div"); // add to arc_table
       
        arc.style.padding = "7px";
        arc.style.background = "black";
       
        let arc_container = document.createElement("div"); // add to arc
        let arc_name = document.createElement("h3"); // add to arc container
        let arc_name_node = document.createTextNode(arc_data.name); // add to arc_name
       
        arc_name.style.color = "white";
        let join_arc = document.createElement("button"); // add to arc container
        join_arc.innerHTML = "Go to arc";
        join_arc.setAttribute("onclick","join(" + arc_number + ")");

        arc_name.appendChild(arc_name_node);
        arc_container.appendChild(arc_name);
        arc_container.appendChild(join_arc);
        arc.appendChild(arc_container);
        arc_table.appendChild(arc);
      });
     }
    }
    else {
      arc_table.innerHTML = "You are not in any Arcs. Create an arc or ask your friends to add you to one!"
    }
    });
   }
    // ...
  } else {
    window.location.href = "index.html";
    // ...
  }
});
