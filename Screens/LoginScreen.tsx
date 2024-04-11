import React, { useState, useEffect } from 'react';
import { ScrollView, Image, Text, TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import FormInput from '../Components/FormInput';
import FormButton from '../Components/FormButton';
import SocialButton from '../Components/SocialButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/YourStackfile';
import auth, { firebase } from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

interface LoginScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const configureGoogleSignIn = async () => {
    GoogleSignin.configure({
      webClientId: '433340399012-2puqhnsvlpg0qss9ujh193hr3b7d4rtn.apps.googleusercontent.com', // Replace with your web client ID
    });
  };

  
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleCredential = firebase.auth.GoogleAuthProvider.credential(userInfo.idToken);
      await firebase.auth().signInWithCredential(googleCredential);
      navigation.navigate('BottomTabScreen');
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error signing in with Google. Please try again.');
    }
  };
  const handleFacebookSignIn = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw new Error('User cancelled the login process');
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Something went wrong obtaining access token');
      }
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      await auth().signInWithCredential(facebookCredential);
      navigation.navigate('BottomTabScreen');
    } catch (error) {
      console.error('Facebook sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Facebook');
    }
  };

  const handleEmailLogin = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        navigation.navigate('BottomTabScreen');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const navigateToSignUp = () => {
    navigation.navigate('Signup');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../Assets/Images/rn-social-logo.png')} style={styles.logo} />
      <Text style={styles.text}>RH Social App</Text>

      {/* Email/Password Form */}
      <FormInput
        labelValue={email}
        onChangeText={(userEmail) => setEmail(userEmail)}
        placeholderText="Email"
        iconType="user"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />
      <FormButton buttonTitle="Sign In" onPress={handleEmailLogin} />

      {/* Forgot Password and Sign Up Links */}
      <TouchableOpacity style={styles.forgotButton} onPress={navigateToForgotPassword}>
        <Text style={styles.navButtonText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotButton} onPress={navigateToSignUp}>
        <Text style={styles.navButtonText}>Don't have an account? Create here</Text>
      </TouchableOpacity>

      {/* Social Buttons */}
      <View style={styles.socialButtonContainer}>
        <SocialButton
          buttonTitle="Sign In with Facebook"
          btnType="facebook"
          color="#4867aa"
          backgroundColor="#e6eaf4"
          onPress={handleFacebookSignIn}
        />
      </View>
      <View style={styles.socialButtonContainer}>
        <SocialButton
          buttonTitle="Sign In with Google"
          btnType="google"
          color="#de4d41"
          backgroundColor="#f5e7ea"
          onPress={handleGoogleSignIn}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'cover',
  },
  text: {
    fontFamily: 'Kufam-SemiBoldItalic',
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  forgotButton: {
    marginVertical: 10,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
    fontFamily: 'Lato-Regular',
  },
  socialButtonContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default LoginScreen;
