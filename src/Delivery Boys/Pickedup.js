import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity,ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useSelector } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';
import { config } from '../../config';

const {height,width}=Dimensions.get('window')


const PickedupOrders = ({navigation,error,id}) => {
  const accessToken = useSelector((state) => state.counter);
  const { BASE_URL, userStage } = config(); // Get values
const[pickedUpData,setPickedUpData]=useState([])
const[loading,setLoading]=useState(true)
const[message,setMessage]=useState('')

useFocusEffect(
  useCallback(() => {
    // Code to run when the screen is focused
    console.log("HomeScreen is focused");
    console.log({accessToken})
    PickupData()
    // Return a cleanup function if needed
    return () => console.log("HomeScreen is unfocused");
  }, [])
);

function PickupData(){
    axios({
      method:"get",
      url:BASE_URL+`order-service/getPickupDataBasedOnId?deliveryBoyId=${id}`,
      headers: {
        Authorization: `Bearer ${accessToken.accessToken}`,
      },
    })
    .then(function(response){
      // console.log(response.data)
      setPickedUpData(response.data)
      setLoading(false)
    })
    .catch(function(error){
      console.log(error.response)
      setLoading(false)
    })
  }


  useEffect(()=>{
    PickupData()
  },[])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008d45" />
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
    <View
      onPress={() =>
        navigation.navigate("Order Details", {
          orderId: item.orderId,
          orderStatus: item.orderStatus,
          orderItems:item.orderItems
        })
      }
    >
      <View style={styles.orderItem}>
        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>
            OrderId : <Text style={{ color: "black" }}>{item.orderId.slice(-4)} </Text>
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
Picked Up              {/* {item?.orderStatus == 0
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
                : "Unknown"} */}
            </Text>
          </Text>
        </View>
        <View style={styles.orderAmountContainer}>
          <Text style={styles.orderAmount}>
            Rs.<Text style={{ color: "#28a745" }}>{item.grandTotal}</Text>
          </Text>
        </View>
      </View>
    </View>
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
      {/* <TouchableOpacity onPress={() => navigation.navigate("Write a Query")}>
        <Text>Write to us</Text>
      </TouchableOpacity> */}

      {message == null || message == "" ? (
        <FlatList
          data={pickedUpData}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          ListFooterComponent={footer}
          ListFooterComponentStyle={styles.footerStyle}
        />
      ) : (
        <Text style={styles.text}>{message}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  orderDetails: {
    flexDirection: "column",
  },
  orderId: {
    fontSize: 28,
    fontWeight: "bold",
    width: width * 0.9,
    color: "#888",
    paddingHorizontal: 10,
  },
  orderDate: {
    fontSize: 14,
    color: "thickgrey",
    fontWeight: "bold",
  },
  orderAmountContainer: {
    justifyContent: "center",
  },
  footerStyle: {
    marginTop: 500,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
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

export default PickedupOrders;
