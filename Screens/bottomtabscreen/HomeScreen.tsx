import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import { RouteProp } from '@react-navigation/native';

interface HomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  route: RouteProp<RootStackParamList, 'Home'>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostText, setNewPostText] = useState<string>('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
          setUser(currentUser);
          await fetchPosts();
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Failed to fetch user. Please try again.');
      }
    };
  
    fetchUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsSnapshot = await firestore().collection('posts').get();
      const fetchedPosts = postsSnapshot.docs.map(async (doc) => {
        if (doc.exists) {
          const postData = doc.data();
          const userData = await firestore().collection('users').doc(postData.userId).get();
          return {
            id: doc.id,
            ...postData,
            userName: userData.exists ? userData.data()?.name || 'Unknown' : 'Unknown',
            profilePic: userData.exists ? userData.data()?.profilePicture || null : null,
          };
        }
        return null;
      });
      setPosts(await Promise.all(fetchedPosts.filter(post => post !== null)));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to fetch posts. Please try again.');
    }
  };

  const handleChooseImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (!response.didCancel && !response.errorMessage) {
        if (response.assets && response.assets.length > 0) {
          console.log('Selected image URI:', response.assets[0].uri);
          setNewPostImage(response.assets[0].uri || null);
        }
      }
    });
  };

  const handleCreatePost = async () => {
    try {
      if (!newPostText) {
        Alert.alert('Error', 'Please write something for your post.');
        return;
      }
  
      let imageUrl = '';
      if (newPostImage) {
        const imageRef = storage().ref(`images/${Date.now()}`);
        await imageRef.putFile(newPostImage);
        imageUrl = await imageRef.getDownloadURL();
      }
  
      const currentUser = firebase.auth().currentUser;
  
      if (currentUser) {
        await firestore().collection('posts').add({
          userId: currentUser.uid,
          userName: currentUser.displayName,
          text: newPostText,
          image: imageUrl,
          profilePic: currentUser.photoURL || null,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
  
        setNewPostText('');
        setNewPostImage(null);
        setShowNewPost(false);
        setLoading(true);
  
        await fetchPosts();
  
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RH SOCIAL</Text>
        {!showNewPost && (
          <TouchableOpacity style={styles.newPostButton} onPress={() => setShowNewPost(true)}>
            <Text style={styles.newPostButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.postsContainer}>
        {showNewPost && (
          <View style={styles.newPostContainer}>
            <TextInput
              value={newPostText}
              onChangeText={setNewPostText}
              placeholder="Write something..."
              style={styles.newPostInput}
              multiline
            />
            {newPostImage && (
              <Image source={{ uri: newPostImage }} style={styles.postImage} />
            )}
            <TouchableOpacity style={styles.chooseImageButton} onPress={handleChooseImage}>
              <Text style={styles.chooseImageButtonText}>Choose Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
              <Text style={styles.createPostButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          posts.map((post: any) => (
            <TouchableOpacity
              key={post.id}
              style={styles.card}
              onPress={() => {
                if (post.userId !== firebase.auth().currentUser?.uid) { // Check if the post's user ID is not the same as the current user's ID
                  navigation.navigate('OtherUserProfile', { userId: post.userId, profilePicture: post.profilePic || null });
                }
              }}
            >
              <View style={styles.userInfo}>
                {post.profilePic && (
                  <TouchableOpacity
                    onPress={() => {
                      if (post.userId !== firebase.auth().currentUser?.uid) { // Check if the post's user ID is not the same as the current user's ID
                        navigation.navigate('OtherUserProfile', { userId: post.userId, profilePicture: post.profilePic || null });
                      }
                    }}
                  >
                    <Image source={{ uri: post.profilePic }} style={styles.profilePic} />
                  </TouchableOpacity>
                )}
                {post.userName !== null ? (
                  <Text style={styles.userName}>{post.userName}</Text>
                ) : (
                  <Text style={styles.userName}>Unknown User</Text>
                )}
              </View>
              
              {post.text && (
                <View style={styles.postContent}>
                  <Text style={styles.postText}>{post.text}</Text>
                </View>
              )}

              {post.image && (
                <View style={styles.postContent}>
                  <Image source={{ uri: post.image }} style={styles.postImage} />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  newPostButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  postsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  newPostContainer: {
    width: '90%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newPostInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  chooseImageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  chooseImageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createPostButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  createPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    width: '90%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft:15,
  },
  postContent: {
    marginBottom: 10,marginLeft:15,
  },
  postText: {
    fontSize: 14,
    marginLeft: 5,
  },
  postImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    borderRadius: 5,
  },
});

export default HomeScreen;
