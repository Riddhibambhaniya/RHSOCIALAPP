import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import { RouteProp } from '@react-navigation/native';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

type Post = {
  id: string;
  title: string;
  text: string;
  profilePic: string;
  userName: string;
  image: string | null;
  userId: string;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
        fetchUserPosts(user.uid);
        setIsCurrentUser(true);
      } else {
        setIsCurrentUser(false);
        setDisplayName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userData = await firestore().collection('users').doc(uid).get();
      setDisplayName(userData.data()?.name || '');
      setProfilePicture(userData.data()?.profilePicture || null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (uid: string) => {
    try {
      const postsSnapshot = await firestore().collection('posts').where('userId', '==', uid).get(); // Filter posts by userId
      const fetchedPosts = postsSnapshot.docs.map(async (doc) => {
        if (doc.exists) {
          const postData = doc.data();
          const userData = await firestore().collection('users').doc(postData.userId).get();
          return {
            id: doc.id,
            ...postData,
            userName: userData.exists ? userData.data()?.name || 'Unknown' : 'Unknown',
            profilePic: userData.exists ? userData.data()?.profilePicture || null : null,
            text: postData.text || '', // Ensure content is set
          } as Post | null;
        }
        return null;
      });
      setPosts((await Promise.all(fetchedPosts)) as Post[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts. Please try again.');
    }
  };
  
  
  
  useEffect(() => {
    console.log(posts); // Log the posts array after it has been set
  }, [posts]);

  const handleProfilePress = (userId: string, profilePicture: string | null) => {
    navigation.navigate('Profile', { userId, profilePicture: profilePicture || null });
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await firebase.auth().signOut();
              navigation.navigate('Login');
            } catch (error) {
              console.error('Logout Error:', error);
              Alert.alert('Logout Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
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

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Posts: {posts.length}</Text>
        </View>

        <ScrollView style={styles.postsContainer}>
          {posts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <TouchableOpacity onPress={() => handleProfilePress(post.userId, post.profilePic)}>
                  <Image source={{ uri: post.profilePic }} style={styles.postProfilePic} />
                </TouchableOpacity>
                <Text style={styles.postUserName}>{post.userName}</Text>
              </View>
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              )}
             {post.text && (
              <Text style={styles.postContent}>{post.text && post.text.trim()}</Text>
             )}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
    marginTop:70,
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
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
  postCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  postUserName: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
});

export default ProfileScreen;
