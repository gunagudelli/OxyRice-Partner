import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  BackHandler,
  Alert,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Animated,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from '../../config';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // //const { BASE_URL, userStage } = config(); // Get values

  const [scaleAnimation] = useState(new Animated.Value(1));
  const [headerHeight] = useState(new Animated.Value(height * 0.28)); // Slightly taller header

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp(), style: 'destructive' }
          ],
          { cancelable: false }
        );
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    }, [])
  );

  const handlePressIn = () => {
    Animated.spring(scaleAnimation, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const menuItems = [
    {
      id: 1,
      title: 'Orders',
      subTitle: 'Manage Orders',
      icon: 'bag-outline',
      gradient: ['#4CAF50', '#2E7D32'],
      onPress: () => navigation.navigate('Orders', { isTestOrder: false })
    },
    {
      id: 2,
      title: 'Items',
      subTitle: 'View Items',
      icon: 'list-outline',
      gradient: ['#2196F3', '#0D47A1'],
      onPress: () => navigation.navigate('Products')
    },
    {
      id: 3,
      title: 'Delivery Boys',
      subTitle: 'Track Team',
      icon: 'people-outline',
      gradient: ['#673AB7', '#4527A0'],
      onPress: () => navigation.navigate('Delivery Boys')
    },
    {
      id: 4,
      title: 'All Orders',
      subTitle: 'Order History',
      icon: 'albums-outline',
      gradient: ['#FF9800', '#E65100'],
      onPress: () => navigation.navigate('All Orders')
    },
    {
      id: 5,
      title: 'All Queries',
      subTitle: 'Raised by users',
      icon: 'chatbubbles-outline',
      gradient: ['#00BCD4', '#00838F'], // Cyan to Dark Cyan
      onPress: () => navigation.navigate('User Queries')
    },
    {
      id: 6,
      title: 'Split Bags',
      subTitle: 'Order History',
      icon: 'cut-outline',
      gradient: ['#FF4081', '#C2185B'], // Pink to Dark Pink
      onPress: () => navigation.navigate('Split Bags')
    },
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerHeight } } }],
    { useNativeDriver: false }
  );

  // Get current time to display appropriate greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️ ";
    if (hour < 18) return "Good Afternoon🌤 ";
    return "Good Evening 🌙 ";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.View style={[styles.header, { height: headerHeight }]}>
      <LinearGradient
          colors={['#3d2a71', '#5a3ea6']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
    <View style={styles.headerContent}>
      <Text style={styles.greetingText}>{getCurrentGreeting()}!</Text>
      <Text style={styles.welcomeText}>Welcome Back</Text>
      <Text style={styles.partnerName}>ASKOXY.AI PARTNER</Text>
      <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })}</Text>
    </View>
  </LinearGradient>
</Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        // onScroll={handleScroll}
        // scrollEventThrottle={16}
      >
        <View style={styles.mainContent}>
          <View style={styles.gridContainer}>
            {menuItems.map((item) => (
              <Animated.View key={item.id} style={{ transform: [{ scale: scaleAnimation }] }}>
                <TouchableOpacity
                  style={styles.box}
                  onPress={item.onPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.iconContainer}
                  >
                    <Icon name={item.icon} size={30} color="#fff" />
                  </LinearGradient>
                  <View style={styles.textContainer}>
                    <Text style={styles.boxText}>{item.title}</Text>
                    <Text style={styles.subText}>{item.subTitle}</Text>
                  </View>
                  <Icon 
                    name="chevron-forward" 
                    size={20} 
                    color="#666" 
                    style={styles.arrowIcon}
                  />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
         
        </View>
      </ScrollView>

      <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                "Logout",
                "🔒 Are you sure you want to log out from Askoxy.AI Partner? 🤔",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "OK", 
                    onPress: async () => {
                      try {
                        // Clear the token from AsyncStorage
                        await AsyncStorage.removeItem("accessToken");
                        
                        // Navigate to login screen
                        navigation.navigate("LoginWithPassword");
                      } catch (error) {
                        console.error("Logout error:", error);
                        Alert.alert("Error", "Failed to logout. Please try again.");
                      }
                    }
                  }
                ],
                { cancelable: false }
              );
            }}
          >
            <LinearGradient
              colors={['#FF5252', '#D32F2F']}
              style={styles.logoutGradient}
            >
              <Icon name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.testButtonsContainer}>
            {/* Test buttons commented out in original code */}
          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    width: '100%',
    overflow: 'hidden',
    // width: '100%',
    // position: 'absolute', // Make header fixed
    // top: 0,
    // left: 0,
    // right: 0,
    // zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 100,
  },
  // Add these to your StyleSheet:

greetingText: {
  fontSize: 24,
  fontWeight: '600',
  color: '#f8f9fa',
  marginBottom: 4,
  textAlign: 'center',
  textShadowColor: 'rgba(0, 0, 0, 0.2)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
},
welcomeText: {
  fontSize: 36,
  fontWeight: '800',
  color: '#ffffff',
  marginBottom: 8,
  textAlign: 'center',
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
},
partnerName: {
  fontSize: 28,
  fontWeight: '700',
  color: '#e0fbfc',
  textAlign: 'center',
  marginBottom: 8,
},
dateText: {
  fontSize: 16,
  color: '#ffffff',
  opacity: 0.9,
  fontWeight: '500',
  letterSpacing: 0.5,
},
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#ffffff',
    width: width * 0.42,
    height: height * 0.11,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft:10
    // justifyContent: 'center',
  },
  boxText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  arrowIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
  logoutButton: {
    // flex:3,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 10,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 3 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 5,
    //   },
    //   android: {
    //     elevation: 4,
    //   },
    // }),
  },
  logoutGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    margin:10
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutIcon: {
    marginRight: 8,
  },
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  testButton: {
    width: width * 0.42,
    overflow: 'hidden',
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

export default HomeScreen;