import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList
} from "react-native";
import axios from "axios";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { config } from '../../config';
import { RadioButton } from "react-native-paper";
import { useSelector } from "react-redux";
import BarCodeScannerScreen from "../BarCode";
import { use } from "react";
const { width } = Dimensions.get("window");
const OrderDetails = ({ route }) => {
  const navigation = useNavigation();
  // console.log("routes",route.params.order.orderId)
  const id = route.params.order.orderId;
  const status = route.params.order.orderStatus;
  const customerId = route.params.order.customerId;
  const accessToken = useSelector((state) => state.counter);
  const { BASE_URL, userStage } = config(); // Get values

  const orderStatusMap = {
    0: "Incomplete",
    1: "Placed",
    2: "Accepted",
    3: "Assigned",
    4: "Delivered",
    5: "Rejected",
    6: "Cancelled",
   "Pickedup":"Pickedup"
  };
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [dbNames, setDbNames] = useState([]); // To store active delivery boys' names
  const [assignedDeliveryBoy, setAssignedDeliveryBoy] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null); // To track selected delivery boy
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dbId, setDbId] = useState();
  const [disable, setDisable] = useState(false);
  // const [accessToken, setAccessToken] = useState(null)
  const [userId, setUserId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [testUser, setTestUser] = useState(false);
  const [dbdetails, setDbdetails] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejected, setIsRejected] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [errormsg, setErrormsg] = useState(false);
  const [loader, setLoader] = useState(false);
  const [acceptLoader, setAcceptLoader] = useState(false);
  const[assignLoader,setAssignLoader]=useState(false)
  const [RejectLoader, setRejectLoader] = useState(false);
  const [RejectReason_error, setRejectReason_error] = useState(false);
  useEffect(() => {
    fetchOrderData();
    deliveryBoyDetails();
    getDeliveryBoyDetails();
  }, [id, status]);
  const fetchOrderData = async () => {
    try {
      const response = await axios.post(
        // userStage == "test"? 
          BASE_URL + `order-service/assignedOrders`,
          // : BASE_URL + `erice-service/order/assignedOrders`,

        {
          // customerId:customerId,
          orderId: id,
          orderStatus: status,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      // console.log("Order Details response", response.data);
      if (response.status === 200) {
        setOrderData(response.data[0]);
        setTestUser(response.data[0].testUser);
        setUserId(response.data[0].customerId);
        setOrderItems(response.data[0].orderItems);
        console.log(response.data[0]);
        console.log(customerId);
        console.log(testUser);
      }
      // }
      // else {
      //     console.log("No user data found in AsyncStorage");
      // }
    } catch (err) {
      setError("Failed to load order details");
      console.error("Error fetching data:", err.response);
    } finally {
      setLoading(false);
    }
  };

  function deliveryBoyDetails() {
    let data = {
      orderId: id,
      orderStatus: status,
    };
    axios({
      method: "post",
      // url:BASE_URL+`erice-service/order/deliveryBoyAssigneData`,
      url:
        // userStage == "test"? 
          BASE_URL + `order-service/deliveryBoyAssigneData`,
          // : "",
      data: data,
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
    })
      .then((response) => {
        // console.log("deliveryBoyAssigneData", response.data[0]);
        setDbdetails(response.data[0]);
      })
      .catch((err) => {
        // console.log("deliveryBoyAssigneData", err.response);
      });
  }

  const handleRejectOrder = async () => {
    if(rejectReason == "" || rejectReason == null) {
      setRejectReason_error(true)
      return;
    }
    setRejectLoader(true)
    try {
      const response = await axios.post(
        // BASE_URL+`erice-service/order/reject_order`,
        // userStage == "test"? 
          BASE_URL + `order-service/reject_orders`,
          // : BASE_URL + `erice-service/order/reject_order`,
        { orderId: id, cancelReason: rejectReason },
         
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data)
        setRejectLoader(false)
        setStatusMessage(response.data.statusMessage);
        setButtonsDisabled(true);
        setIsRejected(false);
        Alert.alert("Success!" ,"Order Rejected Sucessfully", [
          {
            text: "OK",
          },
        ]);
      }
    } catch (error) {
      setRejectLoader(false)
      Alert.alert("Error", "Failed to reject the order.");
      console.error("Error rejecting order:", error.response);
      setIsRejected(false);
    }
  };
  const handleAcceptOrder = async () => {
    // const accessToken= await AsyncStorage.getItem('accessToken');
    setButtonsDisabled(true);
setAcceptLoader(true)
    try {
      const response = await axios.post(
        // BASE_URL+`erice-service/order/accept_order1`,
        // userStage == "test"?
         BASE_URL + `order-service/accept_order1`,
          // : BASE_URL + `erice-service/order/accept_order1`,
        { orderId: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      // console.log("Accept Order",response)
      if (response.status === 200) {
        setAcceptLoader(false)

        setStatusMessage(response.data.statusMessage);
        Alert.alert("Success", response.data.statusMessage);
      }
    } catch (error) {
      setAcceptLoader(false)

      Alert.alert("Error", "Failed to accept the order.");
      console.error("Error accepting order:", error.response);
    }
  };

  const getDeliveryBoys = async () => {
    setLoader(true);
    try {
      const url =
        // userStage === "test" ? 
          `${BASE_URL}user-service/deliveryBoyList`
          // : `${BASE_URL}erice-service/deliveryboy/list`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
      });
      setLoader(false);
      if (response.status === 200) {
        setButtonsDisabled(true);
        setAssignLoader(false)
        const data = await response.json();
        let filteredData = data.filter((item) => item.isActive === "true");
        setDbNames(filteredData);
        console.log("Active Delivery Boys:", filteredData);
      }
    } catch (error) {
      setAssignLoader(false)
      setLoader(false);
      console.error("Error fetching delivery boys:", error);
    }
  };

  const handleAssignedToDB = async () => {
    setAssignLoader(true)
    await getDeliveryBoys();

    setIsModalVisible(true);

  };

  const handleReassignedToDB = async () => {
    setAssignLoader(true)
    await getDeliveryBoys();
    

    setIsModalVisible(true);
  };

  const handleAssign = async () => {
    // console.log({ selectedDb });

    if (!selectedDb) {
      alert("Please select a delivery boy.");
      return;
    }

    const filteredData = dbNames.filter(
      (item) => item.email === selectedDb
    );
    if (filteredData.length === 0) {
      alert("Selected delivery boy not found.");
      return;
    }

    const deliveryBoyId = filteredData[0].userId;
    console.log("DeliveryBoy Id:", deliveryBoyId);

    let data =orderData.orderStatus === "2"? 
        { orderId: id, deliveryBoyId } :
        {orderId:id,deliverBoyId:deliveryBoyId}
    console.log({data});
setSubmitLoader(true)
    const orderApiUrl =
      userStage !== "test"
        ? orderData.orderStatus === "2"
          ? `${BASE_URL}order-service/orderIdAndDbId`
          : `${BASE_URL}order-service/reassignOrderToDb`
        : orderData.orderStatus === "2"
        ? `${BASE_URL}order-service/orderIdAndDbId`
        : `${BASE_URL}order-service/reassignOrderToDb`;

    try {
      const response = await axios.post(orderApiUrl, data, {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      });

      console.log(`Order ID: ${id}, Delivery Boy ID: ${deliveryBoyId}`);
      console.log("Assign Order",response)
setSubmitLoader(false)
      if (response.status === 200) {
        setStatusMessage("Order assigned to " + selectedDb);
        getDeliveryBoyDetails()
        alert("Order successfully assigned to " + selectedDb, [
          {
            text: "OK",
            onPress: () => setDisable(true),
          },
        ]);
        setIsModalVisible(false);
      } else {
        console.log("No user data found in AsyncStorage");
      }
    } catch (error) {
      setSubmitLoader(false)
      console.error("Error assigning order:", error.response);
      alert("Failed to assign order.");
    }
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
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split("T")[0]; // Get "YYYY-MM-DD"
    const formattedTime = date.toTimeString().split(":").slice(0, 2).join(":"); // Get "HH:mm"
    return `${formattedDate} ${formattedTime}`;
  };
  const handleConvert = async () => {
    const apiUrl = BASE_URL + "user-service/updateTestUsers";
    const requestBody = {
      id: userId,
      testUser: !testUser,
    };
    console.log({requestBody})
    try {
      const response = await axios.patch(apiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        fetchOrderData()
        if (testUser) {
          console.log("User successfully converted:", response.data);
          Alert.alert("Success", "User converted to live User successfully!");
        } else {
          Alert.alert("Success", "User converted to Test User successfully!");
        }
        await fetchOrderData();
      } else {
        console.log("Unexpected response:", response);
        alert("Failed to convert user.");
      }
    } catch (error) {
      console.error("Error converting user:", error);
      alert("An error occurred. Please try again.");
    }
  };
  const handlereAcceptPress = async () => {
    try {
      const response = await axios.patch(
        // BASE_URL + "erice-service/order/reAcceptedAdmin",
        // userStage == "test"?
         BASE_URL + `order-service/reAcceptedAdmin`,
          // : BASE_URL + `erice-service/order/reAcceptedAdmin`,

        { orderId: id },
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      if (response.status === 200) {
        setStatusMessage(response.data.statusMessage);
        Alert.alert("Successfully Accepted", response.data.statusMessage);
      } else {
        Alert.alert("Error", "Failed to accept the order.");
      }
    } catch (error) {
      console.error("Error", error);
      alert("An error occurred. Please try again.");
    }
  };
  function getDeliveryBoyDetails() {
    axios({
      method: "post",
      url: BASE_URL + `order-service/deliveryBoyAssigneData`,
      data: {
        orderId: id,
        orderStatus: "3",
      },
      headers: {
        Authorization: `Bearer ${accessToken.accessToken}`,
      },
    })
      .then(function (response) {
        // console.log("deliveryBoyAssigneData", response);
        setAssignedDeliveryBoy(response.data[0]);
        console.log(assignLoader.deliveryBoyName)
      })
      .catch(function (error) {
        // console.log("deliveryBoyAssigneData", error);
      });
  }

  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          // padding: 10,
        }}
      >
        <Text style={styles.heading}>ORDER DETAILS</Text>
        
      </View>

      <TouchableOpacity
            style={styles.convertButton}
            onPress={handleConvert}
          >
            {testUser==false ? (
              <Text style={styles.convertButtonText}>Convert to Live User</Text>
            ) : (
              <Text style={styles.convertButtonText}>Convert to Test User</Text>
            )}
          </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.label}>
          Order Id:{" "}
          <Text style={styles.value}>
            {route.params.order.orderId || "N/A"}
          </Text>
        </Text>
        <Text style={styles.label}>
          Order Date:{" "}
          <Text style={styles.value}>
            {orderData.orderDate ? formatDate(orderData.orderDate) : "N/A"}
          </Text>
        </Text>
        <Text style={styles.label}>
  Mobile Number:{" "}
  <Text style={styles.value}>
    {orderData?.mobileNumber?.trim() && orderData?.customerMobile?.trim() && orderData?.mobileNumber !== orderData?.customerMobile
      ? `${orderData.mobileNumber}, ${orderData.customerMobile}`
      : orderData?.customerMobile?.trim() || orderData?.mobileNumber?.trim() || "N/A"}
  </Text>
</Text>

        <Text style={styles.label}>
          Alternate Mobile Number:{" "} 
          <Text style={styles.value}>{orderData.alternativeMobileNumber ||"N/A"}</Text>
        </Text>
        <Text style={styles.label}>
          Customer Name:{" "}
          <Text style={styles.value}>{orderData.customerName || "N/A"}</Text>
        </Text>
        <Text style={styles.label}>
          Order Status:{" "}
          <Text style={styles.value}>
            {orderStatusMap[orderData.orderStatus] || "Unknown"}
          </Text>
        </Text>
        <Text style={styles.label}>
          Payment:{" "}
          <Text style={styles.value}>
            {orderData.paymentType == 1 ? (
              <Text>COD</Text>
            ) : (
              <Text>Online</Text> || "N/A"
            )}
          </Text>
        </Text>
        {/* <Text style={styles.label}>Payment Status: <Text style={styles.value}>{orderData.paymentStatus || 'N/A'}</Text></Text> */}
      </View>
      <Text style={styles.heading}>DELIVERY ADDRESS</Text>
      <View style={styles.section}>
        <Text style={styles.label}>
          Flat:<Text style={styles.value}>{orderData.orderAddress.flatNo || "N/A"}</Text> 
        </Text>
        <Text style={styles.label}>
          Landmark: <Text style={styles.value}>{orderData.orderAddress.landMark || "N/A"}</Text>
        </Text>
        <Text style={styles.label}>
          Address: <Text style={styles.value}>{orderData.orderAddress.address || "N/A"}</Text>
        </Text>
        <Text style={styles.label}>
          PIN: <Text style={styles.value}>{orderData.orderAddress.pincode || "N/A"}</Text>
        </Text>
      </View>
      <Text style={styles.heading}>ORDER ITEMS</Text>
      <View style={styles.section}>
        {orderData.orderItems && orderData.orderItems.length > 0 ? (
          orderData.orderItems.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.label}>
                Item Name : <Text style={styles.value}>{item.itemName || "N/A"}</Text>
              </Text>
              {/* <Text style={styles.label}>
                SingleItemPrice:  {""}
              </Text> */}
              <Text style={styles.label}>Weight : <Text style={styles.value}>{item.weight || 0} {item?.weight==1?"Kg":"Kgs"}</Text> </Text>

              <Text style={styles.label}>Quantity : <Text style={styles.value}>{item.quantity || 0}</Text> </Text>
              <Text style={styles.label}>Single Item Price : <Text style={styles.value}>Rs {item.price}</Text></Text>
              <Text style={styles.label}>Total : <Text style={styles.value}>Rs {item.itemprice}</Text></Text>
              {orderData.orderItems.length>1 && <Text>-----------------------------</Text>}

            </View>
          ))
        ) : (
          <Text>No items available</Text>
        )}
      </View>
      <Text style={styles.heading}>ORDER STATUS UPDATES</Text>
      <View style={styles.section}>
      <FlatList
        data={orderData.orderHistoryResponse}
        keyExtractor={(item, index) => item.orderId + index}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* <Text style={styles.title}>Order ID: {item.orderId}</Text> */}
            {Object.entries(item)
              .filter(([key, value]) => value !== null && key !== "orderId")
              .map(([key, value]) => (
                <Text key={key} style={styles.value}>
                  <Text style={styles.label}>{formatFieldName(key)}:</Text> {value}
                </Text>
              ))}
          </View>
        )}
      />
      </View>


    



      {orderData.orderStatus === "3" ? (
        <>
          <Text style={styles.heading}>Assigned To</Text>
          <View style={styles.section}>
            {/* <Text style={styles.label}>
                    DeliveryBoy Id: {(orderData.deliveryBoyId).slice(-4) || "N/A"}
                  </Text> */}
            <Text style={styles.label}>
              Delivery Boy Name : <Text style={styles.value}>{assignedDeliveryBoy.deliveryBoyName || "N/A"}</Text>
            </Text>
            <Text style={styles.label}>
              Delivery Boy Mobile Number :{" "}
              <Text style={styles.value}>{assignedDeliveryBoy.deliveryBoyMobile || "N/A"}</Text>
            </Text>
          </View>
        </>
      ) : (
        ""
      )}
     <Text style={styles.heading}>Summary Order</Text>
<View style={styles.section}>
  <Text style={styles.label}>
    SUB TOTAL: <Text style={styles.value}>Rs {orderData.subTotal || 0}</Text>
  </Text>
  <Text style={styles.label}>
    DELIVERY FEE: <Text style={styles.value}>Rs :{orderData.deliveryfee || 0}</Text>
  </Text>

  {/* Show GST only if it's greater than zero */}
  {orderData.gstAmount > 0 && (
    <Text style={styles.label}>
      GST: <Text style={styles.value}>Rs +{orderData.gstAmount}</Text>
    </Text>
  )}

  {/* Show Wallet Amount only if it's greater than zero */}
  {orderData.walletAmount > 0 && (
    <Text style={styles.label}>
      Wallet Amount: <Text style={styles.value}>Rs -{orderData.walletAmount}</Text>
    </Text>
  )}

  {/* Show Discount Amount only if it's greater than zero */}
  {orderData.discountAmount > 0 && (
    <Text style={styles.label}>
      Coupon Amount: <Text style={styles.value}>Rs -{orderData.discountAmount}</Text>
    </Text>
  )}

  <Text style={styles.label}>
    GRAND TOTAL: <Text style={styles.value}>Rs {orderData.grandTotal || 0}</Text>
  </Text>
</View>

      {(orderData.orderStatus === "5" || orderData.orderStatus === "6") && (
        <>
          <Text style={styles.heading}>Reason</Text>
          <View style={styles.section}>
            <Text style={styles.label}>
              Reason :{" "}
              <Text style={styles.value}>{orderData.reason || "N/A"}</Text>
            </Text>
          </View>
        </>
      )}

      {statusMessage && (
        <View style={styles.section}>
          <Text style={styles.statusMessage}>{statusMessage}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {(orderData.orderStatus === "1" ||
          orderData.orderStatus === "2" ||
          orderData.orderStatus === "3") && (
          <TouchableOpacity
            style={[
              styles.rejectButton,
              // buttonsDisabled && styles.disabledButton,
            ]}
            onPress={() => setIsRejected(true)}
            disabled={buttonsDisabled}
          >
            <Text style={styles.rejectButtonText}>REJECT</Text>
          </TouchableOpacity>
        )}
        {orderData.orderStatus === "5" && (
          <TouchableOpacity
            style={[
              styles.ReAccpetButton,
              buttonsDisabled && styles.disabledButton,
            ]}
            onPress={handlereAcceptPress}
            disabled={buttonsDisabled || userStage !== "test"}
          >
            <Text style={styles.rejectButtonText}>Re-Accept</Text>
          </TouchableOpacity>
        )}
        {orderData.orderStatus === "1" && (
          <>
            {acceptLoader == false ? (
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  buttonsDisabled && styles.disabledButton,
                ]}
                onPress={handleAcceptOrder}
                disabled={buttonsDisabled}
              >
                <Text style={styles.acceptButtonText}>ACCEPT</Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.acceptButton,
                  buttonsDisabled && styles.disabledButton,
                ]}
              >
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </>
        )}
        {orderData.orderStatus === "2" && (
          <>
          {assignLoader==false?
          <TouchableOpacity
          style={[
            styles.acceptButton,
            // buttonsDisabled && styles.disabledButton,
          ]}            
          onPress={() => handleAssignedToDB()}
            // disabled={orderData.orderStatus === "3"?buttonsDisabled:false}
            
          >
            <Text style={styles.acceptButtonText}>ASSIGN TO DB</Text>
          </TouchableOpacity>
          :
          <View style={[styles.acceptButton, disable && styles.disabledButton]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
          }
          </>
        )}

        {orderData.orderStatus === "3" && (
          <>
          {assignLoader==false?
          <TouchableOpacity
            style={[styles.acceptButton, disable && styles.disabledButton]}
            onPress={handleReassignedToDB}
            // disabled={disable}
          >
            <Text style={styles.acceptButtonText}>RE-ASSIGN TO DB</Text>
          </TouchableOpacity>
          :
          <View style={[styles.acceptButton, disable && styles.disabledButton]}>
              <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
          }
          </>
        )}
 {/* Reject Button always visible */}
        <Modal
          visible={isModalVisible}
          // onRequestClose={handleCancel}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Delivery Boy</Text>

              {loader == false ? (
                <ScrollView>
                  {dbNames.length === 0 ? (
                    <Text>No active delivery boys found.</Text>
                  ) : (
                    dbNames.map((dbName, index) => (
                      <>
                        {dbdetails.deliveryBoyName != dbName.whatsappNumber ? (
                          <View key={index} style={styles.radioButtonContainer}>
                            <RadioButton
                              value={dbName.email}
                              status={
                                selectedDb === dbName.email
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() => {
                                setSelectedDb(dbName.email);
                                setDbId(dbName.userId);
                              }}
                            />
                            {/* <Text>{dbName.deliveryBoyName}</Text> */}
                            <Text>
                              {dbName.firstName} {dbName.lastName}
                            </Text>
                          </View>
                        ) : null}
                      </>
                    ))
                  )}
                </ScrollView>
              ) : (
                <ActivityIndicator size="small" color="#FFFFFF" />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={()=>setIsModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                {submitLoader == false ? (
                  <TouchableOpacity
                    onPress={() => handleAssign()}
                    style={styles.assignButton}
                  >
                    <Text style={styles.buttonText}>
                      {orderData.orderStatus === "2" ? "Assign" : "Re-Assign"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    // onPress={()=>handleAssignSerialNumberSubmit()}
                    style={styles.assignButton}
                  >
                    {/* <Text style={styles.buttonText}>
                    {orderData.orderStatus === "2" ? "Assign" : "Re-Assign"}
                  </Text> */}
                    <ActivityIndicator
                      size={20}
                      color="white"
                      loading={submitLoader}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isRejected}
          // onRequestClose={handleCancel}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reject Order</Text>
              <Text style={styles.label}>
                Are you sure you want to reject this order?
              </Text>
              <View style={styles.inputContainer}>

                <TextInput
                  style={styles.input}
                  placeholder="Reason for rejection"
                  onChangeText={(text)=>{setRejectReason(text),setRejectReason_error(false)}}
                  value={rejectReason}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                 {RejectReason_error==true ? (
                  <Text style={{ color: "red" }}>Reason to reject is mandatory</Text>
                ): null} 
              </View>

                
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={()=>setIsRejected(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
               { RejectLoader == false ? (
                <TouchableOpacity
                  onPress={handleRejectOrder}
                  style={styles.assignButton}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>):
                <View style={styles.assignButton}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
                }
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
    // padding: 16,
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(12, 13, 12, 0.5)", // Added overlay effect
    height: 500,
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "85%",
    // height:500
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 20,
    // width:"80%",
    justifyContent: "space-between",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  assignButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    marginLeft: 80,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
    backgroundColor:"#c0c0c0",
    width:width,
    padding:10,
  },
  section: {
    paddingLeft: 15,
    // borderRadius: 8,
    // marginBottom: 20,
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 3 },
    // shadowRadius: 6,
    // elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    fontWeight: "bold",
  },
  value: {
    fontWeight: "normal",
    padding: 2,
    // color: "#333",
  },
  itemContainer: {
    // borderBottomWidth: 0.3,
    // // borderBottomColor: "#ddd",
    // paddingBottom: 10,
    marginBottom: 10,
    width: width * 0.6,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
    marginBottom: 20,
  },
  serialNumberInput: {
    borderWidth: 1,
    // borderColor: "#ccc",
    // padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: width * 0.6,
  },
  ReAccpetButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
    width: "48%",
    marginLeft: 220,
    alignItems: "center",
    marginBottom: 20,
  },
  rejectButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  acceptButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
    marginBottom: 20,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
  },
  statusMessage: {
    color: "#27ae60",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  convertButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
    marginBottom: 20,
    alignSelf:"flex-end"
  },
  convertButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    // height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default OrderDetails;
