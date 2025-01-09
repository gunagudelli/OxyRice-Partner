  import React, { useState, useEffect } from 'react';
  import { View,Modal, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
  import axios from 'axios';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useNavigation } from '@react-navigation/native';
  import BASE_URL from "../../config";
  import { RadioButton } from 'react-native-paper';
  import { useSelector } from "react-redux";

  const OrderDetails = ({ route }) => {
    const navigation=useNavigation(); 
    // console.log("routes",route.params.order)
    const id = route.params.order.orderId;
    const status = route.params.order.orderStatus;
    const customerId = route.params.order.customerId;
    const accessToken = useSelector((state) => state.counter);

    const orderStatusMap = {      
      "0": "Incomplete",
      "1": "Placed",
      "2": "Accepted",
      "3": "Picked Up",
      "4": "Delivered",
      "5": "Rejected",
      "6": "Cancelled",
    };

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [dbNames, setDbNames] = useState([]); // To store active delivery boys' names
    const [selectedDb, setSelectedDb] = useState(null); // To track selected delivery boy
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [dbId,setDbId]=useState()
    const [disable,setDisable] = useState(false);
    // const [accessToken, setAccessToken] = useState(null)
    const [userId, setUserId] = useState(null)
    const [testUser, setTestUser]= useState(false);
    const[dbdetails,setDbdetails]=useState([])

    
    useEffect(() => {
      fetchOrderData();
      deliveryBoyDetails();
    }, [id, status]);
        const fetchOrderData = async () => {
          // const accessToken= await AsyncStorage.getItem('accessToken');
          // console.log(accessToken);
          
        try {
          // const userData = await AsyncStorage.getItem("userData");
          // if (userData) {
          //     const parsedData = JSON.parse(userData);
          //     console.log("User ID:", parsedData.userId);
          //     setUserId(parsedData.userId);
          //     console.log("Access Token:", parsedData.accessToken);
          //     setAccessToken(parsedData.accessToken);

          const response = await axios.post(
            BASE_URL+`erice-service/order/assignedOrders`, {
              // customerId:customerId,
              orderId: id,
              orderStatus: status
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken.token}`,
              }
            }
          );
        console.log("assignedOrders response",response.data)
          if (response.status === 200) {
            setOrderData(response.data[0]);
            setTestUser(response.data[0].testUser)
            setUserId(response.data[0].customerId)
            console.log(response.data[0]);
            console.log(customerId);
            console.log(testUser);
          }
        // }    
        // else {
        //     console.log("No user data found in AsyncStorage");
        // }
        } catch (err) {
          setError('Failed to load order details');
          console.error('Error fetching data:', err.response);
        } finally {
          setLoading(false);
        }
      };

    function deliveryBoyDetails(){
      let data={
        orderId: id,
        orderStatus: status
      }
      axios({
        method:"post",
        url:BASE_URL+`erice-service/order/deliveryBoyAssigneData`,
        data:data,
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        }
      })
      .then((response)=>{
        console.log("deliveryBoyAssigneData",response.data[0].deliveryBoyName)
        setDbdetails(response.data[0])
      })
      .catch((err)=>{
        console.log("deliveryBoyAssigneData",err)
      })
    }

   

    const handleRejectOrder = async () => {
      // const accessToken= await AsyncStorage.getItem('accessToken');
      setButtonsDisabled(true);
      try {
        // const userData = await AsyncStorage.getItem("userData");
        // if (userData) {
        //     const parsedData = JSON.parse(userData);
        //     console.log("User ID:", parsedData.userId);
        //     setUserId(parsedData.userId);
        //     console.log("Access Token:", parsedData.accessToken);
        //     setAccessToken(parsedData.accessToken);


        const response = await axios.post(
          BASE_URL+`erice-service/order/reject_order`,
          { orderId: id },
          {
            headers: {
              Authorization: `Bearer ${accessToken.token}`,
            }
          }
        );
        if (response.status === 200) {
          setStatusMessage(response.data.statusMessage);
          Alert.alert("Success",  response.data.statusMessage,
              [
                {
                  text: "OK",
                  onPress: () => navigation.navigate('Orders',{isTestOrder : testUser}) // Replace 'Orders' with your route name
                  // Replace 'Orders' with your route name
                }
              ]);
        }

      // }else{
      //   console.log("No user data found in AsyncStorage");

      // }
      } catch (error) {
        Alert.alert("Error", "Failed to reject the order.");
        console.error("Error rejecting order:", error.response);
      }
    };

    const handleAcceptOrder = async () => {
      // const accessToken= await AsyncStorage.getItem('accessToken');
      setButtonsDisabled(true);

      try {
        // const userData = await AsyncStorage.getItem("userData");
        // if (userData) {
        //     const parsedData = JSON.parse(userData);
        //     console.log("User ID:", parsedData.userId);
        //     setUserId(parsedData.userId);
        //     console.log("Access Token:", parsedData.accessToken);
        //     setAccessToken(parsedData.accessToken);


        const response = await axios.post(
          BASE_URL+`erice-service/order/accept_order1`,
          { orderId: id },
          {
            headers: {
              Authorization: `Bearer ${accessToken.token}`,
            }
          }
        );
        if (response.status === 200) {
          setStatusMessage(response.data.statusMessage);
          Alert.alert("Success", response.data.statusMessage);
        }
      // }
      // else{
      //   console.log("No user data found in AsyncStorage");

      // }
      } catch (error) {
        Alert.alert("Error", "Failed to accept the order.");
        console.error("Error accepting order:", error.response);
      }
    };

    const handleAssignedOrder = async () => {
      // const accessToken= await AsyncStorage.getItem('accessToken');
      setButtonsDisabled(true);
      try {
        // const userData = await AsyncStorage.getItem("userData");
        //   if (userData) {
        //       const parsedData = JSON.parse(userData);
        //       console.log("User ID:", parsedData.userId);
        //       setUserId(parsedData.userId);
        //       console.log("Access Token:", parsedData.accessToken);
        //       setAccessToken(parsedData.accessToken);
        const response = await axios.post(
          BASE_URL+`erice-service/order/assign_order1`
          ,
          { orderId: id },
          {
            headers: {
              Authorization: `Bearer ${accessToken.token}`,
            }
          }
        );
        if (response.status === 200) {
          setStatusMessage(response.data.statusMessage);
          Alert.alert("Success", response.data.statusMessage);
        }
      // } 
      
    }
    // else{
    //   console.log("No user data found in AsyncStorage");

    // }
    catch (error) {
        Alert.alert("Error", "Failed to assign the order.");
        console.error("Error assigning order:", error.response);
      }
    };


    const getDeliveryBoys = async () => {
      // const token = await AsyncStorage.getItem('accessToken');
      try {

        // const userData = await AsyncStorage.getItem("userData");
        // if (userData) {
        //     const parsedData = JSON.parse(userData);
        //     console.log("User ID:", parsedData.userId);
        //     setUserId(parsedData.userId);
        //     console.log("Access Token:", parsedData.accessToken);
        //     setAccessToken(parsedData.accessToken);

        const response = await fetch(BASE_URL+'erice-service/deliveryboy/list', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          setButtonsDisabled(true)
          const data = await response.json();
          const filteredData = data.filter(item => item.active === true);
          const activeNames = filteredData.map(item => item.deliveryBoyName);
          console.log(filteredData[0]);
          
          // dbId = filteredData.map(item => item.deliveryBoyName);
          setDbNames(filteredData); 
        
        }
      // }
      // else{
      //   console.log("No user data found in AsyncStorage");

      // }
      } catch (error) {
        console.error("Error fetching delivery boys:", error);
      }
    };

    const handleAssignedToDB = async () => {
      await getDeliveryBoys();
      setIsModalVisible(true); 
    };

    const handleReassignedToDB = async () => {
      await getDeliveryBoys();
      setIsModalVisible(true); 
    };
  const handleAssign = async () => {
    // console.log({dbId});
    console.log({selectedDb});
    
    
    if (!selectedDb) {
      alert("Please select a delivery boy.");
      return;
    }
    const filteredData = dbNames.filter(item => item.deliveryBoyName === selectedDb);
    console.log({filteredData});

    console.log("DeliveryBoy Id",filteredData[0].userId );
    console.log(orderData.orderStatus)
    let data= { orderId: id, deliveryBoyId: filteredData[0].userId }
console.log({data})
    let status=orderData.orderStatus
    try {
      const response = await axios.post(
        orderData.orderStatus  === '2'? BASE_URL+'erice-service/order/orderIdAndDbId':BASE_URL+'erice-service/order/reassignOrderToDb',
        { orderId: id, deliveryBoyId: filteredData[0].userId },
        {

          
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      console.log(`order id is : ${id} delivery boy is : ${filteredData[0].userId}`);
      
      console.log(response.data);
      

      if (response.status === 200) {
        // setButtonsDisabled(true)
        setStatusMessage("Order assigned to "+selectedDb);
        alert("Order successfully assigned to " + selectedDb, [
          {
            text: 'OK',
            onPress: () => setDisable(true),
          },
        ]);
        
        setIsModalVisible(false); 
      // }
    }
      
else{
  console.log("No user data found in AsyncStorage");

}  
    } catch (error) {
      console.error("Error assigning order:", error.response);
      alert("Failed to assign order.");
    }
  };

  
    // Handle modal cancel
    const handleCancel = () => {
      setIsModalVisible(false); // Close modal when cancel is clicked
    };

    if (loading) {
      return (

        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const formattedDate = date.toISOString().split('T')[0];     // Get "YYYY-MM-DD"
      const formattedTime = date.toTimeString().split(':').slice(0, 2).join(':'); // Get "HH:mm"
      return `${formattedDate} ${formattedTime}`;
    };

    
    const handleConvert = async () => {
      const apiUrl = BASE_URL+'erice-service/user/updateTestUsers';
      const requestBody = {
        userId: userId,
        testUser: !testUser,
      };
    
      try {
        const response = await axios.patch(apiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (response.status === 200) {
          if (testUser) {
            console.log('User successfully converted:', response.data);
          Alert.alert('Success','User converted to live User successfully!');
          } else {
            Alert.alert('Success','User converted to Test User successfully!');
          }
          await fetchOrderData();
          
        } else {
          console.log('Unexpected response:', response);
          alert('Failed to convert user.');
        }
      } catch (error) {
        console.error('Error converting user:', error);
        alert('An error occurred. Please try again.');
      }
    };

    const handlereAcceptPress = async () => {
      try {
        const response = await axios.patch(
          BASE_URL+'erice-service/order/reAcceptedAdmin',
          { orderId: id },
          {
            headers: {
              Authorization: `Bearer ${accessToken.token}`,
            },
          }
        )
        if (response.status === 200) {
          setStatusMessage(response.data.statusMessage);
          Alert.alert("Successfully Accepted", response.data.statusMessage);
        }else{
          Alert.alert("Error", "Failed to accept the order.");
        }
        }           
      catch (error) {
        console.error('Error', error);
        alert('An error occurred. Please try again.');
      }
    }

    return (
      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10}}>
        <Text style={styles.heading}>ORDER DETAILS</Text>
        <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
          {testUser ? <Text style={styles.convertButtonText}>Convert to Live User</Text> 
          : <Text style={styles.convertButtonText}>Convert to Test User</Text>}
        </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.label}>Order Id: <Text style={styles.value}>{ route.params.order.uniqueId || 'N/A'}</Text></Text>
          <Text style={styles.label}>Order Date: <Text style={styles.value}>{orderData.orderDate ? formatDate(orderData.orderDate) : 'N/A'}</Text></Text>
          <Text style={styles.label}>Customer Mobile: <Text style={styles.value}>{orderData.customerMobile || 'N/A'}</Text></Text>
          <Text style={styles.label}>Customer Name: <Text style={styles.value}>{orderData.customerName || 'N/A'}</Text></Text>
          <Text style={styles.label}>Order Status: <Text style={styles.value}>{orderStatusMap[orderData.orderStatus] || "Unknown"}</Text></Text>
          <Text style={styles.label}>Payment: <Text style={styles.value}>{orderData.paymentType==1 ?<Text>COD</Text>:<Text>Online</Text> || 'N/A'}</Text></Text>
          {/* <Text style={styles.label}>Payment Status: <Text style={styles.value}>{orderData.paymentStatus || 'N/A'}</Text></Text> */}
        </View>

        <Text style={styles.heading}>DELIVERY ADDRESS</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Flat: {orderData.orderAddress.flatNo || 'N/A'}</Text>
          <Text style={styles.label}>Landmark: {orderData.orderAddress.landMark || 'N/A'}</Text>
          <Text style={styles.label}>Address: {orderData.orderAddress.address || 'N/A'}</Text>
          <Text style={styles.label}>PIN: {orderData.orderAddress.pincode || 'N/A'}</Text>
        </View>

        <Text style={styles.heading}>ORDER ITEMS</Text>
        <View style={styles.section}>
          {orderData.orderItems && orderData.orderItems.length > 0 ? (
            orderData.orderItems.map((item, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.label}>Item Name : {item.itemName || 'N/A'}</Text>
                <Text style={styles.value}>Quantity : {item.quantity || 0} </Text>
                <Text style={styles.value}>Total: Rs.{item.price * item.quantity || 0}</Text>
              </View>
            ))
          ) : (
            <Text>No items available</Text>
          )}
        </View>
        <Text style={styles.heading}>ORDER STATUS UPDATES</Text>
        <View style={styles.section}>

          <Text style={styles.label}>ORDER PLACED : {orderData?.orderHistoryResponse?.[0]?.placedDate?.split(" ")[0] || "Not available"}</Text>
       {orderData.orderStatus>1? <Text style={styles.label}>ORDER ACCEPTED : {orderData?.orderHistoryResponse?.[1]?.acceptedDate?.split(" ")[0] || "Not available"}</Text>:null}
       {orderData.orderStatus>2 ? <Text style={styles.label}>ORDER ASSIGNED : {orderData?.orderHistoryResponse?.[2]?.assignedDate?.split(" ")[0] || "Not available"}</Text>:null}
        </View> 
        
        {orderData.orderStatus === "3" ? (
              <>
                <Text style={styles.heading}>Assigned To</Text>
                <View style={styles.section}>
                {/* <Text style={styles.label}>
                    DeliveryBoy Id: {(orderData.deliveryBoyId).slice(-4) || "N/A"}
                  </Text> */}
                  <Text style={styles.label}>
                    DeliveryBoy Name: {dbdetails.deliveryBoyName || "N/A"}
                  </Text>
                  <Text style={styles.label}>
                    DeliveryBoy Mobile Number: {dbdetails.deliveryBoyMobile || "N/A"}
                  </Text>
                </View>
              </>
            ) : (
              ""
            )}

        <Text style={styles.heading}>AMOUNT</Text>
        <View style={styles.section}>
          <Text style={styles.label}>SUB TOTAL: <Text style={styles.value}>Rs.{orderData.grandTotal || 0}</Text></Text>
          <Text style={styles.label}>DELIVERY FEE: <Text style={styles.value}>Rs.{orderData.deliveryfee || 0}</Text></Text>
          <Text style={styles.label}>GRAND TOTAL: <Text style={styles.value}>Rs.{orderData.grandTotal || 0}</Text></Text>
        </View>

        {statusMessage && (
          <View style={styles.section}>
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>

        {(orderData.orderStatus  === '1' || orderData.orderStatus  === '2' )&& (
        <TouchableOpacity
            style={[styles.rejectButton, buttonsDisabled && styles.disabledButton]}
            onPress={handleRejectOrder}
            disabled={buttonsDisabled}
          >
            <Text style={styles.rejectButtonText}>REJECT</Text>
          </TouchableOpacity>
          )}

          {orderData.orderStatus  === '5' && (
        <TouchableOpacity
            style={[styles.ReAccpetButton, buttonsDisabled && styles.disabledButton]}
            onPress={handlereAcceptPress}
            disabled={buttonsDisabled}
          >
            <Text style={styles.rejectButtonText}>Re-Accept</Text>
          </TouchableOpacity>
          )}

          {orderData.orderStatus  === '1' && (
            <TouchableOpacity
              style={[styles.acceptButton, buttonsDisabled && styles.disabledButton]}
              onPress={handleAcceptOrder}
              disabled={buttonsDisabled}
            >
              <Text style={styles.acceptButtonText}>ACCEPT</Text>
            </TouchableOpacity>
          )}
          {orderData.orderStatus === '2' && (
            <TouchableOpacity
              style={[styles.acceptButton, disable && styles.disabledButton]}
              onPress={handleAssignedToDB}
              disabled={buttonsDisabled}   
            >
              <Text style={styles.acceptButtonText}>ASSIGN To DB</Text>
            </TouchableOpacity>
          )}
          
          {orderData.orderStatus  === '3' && (
            <TouchableOpacity
              style={[styles.acceptButton, disable && styles.disabledButton]}
              onPress={handleReassignedToDB }
              // disabled={disable}   
            >
              <Text style={styles.acceptButtonText}>RE-ASSIGN TO DB</Text>
            </TouchableOpacity>
          )}
          
          {/* Reject Button always visible */}
          
          <Modal
    visible={isModalVisible}
    onRequestClose={handleCancel}
    transparent={true}
    animationType="slide"
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Select Delivery Boy</Text>
        <ScrollView>
        {dbNames.length === 0 ? (
    <Text>No active delivery boys found.</Text>
  ) : (
    dbNames.map((dbName, index) => (
      <>
      {dbdetails.deliveryBoyName!=dbName.deliveryBoyName?(

      <View key={index} style={styles.radioButtonContainer}>
        
        <RadioButton
          value={dbName.deliveryBoyName}
          status={selectedDb === dbName.deliveryBoyName ? 'checked' : 'unchecked'}
          onPress={() => {
            setSelectedDb(dbName.deliveryBoyName);
            setDbId(dbName.id);
          }}
        />
        {/* <Text>{dbName.deliveryBoyName}</Text> */}
        <Text>{dbName.deliveryBoyName}</Text> 
    
      </View>
    ):null}
    </>
    ))
  )}
  </ScrollView>

        <View style={styles.modalActions}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAssign} style={styles.assignButton}>
            <Text style={styles.buttonText}>{orderData.orderStatus  === '2' ? "Assign" : "Re-Assign"}</Text>
          </TouchableOpacity>
        
        </View>
      </View>
    </View>
  </Modal>

        </View>
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      paddingBottom: 20,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Added overlay effect
      height:500
    },
    modalContainer: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: "85%",
      height:500
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    radioButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 5,
    },
    modalActions: {
      flexDirection: 'row',
      marginTop: 20,
      // width:"80%",
      justifyContent:"space-between"
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    assignButton: {
      backgroundColor: '#4CAF50',
      padding: 10,
      marginLeft: 80,
      borderRadius: 5,

    },
    cancelButton: {
      backgroundColor: '#f44336',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
      color: '#333',
    },
    section: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 6,
      elevation: 3,
    },
    label: {
      fontSize: 16,
      color: '#555',
      marginBottom: 8,
    },
    value: {
      fontWeight: 'bold',
      color: '#333',
    },
    itemContainer: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingBottom: 10,
      marginBottom: 10,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      width: '100%',
      paddingHorizontal: 5,
    },
    rejectButton: {
      backgroundColor: '#e74c3c',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 5,
      width: '48%',
      alignItems: 'center',
      marginBottom: 20,
    },
    ReAccpetButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 5,
      width: '48%',
      marginLeft: 220,
      alignItems: 'center',
      marginBottom: 20,
    },
    rejectButtonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    acceptButton: {
      backgroundColor: '#27ae60',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 5,
      width: '48%',
      alignItems: 'center',
      marginBottom: 20,
    },
    acceptButtonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      fontSize: 18,
    },
    statusMessage: {
      color: '#27ae60',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
    },
    disabledButton: {
      opacity: 0.6, 
    },
    convertButton: {
      backgroundColor: '#27ae60',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 5,
    },
    convertButtonText: {
      color: '#fff',
      fontSize: 14,
    },
  });

  export default OrderDetails;
