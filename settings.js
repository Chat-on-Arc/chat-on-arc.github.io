
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase, set, ref, onValue, get, child } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getMessaging, getToken, onMessage, deleteToken } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js";
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
  let div = document.getElementById("push");
  let btn = document.getElementById("enable-push-btn");
  let status = document.getElementById("push-status");
  status.innerHTML = "<p style='color: green'>Currently, you do not have Arc Push enabled. Click the button below to enable it.</p>";                                
  btn.innerHTML = "Enable Arc Push";
  div.innerHTML += "Arc Push successfully disabled.";
	});
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
		set(ref(database, "/push/users/" + uid), {token: currentToken});
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


onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    console.log(user);
    uid = user.uid;
    user_email = user.email;

   }
    // ...
  } else {
    window.location.href = "login.html";
    // ...
  }
});
