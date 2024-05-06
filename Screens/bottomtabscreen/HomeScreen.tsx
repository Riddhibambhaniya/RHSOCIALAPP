import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icon library

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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<string>('');

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
    const fetchedPosts = await Promise.all(
      postsSnapshot.docs.map(async (doc) => {
        const postData = doc.data();
        const userData = await firestore().collection('users').doc(postData.userId).get();
        const userName = userData.exists ? userData.data()?.name || 'Unknown' : 'Unknown';
        const profilePic = userData.exists ? userData.data()?.profilePicture || 'default_profile_picture_url' : 'default_profile_picture_url';
        return {
          id: doc.id,
          ...postData,
          userName,
          profilePic,
        };
      })
    );
    setPosts(fetchedPosts);
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
          profilePicture: currentUser.photoURL || null, // Set profilePic based on currentUser's photoURL
          createdAt: firestore.FieldValue.serverTimestamp(),
          likes: [],
          comments: [],
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
  const handleLikePost = async (postId: string) => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        return;
      }
  
      const postRef = firestore().collection('posts').doc(postId);
      const postDoc = await postRef.get();
  
      if (postDoc.exists) {
        const postData = postDoc.data();
        const currentLikes: string[] = postData?.likes || [];
        const isLiked = currentLikes.includes(currentUser.uid);
  
        let updatedLikes: string[];
  
        if (isLiked) {
          updatedLikes = currentLikes.filter((uid) => uid !== currentUser.uid);
        } else {
          updatedLikes = [...currentLikes, currentUser.uid];
        }
  
        // Update the likes field in Firestore
        await postRef.update({ likes: updatedLikes });
  
        // Fetch updated post data to include the correct author's profile picture
        const updatedPostDoc = await postRef.get();
        if (updatedPostDoc.exists) {
          const updatedPostData = updatedPostDoc.data();
          updatePosts(postId, {
            ...updatedPostData,
            likes: updatedLikes,
          });
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };
  
  
  const updatePosts = (postId: string, updatedData: any) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, ...updatedData };
      }
      return post;
    });
    setPosts(updatedPosts);
  };
  
  
  const handleViewComments = async (postId: string) => {
    try {
      setSelectedPostId(postId);
      const postRef = firestore().collection('posts').doc(postId);
      const postDoc = await postRef.get();

      if (postDoc.exists) {
        const postData = postDoc.data();
        setComments(postData?.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to fetch comments. Please try again.');
    }
  };

  const handleAddComment = async () => {
    try {
      const currentUser = firebase.auth().currentUser;
      if (currentUser && selectedPostId) {
        const postRef = firestore().collection('posts').doc(selectedPostId);
        const postDoc = await postRef.get();

        if (postDoc.exists) {
          const postData = postDoc.data();
          const existingComments = postData?.comments || [];

          const newComment = {
            userId: currentUser.uid,
            userName: currentUser.displayName,
            profilePicture: currentUser.photoURL || null,
            text: commentText,
            createdAt: new Date().toISOString(),
          };

          const updatedComments = [...existingComments, newComment];
          await postRef.update({ comments: updatedComments });

          setComments(updatedComments);
          setCommentText('');
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const renderComments = () => {
    return comments.map((comment, index) => (
      <View key={index} style={styles.commentContainer}>
        <View style={styles.commentTextContainer}>
          <Text style={styles.commentUserName}>{comment.userName}</Text>
          <Text>{comment.text}</Text>
        </View>
      </View>
    ));
  };
  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Date) {
      // If timestamp is already a Date object
      const now = new Date(); // Current date and time
      const diffTime = Math.abs(now.getTime() - timestamp.getTime()); // Difference in milliseconds
  
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  
      if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour ago`;
      } else {
        const options = { month: 'short', day: 'numeric' };
        return timestamp.toLocaleDateString('en-US',);
      }
    } else {
      // Handle case where timestamp is not a Date object (e.g., Firestore Timestamp)
      // Convert Firestore Timestamp to JavaScript Date object
      const date = timestamp.toDate();
      const now = new Date(); // Current date and time
      const diffTime = Math.abs(now.getTime() - date.getTime()); // Difference in milliseconds
  
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  
      if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour ago`;
      } else {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      }
    }
  };
  
  
  const renderPostItem = (post: any) => {
    const { id, userName, profilePic, text, image, createdAt, likes, comments } = post;
  
    return (
      <TouchableOpacity key={id} style={styles.card}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => {
              if (post.userId !== firebase.auth().currentUser?.uid) {
                navigation.navigate('OtherUserProfile', {
                  userId: post.userId,
                  profilePicture: profilePic || null,
                });
              }
            }}
          >
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profilePic} />
            ) : (
              <Image
                source={require('../../Assets/Images/profile.jpg')}
                style={styles.profilePics}
              />
            )}
          </TouchableOpacity>
          <View style={styles.userNameContainer}>
            <Text style={styles.userNameText}>{userName}</Text>
            <Text style={styles.createdAtText}>{formatDate(createdAt)}</Text>
          </View>
        </View>
  
        {text && (
          <View style={styles.postContent}>
            <Text style={styles.postText}>{text}</Text>
          </View>
        )}
        {image && (
          <View style={styles.postContent}>
            <Image source={{ uri: image }} style={styles.postImage} />
          </View>
        )}
  
        <View style={styles.interactionContainer}>
          <TouchableOpacity onPress={() => handleLikePost(id)}>
            <View style={styles.interactionItem}>
              <Icon
                name="heart"
                color={likes && likes.includes(user?.uid) ? 'red' : 'black'}
                size={20}
              />
              <Text style={{ marginLeft: 5, color: 'black' }}>
                {likes ? likes.length : 0} Likes
              </Text>
            </View>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => handleViewComments(id)}>
            <View style={styles.interactionItem}>
              <Icon name="comment" color="#007bff" size={20} />
              <Text style={{ marginLeft: 5, color: '#007bff', fontSize: 16 }}>
                Comments ({comments ? comments.length : 0})
              </Text>
            </View>
          </TouchableOpacity>
        </View>
  
        {selectedPostId === id && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsHeader}>Comments</Text>
            {renderComments()}
            <View style={styles.commentInputContainer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                style={styles.commentInput}
              />
              <TouchableOpacity style={styles.postCommentButton} onPress={handleAddComment}>
                <Text style={styles.postCommentButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  const sortedPosts = posts.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()); // Sort posts by createdAt in descending order
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            {newPostImage && <Image source={{ uri: newPostImage }} style={styles.postImage} />}
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
          sortedPosts.map((post) => renderPostItem(post)) // Render sorted posts
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
  userNameContainer: {
    marginLeft: 20,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  createdAtText: {
    fontSize: 12,
    color: '#888',
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
    marginLeft: 15,
  },
  profilePics: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 1,
    resizeMode: 'contain',marginLeft:15
  },
  postContent: {
    marginBottom: 10,
    marginLeft: 15,
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
  interactionContainer: {
    flexDirection: 'row',
    marginTop: 10,
   // justifyContent: 'space-between',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',marginLeft:37,marginTop:5
  },
  commentsContainer: {
    marginTop: 10,marginRight:30
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentTextContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
  },
  commentUserName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  postCommentButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 5,
  },
  postCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
