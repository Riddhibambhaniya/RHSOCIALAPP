import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';

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
  const [followingCount, setFollowingCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
        fetchUserPosts(user.uid);
        setIsCurrentUser(true);
        fetchFollowingCount(user.uid);
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
      const postsSnapshot = await firestore().collection('posts').where('userId', '==', uid).get();
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

  const fetchFollowingCount = async (uid: string) => {
    try {
      const followingRef = await firestore().collection('following').doc(uid).collection('userFollowing').get();
      setFollowingCount(followingRef.size);
    } catch (error) {
      console.error('Error fetching following count:', error);
      Alert.alert('Error', 'Failed to fetch following count.');
    }
  };

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
          <View style={styles.profilePictureContainer}>
            <Image style={styles.profilePicture} source={{ uri: profilePicture }} />
          </View>
        ) : (
          <Image style={styles.profilePicture} source={require('../../Assets/Images/profile.jpg')} />
        )}

        <Text style={styles.title}>{displayName}</Text>

        
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
        
          <View style={styles.statsContainer}>
  <View style={styles.statItem}>
    <Text style={styles.statCount}>{posts.length}</Text>
    <Text style={styles.statText}>Posts</Text>
   
  </View>
  <View style={styles.statItem}>
    <Text style={styles.statCount}>{followingCount}</Text>
    <Text style={styles.statText}>Following</Text>
    
  </View>
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
              {post.text && <Text style={styles.postContent}>{post.text && post.text.trim()}</Text>}
              {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderColor: 'black',
    borderWidth: 1,
    resizeMode: 'cover',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',marginTop:20
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e64e5', // Custom color for count
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 15,
  },
  postUserName: {
    marginLeft: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  postContent: {
    fontSize: 16,
    marginLeft: 20,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    borderRadius: 5,
  },
});

export default ProfileScreen;
