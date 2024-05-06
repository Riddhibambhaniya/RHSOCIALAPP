import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigation/YourStackfile';
import auth from '@react-native-firebase/auth';

interface ForgotPasswordScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Password Reset', `Password reset link sent to ${email}`, [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      console.error('Password reset error:', error);

      let errorMessage = 'Failed to send password reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please check the entered email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format. Please enter a valid email address.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
