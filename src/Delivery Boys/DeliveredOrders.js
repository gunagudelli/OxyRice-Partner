import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity,ActivityIndicator, Dimensions } from 'react-native';



import axios from 'axios';
import { useSelector } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from '../../config';

const {height,width}=Dimensions.get('window')


const DeliveredOrders = ({navigation,error,id}) => {
  const accessToken = useSelector((state) => state.counter);
  //const { BASE_URL, userStage } = config(); // Get values

  // console.log({ userStage })
  // console.log({BASE_URL})
const[deliveredData,setDeliveredData]=useState([])
const[loading,setLoading]=useState(true)
const[message,setMessage]=useState('')

useFocusEffect(
  useCallback(() => {
    // Code to run when the screen is focused
    console.log("HomeScreen is focused");
    getAllDeliveredOrdersfunc()
    // Return a cleanup function if needed
    return () => console.log("HomeScreen is unfocused");
  }, [])
);

function getAllDeliveredOrdersfunc(){
  setLoading(true)
  let data
data={
    "deliveryBoyId": id,
    "orderStatus": 4 
  }

  axios({
    method:"post",
    // url:userStage == "test1"
    //       ? BASE_URL + `erice-service/order/getAssignedOrdersToDeliveryBoy`:
           url:BASE_URL + `order-service/getAssignedOrdersToDeliveryBoy`,
     data:data,
      headers:{
        Authorization:`Bearer ${accessToken.accessToken}`,
      }
    }
  )
  .then(function(response){
    console.log("Delivered orders",response.data)
    setDeliveredData(response.data)
    setLoading(false)
  })
  .catch(function(error){
    console.log(error.response)
    setLoading(false)
    if(error.response.data=="Orders not found" || error.response.data==""){
      setMessage(error.response.data || "Orders not found")
    }
  })
}

  useEffect(()=>{
    getAllDeliveredOrdersfunc()
  },[])

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
     <View
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
      {message == null || message == "" ? (
        <FlatList
          data={deliveredData}
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
    marginTop: 500,
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
