import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const orderStatusMap = {
  "0": "Incomplete",
  "1": "Placed",
  "2": "Accepted",
  "3": "Picked Up",
  "4": "Delivered",
  "5": "Rejected",
  "6": "Cancelled",
};

const OrderItem = ({ order }) => {
  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString();
  const formattedTime = orderDate.toLocaleTimeString();
  const navigation = useNavigation();

  const onPress = () => {
    navigation.navigate('OrderDetails', { order });
  };

  return (
    <TouchableOpacity style={styles.orderItem} onPress={onPress}>
      <View style={styles.orderRow}>
        <Text style={styles.orderId}>Order ID: {order.orderId}</Text>
        <Text style={styles.orderRupees}>Rs : <Text style={styles.orderPrice}>{order.grandTotal.toFixed(2)}</Text></Text>
      </View>
      <Text style={styles.orderDate}>Date: {formattedDate} {formattedTime}</Text>
      <Text>Status: <Text style={styles.orderStatus}>{orderStatusMap[order.orderStatus] || "Unknown"}</Text></Text>
    </TouchableOpacity>
  );
};

const OrdersScreen = ({ orders }) => {
  return (
    <View style={styles.screen}>
      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderItem order={item} />}
        keyExtractor={(item) => item.orderId.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders available.</Text>
          </View>
        }        
      />
    </View>
  );
};

const Orders =async () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
   

  const getUserData = async () => {
    console.log(Tab.Navigator);
    console.log(isFocused);
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log("User ID:", parsedData.userId);
        console.log("Access Token:", parsedData.accessToken);
      } else {
        console.log("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

useEffect(()=>{
  getUserData()
},[])
 
  // useEffect(() => {
  //   getUserData()
 

  //   const fetchOrders = async () => {
  //     const accessToken = await AsyncStorage.getItem('accessToken');
  //     console.log("Access Token2222: ", accessToken); // Ensure token is available

      

  //     if (!accessToken) {
  //       setError("Access token is missing.");
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const response = await axios.get('https://meta.oxyloans.com/api/erice-service/order/getAllOrders', {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       });

  //       console.log('API Response:', response.data); // Check response data
  //       setOrders(response.data); 
  //       setError(null); // Reset error if the request is successful
  //     } catch (error) {
  //       console.error("API Error:", error);// Log the error details
  //       setError("Failed to load orders. Please try again later.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (isFocused) {
  //     setLoading(true);  // Set loading to true before fetching
  //     fetchOrders();
  //   }
 
  // }, [isFocused]);

  if (loading) {
    return <ActivityIndicator size="large" color="green" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  const newOrders = orders.filter(order => order.orderStatus === "1");
  const acceptedOrders = orders.filter(order => order.orderStatus === "2");
  const assignedOrders = orders.filter(order => order.orderStatus === "3");

  return (
    <Tab.Navigator
    initialRouteName="New"
    screenOptions={{
      tabBarActiveTintColor: '#000', // Active tab text color
      tabBarInactiveTintColor: '#999', // Inactive tab text color
      tabBarLabelStyle: {
        fontSize: 18, // Ensure the font size is not too small
        fontWeight: 'bold', // Make it stand out
      },
      tabBarStyle: {
        backgroundColor: '#fff', // Background color for the tab bar
        height: 45, // Ensure enough height to display the labels
      },
      tabBarIndicatorStyle: {
        backgroundColor: 'orange', 
        height: 2, 
      },
      showLabel: true,  
    }}
  >
    <Tab.Screen
      name="New"
      options={{
        tabBarLabel: 'New', // Label for this tab
        headerTitle: 'New Orders',
        headerStyle: { backgroundColor: '#FF5722' },
        headerTintColor: '#fff',
      }}
    >
      {() => <OrdersScreen orders={newOrders} />}
    </Tab.Screen>
  
    <Tab.Screen
      name="Accepted"
      options={{
        tabBarLabel: 'Accepted', // Label for this tab
        headerTitle: 'Accepted Orders',
        headerStyle: { backgroundColor: '#FF5722' },
        headerTintColor: '#fff',
      }}
    >
      {() => <OrdersScreen orders={acceptedOrders} />}
    </Tab.Screen>
  
    <Tab.Screen
      name="Assigned"
      options={{
        tabBarLabel: 'Assigned', // Label for this tab
        headerTitle: 'Assigned Orders',
        headerStyle: { backgroundColor: '#FF5722' },
        headerTintColor: '#fff',
      }}
    >
      {() => <OrdersScreen orders={assignedOrders} />}
    </Tab.Screen>
  </Tab.Navigator>
   );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 24,                                      
    color: '#555',
  },
  orderItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderRupees: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  orderStatus: {
    fontSize: 16,
    color: '#28a745',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Orders;

