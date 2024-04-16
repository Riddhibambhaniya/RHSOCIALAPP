import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../Screens/OnboardingScreen';
import LoginScreen from '../Screens/LoginScreen';
import SignupScreen from '../Screens/SignUp';
import ForgotPasswordScreen from '../Screens/ForgotpasswordScreen';
import ResetPasswordScreen from '../Screens/Resetpassword';
import MessagesScreen from '../Screens/bottomtabscreen/MessagePage'; // Corrected import
import ChatScreen from '../Screens/ChatScreen';
import BottomTabScreen from '../Screens/bottomtabscreen/BottomTabScreen';
import { firebase } from '@react-native-firebase/auth';
import EditProfileScreen from '../Screens/EditProfileScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  BottomTabScreen: undefined;
  Profile: undefined;
  ResetPassword: undefined;
  Messages: undefined;
  Chat: { user: any };
  EditProfile: undefined; // Add EditProfile to the RootStackParamList
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
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

    </Stack.Navigator>
  );
};

export default YourStackfile;
