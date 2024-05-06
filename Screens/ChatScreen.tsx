import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/auth';
import ImagePicker, { ImagePickerResponse, launchCamera, launchImageLibrary, MediaType } from 'react-native-image-picker';
import EmojiSelector from 'react-native-emoji-selector';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ChatScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
  route: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [otherUserProfile, setOtherUserProfile] = useState<{ userId: string; profilePicture?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const currentUserUid = firebase.auth().currentUser?.uid;
        if (!currentUserUid) {
          setLoading(false);
          return;
        }
    
        const messagesCollection = firestore().collection('messages');
    
        // Construct the query to fetch messages where the current user is sender or receiver
        const query = messagesCollection
          .where('senderId', 'in', [currentUserUid, userId])
          .where('receiverId', 'in', [currentUserUid, userId])
          .orderBy('createdAt', 'asc');
    
        // Subscribe to the query snapshot
        const unsubscribe = query.onSnapshot((snapshot) => {
          if (!snapshot) {
            console.log('Snapshot is null or undefined');
            setMessages([]);
            setLoading(false);
            return;
          }
    
          const fetchedMessages: any[] = [];
          snapshot.forEach((doc) => {
            if (doc.exists) {
              fetchedMessages.push({
                id: doc.id,
                ...doc.data(),
              });
            } else {
              console.log('Document does not exist:', doc.id);
            }
          });
    
          setMessages(fetchedMessages);
          setLoading(false);
        });
    
        return unsubscribe; // Return the unsubscribe function for cleanup
      } catch (error) {
        console.error('Error fetching messages:', error);
        Alert.alert('Error', 'Failed to fetch messages. Please try again.');
        setLoading(false);
      }
    };
    
    

    const fetchOtherUserProfile = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setOtherUserProfile({
            userId: userDoc.id,
            profilePicture: userData?.profilePicture || null,
          });
        }
      } catch (error) {
        console.error('Error fetching other user profile:', error);
      }
    };

    fetchMessages();
    fetchOtherUserProfile();
  }, [userId]);

  const sendMessage = async () => {
    try {
      const currentUserUid = firebase.auth().currentUser?.uid;
      if (!currentUserUid) {
        return;
      }

      const trimmedMessage = messageText.trim();
      if (trimmedMessage) {
        await firestore().collection('messages').add({
          senderId: currentUserUid,
          receiverId: userId,
          text: messageText,
          createdAt: new Date(),
        });
        setMessageText('');
      } else {
        Alert.alert('Error', 'Message cannot be empty.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const pickImage = () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo' as MediaType,
    };

    Alert.alert(
      'Select Image',
      'Choose the image source',
      [
        {
          text: 'Camera',
          onPress: () => launchCamera(options, handleImagePickerResponse),
        },
        {
          text: 'Gallery',
          onPress: () => launchImageLibrary(options, handleImagePickerResponse),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.assets && response.assets.length > 0) {
      const imageUrl = response.assets[0]?.uri;
      if (imageUrl) {
        sendMessageWithImage(imageUrl);
      } else {
        console.error('Image URL is undefined');
      }
    }
  };

  const sendMessageWithImage = async (imageUrl: string) => {
    try {
      const currentUserUid = firebase.auth().currentUser?.uid;
      if (!currentUserUid) {
        return;
      }

      await firestore().collection('messages').add({
        senderId: currentUserUid,
        receiverId: userId,
        text: '',
        imageUrl,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error sending message with image:', error);
      Alert.alert('Error', 'Failed to send message with image.');
    }
  };

  const handleEmojiSelection = (emoji: string) => {
    setMessageText((prevMessageText) => prevMessageText + emoji);
    setShowEmojiPicker(false);
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isCurrentUser = item.senderId === firebase.auth().currentUser?.uid;

    const currentDate = new Date(item.createdAt.toDate());
    const prevMessage = messages[index - 1];
    const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt.toDate()) : null;

    const isSameDay = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    const renderDateHeader = () => {
      if (!prevMessageDate || !isSameDay(currentDate, prevMessageDate)) {
        if (isSameDay(currentDate, new Date())) {
          return 'Today';
        } else if (isSameDay(currentDate, new Date(Date.now() - 86400000))) {
          return 'Yesterday';
        } else {
          return currentDate.toLocaleDateString();
        }
      }
      return null;
    };

    const renderMessageContent = () => {
      if (item.imageUrl) {
        // Render message with image
        return (
          <View>
            {renderDateHeader() && <Text style={styles.dateHeader}>{renderDateHeader()}</Text>}
            <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
              <Image source={{ uri: item.imageUrl }} style={styles.imageMessage} />
              <Text style={styles.messageTime}>
                {item.createdAt && item.createdAt.toDate().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        );
      } else {
        // Render message with text
    return (
          <View>
            {renderDateHeader() && <Text style={styles.dateHeader}>{renderDateHeader()}</Text>}
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>
                {item.createdAt && item.createdAt.toDate().toLocaleTimeString()}
              </Text>
            </View>
          </View>
        );
      }
    };

    return renderMessageContent();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e64e5" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {otherUserProfile && otherUserProfile.profilePicture ? (
          <Image source={{ uri: otherUserProfile.profilePicture }} style={styles.profilePicture} />
        ) : (
          <Image source={require('../Assets/Images/profile.jpg')} style={styles.profilePics} />
        )}
        <Text style={styles.userName}>{userName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
          <Text style={styles.emoji}>😀</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={pickImage}>
          <Icon name="camera" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {showEmojiPicker && (
        <View style={styles.emojiPickerContainer}>
          <EmojiSelector
            onEmojiSelected={handleEmojiSelection}
            showSearchBar={true}
            showTabs={false}
            columns={8}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 5,
  },
  profilePics:{
    width: 60,
    height: 60,
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 1,
    resizeMode: 'contain',
    marginLeft:5,
    },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2e64e5',
    color: '#fff',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f2f2f2',
  },
  messageText: {
    fontSize: 16,
    color: '#f2f2f2',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  dateHeader: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
   alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    position: 'relative', // Ensure the input container stays in place
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    padding: 8,
    marginLeft: 5,
    borderRadius: 20,
    backgroundColor: '#2e64e5',
  },
  emoji: {
    fontSize: 26,marginRight:4
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  emojiPickerContainer: {top:550,
    position: 'absolute',
    bottom: 50, // Adjust this value to position the emoji picker above the keyboard
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10, // Added padding for better appearance
  },
});

export default ChatScreen;
