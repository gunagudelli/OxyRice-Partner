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
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import BASE_URL from "../../config";

const Checkout = ({ route }) => {
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth?.token);

  // Get route params
  const {
    cartItems = [],
    grandTotal = 0,
    storeDetails = {},
    customerId,
    storeId,
    nofDaysAfterMeetAgain = 0,
    userCartInfo = null,
  } = route.params || {};

  // States
  const [loading, setLoading] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, ONLINE
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    console.log("Checkout Screen mounted with params:", route.params);
    if (userCartInfo) {
      setUserInfo(userCartInfo);
    }
    fetchUserDetails();
  }, []);

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

  // Calculate totals
  const calculateTotals = async() => {
    

    try {
      const response = await axios.post(`${BASE_URL}cart-service/cart/offlineSales`,{
        customerId
      })
      console.log(response.data);
      
      const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.effectivePrice * item.cartQuantity);
    }, 0);
      const deliveryFee = subtotal > 500 ? 0 : 0; // Free delivery above ₹500
    const tax = response.data.totalGstSum; // 5% tax
    const total = subtotal + deliveryFee + tax;

    return {
      subtotal,
      deliveryFee,
      tax,
      total,
    };
    } catch (error) {
      
    }

    
  };

  const totals = calculateTotals();

  // Place Order
  const placeOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert("Missing Information", "Please enter your delivery address");
      return;
    }

    try {
      setOrderProcessing(true);

      const orderData = {
        customerId: customerId || storeDetails.userId,
        storeId: storeId || storeDetails.storeId,
        items: cartItems.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.cartQuantity,
          price: item.effectivePrice,
          originalPrice: item.originalPrice,
          offerPrice: item.offerPrice,
          weight: item.weight,
          units: item.units,
        })),
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        tax: totals.tax,
        grandTotal: totals.total,
        deliveryAddress: deliveryAddress,
        specialInstructions: specialInstructions,
        paymentMethod: paymentMethod,
        nofDaysAfterMeetAgain: nofDaysAfterMeetAgain,
        orderDate: new Date().toISOString(),
      };

      console.log("Placing order with data:", orderData);

      // API call to place order
      const response = await axios.post(
        `${BASE_URL}order-service/orders/place`,
        orderData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log("Order placed successfully:", response.data);

      // Show success message and navigate
      Alert.alert(
        "Order Placed Successfully!",
        `Your order has been placed successfully. Order ID: ${response.data.orderId || 'N/A'}`,
        [
          {
            text: "View Orders",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: "Orders", 
                    params: { 
                      customerId: customerId || storeDetails.userId 
                    }
                  }
                ],
              });
            }
          },
          {
            text: "Continue Shopping",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [
                  { 
                    name: "All Categories",
                    params: { 
                      storeDetails: storeDetails 
                    }
                  }
                ],
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error("Error placing order:", error);
      
      let errorMessage = "Failed to place order. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Order Failed", errorMessage);
    } finally {
      setOrderProcessing(false);
    }
  };

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
              <Text style={styles.offerPrice}>₹{item.effectivePrice}</Text>
            </>
          ) : (
            <Text style={styles.price}>₹{item.effectivePrice}</Text>
          )}
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>Qty: {item.cartQuantity}</Text>
        <Text style={styles.itemTotal}>
          ₹{(item.effectivePrice * item.cartQuantity).toFixed(2)}
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
            keyExtractor={(item) => item.itemId?.toString()}
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
                Subtotal ({cartItems.length} items)
              </Text>
              <Text style={styles.priceValue}>₹{totals.subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={[styles.priceValue, totals.deliveryFee === 0 && styles.freeText]}>
                {totals.deliveryFee === 0 ? "FREE" : `₹${totals.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax (5%)</Text>
              <Text style={styles.priceValue}>₹{totals.tax.toFixed(2)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totals.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalSummary}>
          <Text style={styles.payableLabel}>Total Payable</Text>
          <Text style={styles.payableAmount}>₹{totals.total.toFixed(2)}</Text>
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
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
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
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
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
});

export default Checkout;