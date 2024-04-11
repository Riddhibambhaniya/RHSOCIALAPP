import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../Screens/OnboardingScreen';
import LoginScreen from '../Screens/LoginScreen';
import SignupScreen from '../Screens/SignUp'; // Corrected import
import ForgotPasswordScreen from '../Screens/ForgotpasswordScreen';
import ResetPasswordScreen from '../Screens/Resetpassword';

// Import Tab from App.tsx
import  BottomTabScreen from '../Screens/bottomtabscreen/BottomTabScreen';
import { firebase } from '@react-native-firebase/auth';
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  BottomTabScreen: undefined;
  Profile: undefined; // Add 'Profile' as a key
  ResetPassword: undefined;
};
const Stack = createStackNavigator<RootStackParamList>();

const YourStackfile: React.FC = () => {
  const currentUser = firebase.auth().currentUser;

  return (
    <Stack.Navigator initialRouteName={currentUser ? 'BottomTabScreen' : 'Onboarding'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="BottomTabScreen" component={BottomTabScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};


export default YourStackfile;
