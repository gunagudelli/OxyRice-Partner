// import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Checkbox, TextInput, Button } from 'react-native-paper';
// import BASE_URL from '../../config';
// import Ionicons from 'react-native-vector-icons/Ionicons';


// const Checkout = ({ route }) => {
//   const [cartData, setCartData] = useState(null);
//   const [couponChecked, setCouponChecked] = useState(false);
//   const [couponCode, setCouponCode] = useState('');

//   useEffect(() => {
//     console.log(route.params.MarketDetails);
//     getCartDetails();
//   }, []);

//  function getCartDetails() {
//   axios({
//     method: 'get',
//     url: `${BASE_URL}cart-service/cart/userCartInfo?customerId=${route.params.MarketDetails.userId}`,
//   })
//     .then(function (response) {
//       console.log(response.data);
//       const data = response.data;
//       if (!data.customerCartResponseList || data.customerCartResponseList.length === 0) {
//         // Navigate back to AllCategories if cart is empty
//         navigation.replace('AllCategories', {
//           customerId: route.params.MarketDetails.userId,
//         });
//       } else {
//         setCartData(data);
//       }
//     })
//     .catch(function (error) {
//       console.log(error.response);
//     });
// }


// const renderItem = ({ item }) => {
//   const handleIncrement = () => {
//     axios.post(`${BASE_URL}cart-service/cart/addAndIncrementCart`, {
//       itemId: item.itemId,
//       customerId: route.params.MarketDetails.userId,
//     })
//     .then(() => getCartDetails())
//     .catch(err => console.log('Increment Error', err.response));
//   };

//   const handleDecrement = () => {
//     axios.patch(`${BASE_URL}cart-service/cart/minusCartItem`, {
//       itemId: item.itemId,
//       customerId: route.params.MarketDetails.userId,
//     })
//     .then(() => getCartDetails())
//     .catch(err => console.log('Decrement Error', err.response));
//   };

//   const handleRemove = () => {
//     if (item.status === 'FREE') {
//       // Confirm delete for FREE item
//       Alert.alert(
//         "Remove Free Item",
//         "Are you sure you want to remove this free item?",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Remove", onPress: () => {
//               axios.delete(`${BASE_URL}cart-service/cart/removeFreeContainer`, {
//                 data: { item: item.itemId }
//               })
//               .then(() => getCartDetails())
//               .catch(err => console.log('Delete FREE Error', err.response));
//             }
//           }
//         ]
//       );
//     } else {
//       // Regular item remove
//       Alert.alert(
//         "Remove Item",
//         "Are you sure you want to remove this item?",
//         [
//           { text: "Cancel", style: "cancel" },
//           { text: "Remove", onPress: () => {
//               axios.delete(`${BASE_URL}cart-service/cart/remove`, {
//                 data: { id: item.cartId },
//               })
//               .then(() => getCartDetails())
//               .catch(err => console.log('Delete Error', err.response));
//             }
//           }
//         ]
//       );
//     }
//   };

//   return (
//     <View style={styles.itemContainer}>
//       <Image source={{ uri: item.image }} style={styles.itemImage} />
//       <View style={styles.itemDetails}>
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//           <Text style={styles.itemName}>{item.itemName}</Text>
//           <TouchableOpacity onPress={handleRemove}>
//             <Ionicons name="trash-outline" size={20} color="red" />
//           </TouchableOpacity>
//         </View>
//         <Text style={styles.itemWeight}>Weight: {item.weight} {item.weight == 1 ? "Kg" : "Kgs"}</Text>
//         <Text style={styles.itemPrice}>Price: ₹{item.totalPrice}</Text>
//         <View style={styles.quantityRow}>
//           <TouchableOpacity onPress={handleDecrement} style={styles.iconButton}>
//             <Text style={styles.iconText}>-</Text>
//           </TouchableOpacity>
//           <Text style={styles.itemQuantity}>{item.cartQuantity}</Text>
//           <TouchableOpacity onPress={handleIncrement} style={styles.iconButton}>
//             <Text style={styles.iconText}>+</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };



//   return (
//     <SafeAreaView style={styles.container}>
//       {cartData && (
//         <>
//           <FlatList
//             data={cartData.customerCartResponseList}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.cartId}
//             contentContainerStyle={styles.listContainer}
//           />
//           <View style={styles.summaryContainer}>
//             <Text style={styles.summaryText}>Total Cart Value: ₹{cartData.totalCartValue}</Text>
//             <Text style={styles.summaryText}>Total GST: ₹{cartData.totalGstAmountToPay}</Text>
//             <Text style={styles.summaryText}>Discounted by Free Items: ₹{cartData.discountedByFreeItems}</Text>
//             <Text style={styles.summaryText}>Amount to Pay: ₹{cartData.amountToPay}</Text>
//             <View style={styles.couponContainer}>
//               <Checkbox
//                 status={couponChecked ? 'checked' : 'unchecked'}
//                 onPress={() => setCouponChecked(!couponChecked)}
//               />
//               <Text style={styles.couponText}>Apply Coupon</Text>
//             </View>
//             {couponChecked && (
//               <TextInput
//                 label="Enter Coupon Code"
//                 value={couponCode}
//                 onChangeText={(text) => setCouponCode(text)}
//                 style={styles.couponInput}
//                 mode="outlined"
//               />
//             )}
//           </View>
//           <View style={styles.payButtonContainer}>
//             <Button
//               mode="contained"
//               onPress={() => console.log('Pay Now', { amount: cartData.amountToPay, coupon: couponCode })}
//               style={styles.payButton}
//             >
//               Pay ₹{cartData?.amountToPay}
//             </Button>
//           </View>
//         </>
//       )}
//     </SafeAreaView>
//   );
// };

// export default Checkout;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   listContainer: {
//     padding: 16,
//     paddingBottom: 150, // Ensure space for fixed button and summary
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 8,
//   },
//   itemImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//     marginRight: 16,
//   },
//   itemDetails: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   itemWeight: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 4,
//   },
//   itemPrice: {
//     fontSize: 14,
//     color: '#000',
//     marginBottom: 4,
//   },
//   itemQuantity: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 4,
//   },
//   quantityRow: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   marginVertical: 8,
// },
// iconButton: {
//   padding: 6,
//   borderWidth: 1,
//   borderColor: '#ccc',
//   borderRadius: 4,
//   marginHorizontal: 8,
// },
// iconText: {
//   fontSize: 18,
// },

//   itemSavings: {
//     fontSize: 14,
//     color: 'green',
//     marginBottom: 4,
//   },
//   itemGst: {
//     fontSize: 14,
//     color: '#555',
//   },
//   summaryContainer: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#f9f9f9',
//   },
//   summaryText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   couponContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   couponText: {
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   couponinput: {
//     marginTop: 8,
//     backgroundColor: '#fff',
//   },
//   payButtonContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//   },
//   payButton: {
//     backgroundColor: '#007AFF',
//   },
// });
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform
} from "react-native";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import BASE_URL from "../../config";
import encryptEas  from "../component/encryptEas";
import  decryptEas  from "../component/decryptEas";

const Checkout = ({ route }) => {
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth?.token);

  // Get route params
  const {
    // cartItems = [],
    grandTotal = 0,
    storeDetails = {},
    customerId,
    storeId,
    nofDaysAfterMeetAgain = 0,
    userCartInfo = null,
    address
  } = route.params || {};

  // States
  const [loading, setLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, ONLINE
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState()
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setGrandTotal] = useState(0);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const[qrCode,setQrCode]=useState('')
  const[qrShowModal,setQrShowModal]=useState(false)
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [transactionId, setTransactionId] = useState();
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("1");
  const [fullAddress, setFullAddress] = useState("");
  const [pinCode, setPinCode] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      // Reset state when screen is focused
      setLoading(false);
      setOrderProcessing(false);
      setDeliveryAddress(route.params?.storeDetails?.address || "");
      setSpecialInstructions("");
      setPaymentMethod("COD");
      setUserInfo(null);
      setCartItems([]);
      setSubtotal(0);
      setDeliveryFee(0);
      setTax(0);
      setGrandTotal(0);
      fetchCartItems();
      fetchUserDetails();

      console.log("route.params", route.params?.storeDetails?.address);
      
      
    if (userCartInfo) {
      setUserInfo(userCartInfo);
    }
    }, [])
  );

  useEffect(() => {
    // Calculate totals when cartItems or userCartInfo changes
    calculateTotals();
  }, [subtotal, deliveryFee, tax, cartItems, userCartInfo]);

  // Fetch additional user details if needed
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // You can add API call here to fetch user details like address, etc.
      // const response = await axios.get(`${BASE_URL}user-service/user/${customerId}`);
      // setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };
const fetchCartItems = async () => {
    if (!storeId) {
      console.warn("No storeId provided, cannot fetch cart items.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}product-service/getStore/${storeId}`);
      // console.log("Cart items fetched:", response.data[0].listItems);
      setCartItems(
                  (response.data[0].listItems || []).filter(
                    item => item.status === '' || item.status === 'OPEN'
                  )
                );
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to fetch cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const calculateTotals = async() => {

    try {
      const response = await axios.post(`${BASE_URL}cart-service/cart/offlineSales`,{
        customerId
      })
      console.log(response.data);
      
      const subtotal = cartItems.reduce((sum, item) => {
        if (!item.offerPrice || !item.qty) {
          console.warn("Item missing offerPrice or qty:", item);
          return 
        }
        // console.log(sum+ (item.offerPrice * item.qty));
        const price = sum + (item.offerPrice * item.qty)
      return price
    }, 0);
      const deliveryFee = subtotal > 500 ? 50.123654 : 0; // Free delivery above ₹500
    const tax = response.data.totalGstSum || 0; // 5% tax
    const total = subtotal + deliveryFee + tax;
      setSubtotal(subtotal);
      setDeliveryFee(deliveryFee);
      setTax(tax);
      setGrandTotal(total);

      console.log("Totals calculated:", { 
        subtotal,
        deliveryFee,
        tax,
        total
      });

    } catch (error) {
      
    }

    
  };

const getAddressFromCoordsGoogle = async (lat, lon) => {
  const apiKey = 'AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M'; // Add your key here

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK') {
      const result = data.results[0];
      const fullAddress = result.formatted_address;

      let pinCode = '';
      result.address_components.forEach(comp => {
        if (comp.types.includes('postal_code')) {
          pinCode = comp.long_name;
        }
      });

      console.log("Full Address:", fullAddress);
      console.log("Pincode:", pinCode);
      setFullAddress(fullAddress);
      setPinCode(pinCode);
      return pinCode
    } else {
      console.log("No results found");
    }
  } catch (error) {
    console.error("Error with Google Geocoding API:", error);
  }
};




  const placeOrder = async () => {
    // if (!deliveryAddress.trim()) {
    //   Alert.alert("Missing Information", "Please enter your delivery address");
    //   return;
    // }
    const GOOGLE_MAPS_API_KEY = "AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M"
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = today.getFullYear();

    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

    let location = null;
    let pinCode = null;

      try {
    const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      deliveryAddress
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const geoResponse = await axios.get(geocodeURL);
    if (
      geoResponse.data.status === "OK" &&
      geoResponse.data.results &&
      geoResponse.data.results.length > 0
    ) {
      location = geoResponse.data.results[0].geometry.location;
      console.log("Coordinates:", location);
     pinCode =  await getAddressFromCoordsGoogle(location.lat, location.lng)


      setCoordinates(location);
    } else {
      console.error("Geocoding failed:", geoResponse.data);
    }


    try {
      setOrderProcessing(true);
      const orderData = 
        {
  "address": deliveryAddress,
  "amount": totalAmount,
  "customerId": customerId,
  "flatNo": "",
  "landMark": "",
  "orderStatus": paymentMethod,
  "pincode": pinCode,
  latitude: location.lat,
  longitude: location.lng,
  "area": "",
  "houseType": "",
  "residenceName": "",
  "walletAmount": 0,
  "couponCode": null,
  "couponValue": "",
  "deliveryBoyFee": deliveryFee,
  "subTotal": subtotal,
  "gstAmount": tax,
  "orderFrom": Platform.OS === "android" ? "ANDROID" : "IOS",
  "dayOfWeek": weekday,
  "expectedDeliveryDate": day + "-" + month + "-" + year,
  "timeSlot": "10:00 AM - 07:00 PM",
  "storeId": storeId
}
      console.log("Placing order with data:", orderData);

      const response = await axios.post(`${BASE_URL}order-service/orderPlacedOfflineStores`, orderData);
      console.log("Order placed successfully:", response);
       if(paymentMethod=="COD"){
          Alert.alert("Order Placed Successfully", "Your order has been placed successfully.", 
            [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Store Details");
              }
            }
          ]
        )
          }else{
            setTransactionId(response.data.paymentId);
            paymentInitiation()
          }
    }
    catch (error) {
      console.error("Error placing order:", error);
      let errorMessage = "Failed to place order. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert("Order Failed", errorMessage);
    }
    finally {
      setOrderProcessing(false);

    }
  } catch (error) { 
    console.error("Geocoding error:", error);
    Alert.alert("Error", "Failed to fetch coordinates. Please try again.");
  }
  };

  useEffect(() => {
    if (
      paymentStatus == "PENDING" ||
      paymentStatus == "" ||
      paymentStatus == null ||
      paymentStatus == "INITIATED"
    ) {
      const data = setInterval(() => {
        Requery(paymentId);
      }, 4000);
      return () => clearInterval(data);
    } else {
    }
  }, [paymentStatus, paymentId]);

const paymentInitiation=()=>{
              const data = {
                mid: "1152305",
                // amount: couponValue==''?cartData?.amountToPay : total,
                amount: 1,
                merchantTransactionId: transactionId,
                transactionDate: new Date(),
                terminalId: "getepay.merchant128638@icici",
                udf1: route.params.storeDetails.mobileNumber,
                udf2: '',
                udf3: '',
                udf4: "",
                udf5: "",
                udf6: "",
                udf7: "",
                udf8: "",
                udf9: "",
                udf10: "",
                ru: "https://app.oxybricks.world/interact/paymentreturn",
                callbackUrl:
                  "https://fintech.oxyloans.com/oxyloans/v1/user/getepay",
                currency: "INR",
                paymentMode: "ALL",
                bankId: "",
                txnType: "single",
                productType: "IPG",
                txnNote: "Rice Order In Live",
                vpa: "Getepay.merchant129014@icici",
              };
              // console.log({ data });
              getepayPortal(data);
            //   GoogleAnalyticsService.purchase(
            //     transactionId,
            //     cartData,
            //     couponValue==''?cartData?.amountToPay : total,
            //     "ONLINE"
            //   );
}


const getepayPortal = async (data) => {
    // console.log("getepayPortal", data);
    const JsonData = JSON.stringify(data);
    // console.log("ytfddd");

    var ciphertext = encryptEas(JsonData);
    var newCipher = ciphertext.toUpperCase();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      mid: data.mid,
      terminalId: data.terminalId,
      req: newCipher,
    });
    // console.log("========");
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    await fetch(
      "https://portal.getepay.in:8443/getepayPortal/pg/generateInvoice",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        //  console.log("===getepayPortal result======")
        //  console.log("result",result);
        var resultobj = JSON.parse(result);
        // console.log(resultobj);
        var responseurl = resultobj.response;
        var data = decryptEas(responseurl);
        // console.log("===getepayPortal data======");
        console.log({data});
        data = JSON.parse(data);
        setPaymentId(data.paymentId);
        // paymentID = data.paymentId
        Alert.alert(
          "Cart Summary",
          `The total amount for your cart is ₹${totalAmount}. Please proceed to checkout to complete your purchase.`,
          [
            {
              text: "No",
              onPress: () => {
                setLoading(false);
              },
            },
            {
              text: "yes",
              onPress: () => {
                setQrCode(data.qrPath);
                setQrShowModal(true)
                Requery(data.paymentId);
                setPaymentStatus(null);
              },
            },
          ]
        );
      })
      .catch((error) => {
        console.log("getepayPortal", error.response);
        setLoading(false);
      });
  };

    function Requery(paymentId) {
    if (
      paymentStatus === "PENDING" ||
      paymentStatus === "" ||
      paymentStatus === null ||
      paymentStatus === "INITIATED"
    ) {
      // console.log("Before.....",paymentId)

      const Config = {
        "Getepay Mid": 1152305,
        "Getepay Terminal Id": "getepay.merchant128638@icici",
        "Getepay Key": "kNnyys8WnsuOXgBlB9/onBZQ0jiYNhh4Wmj2HsrV/wY=",
        "Getepay IV": "L8Q+DeKb+IL65ghKXP1spg==",
      };

      const JsonData = {
        mid: Config["Getepay Mid"],
        paymentId: parseInt(paymentId),
        referenceNo: "",
        status: "",
        terminalId: Config["Getepay Terminal Id"],
        vpa: "",
      };

      var ciphertext = encryptEas(
        JSON.stringify(JsonData),
        Config["Getepay Key"],
        Config["Getepay IV"]
      );

      var newCipher = ciphertext.toUpperCase();

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append(
        "Cookie",
        "AWSALBAPP-0=remove; AWSALBAPP-1=remove; AWSALBAPP-2=remove; AWSALBAPP-3=remove"
      );

      var raw = JSON.stringify({
        mid: Config["Getepay Mid"],
        terminalId: Config["Getepay Terminal Id"],
        req: newCipher,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch(
        "https://portal.getepay.in:8443/getepayPortal/pg/invoiceStatus",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          var resultobj = JSON.parse(result);
          if (resultobj.response != null) {
            // console.log("Requery ID result", paymentId);
            var responseurl = resultobj.response;
            // console.log({ responseurl });
            var data = decryptEas(responseurl);
            data = JSON.parse(data);
            // console.log("Payment Result", data);
            setPaymentStatus(data.paymentStatus);
            // console.log(data.paymentStatus);
            if (
              data.paymentStatus == "SUCCESS" ||
              data.paymentStatus == "FAILED"
            ) {
              // clearInterval(intervalId); 294182409
              if (data.paymentStatus === "SUCCESS") {
                                setQrShowModal(false)

                axios({
                  method: "get",
                  url:
                    BASE_URL +
                    `/order-service/api/download/invoice?paymentId=${transactionId}&&userId=${customerId}`,
                //   headers: {
                //     "Content-Type": "application/json",
                //     Authorization: Bearer ${token},
                //   },
                })
                  .then((response) => {
                    // console.log(response.data);
                  })
                  .catch((error) => {
                    console.error("Error in payment confirmation:", error);
                  });
              }
              axios({
                method: "POST",
                url: BASE_URL + "order-service/orderPlacedPaymet",
                data: {
                //   ...payload,
                  paymentId: transactionId,
                  paymentStatus: data.paymentStatus,
                },
                // headers: {
                //   "Content-Type": "application/json",
                //   Authorization: Bearer ${token},
                // },
              })
                .then((secondResponse) => {
                  console.log(
                    "Order Placed with Payment API:",
                    secondResponse.data
                  );
                 
                  Alert.alert("Order Confirmed!", "Order Placed Successfully");
                })
                .catch((error) => {
                  console.error("Error in payment confirmation:", error.response);
                  setLoading(false);
                });
            } else {
              setLoading(false);
            }
          }
        })
        .catch((error) => {
          console.log("Payment Status", error);
          setLoading(false);
        });
    }
  }

  // Render cart item for checkout
  const renderCheckoutItem = ({ item }) => (
    <View style={styles.checkoutItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.itemName}
        </Text>
        <Text style={styles.itemWeight}>
          {item.weight} {item.units}
        </Text>
        <View style={styles.priceRow}>
          {item.offerPrice ? (
            <>
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              <Text style={styles.offerPrice}>₹{item.offerPrice}</Text>
            </>
          ) : (
            <Text style={styles.price}>₹{item.offerPrice}</Text>
          )}
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>Qty: {item.qty}</Text>
        <Text style={styles.itemTotal}>
          ₹{(item.offerPrice * item.qty).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading checkout details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <FlatList
            data={cartItems}
            renderItem={renderCheckoutItem}
            keyExtractor={(item,index) => index}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={styles.addressInput}
            placeholder="Enter your complete delivery address..."
            placeholderTextColor="#999"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Any special instructions for delivery..."
            placeholderTextColor="#999"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "COD" && styles.selectedPayment,
              ]}
              onPress={() => setPaymentMethod("COD")}
            >
              <MaterialIcons 
                name="money" 
                size={24} 
                color={paymentMethod === "COD" ? "#007AFF" : "#666"} 
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "COD" && styles.selectedPaymentText,
                ]}
              >
                Cash on Delivery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "ONLINE" && styles.selectedPayment,
              ]}
              onPress={() => setPaymentMethod("ONLINE")}
            >
              <MaterialIcons 
                name="payment" 
                size={24} 
                color={paymentMethod === "ONLINE" ? "#007AFF" : "#666"} 
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "ONLINE" && styles.selectedPaymentText,
                ]}
              >
                Online Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meet Again Info */}
        {nofDaysAfterMeetAgain > 0 && (
          <View style={styles.section}>
            <View style={styles.meetAgainInfo}>
              <MaterialIcons name="schedule" size={20} color="#007AFF" />
              <Text style={styles.meetAgainText}>
                Next meeting scheduled after {nofDaysAfterMeetAgain} days
              </Text>
            </View>
          </View>
        )}

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Subtotal{subtotal > 0 ? ` (${cartItems.length} items)` : ""}
              </Text>
              <Text style={styles.priceValue}>₹{subtotal.toFixed(2) || 0}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={[styles.priceValue, deliveryFee === 0 && styles.freeText]}>
                {deliveryFee === "0.00" ? "FREE" : `₹${deliveryFee.toFixed(2) || 0}` }
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (5%)</Text>
              <Text style={styles.priceValue}>₹{tax.toFixed(2) || 0}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toFixed(2) || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalSummary}>
          <Text style={styles.payableLabel}>Total Payable</Text>
          <Text style={styles.payableAmount}>₹{totalAmount.toFixed(2) ||0}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.placeOrderButton, orderProcessing && styles.disabledButton]}
          onPress={placeOrder}
          disabled={orderProcessing}
        >
          {orderProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="shopping-bag" size={20} color="white" />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <Modal
        visible={qrShowModal}
        transparent
        animationType="slide"
        onRequestClose={() => setQrShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setQrShowModal(false)}
          >
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Payment Rs.{totalAmount}</Text>
                <Image source={{uri:qrCode}} style={{ width: 200, height: 200 }} />
          </View>
        </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 16,
  },
  checkoutItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F5F5F5",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  itemWeight: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  quantityContainer: {
    alignItems: "flex-end",
  },
  quantity: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: "#F8F9FA",
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: "#F8F9FA",
  },
  paymentMethods: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  selectedPayment: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  paymentText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#666",
  },
  selectedPaymentText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  meetAgainInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
  },
  meetAgainText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  priceBreakdown: {
    gap: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    width: "70%",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    width: "30%",
    textAlign: "right",
  },
  freeText: {
    color: "#34C759",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D1D1F",
    width: "70%",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
    width: "30%",
    textAlign: "right",
  },
  bottomPadding: {
    height: 120,
  },
  bottomContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  totalSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  payableLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  payableAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#007AFF",
  },
  placeOrderButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 20,
    zIndex: 1,
  },
});

export default Checkout;