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

const { height, width } = Dimensions.get("window");

const DeliveredOrders = ({navigation,error,id}) => {
  const accessToken = useSelector((state) => state.counter);
  // console.log({ userStage })
  // console.log({BASE_URL})
  const [deliveredData, setDeliveredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const[count,setCount]=useState(0)

  useFocusEffect(
    useCallback(() => {
      // Code to run when the screen is focused
      console.log("HomeScreen is focused");
      getAllDeliveredOrdersfunc();
      // Return a cleanup function if needed
      return () => console.log("HomeScreen is unfocused");
    }, [])
  );

  function getAllDeliveredOrdersfunc() {
    setLoading(true);
    let data;
    data = {
      deliveryBoyId: id,
      orderStatus: 4,
    };

    axios({
      method: "post",
      url:BASE_URL + `order-service/getAssignedOrdersToDeliveryBoy`,
      data: data,
      headers: {
        Authorization: `Bearer ${accessToken.accessToken}`,
      },
    })
      .then(function (response) {
        // console.log("Delivered orders", response.data);
        setDeliveredData(response.data);
        setCount(response.data?.length)
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error.response);
        setLoading(false);
        if (
          error.response.data == "Orders not found" ||
          error.response.data == ""
        ) {
          setMessage(error.response.data || "Orders not found");
        }
      });
  }

  useEffect(() => {
    getAllDeliveredOrdersfunc();
  }, []);

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

  // Render each order item
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
            OrderId : <Text style={{ color: "black" }}>{item.uniqueId}</Text>
          </Text>
          <Text style={styles.orderDate}>
            Date :{" "}
            <Text style={{ color: "grey" }}>
              {item?.orderDate?.substring(0, 10)}
            </Text>
          </Text>
          <Text style={styles.orderDate}>
            Status :{" "}
            <Text style={{ color: "#28a745" }}>
              {" "}
              {item?.orderStatus == 0
                ? "Incomplete"
                : item.orderStatus == 1
                ? "Placed"
                : item.orderStatus == 2
                ? "Accepted"
                : item.orderStatus == 3
                ? "Picked Up"
                : item.orderStatus == 4
                ? "Delivered"
                : item.orderStatus == 5
                ? "Rejected"
                : item.orderStatus == 6
                ? "Cancelled"
                : "Unknown"}
            </Text>
          </Text>
        </View>
        <View style={styles.orderAmountContainer}>
          <Text style={styles.orderAmount}>
            Rs.<Text style={{ color: "#28a745" }}>{item.grandTotal}</Text>
          </Text>
        </View>
      </View>
      {/* {item?.dayOfWeek!= ""  ?
                   <View style={{backgroundColor:"#f1f1f1", padding:10, borderRadius:10, marginTop:10}}>
                       <Text style={{fontWeight:"bold"}}>{item?.expectedDeliveryDate} , {item?.dayOfWeek} ({item?.timeSlot})</Text>
                   </View>
                   :null} */}

      <View style={{ paddingLeft: 20 }}>
        <Text style={{ fontWeight: "bold" }}>
          Expected Date / Time :{" "}
          {item?.dayOfWeek != "" ? (
            <Text style={{ fontWeight: "normal" }}>
              {item?.expectedDeliveryDate} , {item?.dayOfWeek} , {item?.timeSlot}
              
            </Text>
          ) : (
            <Text style={{ fontWeight: "normal" }}>No Time Slot Selected</Text>
          )}
        </Text>
      </View>

      {item?.orderAddress != null ? (
        <View
          style={{
            backgroundColor: "#f1f1f1",
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
            flexDirection: "row",
            width: width * 0.9,
            alignSelf: "center",
          }}
        >
          <Icon name="location" size={16} style={{ marginRight: 15 }} />
          <Text style={{ fontWeight: "bold", width: width * 0.8 }}>
            {item?.orderAddress?.flatNo},{item?.orderAddress?.address},
            {item?.orderAddress?.landMark},{item?.orderAddress?.pincode}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          borderBottomWidth: 0.3,
          borderColor: "grey",
          marginVertical: 10,
        }}
      />
    </TouchableOpacity>
  );

  function footer() {
    return (
      <View style={{ alignSelf: "center" }}>
        <Text>No More orders Found </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{fontWeight:"bold",margin:10}}>Count of Delivered Orders :{count}</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 10,
          paddingHorizontal: 10,
          width: width * 0.9,
          alignSelf: "center",
        }}
        placeholder="Search by Order ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {message == null || message == "" ? (
        <FlatList
          // data={deliveredData}
          data={deliveredData.filter((order) =>
            order.orderId
              .toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          ListFooterComponent={footer}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No orderId found
            </Text>
          }
          ListFooterComponentStyle={styles.footerStyle}
        />
      ) : (
        <>
          <Text style={styles.text}>{message}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: "#e0e0e0",
  },
  orderDetails: {
    flexDirection: "column",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 15,
    color: "#888",
    width: width * 0.9,
  },
  orderDate: {
    fontSize: 14,
    color: "thickgrey",
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
  footerStyle: {
    marginBottom: 900,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  visuallyHidden: {
    position: "absolute",
    height: 1,
    width: 1,
    overflow: "hidden",
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