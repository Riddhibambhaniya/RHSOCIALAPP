import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage'; // Import Firebase storage
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker'; // Import image picker
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';

type EditProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditProfile'>;
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [avatarSource, setAvatarSource] = useState<string | null>(null); // Added state to track avatar source

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        const userData = await firestore().collection('users').doc(currentUser.uid).get();
        setDisplayName(userData.data()?.name || '');
        setEmail(userData.data()?.email || '');
        setPhoneNumber(userData.data()?.phoneNumber || '');
        setProfilePicture(userData.data()?.profilePicture || null); // Set profile picture
        setAvatarSource(userData.data()?.profilePicture || null); // Set avatar source
      } else {
        console.error('No user currently signed in.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({
          displayName: displayName.trim(),
        });

        await firestore().collection('users').doc(currentUser.uid).update({
          name: displayName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
        });

        Alert.alert('Success', 'Profile updated successfully.');
        navigation.goBack();
      } else {
        console.error('No user currently signed in.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
        const url = await imageRef.getDownloadURL();

        await firestore().collection('users').doc(currentUser.uid).update({
          profilePicture: url,
        });

        setProfilePicture(url);
        setAvatarSource(url); // Set avatar source to the uploaded picture
      } else {
        console.error('No user currently signed in.');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleChooseProfilePicture}>
        <View style={styles.profilePictureContainer}>
          {avatarSource ? (
            <Image style={styles.profilePicture} source={{ uri: avatarSource }} />
          ) : (
            <Image style={styles.profilePicture} source={require('../Assets/Images/profile.jpg')} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={(text) => setDisplayName(text)}
          placeholder="Enter your name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    marginTop:15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#2e64e5',
    width: '100%',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,marginTop:50,
  },
  profilePicture: {
    width: 144,
    height: 160,
    borderRadius: 50, borderColor: 'black',
    borderWidth: 1, // Add border width for clarity
  },
});

export default EditProfileScreen;
