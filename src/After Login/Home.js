import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState, useRef } from "react";
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
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import BASE_URL, { userStage } from "../../config";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const userData = useSelector((state) => state.counter);
  console.log({ userStage });
  console.log({ BASE_URL });
  AsyncStorage.getItem("userData").then((value) => {
    // console.log({value})
  });
  // console.log({userData})

  const [scaleAnimation] = useState(new Animated.Value(1));

  // Remove scrollY animation since the header will be fixed now

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Exit",
              onPress: () => BackHandler.exitApp(),
              style: "destructive",
            },
          ],
          { cancelable: false }
        );
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
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
      title: "Orders",
      subTitle: "Manage Orders",
      icon: "bag-outline",
      color: "#4CAF50",
      onPress: () => navigation.navigate("Orders", { isTestOrder: false }),
    },
    {
      id: 2,
      title: "Items",
      subTitle: "View Items",
      icon: "list-outline",
      color: "#2196F3",
      onPress: () => navigation.navigate("Products"),
    },
    {
      id: 3,
      title: "Delivery Boys",
      subTitle: "Track Team",
      icon: "people-outline",
      color: "#673AB7",
      onPress: () => navigation.navigate("Delivery Boys"),
    },
    {
      id: 4,
      title: "All Orders",
      subTitle: "Order History",
      icon: "albums-outline",
      color: "#FF9800",
      onPress: () => navigation.navigate("All Orders"),
    },
    {
      id: 5,
      title: "All Queries",
      subTitle: "Raised by users",
      icon: "chatbubbles-outline",
      color: "#00BCD4",
      onPress: () => navigation.navigate("User Queries"),
    },
    {
      id: 6,
      title: "Split Bags",
      subTitle: "Order History",
      icon: "cut-outline",
      color: "#FF4081",
      onPress: () => navigation.navigate("Split Bags"),
    },
    
    {
      id: 7,
      title: "Exchange",
      subTitle: "Manage Orders",
      icon: "bag-outline",
      color: "#4CAF50",
      onPress: () => navigation.navigate("Exchange", { isTestOrder: false }),
    },
    {
      id: 8,
      title: "Customer Feedback",
      subTitle: "Customer Feedback",
      icon: "cut-outline",
      color: "#FF4081",
      onPress: () => navigation.navigate("Customer Feedback"),
    },
    {
      id: 9,
      title: "Payment",
      subTitle: "PaymentStatusType",
      icon: "cut-outline",
      color: "#FF4081",
      onPress: () => navigation.navigate("PaymentStatusScreen"),
    },
    {
      id: 10,
      title: "ImageUpload",
      subTitle: "Image Active&Inactive",
      icon: "cut-outline",
      color: "#FF4081",
      onPress: () => navigation.navigate("OfferImagesScreen"),
    },
    {
      id: 11,
      title: "Test Orders",
      subTitle: "Order History",
      icon: "file-tray-full-outline",
      color: "#27ae60",
      onPress: () => navigation.navigate("Orders", { isTestOrder: true }),
    },
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

  // Calculate header height to create proper padding for content
  const headerHeight = Platform.OS === "ios" ? height * 0.28 : height * 0.28;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Fixed Header */}
      <View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={["#3d2a71", "#5a3ea6"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <View>
                <Text style={styles.greetingText}>
                  {getCurrentGreeting()} {getGreetingEmoji()}
                </Text>
                <Text style={styles.welcomeText}>Welcome Back</Text>
              </View>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text style={styles.dayText}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </Text>
              </View>
            </View>
            <Text style={styles.partnerName}> ASKOXY.AI PARTNER</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Scrollable Content with padding to account for the fixed header */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: headerHeight },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.scanContainer}>
          <Text style={styles.sectionTitle}>BarcodeScanner</Text>
          <View style={styles.scanButtonsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Scan Bar Code")}
              style={styles.scanButton}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonInner}>
                <Icon
                  name="scan-outline"
                  size={22}
                  color="#fff"
                  style={styles.scanIcon}
                />
                <Text style={styles.scanText}>Scan Bar Code</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Scan Multiple Barcodes")}
              style={[styles.scanButton, styles.scanButtonSecondary]}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonInner}>
                <Icon
                  name="barcode-outline"
                  size={22}
                  color="#fff"
                  style={styles.scanIcon}
                />
                <Text style={styles.scanText}>Stock Insertion</Text>
              </View>
            </TouchableOpacity>
          </View>
          {userStage == "Live1" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Stock Exchange")}
              style={styles.scanButton}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonInner}>
                <Icon
                  name="scan-outline"
                  size={22}
                  color="#fff"
                  style={styles.scanIcon}
                />
                <Text style={styles.scanText}>Scan Exchange Orders</Text>
              </View>
            </TouchableOpacity>
          )}
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
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.color },
                    ]}
                  >
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
                      Alert.alert(
                        "Error",
                        "Failed to logout. Please try again."
                      );
                    }
                  },
                },
              ],
              { cancelable: false }
            );
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#c0392b", "#e74c3c"]}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon
              name="log-out-outline"
              size={20}
              color="#fff"
              style={styles.logoutIcon}
            />
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
    backgroundColor: "#f5f5f7",
  },
  header: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ddd",
    marginTop: 4,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffe58a",
    textAlign: "center",
    letterSpacing: 1,
    // backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "center",
    overflow: "hidden",
  },
  dateContainer: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  dayText: {
    fontSize: 14,
    color: "#ccc",
    opacity: 0.9,
  },
  scrollContainer: {
    flexGrow: 1,
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
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 15,
    marginLeft: 5,
  },
  scanButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scanButton: {
    width: "48%",
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#3498db",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 10,
  },
  scanButtonSecondary: {
    backgroundColor: "#2980b9",
  },
  scanButtonInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  scanIcon: {
    marginRight: 8,
  },
  scanText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  textContainer: {
    marginTop: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "400",
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutGradient: {
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  logoutIcon: {
    marginRight: 2,
  },
});

export default HomeScreen;
