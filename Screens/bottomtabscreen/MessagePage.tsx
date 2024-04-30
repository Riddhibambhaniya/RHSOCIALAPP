import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'Navigation/YourStackfile';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/auth';

interface MessagesScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Messages'>;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUserUid = firebase.auth().currentUser?.uid;
        const usersCollection = firestore().collection('users');
        const snapshot = await usersCollection.get();

        const fetchedUsers = snapshot.docs
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
          }))
          .filter(user => user.id !== currentUserUid); // Exclude current user

        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const navigateToChat = (userId: string, userName: string) => {
    const currentUserUid = firebase.auth().currentUser?.uid;
    const selectedUserId = userId;
    navigation.navigate('Chat', { userId, selectedUserId,userName });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => navigateToChat(item.id, item.name)}>
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  userItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MessagesScreen;
