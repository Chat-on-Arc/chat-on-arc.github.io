import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
const firebaseConfig = {
    apiKey: "AIzaSyC5oq9fyPeoo8jVU-N07gYhjt2kFEBGqA8",
    authDomain: "arc-by-insight.firebaseapp.com",
    projectId: "arc-by-insight",
    storageBucket: "arc-by-insight.appspot.com",
    messagingSenderId: "1073428960179",
    appId: "1:1073428960179:web:c61897786f1d2ba05131c6",
    measurementId: "G-47T814R2SK"
  };
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

function setPicture(e) {
    let elements = document.getElementsByClassName("pfp");
    for(let element = 0; element < elements.length; element++) {
        elements[element].style.background = "url("+ e + ")";
        elements[element].style.backgroundSize = "contain";
    }
}
window.setPicture = setPicture;


function upload_image(path,file) {
  const storageRef = ref(storage, path);
  uploadBytes(storageRef, file).then((snapshot) => {
    // console.log(snapshot.val());
    console.log("Submission sucessfull!");
  });
}

window.upload_image = upload_image;

async function get_url() {
  const pathReference = ref(storage, path);
  await getDownloadURL(pathReference).then((url) => {
    return url;
  });
}
window.get_url = get_url;