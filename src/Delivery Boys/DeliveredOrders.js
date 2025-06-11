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
  ScrollView,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BASE_URL from "../../config";
import Icon from "react-native-vector-icons/Ionicons";
import SummaryCard from "./SummaryCard";

const { width } = Dimensions.get("window");

const formatDate = (date) => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const DeliveredOrders = ({ navigation, error, id }) => {
  const accessToken = useSelector((state) => state.counter);
  const [deliveredData, setDeliveredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [count, setCount] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");
  const [summary, setSummary] = useState();
  const [startDate, setStartDate] = useState(
    new Date() // 3 days ago
  );
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Fetch data only on initial load
  useEffect(() => {
    getAllDeliveredOrdersfunc();
  }, []);

  const formatDateTime = (dateTimeString) => {
    if (
      !dateTimeString ||
      dateTimeString === "N/A" ||
      dateTimeString === "No Time"
    )
      return "N/A";

    try {
      const date = new Date(dateTimeString);

      if (isNaN(date.getTime())) {
        const timeParts = dateTimeString.trim().split(":");
        if (timeParts.length === 3) {
          const days = parseInt(timeParts[0]);
          const hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);

          if (isNaN(days) || isNaN(hours) || isNaN(minutes)) {
            return dateTimeString;
          }

          let formattedTime = "";
          if (days > 0) {
            formattedTime += `${days}day${days > 1 ? "s" : ""} `;
          }
          if (hours > 0) {
            formattedTime += `${hours}hr `;
          }
          if (minutes > 0) {
            formattedTime += `${minutes}min`;
          }
          if (formattedTime === "") {
            formattedTime = "0min";
          }
          return formattedTime.trim();
        } else {
          return dateTimeString;
        }
      } else {
        const dateHours = date.getHours();
        const dateMinutes = date.getMinutes();
        const days = Math.floor(dateHours / 24);
        const remainingHours = dateHours % 24;
        const totalMinutes = dateMinutes;

        let formattedTime = "";
        if (days > 0) {
          formattedTime += `${days}day${days > 1 ? "s" : ""} `;
        }
        if (remainingHours > 0) {
          formattedTime += `${remainingHours}hr `;
        }
        if (totalMinutes > 0) {
          formattedTime += `${totalMinutes}min`;
        }
        if (formattedTime === "") {
          formattedTime = "0min";
        }
        return formattedTime.trim();
      }
    } catch (err) {
      console.log("Error formatting date:", err);
      return dateTimeString;
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    const sorted = [...deliveredData].sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return newOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
    setDeliveredData(sorted);
  };

  async function getAllDeliveredOrdersfunc() {
    setLoading(true);
    setMessage("");

    try {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const response = await axios.get(
        `${BASE_URL}order-service/get_DeliverdDetails_By_DeliveryBoyId?deliveryBoyId=${id}&EndData=${formattedEndDate}&StartDate=${formattedStartDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.accessToken}`,
          },
        }
      );
      // console.log("API Response:", response);
      const orders = response.data.orderResponseList || [];
      setSummary(response.data.message || {});
      setCount(orders.length);

      if (orders.length === 0) {
        setMessage("No delivered orders found");
        setDeliveredData([]);
        setLoading(false);
        return;
      }

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
            return { ...order, deliveredTime: "N/A" };
          }
        })
      );

      const sortedOrders = ordersWithDeliveredTime.sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return dateB.getTime() - dateA.getTime();
      });

      setDeliveredData(sortedOrders);
    } catch (err) {
      console.log("API Error:", err.response?.data || err.message);
      if (
        err.response?.data === "Orders not found" ||
        err.response?.data === ""
      ) {
        setMessage("Orders not found");
      } else {
        setMessage("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Single Order Item", {
            orderId: item.orderId,
            orderStatus: item.orderStatus,
          })
        }
      >
        <View style={styles.orderItem}>
          <View style={styles.orderDetails}>
            <Text style={styles.orderDate}>
              OrderId:{" "}
              <Text style={{ color: "black" }}>
                {item.uniqueId || item.orderId}
              </Text>
            </Text>
            <Text style={styles.orderDate}>
              Date:{" "}
              <Text style={{ color: "grey" }}>
                {item?.orderDate?.substring(0, 10) || "N/A"}
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
              Rs.
              <Text style={{ color: "#28a745" }}>{item.grandTotal || "0"}</Text>
            </Text>
          </View>
        </View>

        <View style={{ paddingLeft: 20, paddingRight: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Expected Date / Time:{" "}
            <Text style={{ fontWeight: "normal" }}>
              {item?.expectedDeliveryDate
                ? `${item.expectedDeliveryDate}, ${item.dayOfWeek || ""}, ${
                    item.timeSlot || ""
                  }`
                : "No Time Slot Selected"}
            </Text>
          </Text>
          {item?.deliveredTime &&
          item.deliveredTime !== "N/A" &&
          item.deliveredTime !== "No Time" &&
          item.deliveredTime !== null &&
          item.deliveredTime !== "" ? (
            <Text style={{ marginBottom: 10 }}>
              Delivered Time:{" "}
              <Text style={{ fontWeight: "normal", color: "#0066cc" }}>
                {formatDateTime(item.deliveredTime)}
              </Text>
            </Text>
          ) : (
            <Text style={{ marginBottom: 10 }}>
              Delivered Time:{" "}
              <Text style={{ fontWeight: "normal", color: "#999" }}>
                Time not available
              </Text>
            </Text>
          )}
        </View>

        {item?.orderAddress && (
          <View style={styles.addressBox}>
            <Icon name="location" size={16} style={{ marginRight: 15 }} />
            <Text style={styles.addressText}>
              {item.orderAddress.flatNo && `${item.orderAddress.flatNo}, `}
              {item.orderAddress.address && `${item.orderAddress.address}, `}
              {item.orderAddress.landMark && `${item.orderAddress.landMark}, `}
              {item.orderAddress.pincode}
            </Text>
          </View>
        )}

        <View style={styles.divider} />
      </TouchableOpacity>
    );
  };

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
        <Text style={{ marginTop: 10 }}>Loading delivered orders...</Text>
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

  const filteredData = deliveredData.filter(
    (order) =>
      order.orderId
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.uniqueId
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.countText}>Count of Delivered Orders: {count}</Text>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === "asc"
              ? styles.sortButtonOldest
              : styles.sortButtonNewest,
          ]}
          onPress={toggleSortOrder}
        >
          <Text style={styles.sortButtonText}>
            Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </Text>
          <Icon
            name={sortOrder === "desc" ? "arrow-down" : "arrow-up"}
            size={14}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.datePickerContainer}>
        <View style={styles.datePicker}>
          <Text style={styles.dateLabel}>Start Date:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  setStartDate(selectedDate);
                  if (selectedDate > endDate) {
                    setEndDate(selectedDate);
                  }
                }
              }}
              maximumDate={endDate}
            />
          )}
        </View>
        <View style={styles.datePicker}>
          <Text style={styles.dateLabel}>End Date:</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) setEndDate(selectedDate);
              }}
              minimumDate={startDate}
              maximumDate={new Date()}
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.searchIconButton}
          onPress={getAllDeliveredOrdersfunc}
        >
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchBox}
        placeholder="Search by Order ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {message ? (
        <View style={styles.center}>
          <Text style={styles.text}>{message}</Text>
        </View>
      ) : (
        <ScrollView>
          <View>
            <SummaryCard summaryMessage={summary} />
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) =>
              item.orderId?.toString() || index.toString()
            }
            renderItem={renderItem}
            ListFooterComponent={deliveredData.length > 0 ? footer : null}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text
                  style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}
                >
                  No matching orders found
                </Text>
              </View>
            }
            ListFooterComponentStyle={styles.footerStyle}
            showsVerticalScrollIndicator={false}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
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
    backgroundColor: "#28a745",
  },
  sortButtonOldest: {
    backgroundColor: "#007bff",
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
    backgroundColor: "#f9f9f9",
    marginBottom: 5,
    borderRadius: 8,
  },
  orderDetails: {
    flexDirection: "column",
  },
  orderDate: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
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
    marginBottom: 10,
    flexDirection: "row",
    width: width * 0.9,
    alignSelf: "center",
  },
  addressText: {
    fontWeight: "bold",
    flex: 1,
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
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
  },
  searchIconButton: {
    backgroundColor: "#28a745",
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  footerStyle: {
    marginBottom: 1200,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
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
