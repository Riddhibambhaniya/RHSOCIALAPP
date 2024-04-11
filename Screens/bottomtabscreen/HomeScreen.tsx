import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

interface PostImageWithPlaceholderProps {
  source: ImageSourcePropType;
}

const PostImageWithPlaceholder: React.FC<PostImageWithPlaceholderProps> = ({ source }) => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating a delay to showcase the shimmer effect
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.postImageContainer}>
      {loading ? (
        <ShimmerPlaceholder style={styles.postImageShimmer} />
      ) : (
        <Image source={source} style={styles.postImage} onLoad={() => setLoading(false)} />
      )}
    </View>
  );
};

const HomeScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image source={require('../../Assets/Images/user-1.jpg')} style={styles.profilePic} />
          <Text style={styles.userName}>John Doe</Text>
        </View>
        <PostImageWithPlaceholder source={require('../../Assets/Images/post-img-4.jpg')} />
      </View>

      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image source={require('../../Assets/Images/user-6.jpg')} style={styles.profilePic} />
          <Text style={styles.userName}>Jane Smith</Text>
        </View>
        <Text style={styles.postText}>This is a sample post text.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Image source={require('../../Assets/Images/user-2.jpg')} style={styles.profilePic} />
          <Text style={styles.userName}>Alice Johnson</Text>
        </View>
        <PostImageWithPlaceholder source={require('../../Assets/Images/post-img-1.jpg')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
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
    elevation: 5,
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
  postImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postImageShimmer: {
    width: '100%',
    height: '100%',
  },
  postText: {
    fontSize: 14,
  },
});

export default HomeScreen;
