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
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
// import BASE_URL,{userStage} from "../../config"
import { config } from '../../config';


const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { BASE_URL, userStage } = config(); // Get values

  const [scaleAnimation] = useState(new Animated.Value(1));
  const [headerHeight] = useState(new Animated.Value(height * 0.25));

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
      gradient: ['#4CAF50', '#45a049'],
      onPress: () => navigation.navigate('Orders', { isTestOrder: false })
    },
    {
      id: 2,
      title: 'Items',
      subTitle: 'View Items',
      icon: 'list-outline',
      gradient: ['#2196F3', '#1976D2'],
      onPress: () => navigation.navigate('Products')
    },
    {
      id: 3,
      title: 'Delivery Boys',
      subTitle: 'Track Team',
      icon: 'people-outline',
      gradient: ['#3F51B5', '#303F9F'],
      onPress: () => navigation.navigate('Delivery Boys')
    },
    {
      id: 4,
      title: 'All Orders',
      subTitle: 'Order History',
      icon: 'albums-outline',
      gradient: ['#FFC107', '#FFA000'],
      onPress: () => navigation.navigate('All Orders')
    }
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerHeight } } }],
    { useNativeDriver: false }
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar  barStyle="light-content" />
      
      <Animated.View style={[styles.header, { height: headerHeight }]}>
       <LinearGradient
  colors={['#3d2a71', '#5a3ea6', '#3d2a71','#5a3ea6','#3d2a71', '#5a3ea6', '#3d2a71','#5a3ea6']} 
  style={styles.headerGradient}
  start={{ x: 0, y: 0,z:0,a:0,b:0,c:0 }}
  end={{ x: 1, y: 1,z:1,a:1,b:1,c:1 }}  
>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.partnerName}>AskOxy.AI Partner</Text>
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
                    <Icon name={item.icon} size={40} color="#fff" />
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
        <TouchableOpacity style={{ backgroundColor:'#FF6961',padding:10,alignItems:"center",borderRadius:10,

        }}
        
  onPress={() => {

    Alert.alert(
      "Logout",
      "🔒 Are you sure you want to log out from Askoxy.AI Partner? 🤔",
      [
        { text: "Cancel", style: "cancel" ,   },
        { text: "OK", onPress: () => navigation.navigate("LoginWithPassword") }
      ],
      { cancelable: false }
    );
  }}
>
  
  <Text style={{
    fontSize:20,fontWeight:"bold",color:"#fff"
  }}>Logout</Text>
</TouchableOpacity>

           

{/* 
          <View style={styles.testButtonsContainer}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={() => navigation.navigate('Orders', { isTestOrder: true })}
            >
              <LinearGradient
                colors={['#f8f9fa', '#e9ecef']}
                style={styles.testButtonGradient}
              >
                <Icon name="flask-outline" size={24} color="#666" />
                <Text style={styles.testButtonText}>Test Orders</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testButton}
              onPress={() => navigation.navigate('TestAllOrders', { isTestOrder: true })}
            >
              <LinearGradient
                colors={['#f8f9fa', '#e9ecef']}
                style={styles.testButtonGradient}
              >
                <Icon name="layers-outline" size={24} color="#666" />
                <Text style={styles.testButtonText}>Test AllOrders</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>
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
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  welcomeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  partnerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  box: {
    backgroundColor: '#ffffff',
    width: width * 0.42,
    height: height * 0.22,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'column',
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
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
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