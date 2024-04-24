// BottomTabScreen.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import HomeScreen from './HomeScreen';

import MessagesScreen from './MessagePage';
import ProfileScreen from '../bottomtabscreen/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 33;

const BottomTabScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => getTabBarIcon(route, focused, color),
        tabBarLabel: getTabBarLabel(route),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen as React.ComponentType<any>} // Add explicit type annotation
        options={{ headerShown: false }} initialParams={{ userId: 'currentUserId' }}
      />
    </Tab.Navigator>
  );
};

const getTabBarIcon = (route: RouteProp<ParamListBase, string>, focused: boolean, color: string) => {
  let imageName;
  if (route.name === 'Home') {
    imageName = require('../../Assets/Images/home.jpg');
  } else if (route.name === 'Messages') {
    imageName = require('../../Assets/Images/Messages.jpg');
  } else if (route.name === 'Profile') {
    imageName = require('../../Assets/Images/profile.jpg');
  }
  return <Image source={imageName} style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE }} />;
};

const getTabBarLabel = (route: RouteProp<ParamListBase, string>) => {
  if (route.name === 'Home') {
    return 'Home';
  } else if (route.name === 'Messages') {
    return 'Messages';
  } else if (route.name === 'Profile') {
    return 'Profile';
  }
};

export default BottomTabScreen;
