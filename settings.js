
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, set, ref, onValue, get, child, remove, push } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getMessaging, getToken, onMessage, deleteToken } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js";
var uid;
var user_email;
var display_name;

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
window.logout = logout;

function submit_new_info() {
	let name_input = document.getElementById("display-name");
    	let email_input = document.getElementById("email-address");
	let success = document.getElementById("sucess");
	if(name_input.value != display_name) {
		let user = auth.currentUser;
		display_name = name_input.value;
		updateProfile(user, {displayName: name_input.value}).catch((error) => {
			success.style.color = "red";
			success.innerHTML = "An error occured when saving your display name.";
		});
	}
	if(email_input.value != user_email) {
		let user = auth.currentUser;
		user_email = email_input.value;
		updateProfile(user, {email: user_email}).catch((error) => {
			success.style.color = "red";
			success.innerHTML = "An error occured when saving your email.";
		});
	}
	console.log("Profile update complete.");
	success.style.color = "green";
	success.innerHTML = "Changes saved.";
}
window.submit_new_info = submit_new_info;

function arc_direct() {
  let content = document.getElementById("direct");
  let disabled1 = document.getElementById("push");
  let disabled2 = document.getElementById("manage");
  content.style.display = "block";
  disabled1.style.display = "none";
  disabled2.style.display = "none";
}
window.arc_direct = arc_direct;
function arc_push() {
  let content = document.getElementById("push");
  let disabled1 = document.getElementById("direct");
  let disabled2 = document.getElementById("manage");
  content.style.display = "block";
  disabled1.style.display = "none";
  disabled2.style.display = "none";
}
window.arc_push = arc_push;
function manage_acc() {
  let content = document.getElementById("manage");
  let disabled1 = document.getElementById("push");
  let disabled2 = document.getElementById("direct");
  content.style.display = "block";
  disabled1.style.display = "none";
  disabled2.style.display = "none";
}
window.manage_acc = manage_acc;

function delete_acc() {
  window.location.href = "./delete?type=acct";
}
window.delete_acc = delete_acc;

function disable_push() {
	deleteToken(messaging);
  let token_ref = ref(database, "/push/users/" + uid);
  remove(token_ref);
  let div = document.getElementById("push");
  let btn = document.getElementById("enable-push-btn");
  let status = document.getElementById("push-status");
  status.innerHTML = "<p style='color: green'>Currently, you do not have Arc Push enabled. Click the button below to enable it.</p>";                                
  btn.innerHTML = "Enable Arc Push";
  div.innerHTML += "Arc Push successfully disabled.";
	}
window.disable_push = disable_push;

function enable_push() {
  console.log('Requesting permission...');
  let push_button = document.getElementById("enable-direct-btn");
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      if (push_button) {
      	push_button.setAttribute("onclick","disable_push()");
	      push_button.innerHTML = "Disable Arc Push";
      }
	getToken(messaging, {vapidKey: "BFN_4xdvMbKPLlLtMDMiD5gyRnO7dZVR-LQArRYxwuOn3dnZbF_XUbaw3g72p4-NsCyPE-xhYG8YpWHJ0r3goBk"}).then((currentToken) => {
	if(currentToken) {
		console.log(currentToken);
    get(child(dbRef,"/push/users/" + uid + "/tokens/")).then((snapshot) => {
      let data = snapshot.val();
      data = data.tokens;
      if(data != null) {
        data.push(currentToken);
        set(ref(database, "/push/users/" + uid + "/tokens/"), {tokens: data});
      }
      else {
        let data = [];
        data.push(currentToken);
        set(ref(database, "/push/users/" + uid + "/tokens/"), {tokens: data});
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../firebase-messaging-sw.js').then((registration) => {console.log('Service Worker registered with scope:', registration.scope);}).catch((error) => 
         {console.error('Service Worker registration failed:', error);});
      }

    });
		
		}  
	else {
    push_button.remove();
    let div = document.getElementById("push");
    div.innerHTML += "<p style='color: red;'>You denied Arc permission to send notifications. Therefore, you must enable permissions again within the settings, then refresh the page.</p>"
		console.log("no token");
	}
    });
    }
                                        });
}
window.enable_push = enable_push;

function enable_direct() {
  get(child(dbRef, "/push/users/" + uid)).then((snapshot) => {
    let success = document.getElementById("direct-success");
    if(snapshot.val() != null) {
      let data = snapshot.val();
      let token = data.token;
      set(ref(database, "/push/direct/" + uid), {token: token});
      success.innerHTML = "Arc Direct successfully enabled!";
      success.style.color = "green";
    }
    else {
      success.style.color = "red";
      success.innerHTML = "You do not have Arc Push enabled. Enable Arc Push, then enable Arc Direct.";
    }
  });
}
window.enable_direct = enable_direct;
function unsubscribe(id) {
  get(child(dbRef, "/push/users/" + uid)).then((snapshot) => {
    let unsubscribe_key = push(child(ref(database, "/push/unsubscribe"), 'tokens')).key;
    let data = snapshot.val()
    let token = data.token;
    set(ref(database, "/push/unsubscribe" + unsubscribe_key), {token: token, channel_id: id})
  });
}
function disable_direct() {
  get(child(dbRef, "/push/direct/" + uid + "/conversations")).then((snapshot) => {
    let conversations = snapshot.val();

    for(const conversation in conversations) {
      unsubscribe(conversation);
    }
    let direct_ref = ref(database, "/push/direct/" + uid);
    remove(direct_ref);
  }); 
}
window.disable_direct = disable_direct;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log(user);
    uid = user.uid;
    display_name = user.displayName;
    document.getElementById("username").innerHTML = display_name;
    user_email = user.email;
    arc_direct();
    let name_input = document.getElementById("display-name");
    name_input.value = user.displayName;
    let email_input = document.getElementById("email-address");
    email_input.value = user.email;
    get(child(dbRef, "/push/users/" + uid)).then((snapshot) => {
      if(snapshot.val() != null) {
        document.getElementById("push-status").innerHTML = "Currently, you have Arc Push enabled. Click the button below to disable it."
        let button = document.getElementById("enable-push-btn");
        button.innerHTML = "Disable Arc Push";
        button.setAttribute("onclick", "disable_push()");
      }
    });
      if(Notification.permission == "granted") {
        document.getElementById("direct-status").innerHTML = "Currently, you have Arc Direct enabled on this device. Click the button below to disable it."
        let button = document.getElementById("enable-direct-btn");
        button.innerHTML = "Disable Arc Direct";
        button.setAttribute("onclick", "disable_direct()");
      }
  }
    // ...
  else {
    window.location.href = "login.html";
    // ...
  }
});
