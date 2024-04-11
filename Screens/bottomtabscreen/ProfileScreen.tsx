import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack'; // Import the StackNavigationProp type
import { RootStackParamList } from 'Navigation/YourStackfile';
// Import the RootStackParamList type

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>; // Define the type of navigation prop
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        Alert.alert(
          'Confirm Logout',
          'Are you sure you want to log out from RH Social App?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Logout',
              onPress: async () => {
                // Attempt to sign out the current user
                await firebase.auth().signOut();
                // Redirect to the login screen after successful logout
                navigation.navigate('Login');
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        // If no user is currently logged in, log an error
        console.error('No user currently signed in.');
      }
    } catch (error) {
      // Handle any errors that occur during the sign-out process
      console.error('Logout Error:', error);
      // Optionally, show an alert to the user indicating the error
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePictureBorder}>
          <Image
            style={styles.profilePicture}
            source={require('../../Assets/Images/profile.jpg')}
          />
        </View>
      </View>
      
      <Text style={styles.title}>Profile Screen</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profilePictureContainer: {
    marginBottom: 20,
  },
  profilePictureBorder: {
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#2e64e5',
    padding: 3,
  },
  profilePicture: {
    width: 144,
    height: 144,
    borderRadius: 72,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    width: '45%',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ProfileScreen;
