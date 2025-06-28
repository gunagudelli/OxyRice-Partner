import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector,useDispatch } from "react-redux";
import BASE_URL, { userStage } from "../../config";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import axios from "axios";

import { clearAccessToken } from '../../Redux/Slice/authSlice'
 // adjust path as needed


const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const userData = useSelector((state) => state.counter);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scaleAnimation] = useState(new Animated.Value(1));
    const dispatch = useDispatch();

  const [dashboardMetrics, setDashboardMetrics] = useState({
    orders: {
      new: 0,
      // accepted: 0,
      assigned: 0,
      pickedUp: 0,
      total: 0,
    },
    exchangeOrdersResponse:0,
    activeProducts: 0,
    activeDeliveryBoys: 0,
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log({ userStage });
  console.log({ BASE_URL });

  // Fetch dashboard metrics
  const fetchDashboardMetrics = async () => {
    try {
      setIsLoadingMetrics(true);
      const token = await AsyncStorage.getItem("accessToken");

      const headers = {
        "Content-Type": "application/json",
        Accept: "*/*",
      };

      // Perform parallel API requests using axios
     const [
      newOrdersResponse,
      // acceptedOrdersResponse,
      assignedOrdersResponse,
      pickedUpOrdersResponse,
      exchangeOrdersResponse, // Fixed variable name (was EXCHANGEREQUESTEDResponse)
      productsResponse,
      deliveryBoysResponse,
    ] = await Promise.allSettled([
      axios.get(
        `${BASE_URL}order-service/getAllOrdersBasedOnStatus?orderStatus=1`,
        { headers }
      ),
      // axios.get(
      //   `${BASE_URL}order-service/getAllOrdersBasedOnStatus?orderStatus=2`,
      //   { headers }
      // ),
      axios.get(
        `${BASE_URL}order-service/getAllOrdersBasedOnStatus?orderStatus=3`,
        { headers }
      ),
      axios.get(
        `${BASE_URL}order-service/getAllOrdersBasedOnStatus?orderStatus=PickedUp`,
        { headers }
      ),
      axios.get(
        `${BASE_URL}order-service/getAllExchangeOrder?orderStatus=EXCHANGEREQUESTED`,
        { headers }
      ),
      axios.get(`${BASE_URL}product-service/ItemsGetTotal`, { headers }),
      axios.get(`${BASE_URL}user-service/deliveryBoyList`, {
        headers,
      }),
    ]);

    let newMetrics = {
      orders: { new: 0, accepted: 0, assigned: 0, pickedUp: 0, total: 0 },
      exchangeOrdersResponse: 0, // Fixed property name
      activeProducts: 0,
      activeDeliveryBoys: 0,
    };

      // Helper to process orders
     const processOrders = (response, statusKey) => {
      if (response.status === "fulfilled") {
        const data = response.value.data;
        const realOrders = data.filter((order) => order.testUser === false);
        console.log("=============");
        console.log(realOrders.length, statusKey);
        return realOrders.length;
      } else {
        console.error(
          `Failed to fetch ${statusKey} orders:`,
          response.reason || "Unknown error"
        );
        return 0;
      }
    };

    // newMetrics.orders.new = processOrders(newOrdersResponse, "new");
    // newMetrics.orders.assigned += processOrders(
    //   acceptedOrdersResponse,
    //   "accepted"
    // );
    newMetrics.orders.assigned += processOrders(
      assignedOrdersResponse,
      "assigned"
    );
    newMetrics.orders.pickedUp = processOrders(
      pickedUpOrdersResponse,
      "pickedUp"
    );

    newMetrics.orders.total =
      newMetrics.orders.new +
      newMetrics.orders.assigned +
      newMetrics.orders.pickedUp;
if (exchangeOrdersResponse.status === "fulfilled") {
      const exchangeOrders = exchangeOrdersResponse.value.data || [];
      
      // Filter for exchange requested orders
      const exchangeRequestedOrders = exchangeOrders.filter(
        (item) => item.status === "EXCHANGEREQUESTED"
      );

      // Fixed property assignment
      newMetrics.exchangeOrdersResponse = exchangeRequestedOrders.length;
      console.log("Exchange orders count:", exchangeRequestedOrders.length);
    } else {
      console.error(
        "Failed to fetch exchange orders:",
        exchangeOrdersResponse.reason || "Unknown error"
      );
      newMetrics.exchangeOrdersResponse = 0;
    }

    // Products processing
    if (productsResponse.status === "fulfilled") {
      const products = productsResponse.value.data || [];
      const activeProducts = products.filter((item) => item.active === true);
      newMetrics.activeProducts = activeProducts.length;
    } else {
      console.error(
        "Failed to fetch products:",
        productsResponse.reason || "Unknown error"
      );
    }

    // Delivery boys processing
    if (deliveryBoysResponse.status === "fulfilled") {
      const data = deliveryBoysResponse.value.data || [];
      const activeDeliveryBoys = data.filter(
        (boy) => boy.isActive === "true"
      );
      newMetrics.activeDeliveryBoys = activeDeliveryBoys.length;
    } else {
      console.error(
        "Failed to fetch delivery boys:",
        deliveryBoysResponse.reason || "Unknown error"
      );
    }

    setDashboardMetrics(newMetrics);
    console.log("Updated dashboard metrics:", newMetrics);
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    Alert.alert(
      "Error",
      "Failed to load dashboard metrics. Please check your connection and try again."
    );
  } finally {
    setIsLoadingMetrics(false);
    setRefreshing(false);
  }
};
  // Fetch metrics on component mount and when tab becomes active
  useFocusEffect(
    useCallback(() => {
      fetchDashboardMetrics();

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

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardMetrics();
  };

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

  // Bottom tabs configuration
  const bottomTabs = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "home-outline",
      activeIcon: "home",
      color: "#3d2a71",
    },
    {
      id: "orders",
      title: "Orders",
      icon: "bag-outline",
      activeIcon: "bag",
      color: "#4CAF50",
    },
    {
      id: "products",
      title: "Products",
      icon: "cube-outline",
      activeIcon: "cube",
      color: "#2196F3",
    },
    {
      id: "team",
      title: "Team",
      icon: "people-outline",
      activeIcon: "people",
      color: "#673AB7",
    },
    {
      id: "tools",
      title: "Tools",
      icon: "build-outline",
      activeIcon: "build",
      color: "#FF9800",
    },
  ];

  // Reorganized menu items by tabs
  const menuByTabs = {
    dashboard: {
      quickActions: [
        {
          id: 1,
          title: "Orders",
          icon: "bag-outline",
          color: "#4CAF50",
          onPress: () => navigation.navigate("Orders", { isTestOrder: false }),
        },
        {
          id: 2,
          title: "Items",
          icon: "list-outline",
          color: "#2196F3",
          onPress: () => navigation.navigate("Products"),
        },
        {
          id: 3,
          title: "Exchange Orders",
          icon: "repeat-outline",
          color: "#8E44AD",
          onPress: () =>
            navigation.navigate("Exchange", { isTestOrder: false }),
        },
        {
          id: 4,
          title: "User Queries",
          icon: "chatbubbles-outline",
          color: "#00BCD4",
          onPress: () => navigation.navigate("User Queries"),
        },
      ],
      scanActions: [
        {
          id: 1,
          title: "Scan Bar Code",
          icon: "scan-outline",
          color: "#3498db",
          onPress: () => navigation.navigate("Scan Bar Code"),
        },
        {
          id: 2,
          title: "Split Bags",
          icon: "cut-outline",
          color: "#FF4081",
          onPress: () => navigation.navigate("Split Bags"),
        },
        {
          id: 3,
          title: "Stock Insertion",
          icon: "barcode-outline",
          color: "#2980b9",
          onPress: () => navigation.navigate("Scan Multiple Barcodes"),
        },
        ...(userStage == "Live"
          ? [
              {
                id: 4,
                title: "Stock Exchange",
                icon: "sync-outline",
                color: "#1abc9c",
                onPress: () => navigation.navigate("Stock Exchange"),
              },
            ]
          : []),
      ],
    },
    orders: [
      {
        id: 1,
        title: "Orders",
        icon: "bag-outline",
        color: "#4CAF50",
        onPress: () => navigation.navigate("Orders", { isTestOrder: false }),
      },
      {
        id: 2,
        title: "All Orders",
        icon: "albums-outline",
        color: "#FF9800",
        onPress: () => navigation.navigate("All Orders"),
      },
      {
        id: 3,
        title: "Exchange",
        icon: "repeat-outline",
        color: "#8E44AD",
        onPress: () => navigation.navigate("Exchange", { isTestOrder: false }),
      },
      {
        id: 4,
        title: "Test Orders",
        icon: "file-tray-full-outline",
        color: "#27ae60",
        onPress: () => navigation.navigate("Orders", { isTestOrder: true }),
      },
    ],
    products: [
      {
        id: 1,
        title: "Items",
        icon: "list-outline",
        color: "#2196F3",
        onPress: () => navigation.navigate("Products"),
      },
      {
        id: 2,
        title: "Orders Report",
        icon: "receipt-outline",
        color: "#FF4081",
        onPress: () => navigation.navigate("Orders Report"),
      },
       {
        id: 3,
        title: "Orders Stats",
        icon: "trending-up-outline",
        color: "green",
        onPress: () => navigation.navigate("Orders Stats"),
      },
       {
        id: 3,
        title: "Pincode wise Orders",
        icon: "location-outline",
        color: "orange",
        onPress: () => navigation.navigate("Pincode wise orders"),
      },
      // {
      //   id: 2,
      //   title: "Split Bags",
      //   icon: "cut-outline",
      //   color: "#FF4081",
      //   onPress: () => navigation.navigate("Split Bags"),
      // },
      // {
      //   id: 3,
      //   title: "Image Upload",
      //   icon: "image-outline",
      //   color: "#795548",
      //   onPress: () => navigation.navigate("OfferImagesScreen"),
      // },
    ],
    team: [
      {
        id: 1,
        title: "Delivery Boys",
        icon: "people-outline",
        color: "#673AB7",
        onPress: () => navigation.navigate("Delivery Boys"),
      },
      // {
      //   id: 2,
      //   title: "User Queries",
      //   icon: "chatbubbles-outline",
      //   color: "#00BCD4",
      //   onPress: () => navigation.navigate("User Queries"),
      // },
      // {
      //   id: 3,
      //   title: "Customer Feedback",
      //   icon: "star-outline",
      //   color: "#FFC107",
      //   onPress: () => navigation.navigate("Customer Feedback"),
      // },
      // {
      //   id: 4,
      //   title: "Payment Method Status",
      //   icon: "cash-outline",
      //   color: "#FF4245",
      //   onPress: () => navigation.navigate("PaymentStatus"),
      // },
    ],
    tools: [
      {
        id: 1,
        title: "User Queries",
        icon: "chatbubbles-outline",
        color: "#00BCD4",
        onPress: () => navigation.navigate("User Queries"),
      },
      {
        id: 2,
        title: "Customer Feedback",
        icon: "star-outline",
        color: "#FFC107",
        onPress: () => navigation.navigate("Customer Feedback"),
      },
      {
        id: 3,
        title: "Payment Method Status",
        icon: "cash-outline",
        color: "#FF4245",
        onPress: () => navigation.navigate("PaymentStatus"),
      },
    ],
  };

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

  // Calculate header height
  const headerHeight = Platform.OS === "ios" ? height * 0.2 : height * 0.2;

  // Render dashboard content
  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      {/* Refresh Button Container */}
      <View style={styles.refreshContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          <Icon
            name={refreshing ? "refresh" : "refresh-outline"}
            size={16}
            color="#3d2a71"
            style={refreshing ? styles.rotating : null}
          />
          <Text style={styles.refreshText}>
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Overview Container */}
      <View style={styles.overviewContainer}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>

        {/* Main Stats Container */}
        <View style={styles.mainStatsWrapper}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["#4CAF50", "#45a049"]}
              style={styles.statGradient}
            >
              {isLoadingMetrics ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.statContent}>
                  <Icon name="bag-outline" size={24} color="#fff" />
                  <Text style={styles.statNumber}>
                    {dashboardMetrics.orders.total}
                  </Text>
                  <Text style={styles.statLabel}>Total Orders</Text>
                </View>
              )}
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
  <LinearGradient
    colors={["#FF9800", "#F57C00"]}
    style={styles.statGradient}
  >
    {isLoadingMetrics ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <View style={styles.statContent}>
        <Icon name="swap-horizontal" size={24} color="#fff" />
        <Text style={styles.statNumber}>
          {dashboardMetrics.exchangeOrdersResponse}  {/* ✅ CORRECT PATH */}
        </Text>
        <Text style={styles.statLabel}>Exchange Orders</Text>
      </View>
    )}
  </LinearGradient>
</View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["#2196F3", "#1976D2"]}
              style={styles.statGradient}
            >
              {isLoadingMetrics ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.statContent}>
                  <Icon name="cube-outline" size={24} color="#fff" />
                  <Text style={styles.statNumber}>
                    {dashboardMetrics.activeProducts}
                  </Text>
                  <Text style={styles.statLabel}>Active Products</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={["#FF9800", "#F57C00"]}
              style={styles.statGradient}
            >
              {isLoadingMetrics ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.statContent}>
                  <Icon name="bicycle-outline" size={24} color="#fff" />
                  <Text style={styles.statNumber}>
                    {dashboardMetrics.activeDeliveryBoys}
                  </Text>
                  <Text style={styles.statLabel}>Active Delivery Boys</Text>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Order Status Breakdown Container */}
        <View style={styles.orderBreakdownWrapper}>
          <Text style={styles.breakdownTitle}>Order Status Breakdown</Text>
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.statusIndicator, { backgroundColor: "#e74c3c" }]}
              />
              <Text style={styles.statusLabel}>New</Text>
              <Text style={styles.statusCount}>
                {isLoadingMetrics ? "-" : dashboardMetrics.orders.new}
              </Text>
            </View>
            {/* <View style={styles.breakdownItem}>
              <View
                style={[styles.statusIndicator, { backgroundColor: "#27ae60" }]}
              />
              <Text style={styles.statusLabel}>Accepted</Text>
              <Text style={styles.statusCount}>
                {isLoadingMetrics ? "-" : dashboardMetrics.orders.accepted}
              </Text>
            </View> */}
            <View style={styles.breakdownItem}>
              <View
                style={[styles.statusIndicator, { backgroundColor: "#f39c12" }]}
              />
              <Text style={styles.statusLabel}>Assigned</Text>
              <Text style={styles.statusCount}>
                {isLoadingMetrics ? "-" : dashboardMetrics.orders.assigned}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <View
                style={[styles.statusIndicator, { backgroundColor: "#3498db" }]}
              />
              <Text style={styles.statusLabel}>Picked-Up</Text>
              <Text style={styles.statusCount}>
                {isLoadingMetrics ? "-" : dashboardMetrics.orders.pickedUp}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions Container */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuByTabs.dashboard.quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickActionCard}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View
                style={[styles.iconContainer, { backgroundColor: item.color }]}
              >
                <Icon name={item.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.quickActionTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Barcode Scanner Container */}
      <View style={styles.barcodeContainer}>
        <Text style={styles.sectionTitle}> Barcode Scanner</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scanButtonsContainer}
        >
          {menuByTabs.dashboard.scanActions.map((button) => (
            <TouchableOpacity
              key={button.id}
              onPress={button.onPress}
              style={[styles.scanButton, { backgroundColor: button.color }]}
              activeOpacity={0.85}
            >
              <Icon name={button.icon} size={22} color="#fff" />
              <Text style={styles.scanText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
  // Render tab content
  const renderTabContent = (tabId) => {
    if (tabId === "dashboard") {
      return renderDashboard();
    }

    const items = menuByTabs[tabId] || [];
    return (
      <View style={styles.tabContentContainer}>
        <Text style={styles.sectionTitle}>
          {bottomTabs.find((tab) => tab.id === tabId)?.title}
        </Text>
        <View style={styles.menuGrid}>
          {items.map((item) => (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItemContainer,
                { transform: [{ scale: scaleAnimation }] },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Icon name={item.icon} size={22} color="#fff" />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Fixed Header Container */}
      <View style={[styles.headerContainer, { height: headerHeight }]}>
        <LinearGradient
          colors={["#3d2a71", "#5a3ea6"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTopRow}>
              <View style={styles.greetingSection}>
                <View style={styles.greetingText}>
                  <Text style={styles.greeting}>
                    {getCurrentGreeting()} {getGreetingEmoji()}
                  </Text>
                  <Text style={styles.welcomeText}>Welcome Back</Text>
                </View>
                <View style={styles.dateSection}>
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

              {/* Logout Button Container */}
              <View style={styles.logoutSection}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={() => {
                    console.log("ashgcx")
                    // Alert.alert(
                    //   "Logout",
                    //   "🔒 Are you sure you want to log out from ASKΟXY.AI PARTNER?",
                    //   [
                    //     { text: "Cancel", style: "cancel" },
                    //     {
                    //       text: "Logout",
                    //       onPress: async () => {
                    //         try {
                    //           await AsyncStorage.removeItem("accessToken");
                    //           navigation.navigate("LoginWithPassword");
                    //         } catch (error) {
                    //           console.error("Logout error:", error);
                    //           Alert.alert(
                    //             "Error",
                    //             "Failed to logout. Please try again."
                    //           );
                    //         }
                    //       },
                    //     },
                    //   ],
                    //   { cancelable: false }
                    // );
                  
                    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          console.log({userData})
          await AsyncStorage.removeItem("userData");
          console.log("Logout pressed");
          // dispatch(clearAccessToken());  // <-- Clear Redux token
          navigation.navigate("LoginWithPassword");
        }
      }
    ]);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#c0392b", "#e74c3c"]}
                    style={styles.logoutGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Icon name="log-out-outline" size={18} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.partnerNameContainer}>
              <Text style={styles.partnerName}>ASKOXY.AI PARTNER</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Scrollable Content Container */}
      <View style={styles.scrollableContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: headerHeight + 10, paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent(activeTab)}
        </ScrollView>
      </View>

      {/* Bottom Tab Navigation Container */}
      <View style={styles.bottomTabContainer}>
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]}
          style={styles.bottomTabGradient}
        >
          {bottomTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.bottomTab,
                activeTab === tab.id && styles.activeBottomTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.tabIconContainer,
                  activeTab === tab.id && { backgroundColor: tab.color + "20" },
                ]}
              >
                <Icon
                  name={activeTab === tab.id ? tab.activeIcon : tab.icon}
                  size={20}
                  color={activeTab === tab.id ? tab.color : "#8e8e93"}
                />
              </View>
              <Text
                style={[
                  styles.tabTitle,
                  { color: activeTab === tab.id ? tab.color : "#8e8e93" },
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // ===== MAIN CONTAINER =====
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // ===== HEADER STYLES =====
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight + 10,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "space-between",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  greetingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 3,
  },
  welcomeText: {
    fontSize: 13,
    color: "#e8e8e8",
    fontWeight: "400",
  },
  dateSection: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  dayText: {
    fontSize: 11,
    color: "#e8e8e8",
    marginTop: 2,
  },
  logoutSection: {
    justifyContent: "flex-start",
  },
  logoutButton: {
    borderRadius: 18,
    overflow: "hidden",
  },
  logoutGradient: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  partnerNameContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  partnerName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 1.3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // ===== SCROLLABLE CONTENT =====
  scrollableContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ===== DASHBOARD CONTAINER =====
  dashboardContainer: {
    flex: 1,
    paddingBottom: 18,
  },

  // ===== SECTION STYLES =====
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 14,
    letterSpacing: 0.4,
    marginLeft: 10,
  },

  // ===== REFRESH BUTTON =====
  refreshContainer: {
    marginHorizontal: 18,
    marginBottom: 18,
    alignItems: "flex-end",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#3d2a71",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  refreshText: {
    marginLeft: 7,
    color: "#3d2a71",
    fontWeight: "500",
    fontSize: 13,
  },
  rotating: {
    transform: [{ rotate: "180deg" }],
  },

  // ===== OVERVIEW CONTAINER =====
  // Updated styles for 4 stat cards in one row
overviewContainer: {
  marginHorizontal: 18,
  marginBottom: 22,
},
mainStatsWrapper: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 18,
  flexWrap: "wrap", // Added to handle overflow if needed
},
statCard: {
  width: "23%", // Changed from 31% to 23% to fit 4 cards
  aspectRatio: 0.9, // Slightly reduced aspect ratio to make cards more compact
  borderRadius: 12, // Slightly smaller border radius
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 4,
},
statGradient: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 8, // Reduced padding from 11 to 8
},
statContent: {
  alignItems: "center",
},
statNumber: {
  fontSize: 18, // Reduced from 21 to 18
  fontWeight: "700",
  color: "#fff",
  marginVertical: 5, // Reduced from 7 to 5
},
statLabel: {
  fontSize: 10, // Reduced from 11 to 10
  color: "#fff",
  textAlign: "center",
  lineHeight: 13, // Reduced from 15 to 13
  paddingHorizontal: 2, // Added small horizontal padding
},

  // ===== ORDER BREAKDOWN =====
  orderBreakdownWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 14,
  },
  breakdownGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    alignItems: "center",
    width: "23%",
  },
  statusIndicator: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginBottom: 7,
  },
  statusLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  statusCount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
  },

  // ===== QUICK ACTIONS =====
  quickActionsContainer: {
    marginHorizontal: 18,
    marginBottom: 22,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 11,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2c3e50",
    flexShrink: 1,
  },

  // ===== BARCODE SCANNER =====
  barcodeContainer: {
    marginBottom: 20,
  },
  scanButtonsContainer: {
    paddingHorizontal: 8,
  },
  scanButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  scanText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },

  // ===== TAB CONTENT =====
  tabContentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  menuItemContainer: {
    width: "48%",
    marginBottom: 14,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 11,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 8,
    textAlign: "center",
  },

  // ===== BOTTOM TABS =====
  bottomTabContainer: {
    height: 68,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  bottomTabGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  bottomTab: {
    alignItems: "center",
    padding: 7,
  },
  activeBottomTab: {
    transform: [{ translateY: -3 }],
  },
  tabIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  tabTitle: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
});
export default HomeScreen;
