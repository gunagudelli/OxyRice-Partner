import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../config";
import { useFocusEffect } from "@react-navigation/native";
const { height, width } = Dimensions.get("window");
import { useSelector } from "react-redux";
import ModalDropdown from "react-native-modal-dropdown";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";

const WeeklyOrders = ({ navigation, route }) => {
  const { isTestOrder } = route.params;
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderAddress, setOrderAddress] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userPrimaryType, setUserPrimaryType] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const accessToken = useSelector((state) => state.counter);

  useFocusEffect(
    useCallback(() => {
      const getdata = async () => {
        await fetchUserData();
        await fetchData();
      };

      getdata();

      return () => {
        console.log("Screen is unfocused");
      };
    }, [])
  );

  // Auto-search when searchQuery changes
  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const userBgColors = {
    ERICEUSER: "rgba(255, 182, 193, 0.3)",
    NEWUSER: "rgba(144, 238, 144, 0.3)",
    MOBILE: "rgba(173, 216, 230, 0.3)",
    android: "rgba(221, 160, 221, 0.3)",
    WEB: "rgba(240, 230, 140, 0.3)",
    ios: "rgba(255, 228, 181, 0.3)",
  };

  // Fetch user data to get user ID and primary type
  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserId(parsedUserData.id);

        setUserPrimaryType(parsedUserData.primaryType);
        console.log("User ID:", parsedUserData.id);
        console.log("User Primary Type:", parsedUserData.primaryType);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data. Please log in again.");
    }
  };

  const fetchData = async () => {
    try {
      setLoader(true);
      setSearchError("");
      const response = await axios.get(
        BASE_URL + `order-service/getAllOrdersBasedOnStatus?orderStatus=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      console.log("Fetched Orders Data:", response.data);
      setLoader(false);

      // Filter orders based on status and test user preference
      const acceptedOrders = response.data.filter((order) => {
        return (
          order && order.orderStatus === "1" && order.testUser === isTestOrder
        );
      });

      setOrders(acceptedOrders);
      setOrderAddress(acceptedOrders.orderAddress);
      setFilteredOrders(acceptedOrders);
    } catch (error) {
      setLoader(false);
      console.error("Error fetching orders:", error);

      let errorMessage = "Failed to load orders. Please try again.";
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to view these orders.";
      }

      Alert.alert("Error", errorMessage);
      setError(errorMessage);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchQuery("");
    setSearchError("");
    await fetchData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
      setSearchError("");
      return;
    }

    const filtered = orders.filter(
      (order) =>
        order.uniqueId &&
        order.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      setSearchError(`No orders found with order ID: ${searchQuery}`);
    } else {
      setSearchError("");
    }

    setFilteredOrders(filtered);
  };

  const handleWeeklyMarketUpdate = (orderId, uniqueId) => {
    if (!userId) {
      Alert.alert(
        "Error",
        "User information not available. Please log in again."
      );
      return;
    }

    Alert.alert(
      "Confirm Weekly Market",
      `Mark order ${uniqueId} as part of the weekly market?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => callWeeklyMarketAPI(orderId, uniqueId),
        },
      ]
    );
  };

  const handleDeliveredUpdate = (orderId, uniqueId) => {
    if (!userId) {
      Alert.alert(
        "Error",
        "User information not available. Please log in again."
      );
      return;
    }

    Alert.alert("Confirm Delivery", `Mark order ${uniqueId} as delivered?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => callDeliveredAPI(orderId, uniqueId) },
    ]);
  };

  const callWeeklyMarketAPI = async (orderId, uniqueId) => {
    try {
      setUpdatingOrders((prev) => new Set(prev).add(orderId));

      const response = await axios.patch(
        BASE_URL + `order-service/updateWeeklyOrders`,
        { orderId },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );

      console.log("Weekly Market Update:", response.data);
      Alert.alert("Success", `Order ${uniqueId} marked as Weekly Market.`);
      fetchData();
    } catch (error) {
      console.error("Weekly Market Error:", error);
      Alert.alert("Error", "Failed to mark as weekly market.");
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const callDeliveredAPI = async (orderId, uniqueId) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));
    try {
      await callWeeklyMarketAPI(orderId);
    } catch (error) {
      console.error("Weekly Market API failed:", error);
    }
    try {
      const response = await axios.patch(
        BASE_URL + `order-service/weeklyMarketUpadte`,
        { id: userId, orderId },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );

      console.log("Delivery Update:", response.data);
      Alert.alert("Success", `Order ${uniqueId} marked as Delivered.`);
      fetchData();
    } catch (error) {
      console.error("Delivery Update Error:", error);
      Alert.alert("Error", "Failed to mark as delivered.");
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    const rounded = Math.round(price * 10) / 10;
    const decimalPart = rounded % 1;

    if (decimalPart < 0.5) {
      return Math.floor(rounded);
    }
    return rounded.toFixed(1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredOrders(orders);
    setSearchError("");
  };

  const renderItem = ({ item }) => {
    const isUpdating = updatingOrders.has(item.orderId);

    return (
      <View>
        {/* Only show orders that match the current filter criteria */}
        {item.orderStatus == 1 && item.testUser == isTestOrder ? (
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() =>
              navigation.navigate("Order Details", {
                orderId: item.orderId,
                orderStatus: item.orderStatus,
                istestUser: route.params.isTestOrder,
              })
            }
          >
            {/* Header Row: Order ID and User Type Tags */}
            <View style={styles.headerRow}>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderIdLabel}>Order ID: </Text>
                <Text style={styles.orderIdValue}>{item?.uniqueId}</Text>
              </View>
              <View style={styles.tagsContainer}>
                <View style={styles.tagWrapper}>
                  <Text
                    style={[
                      styles.tag,
                      {
                        backgroundColor:
                          userBgColors[item?.userType] ??
                          "rgba(240, 248, 255, 0.3)",
                      },
                    ]}
                  >
                    {item?.userType}
                  </Text>
                </View>
                {item?.orderFrom != null && (
                  <View style={styles.tagWrapper}>
                    <Text
                      style={[
                        styles.tag,
                        {
                          backgroundColor:
                            userBgColors[item?.orderFrom] ??
                            "rgba(240, 248, 255, 0.3)",
                        },
                      ]}
                    >
                      {item?.orderFrom}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Order Info Row */}
            <View style={styles.infoRow}>
              <View style={styles.leftInfo}>
                <Text style={styles.infoLabel}>
                  Order Date:{" "}
                  <Text style={styles.infoValue}>
                    {item?.orderDate?.substring(0, 10)}
                  </Text>
                </Text>
                <Text style={styles.infoLabel}>
                  Order Status:
                  <Text style={styles.orderStatus}>
                    {item?.orderStatus == 0
                      ? " Incomplete"
                      : item.orderStatus == 1
                      ? " Placed"
                      : item.orderStatus == 2
                      ? " Accepted"
                      : item.orderStatus == 3
                      ? " Picked Up"
                      : item.orderStatus == 4
                      ? " Delivered"
                      : item.orderStatus == 5
                      ? " Rejected"
                      : item.orderStatus == 6
                      ? " Cancelled"
                      : " Unknown"}
                  </Text>
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Total Amount</Text>
                <Text style={styles.priceValue}>
                  ₹ {formatPrice(item?.grandTotal)}
                </Text>
              </View>
            </View>

            {/* Expected Delivery Time */}
            {item?.dayOfWeek !== "" && (
              <View style={styles.deliveryTimeContainer}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color="#666"
                  style={styles.timeIcon}
                />
                <View style={styles.deliveryTimeContent}>
                  <Text style={styles.deliveryTimeLabel}>
                    Expected Delivery:
                  </Text>
                  <Text style={styles.deliveryTimeValue}>
                    {item?.expectedDeliveryDate}, {item?.dayOfWeek} (
                    {item?.timeSlot})
                  </Text>
                </View>
              </View>
            )}

            {/* Location Information */}
            {item?.choosedLocations && (
              <View style={styles.locationInfoContainer}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location-outline" size={16} color="#28a745" />
                  <Text style={styles.locationLabel}>
                    Chosen Location:{" "}
                    <Text style={styles.locationValue}>
                      {item?.choosedLocations}
                    </Text>
                  </Text>
                </View>
                <View style={styles.distanceContainer}>
                  <View style={styles.distanceItem}>
                    <Text style={styles.distanceLabel}>From Miyapur:</Text>
                    <Text style={styles.distanceValue}>
                      {item?.distancefromMiyapur}
                    </Text>
                  </View>
                  <View style={styles.distanceItem}>
                    <Text style={styles.distanceLabel}>From Mythri Nagar:</Text>
                    <Text style={styles.distanceValue}>
                      {item?.distancefromMythriNager}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Address Section */}
            {item?.orderAddress != null && (
              <View style={styles.addressContainer}>
                <Ionicons
                  name="home-outline"
                  size={16}
                  color="#666"
                  style={styles.addressIcon}
                />
                <View style={styles.addressContent}>
                  <Text style={styles.addressLabel}>Delivery Address:</Text>
                  <Text style={styles.addressText}>
                    {item?.orderAddress?.flatNo}, {item?.orderAddress?.address},{" "}
                    {item?.orderAddress?.landMark},{" "}
                    {item?.orderAddress?.pincode}
                  </Text>
                </View>
              </View>
            )}

            {/* Weekly Market Assignment Status */}
            {item?.weeklyMarket && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.weeklyMarketButton,
                    updatingOrders.has(item.orderId) && styles.disabledButton,
                  ]}
                  onPress={() =>
                    handleWeeklyMarketUpdate(item.orderId, item.uniqueId)
                  }
                  disabled={updatingOrders.has(item.orderId)}
                >
                  {updatingOrders.has(item.orderId) ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.buttonText}>Processing...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="calendar" size={18} color="#fff" />
                      <Text style={styles.buttonText}>
                         Mark as Weekly Market
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Delivered Button */}
                <TouchableOpacity
                  style={[
                    styles.deliveredButton,
                    updatingOrders.has(item.orderId) && styles.disabledButton,
                  ]}
                  onPress={() =>
                    handleDeliveredUpdate(item.orderId, item.uniqueId)
                  }
                  disabled={updatingOrders.has(item.orderId)}
                >
                  {updatingOrders.has(item.orderId) ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.buttonText}>Processing...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#fff"
                      />
                      <Text style={styles.buttonText}>Delivered</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* User Assignment Info */}
            {userPrimaryType && (
              <View style={styles.userInfoContainer}>
                <Ionicons name="person-outline" size={16} color="#007bff" />
                <Text style={styles.userInfoText}>
                  You are: {userPrimaryType}
                </Text>
              </View>
            )}

            {/* Delivered Button */}
            <View style={styles.buttonContainer}>
              {/* Mark as Weekly Market Button */}
              <TouchableOpacity
                style={[
                  styles.weeklyMarketButton,
                  isUpdating && styles.disabledButton,
                ]}
                onPress={() =>
                  handleWeeklyMarketUpdate(item.orderId, item.uniqueId)
                }
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="calendar" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Weekly Market</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Delivered Button */}
              <TouchableOpacity
                style={[
                  styles.deliveredButton,
                  isUpdating && styles.disabledButton,
                ]}
                onPress={() =>
                  handleDeliveredUpdate(item.orderId, item.uniqueId)
                }
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.buttonText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Delivered</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  function footer() {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {filteredOrders.length > 0 ? "No more orders to show" : ""}
        </Text>
      </View>
    );
  }

  const renderNoOrdersFound = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-outline" size={50} color="#ccc" />
        <Text style={styles.emptyText}>No orders available</Text>
        <Text style={styles.emptySubText}>
          {isTestOrder ? "No test orders found" : "No live orders found"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {orders.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order ID"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#aaa"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {searchError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color="#d32f2f" />
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      <View style={styles.listContainer}>
        {loader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#28a745" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          renderNoOrdersFound()
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderItem}
            keyExtractor={(item) => item.orderId.toString()}
            ListFooterComponent={footer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#28a745"]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              searchQuery.trim() !== "" ? (
                <View style={styles.emptySearchContainer}>
                  <Ionicons name="search-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>No orders found</Text>
                  <Text style={styles.emptySubText}>
                    Try adjusting your search
                  </Text>
                </View>
              ) : (
                renderNoOrdersFound()
              )
            }
          />
        )}
      </View>
    </View>
  );
};

export default WeeklyOrders;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Search Container Styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },

  // Error Container
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#d32f2f",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },

  // List Container
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },

  // Loading States
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptySearchContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },

  // Order Item Styles
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },

  // Header Row
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  orderIdValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagWrapper: {
    marginLeft: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leftInfo: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    color: "#333",
    fontWeight: "normal",
  },
  orderStatus: {
    color: "#FF6B00",
    fontWeight: "600",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },

  // Delivery Time
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  timeIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  deliveryTimeContent: {
    flex: 1,
  },
  deliveryTimeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  deliveryTimeValue: {
    fontSize: 14,
    color: "#666",
  },

  // Location Info
  locationInfoContainer: {
    backgroundColor: "#f8fff8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#28a745",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  locationValue: {
    color: "#28a745",
    fontWeight: "normal",
  },
  distanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  distanceItem: {
    flex: 1,
  },
  distanceLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  distanceValue: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },

  // Address Section
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Assignment Status Section
  assignmentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  assignmentText: {
    fontSize: 14,
    color: "#856404",
    fontWeight: "600",
    marginLeft: 8,
  },

  // User Info Section
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
  },
  userInfoText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
    marginLeft: 8,
  },

  // Button Styles
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  weeklyMarketButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "48%",
    shadowColor: "#007bff",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  deliveredButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "48%",
    shadowColor: "#28a745",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  // Footer
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
