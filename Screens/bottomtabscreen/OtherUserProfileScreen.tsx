import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface OtherUserProfileScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'OtherUserProfile'>;
  route: any; // Ensure to import appropriate type for route
}

interface PostItem {
  id: string;
  image: string;
  text: string;
}

const OtherUserProfileScreen: React.FC<OtherUserProfileScreenProps> = ({ navigation, route }) => {
  const { userId, profilePicture } = route.params;
  const [userName, setUserName] = useState<string>('');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [userPosts, setUserPosts] = useState<PostItem[]>([]);

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

    const fetchUserPosts = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        if (currentUser && isFollowing) {
          const userPostsSnapshot = await firestore()
            .collection('posts')
            .where('userId', '==', userId)
            .get();
          const fetchedUserPosts: PostItem[] = userPostsSnapshot.docs.map(doc => ({
            id: doc.id,
            image: doc.data().image || '',
            text: doc.data().text || '',
          }));
          setUserPosts(fetchedUserPosts);
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
        Alert.alert('Error', 'Failed to fetch user posts.');
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [userId, isFollowing]);

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
        setUserPosts([]); // Clear user posts when unfollowing
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

  const handleMessage = () => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const selectedUserId = userId;
      navigation.navigate('Chat', { userId, selectedUserId, userName });
    } else {
      // Handle user not logged in
      Alert.alert('Error', 'You must be logged in to send a message.');
    }
  };

  const renderPostItem = ({ item }: { item: PostItem }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.postProfilePic} />
        ) : (
          <Image source={require('../../Assets/Images/profile.jpg')} style={styles.postProfilePic} />
        )}
        <Text style={styles.postUserName}>{userName}</Text>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
    </View>
  );

  return (
    <FlatList
      data={userPosts}
      renderItem={renderPostItem}
      keyExtractor={item => item.id}
      ListHeaderComponent={() => (
        <View style={styles.profileContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <Image source={require('../../Assets/Images/profile.jpg')} style={styles.profilePicture} />
          )}
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: isFollowing ? '#ccc' : '#2e64e5' }]}
              onPress={handleFollow}
              disabled={isFollowing}
            >
              <Text style={styles.buttonText}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#2e64e5' }]} onPress={handleMessage}>
              <Text style={styles.buttonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={styles.postsContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  profilePicture: {
    width: 130,
    height: 130,
    borderRadius: 60, // Make it a circle by setting borderRadius to half of width and height
    borderColor: 'black',
    borderWidth: 1,
    resizeMode: 'cover', // Maintain aspect ratio and cover the container
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '55%',marginTop:10,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  postsContainer: {
    paddingHorizontal: 20,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 15,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',marginLeft:20,
  },
  postImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    borderRadius: 5,
  },
  postText: {
    fontSize: 16,marginBottom:10,marginLeft:20
  },
});

export default OtherUserProfileScreen;
