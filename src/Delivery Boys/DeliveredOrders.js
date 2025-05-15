import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import BASE_URL from "../../config";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const DeliveredOrders = ({ navigation, error ,id}) => {
  const accessToken = useSelector((state) => state.counter);
  const [deliveredData, setDeliveredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [count, setCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" or "desc" for date sorting

  useFocusEffect(
    useCallback(() => {
      getAllDeliveredOrdersfunc();
    }, [])
  );

  // Format date-time in readable format
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === "N/A") return "N/A";
    
    try {
      const date = new Date(dateTimeString);
      let hours, minutes, seconds;
      
      if (isNaN(date.getTime())) {
        // Try to parse time string if it's in a format like "1:8:54"
        const timeParts = dateTimeString.trim().split(':');
        if (timeParts.length === 3) {
          hours = parseInt(timeParts[0]);
          minutes = parseInt(timeParts[1]);
          seconds = parseInt(timeParts[2]);
          
          if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return dateTimeString; // Return original if any part is not a number
          }
        } else {
          return dateTimeString; // Return original if not in expected format
        }
      } else {
        // For regular date objects, extract time components
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();
      }
      
      // Build the formatted string based on non-zero values
      let formattedTime = "";
      
      if (hours > 0) {
        formattedTime += `${hours}hr `;
      }
      
      if (minutes > 0) {
        formattedTime += `${minutes}min `;
      }
      
      if (seconds > 0) {
        formattedTime += `${seconds}sec`;
      }
      
      // Handle edge case where all values are 0
      if (formattedTime === "") {
        formattedTime = "0sec";
      }
      
      return formattedTime.trim();
    } catch (err) {
      console.log("Error formatting date:", err);
      return dateTimeString;
    }
  };

  // Toggle sort order function
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    
    // Re-sort the data with the new order
    const sorted = [...deliveredData].sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      
      return newOrder === "desc" 
        ? dateB.getTime() - dateA.getTime() // Newest first
        : dateA.getTime() - dateB.getTime(); // Oldest first
    });
    
    setDeliveredData(sorted);
  };

  async function getAllDeliveredOrdersfunc() {
    setLoading(true);
    setMessage("");
    const data = {
      deliveryBoyId: id,
      orderStatus: 4,
    };

    try {
      const response = await axios.post(
        BASE_URL + "order-service/getAssignedOrdersToDeliveryBoy",
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken.accessToken}`,
          },
        }
      );

      const orders = response.data || [];
      setCount(orders.length);

      // Get delivered time for each order
      const ordersWithDeliveredTime = await Promise.all(
        orders.map(async (order) => {
          try {
            const res = await axios.get(
              `${BASE_URL}order-service/getAllOrdersDelivered?orderId=${order.orderId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken.accessToken}`,
                },
              }
            );
            const deliveredTime = res.data?.deliveryTime || "No Time";
            return { ...order, deliveredTime };
          } catch (err) {
            console.log("Error fetching delivered time for:", order.orderId);
            return { ...order, deliveredTime: "N/A" };
          }
        })
      );

      // Sort orders by date (newest first by default)
      const sortedOrders = ordersWithDeliveredTime.sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      });

      setDeliveredData(sortedOrders);
    } catch (err) {
      console.log(err.response?.data || err.message);
      if (
        err.response?.data === "Orders not found" ||
        err.response?.data === ""
      ) {
        setMessage("Orders not found");
      }
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
       navigation.navigate("Order Details", {
        orderId: item.orderId,
        orderStatus: item.orderStatus,
      })
      }
    >
      <View style={styles.orderItem}>
        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>
            OrderId: <Text style={{ color: "black" }}>{item.uniqueId}</Text>
          </Text>
          <Text style={styles.orderDate}>
            Date:{" "}
            <Text style={{ color: "grey" }}>
              {item?.orderDate?.substring(0, 10)}
            </Text>
          </Text>
          <Text style={styles.orderDate}>
            Status:{" "}
            <Text style={{ color: "#28a745" }}>
              {item?.orderStatus == 4 ? "Delivered" : "Other"}
            </Text>
          </Text>
        </View>
        <View style={styles.orderAmountContainer}>
          <Text style={styles.orderAmount}>
            Rs.<Text style={{ color: "#28a745" }}>{item.grandTotal}</Text>
          </Text>
        </View>
      </View>

      <View style={{ paddingLeft: 20 }}>
        <Text style={{ fontWeight: "bold" }}>
          Expected Date / Time:{" "}
          <Text style={{ fontWeight: "normal" }}>
            {item?.expectedDeliveryDate
              ? `${item.expectedDeliveryDate}, ${item.dayOfWeek}, ${item.timeSlot}`
              : "No Time Slot Selected"}
          </Text>
        </Text>
       { item?.deliveredTime!= null || item?.deliveredTime!=" " ?
        <Text>
          Delivered Time: <Text style={{ fontWeight: "normal", color: "#0066cc" }}>
            {item?.deliveredTime !== "N/A" 
              ? formatDateTime(item.deliveredTime) 
              : "No Time"}
          </Text>
        </Text>
        :null}
      </View>

      {item?.orderAddress && (
        <View style={styles.addressBox}>
          <Icon name="location" size={16} style={{ marginRight: 15 }} />
          <Text style={styles.addressText}>
            {item.orderAddress.flatNo},{item.orderAddress.address},
            {item.orderAddress.landMark},{item.orderAddress.pincode}
          </Text>
        </View>
      )}

      <View style={styles.divider} />
    </TouchableOpacity>
  );

  function footer() {
    return (
      <View style={{ alignSelf: "center", marginBottom: 20 }}>
        <Text>No More Orders Found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const filteredData = deliveredData.filter((order) =>
    order.orderId.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.countText}>
          Count of Delivered Orders: {count}
        </Text>
        <TouchableOpacity 
          style={[
            styles.sortButton, 
            sortOrder === "asc" ? styles.sortButtonOldest : styles.sortButtonNewest
          ]}
          onPress={toggleSortOrder}
        >
          <Text style={styles.sortButtonText}>
            Sort : {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </Text>
          <Icon 
            name={sortOrder === "desc" ? "arrow-down" : "arrow-up"} 
            size={14} 
            color="#fff" 
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBox}
        placeholder="Search by Order ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {message ? (
        <Text style={styles.text}>{message}</Text>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          ListFooterComponent={footer}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No matching orders found
            </Text>
          }
          ListFooterComponentStyle={styles.footerStyle}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
    // flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  countText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  sortButton: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  sortButtonNewest: {
    backgroundColor: "#28a745", // Green for newest first
  },
  sortButtonOldest: {
    backgroundColor: "#007bff", // Blue for oldest first
  },
  sortButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  orderDetails: {
    flexDirection: "column",
  },
  orderDate: {
    fontSize: 14,
    fontWeight: "bold",
  },
  orderAmountContainer: {
    justifyContent: "center",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  addressBox: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    width: width * 0.9,
    alignSelf: "center",
  },
  addressText: {
    fontWeight: "bold",
    width: width * 0.8,
  },
  divider: {
    borderBottomWidth: 0.3,
    borderColor: "grey",
    marginVertical: 10,
  },
  searchBox: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: width * 0.9,
    alignSelf: "center",
  },
  footerStyle: {
    marginBottom: 1000,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center",
  },
});

export default DeliveredOrders;