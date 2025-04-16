// import { useFocusEffect } from '@react-navigation/native';
// import React, { useCallback, useEffect, useState } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Dimensions,
//   BackHandler,
//   Alert,
//   StatusBar,
//   SafeAreaView,
//   ScrollView,
//   Animated,
//   Platform
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';
// import BASE_URL from '../../config';
// import { useSelector } from 'react-redux';
// // import BarcodeScanner from "../After Login/BarcodeScanner"
// const { width, height } = Dimensions.get('window');

// const HomeScreen = ({ navigation }) => {
//   // //const { BASE_URL, userStage } = config(); // Get values
//   const userData = useSelector((state) => state.counter);
//   AsyncStorage.getItem("userData").then((value) => {
//     console.log({value})
//   })
//   console.log({userData})
//   const [scaleAnimation] = useState(new Animated.Value(1));
//   const [headerHeight] = useState(new Animated.Value(height * 0.28)); // Slightly taller header

//   useFocusEffect(
//     useCallback(() => {
//       const handleBackPress = () => {
//         Alert.alert(
//           'Exit App',
//           'Are you sure you want to exit?',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Exit', onPress: () => BackHandler.exitApp(), style: 'destructive' }
//           ],
//           { cancelable: false }
//         );
//         return true;
//       };

//       BackHandler.addEventListener('hardwareBackPress', handleBackPress);
//       return () => BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
//     }, [])
//   );

//   const handlePressIn = () => {
//     Animated.spring(scaleAnimation, {
//       toValue: 0.95,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnimation, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   const menuItems = [
//     {
//       id: 1,
//       title: 'Orders',
//       subTitle: 'Manage Orders',
//       icon: 'bag-outline',
//       gradient: ['#4CAF50', '#2E7D32'],
//       onPress: () => navigation.navigate('Orders', { isTestOrder: false })
//     },
//     {
//       id: 2,
//       title: 'Items',
//       subTitle: 'View Items',
//       icon: 'list-outline',
//       gradient: ['#2196F3', '#0D47A1'],
//       onPress: () => navigation.navigate('Products')
//     },
//     {
//       id: 3,
//       title: 'Delivery Boys',
//       subTitle: 'Track Team',
//       icon: 'people-outline',
//       gradient: ['#673AB7', '#4527A0'],
//       onPress: () => navigation.navigate('Delivery Boys')
//     },
//     {
//       id: 4,
//       title: 'All Orders',
//       subTitle: 'Order History',
//       icon: 'albums-outline',
//       gradient: ['#FF9800', '#E65100'],
//       onPress: () => navigation.navigate('All Orders')
//     },
//     {
//       id: 5,
//       title: 'All Queries',
//       subTitle: 'Raised by users',
//       icon: 'chatbubbles-outline',
//       gradient: ['#00BCD4', '#00838F'], // Cyan to Dark Cyan
//       onPress: () => navigation.navigate('User Queries')
//     },
//     {
//       id: 6,
//       title: 'Split Bags',
//       subTitle: 'Order History',
//       icon: 'cut-outline',
//       gradient: ['#FF4081', '#C2185B'], // Pink to Dark Pink
//       onPress: () => navigation.navigate('Split Bags')
//     },
//     {
//       id: 7,  
//       title: 'Test Orders',  
//       subTitle: 'Order History',  
//       icon: 'file-tray-full-outline',  
//       gradient: ['#4CAF50', '#2E7D32'], // Green shades  
//       onPress: () => navigation.navigate('Orders', { isTestOrder: true })  
//     }
//   ];

  

//   const handleScroll = Animated.event(
//     [{ nativeEvent: { contentOffset: { y: headerHeight } } }],
//     { useNativeDriver: false }
//   );

//   // Get current time to display appropriate greeting
//   const getCurrentGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good Morning ☀️ ";
//     if (hour < 18) return "Good Afternoon🌤 ";
//     return "Good Evening 🌙 ";
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
      
//       <Animated.View style={[styles.header, { height: headerHeight }]}>
//       <LinearGradient
//           colors={['#3d2a71', '#5a3ea6']}
//           style={styles.headerGradient}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//     <View style={styles.headerContent}>
//       <Text style={styles.greetingText}>{getCurrentGreeting()}!</Text>
//       <Text style={styles.welcomeText}>Welcome Back</Text>
//       <Text style={styles.partnerName}>ASKOXY.AI PARTNER</Text>
//       <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
//         weekday: 'long', 
//         month: 'long', 
//         day: 'numeric' 
//       })}</Text>
//     </View>
//   </LinearGradient>
// </Animated.View>

//       <ScrollView 
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         // onScroll={handleScroll}
//         // scrollEventThrottle={16}
//       >
//         <View style={styles.mainContent}>
//         {/* <Text>gadsc</Text> */}
// <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:10}}>
// <TouchableOpacity onPress={() => navigation.navigate('Scan Bar Code')} style={styles.scanButton}>
//           <Text style={styles.buttonText}>Scan Bar Code</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => navigation.navigate('Scan Multiple Barcodes')} style={styles.scanButton}>
//           <Text style={styles.buttonText}>Scan Multiple BarCodes</Text>
//         </TouchableOpacity>
// </View>
     


//           <View style={styles.gridContainer}>
//             {menuItems.map((item) => (
//               <Animated.View key={item.id} style={{ transform: [{ scale: scaleAnimation }] }}>
//                 <TouchableOpacity
//                   style={styles.box}
//                   onPress={item.onPress}
//                   onPressIn={handlePressIn}
//                   onPressOut={handlePressOut}
//                   activeOpacity={0.9}
//                 >
//                   <LinearGradient
//                     colors={item.gradient}
//                     style={styles.iconContainer}
//                   >
//                     <Icon name={item.icon} size={30} color="#fff" />
//                   </LinearGradient>
//                   <View style={styles.textContainer}>
//                     <Text style={styles.boxText}>{item.title}</Text>
//                     <Text style={styles.subText}>{item.subTitle}</Text>
//                   </View>
//                   {/* <Icon 
//                     name="chevron-forward" 
//                     size={20} 
//                     color="#666" 
//                     style={styles.arrowIcon}
//                   /> */}
//                 </TouchableOpacity>
//               </Animated.View>
//             ))}
//           </View>
         
//         </View>
//       </ScrollView>

//       <TouchableOpacity 
//             style={styles.logoutButton}
//             onPress={() => {
//               Alert.alert(
//                 "Logout",
//                 "🔒 Are you sure you want to log out from ASKОXY.AI PARTNER?? 🤔",
//                 [
//                   { text: "Cancel", style: "cancel" },
//                   { 
//                     text: "OK", 
//                     onPress: async () => {
//                       try {
//                         // Clear the token from AsyncStorage
//                         await AsyncStorage.removeItem("accessToken");
                        
//                         // Navigate to login screen
//                         navigation.navigate("LoginWithPassword");
//                       } catch (error) {
//                         console.error("Logout error:", error);
//                         Alert.alert("Error", "Failed to logout. Please try again.");
//                       }
//                     }
//                   }
//                 ],
//                 { cancelable: false }
//               );
//             }}
//           >
//             <LinearGradient
//               colors={['#FF5252', '#D32F2F']}
//               style={styles.logoutGradient}
//             >
//               <Icon name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
//               <Text style={styles.logoutText}>Logout</Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           <View style={styles.testButtonsContainer}>
//             {/* Test buttons commented out in original code */}
//           </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     width: '100%',
//     overflow: 'hidden',
//     // width: '100%',
//     // position: 'absolute', // Make header fixed
//     // top: 0,
//     // left: 0,
//     // right: 0,
//     // zIndex: 10,
//   },
//   headerGradient: {
//     flex: 1,
//     paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
//     paddingTop: 20,
//     paddingBottom: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     overflow: 'hidden',
//   },
//   headerContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     paddingTop: 40,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     padding: 20,
//     // paddingTop: 100,
//   },
//   // Add these to your StyleSheet:

// greetingText: {
//   fontSize: 24,
//   fontWeight: '600',
//   color: '#f8f9fa',
//   marginBottom: 4,
//   textAlign: 'center',
//   textShadowColor: 'rgba(0, 0, 0, 0.2)',
//   textShadowOffset: { width: 1, height: 1 },
//   textShadowRadius: 3,
// },
// welcomeText: {
//   fontSize: 36,
//   fontWeight: '800',
//   color: '#ffffff',
//   marginBottom: 8,
//   textAlign: 'center',
//   textShadowColor: 'rgba(0, 0, 0, 0.3)',
//   textShadowOffset: { width: 1, height: 1 },
//   textShadowRadius: 3,
// },
// partnerName: {
//   fontSize: 28,
//   fontWeight: '700',
//   color: '#e0fbfc',
//   textAlign: 'center',
//   marginBottom: 8,
// },
// dateText: {
//   fontSize: 16,
//   color: '#ffffff',
//   opacity: 0.9,
//   fontWeight: '500',
//   letterSpacing: 0.5,
// },
//   mainContent: {
//     // flex: 1,
//     justifyContent: 'space-between',
//   },
//   gridContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   box: {
//     backgroundColor: '#ffffff',
//     width: width * 0.42,
//     height: "auto",
//     borderRadius: 20,
//     padding: 15,
//     marginBottom: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   iconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   scanButton: {
//     backgroundColor: '#007BFF', // Background color of the button
//     paddingVertical: 12,        // Vertical padding
//     paddingHorizontal: 24,      // Horizontal padding
//     borderRadius: 8,            // Rounded corners
//     alignItems: 'center',       // Center text horizontally
//     alignSelf: 'flex-end',   // Center text vertically
//     elevation: 3,               // Shadow for Android
//     shadowColor: '#000',        // Shadow for iOS
//     shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
//     shadowOpacity: 0.3,         // Shadow for iOS
//     shadowRadius: 3,            // Shadow for iOS
//     marginBottom: 20,           // Bottom
//     width:width*0.4
//   },
//   buttonText: {
//     color: 'white',           // Text color
//     fontSize: 16,               // Text size
//     fontWeight: 'bold',         // Bold text
//   },
//   textContainer: {
//     flex: 1,
//     marginLeft:10
//     // justifyContent: 'center',
//   },
//   boxText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333333',
//     marginBottom: 4,
//   },
//   subText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '400',
//   },
//   arrowIcon: {
//     position: 'absolute',
//     right: 15,
//     bottom: 20,
//     // marginVertical:15
//   },
//   logoutButton: {
//     // flex:3,
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginVertical: 10,
//     // ...Platform.select({
//     //   ios: {
//     //     shadowColor: '#000',
//     //     shadowOffset: { width: 0, height: 3 },
//     //     shadowOpacity: 0.2,
//     //     shadowRadius: 5,
//     //   },
//     //   android: {
//     //     elevation: 4,
//     //   },
//     // }),
//   },
//   logoutGradient: {
//     padding: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     margin:10
//   },
//   logoutText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   logoutIcon: {
//     marginRight: 8,
//   },
//   testButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   testButton: {
//     width: width * 0.42,
//     overflow: 'hidden',
//     borderRadius: 15,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   testButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 15,
//   },
//   testButtonText: {
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#666',
//   },
// });

// export default HomeScreen;




import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState, useRef } from 'react';
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
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const userData = useSelector((state) => state.counter);
  AsyncStorage.getItem("userData").then((value) => {
    console.log({value})
  })
  console.log({userData})
  
  const [scaleAnimation] = useState(new Animated.Value(1));
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Animate header based on scroll position
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [height * 0.28, height * 0.18],
    extrapolate: 'clamp'
  });

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
      toValue: 0.97,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const menuItems = [
    {  
      id: 1,
      title: 'Orders',
      subTitle: 'Manage Orders',
      icon: 'bag-outline',
      color: '#4CAF50',
      onPress: () => navigation.navigate('Orders', { isTestOrder: false })
    },
    {
      id: 2,
      title: 'Items',
      subTitle: 'View Items',
      icon: 'list-outline',
      color: '#2196F3',
      onPress: () => navigation.navigate('Products')
    },
    {
      id: 3,
      title: 'Delivery Boys',
      subTitle: 'Track Team',
      icon: 'people-outline',
      color: '#673AB7',
      onPress: () => navigation.navigate('Delivery Boys')
    },
    {
      id: 4,
      title: 'All Orders',
      subTitle: 'Order History',
      icon: 'albums-outline',
      color: '#FF9800',
      onPress: () => navigation.navigate('All Orders')
    },
    {
      id: 5,
      title: 'All Queries',
      subTitle: 'Raised by users',
      icon: 'chatbubbles-outline',
      color: '#00BCD4',
      onPress: () => navigation.navigate('User Queries')
    },
    {
      id: 6,
      title: 'Split Bags',
      subTitle: 'Order History',
      icon: 'cut-outline',
      color: '#FF4081',
      onPress: () => navigation.navigate('Split Bags')
    },
    {
      id: 7,  
      title: 'Test Orders',  
      subTitle: 'Order History',  
      icon: 'file-tray-full-outline',  
      color: '#27ae60',
      onPress: () => navigation.navigate('Orders', { isTestOrder: true })  
    }
  ];

  // Get current time to display appropriate greeting
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "☀️";
    if (hour < 18) return "🌤️";
    return "🌙";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight,
          }
        ]}
      >
        <LinearGradient
          colors={['#3d2a71', '#5a3ea6']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <View>
                <Text style={styles.greetingText}>{getCurrentGreeting()} {getGreetingEmoji()}</Text>
                <Text style={styles.welcomeText}>Welcome Back</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}</Text>
                <Text style={styles.dayText}>{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long' 
                })}</Text>
              </View>
            </View>
            <Text style={styles.partnerName}> ASKOXY.AI PARTNER</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.scanContainer}>
          <Text style={styles.sectionTitle}>BarcodeScanner</Text>
          <View style={styles.scanButtonsRow}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Scan Bar Code')} 
              style={styles.scanButton}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonInner}>
                <Icon name="scan-outline" size={22} color="#fff" style={styles.scanIcon} />
                <Text style={styles.scanText}>Scan Bar Code</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('Scan Multiple Barcodes')} 
              style={[styles.scanButton, styles.scanButtonSecondary]}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonInner}>
                <Icon name="barcode-outline" size={22} color="#fff" style={styles.scanIcon} />
                <Text style={styles.scanText}>Multiple Scan</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <View style={styles.gridContainer}>
            {menuItems.map((item) => (
              <Animated.View 
                key={item.id} 
                style={{ 
                  transform: [{ scale: scaleAnimation }],
                  width: width * 0.44,
                }}
              >
                <TouchableOpacity
                  style={[styles.menuItem, { borderLeftColor: item.color }]}
                  onPress={item.onPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Icon name={item.icon} size={24} color="#fff" />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subTitle}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              "Logout",
              "🔒 Are you sure you want to log out from ASKОXY.AI PARTNER?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Logout", 
                  onPress: async () => {
                    try {
                      await AsyncStorage.removeItem("accessToken");
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
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#c0392b', '#e74c3c']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="log-out-outline" size={20} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    width: '100%',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ddd',
    marginTop: 4,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffe58a',
    textAlign: 'center',
    letterSpacing: 1,
    // backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayText: {
    fontSize: 14,
    color: '#ccc',
    opacity: 0.9,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: height * 0.28 + 10,
    paddingBottom: 20,
  },
  scanContainer: {
    padding: 20,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
    marginLeft: 5,
  },
  scanButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scanButton: {
    width: '48%',
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#3498db',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonSecondary: {
    backgroundColor: '#2980b9',
  },
  scanButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  scanIcon: {
    marginRight: 8,
  },
  scanText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    height: 110,
  },
  iconContainer: {
    width: 45,
    height: 25,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  textContainer: {
    marginTop: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '400',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutGradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  logoutIcon: {
    marginRight: 2,
  },
});

export default HomeScreen;