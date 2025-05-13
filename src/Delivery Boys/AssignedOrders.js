import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity,ActivityIndicator, Dimensions ,TextInput} from 'react-native';
import axios from 'axios';
import { useSelector } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from "../../config"
import Icon from "react-native-vector-icons/Ionicons"

const {height,width}=Dimensions.get('window')


const AssignedOrders = ({navigation,error,id}) => {
  const accessToken = useSelector((state) => state.counter);
  
// console.log({userStage})
const[assignedData,setAssignedData]=useState([])
const[loading,setLoading]=useState(true)
const[message,setMessage]=useState('')
const [searchQuery, setSearchQuery] = useState('');
const[count,setCount]=useState(0)

useFocusEffect(
  useCallback(() => {
    // Code to run when the screen is focused
    // console.log("HomeScreen is focused");
    // console.log({accessToken})
    getAllAssignedOrdersfunc()
    // Return a cleanup function if needed
    return () => console.log("HomeScreen is unfocused");
  }, [])
);

  function getAllAssignedOrdersfunc(){
    setLoading(true)
    let data={
      "deliveryBoyId": id,
      "orderStatus": 3
    }
    console.log({data})
    axios({
      method: "post",
      url: BASE_URL + `order-service/getAssignedOrdersToDeliveryBoy`,
      data: data,
      headers: {
        Authorization: `Bearer ${accessToken.accessToken}`,
      },
    })
      .then(function (response) {
        // console.log("asssigned orders", response.data[0].orderAddress);
        // const orders = (response.data);

// Sort the array in ascending order based on OrderDate
// orders.sort((a, b) => {
//   // Convert strings to Date objects for comparison
//   const dateA = new Date(a.orderDate);
//   const dateB = new Date(b.orderDate);

//   // Compare dates
//   return dateB - dateA;
// });
// console.log({orders})
        setAssignedData(response.data);
        setCount(response.data?.length)
        setLoading(false);
      })
      .catch(function (error) {
        // console.log("getAssignedOrdersToDeliveryBoy_error",error.response);
        setLoading(false);
        if (
          error.response.data == "Orders not found" ||
          error.response.data == ""
        ) {
          setMessage(error.response.data || "Orders not found");
        }
      });
  }

  useEffect(()=>{
    getAllAssignedOrdersfunc()
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
            OrderId : <Text style={{ color: "black" }}>{item.uniqueId} </Text>
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
                Assigned             
            </Text>
          </Text>
        </View>
        <View style={styles.orderAmountContainer}>
          <Text style={styles.orderAmount}>
            Rs.<Text style={{ color: "#28a745" }}>{item.grandTotal}</Text>
          </Text>
        </View>
      </View>


{item?.dayOfWeek!=null ? 
      <View style={{paddingLeft: 20,}}>
          <Text style={{fontWeight:"bold"}}>Expected Date / Time : {" "}
            <Text style={{fontWeight:"normal"}}>{item?.expectedDeliveryDate} , {item?.dayOfWeek} ({item?.timeSlot})</Text>
            </Text>
            </View>
            :null}

      {item?.orderAddress!=null ?
            <View style={{backgroundColor:"#f1f1f1", padding:10, borderRadius:10, marginTop:10,flexDirection:"row",width:width*0.9,alignSelf:"center"}}>
              <Icon name="location" size={16} style={{marginRight:15}}/>
              <Text style={{fontWeight:"bold",width:width*0.8}}>{item?.orderAddress?.flatNo},{item?.orderAddress?.address},{item?.orderAddress?.landMark},{item?.orderAddress?.pincode}</Text>
            </View>
            :null}
        <View style={{borderBottomWidth:0.3,borderColor:"grey",marginVertical:10}}/>
      
    </TouchableOpacity>
  );

    function footer() {
        return (
          <View style={{ alignSelf: "center",marginBottom:100 }}>
            <Text>No More orders Found </Text>
          </View>
        );
      }
  return (
    <>
{/* <LocationMap/> */}
{/* <View style={{alignSelf:"flex-end",marginRight:15}}>
<Icon name="map" size={20} style={{margin:10}} onPress={()=>navigation.navigate("Location Map")}/>
</View> */}
    <View style={styles.container}>
      <Text style={{fontWeight:"bold",margin:10}}>Count of Assigned Orders : {count}</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          borderRadius: 5,
          marginBottom: 10,
          paddingHorizontal: 10,
          width:width*0.9,
          alignSelf:"center"
        }}
        placeholder="Search by Order ID"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {message == null || message == "" ? (
        <FlatList
          // data={assignedData}
          data={assignedData.filter(order =>
            order.orderId.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          ListFooterComponent={footer}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No orderId found</Text>}
          ListFooterComponentStyle={styles.footerStyle}
        />
      ) : (
        <Text style={styles.text}>{message}</Text>
      )}
    </View>
    </>
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
    marginBottom: 1000,
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

export default AssignedOrders;