import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet , SafeAreaView} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

import { RootStackParamList } from '../Navigation/YourStackfile';

interface OnboardingScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Onboarding'>;
}

const Dots = ({ selected }: { selected: boolean }) => {
  let backgroundColor = selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)';
  return (
    <View
      style={{
        width: 6,
        height: 6,
        marginHorizontal: 3,
        backgroundColor,
      }}
    />
  );
};

const Skip = ({ ...props }: any) => (
  <TouchableOpacity style={{ marginHorizontal: 20 }} {...props}>
    <Text style={{ fontSize: 16 }}>Skip</Text>
  </TouchableOpacity>
);

const Next = ({ ...props }: any) => (
  <TouchableOpacity style={{ marginHorizontal: 20 }} {...props}>
    <Text style={{ fontSize: 16 }}>Next</Text>
  </TouchableOpacity>
);

const Done = ({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'Onboarding'> }) => (
  <TouchableOpacity style={{ marginHorizontal: 20 }} onPress={() => navigation.navigate('Login')}>
    <Text style={{ fontSize: 16 }}>Done</Text>
  </TouchableOpacity>
);

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Onboarding
          SkipButtonComponent={Skip}
          NextButtonComponent={Next}
          DoneButtonComponent={() => <Done navigation={navigation} />}
          DotComponent={Dots}
          onDone={() => navigation.navigate('Login')}
          pages={[
            {
              backgroundColor: '#a6e4d0',
              image: <Image source={require('../Assets/Images/onboarding-img1.png')} />,
              title: 'Connect to the World',
              subtitle: 'A New Way To Connect With The World',
            },
            {
              backgroundColor: '#fdeb93',
              image: <Image source={require('../Assets/Images/onboarding-img2.png')} />,
              title: 'Share Your Favorites',
              subtitle: 'Share Your Thoughts With Similar Kind of People',
            },
            {
              backgroundColor: '#e9bcbe',
              image: <Image source={require('../Assets/Images/onboarding-img3.png')} />,
              title: 'Become The Star',
              subtitle: 'Let The Spot Light Capture You',
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
});

export default OnboardingScreen;
