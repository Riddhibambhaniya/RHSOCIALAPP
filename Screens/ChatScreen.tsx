import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/auth';

interface ChatScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Chat'>;
  route: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const currentUserUid = firebase.auth().currentUser?.uid;
        const messageListener = firestore()
          .collection('messages')
          .where('senderId', 'in', [currentUserUid, userId])
          .where('receiverId', 'in', [currentUserUid, userId])
          .orderBy('createdAt', 'asc')
          .onSnapshot(snapshot => {
            const fetchedMessages: any[] = [];
            snapshot.forEach(doc => {
              fetchedMessages.push({
                id: doc.id,
                ...doc.data(),
              });
            });
            setMessages(fetchedMessages);
          });

        return () => messageListener(); // Unsubscribe from listener on component unmount
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId]);

  const sendMessage = async () => {
    try {
      const currentUserUid = firebase.auth().currentUser?.uid;

      await firestore().collection('messages').add({
        senderId: currentUserUid,
        receiverId: userId,
        text: messageText,
        createdAt: new Date(),
      });

      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === firebase.auth().currentUser?.uid;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => {}}
        onLayout={() => {}}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
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
    backgroundColor: '#2e64e5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
