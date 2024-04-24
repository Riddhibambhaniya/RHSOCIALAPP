import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import { RouteProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/auth';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
  route: ProfileScreenRouteProp;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, route }) => {
  const { userId } = route.params;
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await firestore().collection('users').doc(userId).get();
        setDisplayName(userData.data()?.name || '');
        setProfilePicture(userData.data()?.profilePicture || null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserPosts(userId);
    });

    return unsubscribe;
  }, [navigation, userId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = firebase.auth().currentUser;
      if (currentUser) {
        setIsCurrentUser(currentUser.uid === userId);
      }
    };

    fetchCurrentUser();
  }, [userId]);

  const fetchUserPosts = async (userId: string) => {
    try {
      const userPostsSnapshot = await firestore().collection('posts').where('userId', '==', userId).get();
      const userPostsData = userPostsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserPosts(userPostsData);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      Alert.alert('Error', 'Failed to fetch user posts.');
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e64e5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        {/* Profile Picture, Display Name, and Buttons */}
        {profilePicture !== null ? (
          <Image style={styles.profilePicture} source={{ uri: profilePicture }} />
        ) : (
          <Image style={styles.profilePicture} source={require('../../Assets/Images/profile.jpg')} />
        )}
        <Text style={styles.title}>{displayName}</Text>
        {isCurrentUser ? (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2e64e5' }]}
              onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]}>
            <Text style={styles.buttonText}>Follow</Text>
          </TouchableOpacity>
        )}
        
        {/* User's Posts */}
        <View style={styles.postsContainer}>
          <Text style={styles.postTitle}>Your Posts</Text>
          {userPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
               <View style={styles.userInfo}>
               {isCurrentUser && profilePicture && (
  <View style={styles.userInfo}>
    <TouchableOpacity >
      <Image source={{ uri: profilePicture }} style={styles.profilePic} />
    </TouchableOpacity>
    {post.userName !== null ? (
                  <Text style={styles.userName}>{post.userName}</Text>
                ) : (
                  <Text style={styles.userName}>Unknown User</Text>
                )}
  </View>
)}

</View>
                
              <Text style={styles.postContent}>{post.text}</Text>
              {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profilePicture: {
    width: 144,
    height: 160,
    borderRadius: 50,
    marginBottom: 20,
    borderColor: 'black',
    borderWidth: 1,
    marginTop:50,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
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
  postsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  postContent: {
    fontSize: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 5,
  },userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ProfileScreen;
