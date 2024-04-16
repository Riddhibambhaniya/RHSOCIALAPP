import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker'; // Import image picker
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'; // Import Firebase storage
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // State to track loading indicator

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        // Clear user data when no user is signed in
        setDisplayName('');
        setProfilePicture(null);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true); // Set loading to true while fetching data
      const userData = await firestore().collection('users').doc(uid).get();
      setDisplayName(userData.data()?.name || '');
      const profilePicUrl = userData.data()?.profilePicture;
      if (profilePicUrl) {
        setProfilePicture(profilePicUrl);
      } else {
        // If user does not have a profile picture, set it to null or a default image
        setProfilePicture(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    } finally {
      setLoading(false); // Set loading to false when data fetching is completed
    }
  };
  
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Error', 'Failed to log out. Please try again.');
    }
  };

  const handleChooseProfilePicture = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const uri = response.assets[0]?.uri; // Use optional chaining
        if (uri) {
          uploadProfilePicture(uri);
        } else {
          console.error('Image URI is undefined.');
          Alert.alert('Error', 'Failed to select profile picture.');
        }
      }
    });
  };
  
  
  const uploadProfilePicture = async (uri: string) => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        const imageRef = storage().ref(`profilePictures/${currentUser.uid}`);
        await imageRef.putFile(uri);
        // Get the URL of the uploaded image
        const url = await imageRef.getDownloadURL();
        
        // Update Firestore with the new profile picture URL
        await firestore().collection('users').doc(currentUser.uid).update({
          profilePicture: url,
        });
  
        // Fetch user data again to update the profile picture state
        fetchUserData(currentUser.uid);
      } else {
        console.error('No user currently signed in.');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChooseProfilePicture}>
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePictureBorder}>
            {loading ? (
              <ActivityIndicator size="large" color="#2e64e5" /> // Display loading indicator
            ) : (
              <>
                {profilePicture ? (
                  <Image style={styles.profilePicture} source={{ uri: profilePicture }} />
                ) : (
                  <Image
                    style={styles.profilePicture}
                    source={require('../../Assets/Images/profile.jpg')}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <Text style={styles.title}>{displayName}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2e64e5' }]}
          onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2e64e5' }]}
          onPress={handleLogout}>
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
