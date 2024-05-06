import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import FormInput from '../Components/FormInput';
import FormButton from '../Components/FormButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/YourStackfile';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface SignupScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Signup'>;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSignUp = async () => {
    try {
      // Create user using email and password
      const { user } = await firebase.auth().createUserWithEmailAndPassword(email, password);
  
      // Check if user exists
      if (user) {
        // Save user data to Firestore with user ID
        await firestore().collection('users').doc(user.uid).set({
          userId: user.uid,
          name: name,
          email: email,
          phoneNumber: phoneNumber,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Include timestamp field
        });
  
        // Navigate to the bottom tab screen
        navigation.navigate('BottomTabScreen');
      } else {
        Alert.alert('Error', 'User not found after signup.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create an account</Text>

      <FormInput
        labelValue={name}
        onChangeText={(userName) => setName(userName)}
        placeholderText="Name"
        iconType="user"
      />

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
        labelValue={phoneNumber}
        onChangeText={(userPhoneNumber) => setPhoneNumber(userPhoneNumber)}
        placeholderText="Phone Number"
        iconType="phone"
        keyboardType="phone-pad"
      />

      <FormInput
        labelValue={password}
        onChangeText={(userPassword) => setPassword(userPassword)}
        placeholderText="Password"
        iconType="lock"
        secureTextEntry={true}
      />

      <FormInput
        labelValue={confirmPassword}
        onChangeText={(userPassword) => setConfirmPassword(userPassword)}
        placeholderText="Confirm Password"
        iconType="lock"
        secureTextEntry={true}
      />

      <FormButton buttonTitle="Sign Up" onPress={handleSignUp} />

      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.navButtonText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafd',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontFamily: 'Kufam-SemiBoldItalic',
    fontSize: 28,
    marginBottom: 10,
    color: '#051d5f',
  },
  navButton: {
    marginTop: 15,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2e64e5',
    fontFamily: 'Lato-Regular',
  },
});
