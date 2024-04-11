import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import HomeScreen from './HomeScreen';

import ProfileScreen from './ProfileScreen';
import MessagesScreen from './MessagePage';

const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 24;

const BottomTabScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => getTabBarIcon(route, focused, color),
        tabBarLabel: getTabBarLabel(route),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
     
<Tab.Screen name="Profile" component={ProfileScreen} />
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
  return <Image source={imageName} style={{ width: 40, height: 40 }} />;
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
