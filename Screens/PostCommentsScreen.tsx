import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import firestore, { firebase } from '@react-native-firebase/firestore';

interface Comment {
  id: string;
  text: string;
  // Add other fields as needed
}

interface PostCommentsScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'PostComments'>;
  route: any;
}

const PostCommentsScreen: React.FC<PostCommentsScreenProps> = ({ route }) => {
  const { postId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsSnapshot = await firestore()
          .collection('comments')
          .where('postId', '==', postId)
          .get();
        const fetchedComments: Comment[] = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text, // Assuming 'text' is a field in your comment document
          // Add other fields similarly
        }));
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    try {
      if (!newComment.trim()) {
        return;
      }

      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        return;
      }

      await firestore().collection('comments').add({
        postId,
        userId: currentUser.uid,
        text: newComment.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setNewComment('');

      // Call fetchComments again to refresh the comments after adding a new comment
    
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Post Comments Screen for Post ID: {postId}</Text>
      {comments.map((comment) => (
        <Text key={comment.id}>{comment.text}</Text>
      ))}
      <TextInput
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Add a comment..."
        style={styles.commentInput}
      />
      <Button title="Add Comment" onPress={handleAddComment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInput: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});

export default PostCommentsScreen;
