import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface OtherUserProfileScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'OtherUserProfile'>;
  route: any; // Ensure to import appropriate type for route
}

const OtherUserProfileScreen: React.FC<OtherUserProfileScreenProps> = ({ navigation, route }) => {
  const { userId, profilePicture } = route.params;
  const [userName, setUserName] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  console.log('SenderId:', firebase.auth().currentUser?.uid);
  console.log('UserId:', userId);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await firebase.firestore().collection('users').doc(userId).get();
        if (userData.exists) {
          const { name } = userData.data() || {};
          setUserName(name || 'Unknown');
          // Check if the logged-in user is already following this user
          const currentUser = firebase.auth().currentUser;
          if (currentUser) {
            const followingRef = await firestore()
              .collection('following')
              .doc(currentUser.uid)
              .collection('userFollowing')
              .doc(userId)
              .get();
            setIsFollowing(!!followingRef.exists);
          }
        } else {
          setUserName('Unknown');
          // Handle user not found scenario
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data.');
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [userId]);

  const fetchUserPosts = async () => {
    try {
      const userPostsSnapshot = await firestore()
        .collection('posts')
        .where('userId', '==', userId)
        .get();
      const fetchedUserPosts = userPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(fetchedUserPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      Alert.alert('Error', 'Failed to fetch user posts.');
    }
  };

  const handleFollow = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        // User not logged in
        return;
      }
      if (isFollowing) {
        // Unfollow the user
        await firestore()
          .collection('following')
          .doc(currentUser.uid)
          .collection('userFollowing')
          .doc(userId)
          .delete();
        setIsFollowing(false);
      } else {
        // Follow the user
        await firestore()
          .collection('following')
          .doc(currentUser.uid)
          .collection('userFollowing')
          .doc(userId)
          .set({});
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      Alert.alert('Error', 'Failed to toggle follow status.');
    }
  };

  const handleMessage = () => {const { userId } = route.params; // Retrieve the userId from route.params
  const selectedUserId = userId; // Set selectedUserId to userId (you may want to modify this logic based on your navigation)

    // Navigate to the chat screen with the selected user
    navigation.navigate('Chat', { userId, selectedUserId,userName });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileInfo}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <Image
              source={require('../../Assets/Images/profile.jpg')}
              style={styles.profilePicture}
            />
          )}
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]} onPress={handleFollow}>
            <Text style={styles.buttonText}>{isFollowing ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]} onPress={handleMessage}>
            <Text style={styles.buttonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Posts</Text>

      <ScrollView style={styles.postsContainer}>
        {userPosts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.postProfilePic} />
              ) : (
                <Image
                  source={require('../../Assets/Images/profile.jpg')}
                  style={styles.postProfilePic}
                />
              )}
              <Text style={styles.postUserName}>{userName}</Text>
            </View>
            {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
            <Text style={styles.postText}>{post.text}</Text>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    
  },
  profileInfo: {
    alignItems: 'center',
  },
  profilePicture: {
    width: 144,
    height: 160,
    borderRadius: 50,
    marginBottom: 20,
    borderColor: 'black',
    borderWidth: 1,
    marginTop: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '55%',
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop:20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,marginTop:30,marginRight:280,
  },
  postsContainer: {
    width: '100%',
    paddingHorizontal: 20,marginTop:10,
  },
  postCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
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
    marginRight: 10,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 5,
  },
  postText: {
    fontSize: 16,
  },
});

export default OtherUserProfileScreen;
