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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from '../../config';
import { useFocusEffect } from "@react-navigation/native";
const { height, width } = Dimensions.get("window");
import { useSelector } from "react-redux";
import ModalDropdown from "react-native-modal-dropdown";
import { Ionicons } from "@expo/vector-icons";

const NewOrders = ({ navigation, route }) => {
  const accessToken = useSelector((state) => state.counter);
  //const { BASE_URL, userStage } = config(); // Get values
  
  const { isTestOrder } = route.params;
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
 

  useFocusEffect(
    useCallback(() => {
      const getdata = async () => {
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

  const fetchData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      setLoader(true);
      setSearchError("");
      
      const response = await axios.get(
        // userStage == "test" ?
           BASE_URL + `order-service/getAllOrdersBasedOnStatus?orderStatus=3` ,
          // : BASE_URL + 'erice-service/order/getAllOrders',
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      setLoader(false);
      console.log("getAllOrders response", response.data);
      const acceptedOrders = response.data.filter((order) => {
        return order && order.orderStatus === "3";
      });
      const liveUsers = response.data.filter(
        (order) =>
          order && order.orderStatus === "3" && order.testUser === false
      );
      console.log("Live users", liveUsers);

      setOrders(acceptedOrders);
      setFilteredOrders(acceptedOrders);
    } catch (error) {
      setLoader(false);
      console.error("Error fetching user data or orders:", error);
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
      (order) => order.uniqueId && order.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length === 0) {
      setSearchError(`No orders found with order ID: ${searchQuery}`);
    } else {
      setSearchError("");
    }
    
    setFilteredOrders(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredOrders(orders);
    setSearchError("");
  };

  const renderItem = ({ item }) => {
    return (
      <View>
        {item.orderStatus == 3 && item.testUser == isTestOrder ? (
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() => navigation.navigate("Order Details", { order: item })}
          >
            <Text style={styles.orderId}>
              Order Id :{" "}
              <Text styles={{ fontWeight: "normal" }}>{item?.uniqueId}</Text>
            </Text>

            <View style={styles.orderRow}>
              <View>
                <Text style={styles.orderDate}>
                  Date :{" "}
                  <Text style={{ fontWeight: "normal" }}>
                    {item?.orderDate.substring(0, 10)}
                  </Text>{" "}
                </Text>
                <Text style={styles.orderDate}>
                  Status :{" "}
                  <Text style={styles.orderStatus}>
                    {" "}
                    {item?.orderStatus == 0
                      ? "Incomplete"
                      : item.orderStatus == 1
                      ? "Placed"
                      : item.orderStatus == 2
                      ? "Accepted"
                      : item.orderStatus == 3
                      ? "Assigned"
                      : item.orderStatus == 4
                      ? "Delivered"
                      : item.orderStatus == 5
                      ? "Rejected"
                      : item.orderStatus == 6
                      ? "Cancelled"
                      :item.orderStatus == "Pickedup" 
                      ?"Picked Up"
                      : "Unknown"}
                  </Text>
                </Text>
              </View>
              <View>
                <Text style={styles.orderRupees}>
                  Rs : <Text style={styles.orderPrice}>{item?.grandTotal}</Text>
                </Text>
              </View>
            </View>

             {item?.dayOfWeek!=""  ?
                        <View style={{backgroundColor:"#f1f1f1", padding:10, borderRadius:10, marginTop:10}}>
                            {/* <AntDesign name="clockcircle" size={15} /> */}
                            <Text style={{fontWeight:"bold"}}> {item?.dayOfWeek} ({item?.timeSlot})</Text>
                        </View>
                        :null}
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  function footer() {
    return (
      <View style={{ height: 100 }}>
        <Text style={{ alignSelf: "center", fontSize: 15, marginTop: 15 }}>
          {filteredOrders.length > 0 ? "No more data found" : ""}
        </Text>
      </View>
    );
  }

  const renderNoOrdersFound = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders available</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Only show search bar if orders exist */}
      {orders.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order ID"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#aaa"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search error message */}
      {searchError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      <View style={styles.listContainer}>
        {loader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={"large"} color="green" />
          </View>
        ) : orders.length === 0 ? (
          renderNoOrdersFound()
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderItem}
            keyExtractor={(item) => item.orderId.toString()}
            ListFooterComponentStyle={styles.footerStyle}
            ListFooterComponent={footer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              searchQuery.trim() !== "" ? (
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptyText}>No orders found</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No orders available</Text>
                </View>
              )
            }
          />
        )}
      </View>
    </View>
  );
};

export default NewOrders;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#ffeeee",
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  loaderContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptySearchContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  orderItem: {
    padding: 14,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    width: width - 20,
    alignSelf: "center",
    marginBottom: 6,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    width: width * 0.8,
    marginLeft: 5,
  },
  orderRupees: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  orderDate: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 16,
    color: "#28a745",
  },
  footerStyle: {
    marginBottom: 100,
  },
});