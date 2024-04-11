import firebase from '@react-native-firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyCMQ9_hML3StIvdp10GCJ8K_HLmwaq62XM",
  authDomain: "rhsocialapp.firebaseapp.com",
  projectId: "rhsocialapp",
  storageBucket: "rhsocialapp.appspot.com",
  messagingSenderId: "433340399012",
  appId: "1:433340399012:android:8172bb866e3f2041005531",
  measurementId: "G-8172BB866E"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
