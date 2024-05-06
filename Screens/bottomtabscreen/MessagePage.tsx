import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { RootStackParamList } from 'Navigation/YourStackfile';

interface User {
  id: string;
  name: string;
  profilePic: string;
}

interface MessagesScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Messages'>;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUserUid = firebase.auth().currentUser?.uid;
        if (!currentUserUid) {
          setLoading(false);
          return;
        }
  
        const messagesCollection = firestore().collection('messages');
  
        // Query messages where the current user is either the sender or receiver
        const snapshot = await messagesCollection
          .where('senderId', '==', currentUserUid)
          .get();
  
        if (snapshot.empty) {
          setUsers([]);
          setLoading(false);
          return;
        }
  
        const receiverIds: Set<string> = new Set();
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.receiverId) {
            receiverIds.add(data.receiverId);
          }
        });
  
        if (receiverIds.size === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }
  
        const fetchedUsers: User[] = [];
        await Promise.all(
          Array.from(receiverIds).map(async (receiverId) => {
            const userDoc = await firestore().collection('users').doc(receiverId).get();
            const userData = userDoc.data();
            if (userData) {
              fetchedUsers.push({
                id: receiverId,
                name: userData.name,
                profilePic: userData.profilePicture || '',
              });
            }
          })
        );
  
        setUsers(fetchedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to fetch users. Please try again.');
      }
    };
  
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        fetchUsers(); // Fetch users when the user is authenticated
      } else {
        setUsers([]);
        setLoading(false);
      }
    });
  
    return () => {
      unsubscribe(); // Clean up the listener on component unmount
    };
  }, []);
  

    

  const navigateToChat = (userId: string, userName: string) => {
    navigation.navigate('Chat', { userId, selectedUserId: userId, userName });
  };

  const navigateToProfile = (userId: string, userName: string, profilePic: string) => {
    navigation.navigate('OtherUserProfile', { userId, profilePicture: profilePic });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigateToChat(item.id, item.name)}
      onLongPress={() => navigateToProfile(item.id, item.name, item.profilePic)}
    >
      <View style={styles.userContainer}>
        {item.profilePic ? (
          <TouchableOpacity onPress={() => navigateToProfile(item.id, item.name, item.profilePic)}>
            <Image
              source={{ uri: item.profilePic }}
              style={styles.profilePic}
              onError={() => console.warn('Failed to load image:', item.profilePic)}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigateToProfile(item.id, item.name, item.profilePic)}>
            <Image source={require('../../Assets/Images/profile.jpg')} style={styles.profilePics} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigateToChat(item.id, item.name)}>
          <Text style={styles.userName}>{item.name}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  profilePics: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderColor: 'black',
    borderWidth: 1,
    resizeMode: 'contain',
    marginLeft: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
});

export default MessagesScreen;
