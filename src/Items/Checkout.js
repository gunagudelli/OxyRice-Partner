
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
  Platform,
} from "react-native";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import BASE_URL from "../../config";
import encryptEas from "../component/encryptEas";
import decryptEas from "../component/decryptEas";

const Checkout = ({ route }) => {
  const navigation = useNavigation();
  const token = useSelector((state) => state.auth?.token);
  console.log(route.params);
  

  // Get route params with proper defaults
  const {
    grandTotal = 0,
    storeDetails = {},
    customerId,
    storeId,
    nofDaysAfterMeetAgain = 0,
    userCartInfo = null,
    address,
  } = route.params || {};

  // States
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [calculatingTotals, setCalculatingTotals] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setGrandTotal] = useState(0);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrShowModal, setQrShowModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("1");
  const [fullAddress, setFullAddress] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = "AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M";

  useFocusEffect(
    React.useCallback(() => {
      // Reset state when screen is focused
      setLoading(true);
      setOrderProcessing(false);
      setCalculatingTotals(false);
      setDeliveryAddress(route.params?.storeDetails?.address || "");
      setSpecialInstructions("");
      setPaymentMethod("COD");
      setUserInfo(null);
      setCartItems([]);
      setSubtotal(0);
      setDeliveryFee(0);
      setTax(0);
      setGrandTotal(0);
      setPaymentStatus("1");
      setTransactionId("");
      setPaymentId(null);

      // Initialize data
      initializeCheckoutData();
      fetchCartData();
      console.log("route.params", route.params);

      if (userCartInfo) {
        setUserInfo(userCartInfo);
      }
    }, [route.params])
  );

  const fetchCartData = async () => {
    console.log("into the fetch cart dataaaaaaa");
    
    // const customerId = route.params?.userId;
    console.log("Fetching cart data for customerId:", customerId);
    if (!customerId) return;
    
    try {
      const res = await axios.get(
        `${BASE_URL}cart-service/cart/customersCartItems`,
        {
          params: { customerId },
        }
      );
      console.log("cart response",res);
      
      const cartItems = res.data;
      console.log("Cart Items:", cartItems);
     
    } catch (error) {
      console.error("Error fetching cart data:", error);
     
    }
  };
  // Initialize checkout data
  const initializeCheckoutData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCartItems(), fetchUserDetails()]);
    } catch (error) {
      console.error("Error initializing checkout data:", error);
      Alert.alert("Error", "Failed to load checkout data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      calculateTotals();
    } else if (!loading) {
      setSubtotal(0);
      setDeliveryFee(0);
      setTax(0);
      setGrandTotal(0);
      setCalculatingTotals(false);
    }
  }, [cartItems]);

  useEffect(() => {
    let intervalId;
    if (
      paymentId &&
      (paymentStatus === "PENDING" ||
        paymentStatus === "" ||
        paymentStatus === null ||
        paymentStatus === "INITIATED")
    ) {
      intervalId = setInterval(() => {
        Requery(paymentId);
      }, 4000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentStatus, paymentId]);

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      // Add your user details API call here if needed
      console.log("Fetching user details for customerId:", customerId);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!storeId) {
      console.warn("No storeId provided, cannot fetch cart items.");
      return;
    }

    try {
      console.log("Fetching cart items for storeId:", storeId);

      const response = await axios.get(
        `${BASE_URL}product-service/getStore/${storeId}`
      );

      console.log("Store response:", response.data);

      // Safely access listItems from response
      const items = (response.data[0]?.listItems || []).filter(
        (item) => item.status === "" || item.status === "OPEN"
      );

      console.log("Filtered cart items:", items);

      setCartItems(items); // Update state
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to fetch cart items. Please try again.");
    }
  };

  // Calculate totals
  const calculateTotals = async () => {
    try {
      setCalculatingTotals(true);
      console.log("Calculating totals for items:", cartItems);

      // Calculate subtotal from cart items
      const itemSubtotal = cartItems.reduce((sum, item) => {
        if (!item.offerPrice || !item.qty) {
          console.warn("Item missing offerPrice or qty:", item);
          return sum;
        }
        return sum + parseFloat(item.offerPrice) * parseInt(item.qty);
      }, 0);

      console.log("Item subtotal calculated:", itemSubtotal);

      // Get tax information from API
      let taxAmount = 0;
      if (customerId && itemSubtotal > 0) {
        try {
          const response = await axios.post(
            `${BASE_URL}cart-service/cart/offlineSales`,
            {
              customerId,
            }
          );
          taxAmount = response.data?.totalGstSum || 0;
          console.log("Tax from API:", taxAmount);
        } catch (error) {
          console.error("Error fetching tax info:", error);
          taxAmount = itemSubtotal * 0.05; // Fallback to 5% tax
          console.log("Using fallback tax:", taxAmount);
        }
      } else {
        taxAmount = itemSubtotal * 0.05; // 5% tax fallback
        console.log("Using default tax calculation:", taxAmount);
      }

      const calculatedDeliveryFee = itemSubtotal > 500 ? 0 : 50;
      const total = itemSubtotal + calculatedDeliveryFee + taxAmount;

      setSubtotal(itemSubtotal);
      setDeliveryFee(calculatedDeliveryFee);
      setTax(taxAmount);
      setGrandTotal(total);

      console.log("Totals calculated:", {
        subtotal: itemSubtotal,
        deliveryFee: calculatedDeliveryFee,
        tax: taxAmount,
        total,
      });
    } catch (error) {
      console.error("Error calculating totals:", error);
      Alert.alert("Error", "Failed to calculate totals. Please refresh.");
    } finally {
      setCalculatingTotals(false);
    }
  };

  // Get address from coordinates using Google Geocoding API
  const getAddressFromCoordsGoogle = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        const fullAddress = result.formatted_address;

        let pinCode = "";
        result.address_components.forEach((comp) => {
          if (comp.types.includes("postal_code")) {
            pinCode = comp.long_name;
          }
        });

        setFullAddress(fullAddress);
        setPinCode(pinCode);

        return pinCode;
      } else {
        console.log("No results found for reverse geocoding");
        return "";
      }
    } catch (error) {
      console.error("Error with Google Geocoding API:", error);
      return "";
    }
  };

  // Helper function to proceed without location
  const proceedWithoutLocation = async () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

    // Use fallback coordinates (you can use store coordinates or 0,0)
    const fallbackLocation = { lat: 0, lng: 0 };
    await proceedWithOrder(fallbackLocation, "", day, month, year, weekday);
  };

  // Helper function to handle order placement
  const proceedWithOrder = async (
    location,
    pinCode,
    day,
    month,
    year,
    weekday
  ) => {
    try {
      const orderData = {
        address: deliveryAddress,
        amount: totalAmount,
        customerId: customerId,
        flatNo: "",
        landMark: specialInstructions,
        orderStatus: paymentMethod,
        pincode: pinCode || "",
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        area: "",
        houseType: "",
        residenceName: "",
        walletAmount: 0,
        couponCode: null,
        couponValue: "",
        deliveryBoyFee: deliveryFee,
        subTotal: subtotal,
        gstAmount: tax,
        orderFrom: Platform.OS === "android" ? "ANDROID" : "IOS",
        dayOfWeek: weekday,
        expectedDeliveryDate: day + "-" + month + "-" + year,
        timeSlot: "10:00 AM - 07:00 PM",
        storeId: storeId,
      };

      console.log("Placing order with data:", orderData);

      const response = await axios.post(
        `${BASE_URL}order-service/orderPlacedOfflineStores`,
        orderData
      );

      console.log("Order placed successfully:", response.data);

      if (paymentMethod === "COD") {
        Alert.alert(
          "Order Placed Successfully",
          "Your order has been placed successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Store Details");
              },
            },
          ]
        );
      } else {
        setTransactionId(response.data.paymentId);
        paymentInitiation();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      let errorMessage = "Failed to place order. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert("Order Failed", errorMessage);
    }
  };

  // Main place order function
  const placeOrder = async () => {
    // Validate delivery address
    if (!deliveryAddress.trim()) {
      Alert.alert("Missing Information", "Please enter your delivery address");
      return;
    }

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before placing an order"
      );
      return;
    }

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

    let location = null;
    let pinCode = null;

    try {
      setOrderProcessing(true);

      // Try to geocode the address
      const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        deliveryAddress
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      console.log("Geocoding address:", deliveryAddress);

      const geoResponse = await axios.get(geocodeURL);
      console.log("Geocoding response status:", geoResponse.data.status);

      if (
        geoResponse.data.status === "OK" &&
        geoResponse.data.results &&
        geoResponse.data.results.length > 0
      ) {
        location = geoResponse.data.results[0].geometry.location;
        console.log("Coordinates found:", location);

        // Get pincode from coordinates
        pinCode = await getAddressFromCoordsGoogle(location.lat, location.lng);
        setCoordinates(location);

        // Proceed with order placement
        await proceedWithOrder(location, pinCode, day, month, year, weekday);
      } else {
        console.warn("Geocoding failed:", geoResponse.data);

        // Handle geocoding failure - give user options
        Alert.alert(
          "Address Not Found",
          "We couldn't find the exact location for this address. Would you like to continue without precise location data?",
          [
            {
              text: "Fix Address",
              style: "cancel",
            },
            {
              text: "Continue Anyway",
              onPress: () => proceedWithoutLocation(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error in placeOrder:", error);
      Alert.alert(
        "Error",
        "An error occurred while processing your order. Please try again."
      );
    } finally {
      setOrderProcessing(false);
    }
  };

  // Payment initiation
  const paymentInitiation = () => {
    const data = {
      mid: "1152305",
      amount: Math.max(1, totalAmount), // Ensure minimum amount of 1
      merchantTransactionId: transactionId,
      transactionDate: new Date(),
      terminalId: "getepay.merchant128638@icici",
      udf1: storeDetails?.mobileNumber || "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
      udf6: "",
      udf7: "",
      udf8: "",
      udf9: "",
      udf10: "",
      ru: "https://app.oxybricks.world/interact/paymentreturn",
      callbackUrl: "https://fintech.oxyloans.com/oxyloans/v1/user/getepay",
      currency: "INR",
      paymentMode: "ALL",
      bankId: "",
      txnType: "single",
      productType: "IPG",
      txnNote: "Order Payment",
      vpa: "Getepay.merchant129014@icici",
    };

    console.log("Initiating payment with data:", data);
    getepayPortal(data);
  };

  // Getepay portal integration
  const getepayPortal = async (data) => {
    try {
      const JsonData = JSON.stringify(data);
      var ciphertext = encryptEas(JsonData);
      var newCipher = ciphertext.toUpperCase();

      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        mid: data.mid,
        terminalId: data.terminalId,
        req: newCipher,
      });

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      const response = await fetch(
        "https://portal.getepay.in:8443/getepayPortal/pg/generateInvoice",
        requestOptions
      );

      const result = await response.text();
      console.log("Payment portal response:", result);

      var resultobj = JSON.parse(result);
      var responseurl = resultobj.response;
      var decryptedData = decryptEas(responseurl);
      console.log("Decrypted payment data:", decryptedData);

      const paymentData = JSON.parse(decryptedData);
      setPaymentId(paymentData.paymentId);

      Alert.alert(
        "Payment Required",
        `Please complete the payment of ₹${totalAmount.toFixed(
          2
        )} to proceed with your order.`,
        [
          {
            text: "Cancel",
            onPress: () => {
              setOrderProcessing(false);
            },
            style: "cancel",
          },
          {
            text: "Pay Now",
            onPress: () => {
              setQrCode(paymentData.qrPath);
              setQrShowModal(true);
              setPaymentStatus("INITIATED");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Payment portal error:", error);
      setOrderProcessing(false);
      Alert.alert(
        "Payment Error",
        "Failed to initiate payment. Please try again."
      );
    }
  };
  const navigateToAllCategories = () => {
  //  navigation.navigate("All Categories", {
  //     storeDetails: route.params?.storeDetails,
  //   });
  navigation.navigate("Categories",{
    storeDetails: storeDetails,
      storeId: storeDetails.storeId,
      customerId: storeDetails.userId,
  });
  };

  // Payment status requery
  function Requery(paymentId) {
    if (
      paymentStatus === "PENDING" ||
      paymentStatus === "" ||
      paymentStatus === null ||
      paymentStatus === "INITIATED"
    ) {
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
            var responseurl = resultobj.response;
            var data = decryptEas(responseurl);
            data = JSON.parse(data);
            console.log("Payment status result:", data);

            setPaymentStatus(data.paymentStatus);

            if (
              data.paymentStatus === "SUCCESS" ||
              data.paymentStatus === "FAILED"
            ) {
              if (data.paymentStatus === "SUCCESS") {
                setQrShowModal(false);

                // Download invoice
                axios({
                  method: "get",
                  url: `${BASE_URL}order-service/api/download/invoice?paymentId=${transactionId}&userId=${customerId}`,
                })
                  .then((response) => {
                    console.log("Invoice downloaded:", response.data);
                  })
                  .catch((error) => {
                    console.error("Error downloading invoice:", error);
                  });
              }

              // Update payment status
              axios({
                method: "POST",
                url: BASE_URL + "order-service/orderPlacedPaymet",
                data: {
                  paymentId: transactionId,
                  paymentStatus: data.paymentStatus,
                },
              })
                .then((secondResponse) => {
                  console.log("Payment status updated:", secondResponse.data);

                  const message =
                    data.paymentStatus === "SUCCESS"
                      ? "Order Placed Successfully!"
                      : "Payment Failed. Please try again.";

                  Alert.alert(
                    data.paymentStatus === "SUCCESS"
                      ? "Success"
                      : "Payment Failed",
                    message,
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          if (data.paymentStatus === "SUCCESS") {
                            navigation.navigate("Store Details");
                          }
                        },
                      },
                    ]
                  );
                })
                .catch((error) => {
                  console.error("Error updating payment status:", error);
                });
            }
          }
        })
        .catch((error) => {
          console.error("Payment status check error:", error);
        });
    }
  }

  // Render cart item for checkout
  const renderCheckoutItem = ({ item, index }) => (
    <View style={styles.checkoutItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.itemName || "Product Name"}
        </Text>
        <Text style={styles.itemWeight}>
          {item.weight || "1"} {item.units || "unit"}
        </Text>
        <View style={styles.priceRowItem}>
          {item.originalPrice && item.originalPrice !== item.offerPrice ? (
            <>
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              <Text style={styles.offerPrice}>₹{item.offerPrice}</Text>
            </>
          ) : (
            <Text style={styles.price}>₹{item.offerPrice || 0}</Text>
          )}
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantity}>Qty: {item.qty || 1}</Text>
        <Text style={styles.itemTotal}>
          ₹{((item.offerPrice || 0) * (item.qty || 1)).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  // Show loading screen when fetching initial data
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading checkout details...</Text>
        <Text style={styles.loadingSubText}>
          Fetching cart items and calculating totals
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Item</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.orderSummaryHeader}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {/* <TouchableOpacity
              style={styles.addItemButton}
              onPress={navigateToAllCategories}
            >
              <MaterialIcons name="add" size={20} color="#007AFF" />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity> */}
          </View>
          {cartItems.length > 0 ? (
            <FlatList
              data={cartItems}
              renderItem={renderCheckoutItem}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyCartContainer}>
              <MaterialIcons name="shopping-cart" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No items in cart</Text>
              <Text style={styles.emptySubText}>
                Tap "Add Item" to browse products
              </Text>
            </View>
          )}
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
          <Text style={styles.sectionTitle}>
            Special Instructions (Optional)
          </Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            {calculatingTotals && (
              <ActivityIndicator size="small" color="#007AFF" />
            )}
          </View>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Subtotal
                {cartItems.length > 0 ? ` (${cartItems.length} items)` : ""}
              </Text>
              <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text
                style={[
                  styles.priceValue,
                  deliveryFee === 0 && styles.freeText,
                ]}
              >
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax & Fees</Text>
              <Text style={styles.priceValue}>₹{tax.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalSummary}>
          <Text style={styles.payableLabel}>Total Payable</Text>
          <Text style={styles.payableAmount}>₹{totalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (orderProcessing || calculatingTotals) && styles.disabledButton,
          ]}
          onPress={placeOrder}
          disabled={
            orderProcessing || cartItems.length === 0 || calculatingTotals
          }
        >
          {orderProcessing ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.placeOrderText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.placeOrderText}>
              {cartItems.length === 0 ? "Cart is Empty" : "Place Order"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Code Modal */}
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
            <Text style={styles.modalTitle}>
              Payment ₹{totalAmount.toFixed(2)}
            </Text>
            <Text style={styles.modalSubtitle}>Scan QR code to pay</Text>
            {qrCode ? (
              <Image source={{ uri: qrCode }} style={styles.qrImage} />
            ) : (
              <ActivityIndicator size="large" color="#007AFF" />
            )}
            <Text style={styles.modalNote}>
              Payment status will be updated automatically
            </Text>
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
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginTop: 16,
    textAlign: "center",
  },
  loadingSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    paddingTop: Platform.OS === "ios" ? 50 : 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  checkoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  itemWeight: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceRowItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  quantityContainer: {
    alignItems: "flex-end",
    minWidth: 80,
  },
  quantity: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1D1D1F",
    backgroundColor: "#FFFFFF",
    minHeight: 80,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: "#E5E5E7",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1D1D1F",
    backgroundColor: "#FFFFFF",
    minHeight: 60,
  },
  paymentMethods: {
    flexDirection: "column",
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E5E5E7",
  },
  selectedPayment: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginLeft: 12,
  },
  selectedPaymentText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  meetAgainInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  meetAgainText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  priceBreakdown: {
    paddingTop: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1D1D1F",
  },
  freeText: {
    color: "#34C759",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E7",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  bottomPadding: {
    height: 100,
  },
  bottomContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  totalSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  payableLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  payableAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  placeOrderButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#999",
    shadowOpacity: 0,
    elevation: 0,
  },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCloseButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "90%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  orderSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  addItemText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  modalNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
});
export default Checkout;
