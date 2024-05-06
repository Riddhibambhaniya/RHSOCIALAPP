import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../Screens/OnboardingScreen';
import LoginScreen from '../Screens/LoginScreen';
import SignupScreen from '../Screens/SignUp';
import ForgotPasswordScreen from '../Screens/ForgotpasswordScreen';
import ResetPasswordScreen from '../Screens/Resetpassword';
import ChatScreen from '../Screens/ChatScreen';
import BottomTabScreen from '../Screens/bottomtabscreen/BottomTabScreen';
import EditProfileScreen from '../Screens/EditProfileScreen';
import ProfileScreen from '../Screens/bottomtabscreen/ProfileScreen';
import HomeScreen from '../Screens/bottomtabscreen/HomeScreen';
import OtherUserProfileScreen from '../Screens/bottomtabscreen/OtherUserProfileScreen';
import MessagesScreen from '../Screens/bottomtabscreen/MessagePage';

import { firebase } from '@react-native-firebase/auth';
import PostCommentsScreen from '../Screens/PostCommentsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  BottomTabScreen: undefined;
  Profile: { userId: string; profilePicture?: string | null };
  ResetPassword: { email: string }; // Define params for ResetPassword screen
  Messages: { userId: string; selectedUserId: string; userName: string };
  Chat: { userId: string; selectedUserId: string; userName: string };
  EditProfile: undefined;
  Home: undefined;
  OtherUserProfile: { userId: string; profilePicture?: string | null };
  PostComments: { postId: string };
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
      <Stack.Screen name="Chat" component={ChatScreen} initialParams={{ userId: '', selectedUserId: '', userName: '' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} />
      <Stack.Screen name="PostComments" component={PostCommentsScreen} />
    </Stack.Navigator>
  );
};

export default YourStackfile;
