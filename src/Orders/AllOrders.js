import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList,TouchableOpacity } from 'react-native';
import axios from 'axios';
import BASE_URL from "../../config";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from "react-redux";
import { Dropdown } from 'react-native-element-dropdown';
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window')
import OrderDetails from './OrderDetails';
import { useNavigation } from '@react-navigation/native'; 



const AllOrders= () => {
  const navigation   = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const accessToken = useSelector((state) => state.counter);
  const [selectedValue, setSelectedValue] = useState("1");
  const [dropLoading,setDropLoading]=useState(false)
  

  // const [accessToken, setAccessToken] = usesState(null)
  const [userId, setUserId] = useState(null)

  const orderStatusMap = {
    "0": "Incomplete",
    "1": "Placed",
    "2": "Accepted",
    "3": "Picked Up",
    "4": "Delivered",
    "5": "Rejected",
    "6": "Cancelled",
  };

  useEffect(() => {
    const fetchOrders = async () => {

      setLoading(true)
      axios({
        method:"get",
        url:BASE_URL+'erice-service/order/getAllOrders',
        headers:{
          Authorization: `Bearer ${accessToken.token}`
        }
      })
      .then(function(response){
        console.log(response.data)
        setLoading(false)
        setOrders(response.data)
      })
      .catch(function(error){
        console.log(error.response)
        setLoading(false)
      })
      }
    // };  

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split('T')[0]; // Get "YYYY-MM-DD"
    const formattedTime = date.toTimeString().split(':').slice(0, 2).join(':'); // Get "HH:mm"
    return `${formattedDate}`;
  };

  const filteredOrders = orders.filter(item => item.orderStatus === selectedValue && item.testUser==false);

  const statusData= Object.keys(orderStatusMap).map((key) => ({
    label: orderStatusMap[key],
    value: key,
  }));

  const handleChange = (item) => {
    setDropLoading(true); 
    setSelectedValue(item.value);
    {setTimeout(() => {
      setDropLoading(false);
    }, 1000);}
    
  };
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
    {selectedValue===item.orderStatus?
      <TouchableOpacity onPress ={() => navigation.navigate('OrderDetails', { order: item })}>
      <Text style={styles.orderText}>Order ID: <Text style={styles.orderValue}>{item.uniqueId || 'N/A'}</Text></Text>
      {/* <Text style={styles.orderText}>Customer Mobile: <Text style={styles.orderValue}>{item.customerMobile || 'N/A'}</Text></Text> */}
      {/* <Text style={styles.orderText}>Subtotal: <Text style={styles.orderValue}>{item.grandTotal !== null ? item.grandTotal : 'N/A'}</Text></Text> */}
      <Text style={styles.orderText}>Grand Total: <Text style={styles.orderValue}>{item.grandTotal !== null ? item.grandTotal : 'N/A'}</Text></Text>
      <Text style={styles.orderText}>Delivery Fee: <Text style={styles.orderValue}>{item.deliveryFee !== null ? item.deliveryFee : 'N/A'}</Text></Text>
      <Text style={styles.orderText}>Order Date: <Text style={styles.orderValue}>{item.orderDate ? formatDate(item.orderDate) : 'N/A'}</Text></Text>
      <Text style={[styles.orderText, styles.statusText]}>Status: <Text style={styles.statusValue}>{orderStatusMap[item.orderStatus || 'N/A']}</Text></Text>
      </TouchableOpacity>
      :null}
      </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    Alert.alert('Error', error);
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}> 
      <Dropdown style={styles.dropdown}
      data={statusData} 
      labelField="label"
      valueField="value"
      value={selectedValue}
      onChange={handleChange}/>

{dropLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : null}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.OrderId}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  orderItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical:2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  orderText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  orderValue: {
    color: '#333',
    fontWeight: 'bold',
  },
  statusText: {
    color: ': #03843b',
    fontWeight: '600',
  },
  statusValue: {
    color: 'orange', // Green color for statuses
    fontSize:18
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  dropdown: {
    width: width * 0.5,
    height: height * 0.06,
    // borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: height * 0.02,
    alignSelf: 'flex-end',
},
  dropdown: {
    width: width * 0.5, 
    height: height * 0.07, 
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: height * 0.02,
    alignSelf: 'flex-end',
  },
  loader: {
    marginTop: 10,
  },
});

export default AllOrders;
