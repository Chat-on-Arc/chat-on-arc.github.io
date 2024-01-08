importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js');

// Your Firebase project configuration
firebase.initializeApp({
  apiKey: "AIzaSyC5oq9fyPeoo8jVU-N07gYhjt2kFEBGqA8",
  authDomain: "arc-by-insight.firebaseapp.com",
  projectId: "arc-by-insight",
  storageBucket: "arc-by-insight.appspot.com",
  messagingSenderId: "1073428960179",
  appId: "1:1073428960179:web:c61897786f1d2ba05131c6",
  measurementId: "G-47T814R2SK"
});

var channel_id;
// Initialize Firebase with the configuration
const messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  channel_id = payload.data.channelId;
  const notificationTitle = payload.data.displayName + ' in ' + payload.data.channel_name;
  const notificationOptions = {
    body: payload.data.content,
    fcm_options: {
      link: "https://jcamille2023.github.io/arc/channel?channel_id=" + payload.data.channelId,
    },
  };

      self.registration.showNotification(notificationTitle, notificationOptions);
});


self.onnotificationclick = (event) => {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/arc/channel?channel_id=" + channel_id && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/arc/channel?channel_id=" + channel_id);
      }),
  );
};
