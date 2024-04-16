import React, { useState, useEffect } from 'react';
import { ScrollView, Image, Text, TouchableOpacity, StyleSheet, View, Alert, TextInput, ActivityIndicator } from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

const HomeScreen: React.FC = () => {
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
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Failed to fetch user. Please try again.');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
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
              userName: userData.data()?.name || 'Unknown',
              profilePic: userData.data()?.profilePicture || null,
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

    fetchPosts();
  }, []);

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
      let imageUrl = '';
      if (newPostImage) {
        const imageRef = storage().ref(`images/${Date.now()}`);
        await imageRef.putFile(newPostImage);
        imageUrl = await imageRef.getDownloadURL();
      }

      await firestore().collection('posts').add({
        userId: user.uid,
        userName: user.displayName,
        profilePic: user.photoURL,
        text: newPostText,
        image: imageUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setNewPostText('');
      setNewPostImage(null);
      setShowNewPost(false);
      setLoading(true);

      const postsSnapshot = await firestore().collection('posts').get();
      const updatedPosts = postsSnapshot.docs.map(async (doc) => {
        if (doc.exists) {
          const postData = doc.data();
          const userData = await firestore().collection('users').doc(postData.userId).get();
          return {
            id: doc.id,
            ...postData,
            userName: userData.data()?.name || 'Unknown',
            profilePic: userData.data()?.profilePicture || null,
          };
        }
        return null;
      });
      setPosts(await Promise.all(updatedPosts.filter(post => post !== null)));
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RH SOCIAL</Text>
        {!showNewPost && (
          <TouchableOpacity style={styles.newPostButton} onPress={() => setShowNewPost(true)}>
            <Text style={styles.newPostButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={true}>
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
              <Image source={{ uri: newPostImage }} style={styles.newPostImage} />
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
          posts.map((post) => (
            <View key={post.id} style={styles.card}>
  <View style={styles.userInfo}>
    <Image source={{ uri: post.profilePic }} style={styles.profilePic} />
    <Text style={styles.userName}>{post.userName}</Text>
  </View>
  
  {/* Post Text */}
  {post.text && (
    <View style={styles.postContent}>
      <Text style={styles.postText}>{post.text}</Text>
    </View>
  )}

  {/* Post Image */}
  {post.image && (
    <View style={styles.postContent}>
      <Image source={{ uri: post.image }} style={styles.postImage} />
    </View>
  )}
</View>

          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
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
  newPostImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
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
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postContent: {
    marginBottom: 10,
  },
  postText: {
    fontSize: 14,
    marginLeft:5,
  },
  postImage: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    borderRadius: 5,
  },
});

export default HomeScreen;
