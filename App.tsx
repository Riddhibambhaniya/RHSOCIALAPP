// app.tsx


// Import the specific Firebase services you need
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import YourStackfile from './Navigation/YourStackfile'; 
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCMQ9_hML3StIvdp10GCJ8K_HLmwaq62XM",
    authDomain: "rhsocialapp.firebaseapp.com",
    projectId: "rhsocialapp",
    storageBucket: "rhsocialapp.appspot.com",
    messagingSenderId: "433340399012",
    appId: "1:433340399012:android:8172bb866e3f2041005531",
    measurementId: "G-8172BB866E"
  };
  
  
  useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  }, []);

  return (
    <NavigationContainer>
      <YourStackfile />
    </NavigationContainer>
  );
};

export default App;
