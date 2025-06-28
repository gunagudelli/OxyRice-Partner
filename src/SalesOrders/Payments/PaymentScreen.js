import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Linking,
  Image,
  Alert,
  TextInput,
  Dimensions,
  ScrollView,
  Platform,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import axios from "axios";
import { useSelector } from "react-redux";
import { RadioButton, Checkbox, ActivityIndicator } from "react-native-paper";
import encryptEas from "../../../Screens/View/Payments/components/encryptEas";
import decryptEas from "../../../Screens/View/Payments/components/decryptEas";
import { COLORS } from "../../../../Redux/constants/theme";
import BASE_URL, { userStage } from "../../../../Config";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import DeliveryTimelineModal from "./DeliveryModal";
import GoogleAnalyticsService from "../../../Components/GoogleAnalytic";
import RadioGroup from "react-native-radio-buttons-group";
import TimeSlotModal from "./TimeSlotModal ";
import {
  handleCustomerCartData,
  handleGetProfileData,
  handleUserAddorIncrementCart,
  handleDecrementorRemovalCart,
  handleRemoveItem,
  handleRemoveFreeItem,
} from "../../../../src/ApiService";
const { width, height } = Dimensions.get("window");

const PaymentDetails = ({ navigation, route }) => {
  console.log("payment screen", route.params.addressData);
  // "totalGstSum": 0, "totalSum": 1295, "totalSumWithGstSum": 1295,

  const userData = useSelector((state) => state.counter);
  const token = userData.accessToken;
  const customerId = userData.userId;
  const [transactionId, setTransactionId] = useState();
  const [couponCode, setCouponCode] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("1");
  const [grandTotal, setGrandTotal] = useState("");
  const [coupenDetails, setCoupenDetails] = useState("");
  const [coupenApplied, setCoupenApplied] = useState(false);
  const [walletTotal, setWalletTotal] = useState("");
  const [deliveryBoyFee, setDeliveryBoyFee] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [totalSum, setTotalSum] = useState("");
  const [walletAmount, setWalletAmount] = useState();
  const [status, setStatus] = useState();
  const [totalGstSum, setTotalGstSum] = useState();
  const [grandTotalAmount, setGrandTotalAmount] = useState();
  const [subTotal, setSubTotal] = useState();
  const [message, setMessge] = useState();
  const [cartData, setCartData] = useState();
  const [usedWalletAmount, setUsedWalletAmount] = useState();
  const [afterWallet, setAfterWallet] = useState();
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayName, setSelectedDayName] = useState("");
  const [days, setDays] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date());
  const [updatedDate, setUpdatedate] = useState();
 const [freeItemsDiscount,setFreeItemsDiscount] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [slotsData, setSlotsData] = useState();
  const [onlyOneKg, setOnlyOneKg] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [gstAmount,setGstAmount] = useState("");
  const [itemsGstAmount, setItemsGstAmount] = useState("");
  const [goldMakingCost,setGoldMakingCost]  = useState("");
  const [goldGstAmount,setGoldGstAmont] =useState("");
   const [coupons, setCoupons] = React.useState([]);
  const [profileForm, setProfileForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const items = route.params?.items || [];
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [offeravailable, setOfferAvailable] = useState();
  const [showCOD, setShowCOD] = useState(false);


 
  
const copyToClipboard = async(couponCode, discountAmount) => {
  console.log("Copying coupon code:", couponCode);
  
  await Clipboard.setStringAsync(couponCode);


 Alert.alert(
    '🎉 Success!', 
    `💰 You will save ₹${discountAmount}! 💰\n\n✨ Coupon copied to clipboard `,
    [{ text: 'Got it! ✅' }]
  );
  setCouponCode(couponCode);
};


  const applyCouponDirectly = (couponCode) => {
    setCouponCode(couponCode);
    handleApplyCoupon();
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}order-service/fetchTimeSlotlist`
      );
      const data = response.data;
      console.log({ data });

      setSlotsData(data);
      let updatedOrderDate = new Date();
      updatedOrderDate.setDate(updatedOrderDate.getDate() + 1);
      setOrderDate(updatedOrderDate);

      const tomorrowDate = updatedOrderDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");

      console.log("New Date (Updatedate):", tomorrowDate);

      const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(updatedOrderDate);
        date.setDate(updatedOrderDate.getDate() + i);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${date.getFullYear()}`;
        return {
          dayOfWeek: date
            .toLocaleDateString("en-GB", { weekday: "long" })
            .toUpperCase(),
          formattedDate: formattedDate,
        };
      });

      console.log("Next seven days:", nextSevenDays);

      // Fixed the filter condition - changed isAvailable === false to isAvailable === true
      const availableDays = nextSevenDays
        .filter((day) => {
          const matchedDay = data.find((d) => d.dayOfWeek === day.dayOfWeek);
          return matchedDay && matchedDay.isAvailable === false;
        })
        .slice(0, 3);

      console.log("Filtered available days:", availableDays);

      const transformedDays = availableDays.map((day) => ({
        label: `${day.dayOfWeek} (${day.formattedDate})`,
        value: day.dayOfWeek,
        formattedDate: day.formattedDate,
      }));

      console.log("Transformed days:", transformedDays);
      setDays(transformedDays);

      if (Platform.OS === "ios") {
        setSelectedDay(transformedDays[0]?.value);
        const selectedDayData = transformedDays.find(
          (d) =>
            d.value?.trim()?.toUpperCase() ===
            selectedDay?.trim()?.toUpperCase()
        );

        console.log({ selectedDayData });

        if (selectedDayData) {
          const fullDayData = slotsData.find(
            (d) =>
              d.dayOfWeek.trim().toUpperCase() ===
              selectedDay.trim().toUpperCase()
          );

          if (fullDayData) {
            setSelectedDate(selectedDayData.formattedDate || "");
            setUpdatedate(selectedDayData?.formattedDate);

            console.log("Matching Slot:", fullDayData);

            const timeSlots = [
              { time: fullDayData.timeSlot1, status: fullDayData.slot1Status },
              { time: fullDayData.timeSlot2, status: fullDayData.slot2Status },
              { time: fullDayData.timeSlot3, status: fullDayData.slot3Status },
              { time: fullDayData.timeSlot4, status: fullDayData.slot4Status },
            ];

            // Filter for available slots only (status === false)
            // Assuming false means available and true means unavailable/booked
            const availableTimeStrings = timeSlots
              .filter((slot) => slot.time && !slot.status)
              .map((slot) => slot.time);

            // Remove duplicates
            const uniqueAvailableTimes = [...new Set(availableTimeStrings)];

            console.log("Available Times:", uniqueAvailableTimes);

            // Set only array of time strings
            setTimeSlots(uniqueAvailableTimes);
            setSelectedTimeSlot(uniqueAvailableTimes[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const checkOfferEligibility = async (customerId) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}order-service/freeContainerBasedOnUserId?userId=${customerId}`
      );

      const hasInterested = data.some(
        (item) => item.freeContainer === "Interested"
      );

      // setShowButtons(!hasInterested);
    } catch (error) {
      console.error(
        "Error fetching offer details:",
        error?.response?.status,
        error?.response?.data
      );
      // setShowButtons(true);
    }
  };

   const handleGetPaymentMethod = async () => {
      console.log("into payment method");
  
      try {
        const response = await axios.get(
          BASE_URL + `order-service/getCodAndOnlinePaymetStatus`
        );
        console.log("Payment method response", response.data);
        const data = response.data;
        const paymentMethods = data.filter((item) => item.status === true);
        console.log("Payment methods", paymentMethods);
        setPaymentMethods(paymentMethods);
      } catch (error) {
        console.log("Error fetching payment methods", error);
      }
    };

  const handleTimeSlotChange = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleOfferResponse = async (orderId, userId, userResponse) => {
    try {
      setLoading(true);

      const requestBody = {
        freeContainer: userResponse,
        orderId: orderId,
        userId: customerId,
      };

      console.log(" free Request Body:", requestBody);

      const API_URL = `${BASE_URL}order-service/freeContainer`;

      const response = await axios.post(API_URL, requestBody, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("API Response:", response);

      console.log(response);
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong!"
      );
    } finally {
      Alert.alert(
        "Thank You!",
        "Your interest has been successfully registered.",
        [
          {
            text: "OK",
            onPress: () => {
              setLoading(false);
              navigation.navigate("My Orders");
            },
          },
        ]
      );
    }
  };

  const handleDayChange = (selectedDay) => {
    setSelectedDay(selectedDay);
    console.log("selectedDay", selectedDay);
    console.log("Days array before filtering:", days);
    console.log(
      "Available Days:",
      days.map((d) => `${d.value}`)
    );
    console.log("Selected Day:", `${selectedDay}`);

    // Improved day matching by normalizing case and trimming
    const selectedDayData = days.find(
      (d) =>
        d.value?.trim()?.toUpperCase() === selectedDay?.trim()?.toUpperCase()
    );

    console.log({ selectedDayData });

    if (selectedDayData) {
      const fullDayData = slotsData.find(
        (d) =>
          d.dayOfWeek.trim().toUpperCase() === selectedDay.trim().toUpperCase()
      );

      if (fullDayData) {
        setSelectedDate(selectedDayData.formattedDate || "");
        setUpdatedate(selectedDayData?.formattedDate);

        console.log("Matching Slot:", fullDayData);

        const timeSlots = [
          { time: fullDayData.timeSlot1, status: fullDayData.slot1Status },
          { time: fullDayData.timeSlot2, status: fullDayData.slot2Status },
          { time: fullDayData.timeSlot3, status: fullDayData.slot3Status },
          { time: fullDayData.timeSlot4, status: fullDayData.slot4Status },
        ];

        // Filter for available slots only (status === false)
        // Assuming false means available and true means unavailable/booked
        const availableTimeStrings = timeSlots
          .filter((slot) => slot.time && !slot.status)
          .map((slot) => slot.time);

        // Remove duplicates
        const uniqueAvailableTimes = [...new Set(availableTimeStrings)];

        console.log("Available Times:", uniqueAvailableTimes);

        // Set only array of time strings
        setTimeSlots(uniqueAvailableTimes);
      } else {
        setTimeSlots([]);
      }
    } else {
      setTimeSlots([]);
    }
  };

  const totalCart = async () => {
    console.log("into total cart function");
    
    try {
     
        const response = await handleCustomerCartData(customerId);
        console.log("cart response", response.data);
     
      const cartResponse = response.data?.customerCartResponseList;
      const onlyOneKg = items.every((item) => item.weight === 1);
      

      setCartData(cartResponse);
      const totalDeliveryFee = response.data?.customerCartResponseList.reduce(
        (sum, item) => sum + item.deliveryBoyFee,
        0
      );
        const itemsGst = cartResponse.reduce((sum, item) => {
       if ((item?.goldGst || 0) === 0) {
        return sum + (item?.gstAmount || 0);
       }
       return sum;
       }, 0);
       setItemsGstAmount(itemsGst)
      const totalGoldGst = cartResponse.reduce((sum, item) => sum + (item?.goldGst || 0), 0);
      setGoldGstAmont(totalGoldGst)
     const totalGoldMakingCost = cartResponse.reduce((sum, item) => sum + (item?.goldMakingCost || 0), 0);
      setGoldMakingCost(totalGoldMakingCost);

      console.log("gst amount to pay",response.data.totalGstAmountToPay);
      const totalGstAmountToPay = response.data?.totalGstAmountToPay
      setFreeItemsDiscount(response.data?.discountedByFreeItems || 0);
      setTotalGstSum(response.data?.totalGstAmountToPay);
      setDeliveryBoyFee(totalDeliveryFee);
      const amountToPay = Number(response.data?.amountToPay || 0);
      const gst = Number(totalGstAmountToPay || 0);
      setGrandTotal(amountToPay + gst);
      // setGrandTotal(response.data?.amountToPay + totalGstAmountToPay);
      // setOfferAvailable(response.data.offerElgible);
    } catch (error) {
      // setError("Failed to fetch cart data");
    }
  };

  var addressDetails = route.params.addressData;

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("ONLINE");

  var calculatedTotal;
  useEffect(() => {
    calculatedTotal = items.reduce(
      (total, item) => total + item.cartQuantity * item.itemPrice,
      0
    );
    console.log(
      "grand total",
      items.reduce(
        (total, item) => total + item.cartQuantity * item.itemPrice,
        0
      )
    );
    setSubTotal(calculatedTotal);
    grandTotalfunc();
  }, [items]);

  const handlePaymentModeSelect = (mode) => {
    setSelectedPaymentMode(mode);
    // console.log({ mode });
  };

  const deleteCoupen = () => {
    setCouponCode("");
    setCoupenApplied(false);

    Alert.alert("coupen removed successfully");
  };

  const confirmPayment = () => {
    // if(selez
    if (selectedTimeSlot == null || selectedTimeSlot == "") {
      Alert.alert("Please select time slot to proceed");
    } else if (selectedPaymentMode == null || selectedPaymentMode == "") {
      Alert.alert("Please select payment method");
      return;
    } else {
      handleOrderConfirmation();
    }
  };

  const validateCartBeforeCheckout = (cartItems, navigation) => {
    let insufficientStockItems = [];

    cartItems.forEach((item) => {
      if (item.cartItemQuantity > item.quantity) {
        insufficientStockItems.push(
          `${item.itemName}: Only ${item.quantity} left, but you added ${item.cartItemQuantity}`
        );
      }
    });

    if (insufficientStockItems.length > 0) {
      Alert.alert(
        "Insufficient Stock",
        "Some items in your cart have insufficient stock:\n" +
          insufficientStockItems.join("\n"),
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Home", { screen: "My Cart" });
            },
          },
        ]
      );
      return false;
    }

    return true;
  };

  const handleOrderConfirmation = () => {
    if (!cartData || cartData.length === 0) {
      return;
    }
    if (grandTotalAmount == 0) {
      setSelectedPaymentMode("COD");
    }
    const zeroQuantityItems = cartData
      .filter((item) => item.quantity === 0)
      .map((item) => item.itemName);

    if (zeroQuantityItems.length > 0) {
      const itemNames = zeroQuantityItems.join(", ");
      Alert.alert(
        "Sorry for the inconvenience",
        `We noticed that the following items in your cart have zero quantity: ${itemNames}. 
      
         Please update or remove them before proceeding with your order.`,
        [{ onPress: () => navigation.navigate("Home", { screen: "My Cart" }) }]
      );
      return;
    } else if (!validateCartBeforeCheckout(cartData)) {
      return;
    } else {
      placeOrder();
    }
  };

  useEffect(() => {
    getProfile();
    getOffers();
    getWalletAmount();
    totalCart();
    fetchTimeSlots();
    checkOfferEligibility(customerId);
    handleGetPaymentMethod();
    // setDeliveryBoyFee(200);
  }, [grandTotalAmount, deliveryBoyFee,totalGstSum]);

  const getWalletAmount = async () => {
    try {
      const response = await axios.post(
        BASE_URL + `order-service/applyWalletAmountToCustomer`,
        {
          customerId: customerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setWalletAmount(response.data.usableWalletAmountForOrder);
        setMessge(response.data.message);
        setTotalSum(response.data.totalSum);
        setStatus();
        setWalletTotal(grandTotal - response.data.usableWalletAmountForOrder);
      }
    } catch (error) {
      console.error(
        "Error applying wallet amount:",
        error.response?.data || error.message
      );
    }
  };

  const handleCheckboxToggle = () => {
    const newValue = !useWallet;

    setUseWallet(newValue);
    getWalletAmount();

    if (newValue) {
      Alert.alert(
        "Wallet Amount Used",
        `You are using ${walletAmount} from your wallet.`,
        [
          {
            text: "OK",
          },
        ]
      );
    } else {
      Alert.alert(
        "Wallet Amount Deselected",
        `You have removed the usage of ${walletAmount} from your wallet.`,
        [
          {
            text: "OK",
          },
        ]
      );
    }
  };

  const getProfile = async () => {
    try {
      const response = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        url:
          BASE_URL +
          `user-service/customerProfileDetails?customerId=${customerId}`,
      });
      // console.log(response.data);

      if (response.status === 200) {
        setProfileForm({
          customer_name: response.data.name,
          customer_email: response.data.email,
          customer_mobile: response.data.mobileNumber,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  var postData;

  const placeOrder = () => {
    if (loading == true) {
      return;
    }
    if (!isChecked) {
      Alert.alert(
        "Confirmation Required",
        "Please confirm that the exchange can be taken within 10 days after delivery."
      );
      return;
    }

    let wallet;
    if (useWallet) {
      wallet = walletAmount;
    } else {
      wallet = null;
    }
    let coupon, coupenAmount;
    if (coupenApplied && coupenDetails > 0) {
      coupon = couponCode.toUpperCase();
      coupenAmount = coupenDetails;
    } else {
      coupon = null;
      coupenAmount = 0;
    }

    console.log(addressDetails);

    // const avail = offeravailable === "YES" ? "YES" : null;

    postData = {
      address: addressDetails.address,
      amount: grandTotalAmount,
      customerId: customerId,
      flatNo: addressDetails.flatNo,
      landMark: addressDetails.landMark,
      orderStatus: selectedPaymentMode,
      pincode: addressDetails.pincode,
      latitude: addressDetails.latitude ?? 0,
      longitude: addressDetails.longitude ?? 0,
      area: addressDetails?.area || "",
      houseType: addressDetails?.houseType || "",
      residenceName: addressDetails?.residenceName || "",
      walletAmount: usedWalletAmount,
      couponCode: coupon,
      couponValue: coupenDetails,
      deliveryBoyFee: deliveryBoyFee,
      subTotal: subTotal,
      gstAmount: totalGstSum,
      orderFrom: Platform.OS,
      dayOfWeek: selectedDay,
      expectedDeliveryDate: updatedDate,
      timeSlot: selectedTimeSlot,
      latitude: addressDetails.latitude ?? 0,
      longitude: addressDetails.longitude ?? 0,
      freeTicketAvailable: null,
    };

    console.log({ postData });
    console.log("postdata", postData);

    setLoading(true);
    console.log({ postData });

    axios({
      method: "POST",
      url: BASE_URL + "order-service/orderPlacedPaymet",
      data: postData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("Order Placed with Payment API:", response);
        console.log("order id after placing the order", response.data.orderId);
        setOrderId(response.data.orderId);
        // if (response.data.status) {
        //   Alert.alert(
        //     "Sorry",
        //     response.data.status,
        //     [
        //       {
        //         text: "OK",
        //         onPress: () => navigation.navigate("Home",{screen:"My Cart"}),
        //       },
        //     ]
        //   );
        //   return;
        // }
        if (response.data.status) {
          const message = response.data.status;

          if (message === "Item not found or out of stock. Order not placed.") {
            Alert.alert("Out of Stock", message, [
              {
                text: "OK",
                onPress: () =>
                  navigation.navigate("Home", { screen: "My Cart" }),
              },
            ]);
          } else if (
            message ===
            "We noticed that this offer has already been used at this address. To help you move forward, it’s been removed from the cart."
          ) {
            Alert.alert(
              "Alert", 
              message, 
              [
                {
                  text: "OK",
                  onPress: () => {},
                },
              ]
            );
            setLoading(false);
          } else {
            Alert.alert("Notice", message, [
              {
                text: "OK",
                onPress: () => {},
              },
            ]);
          }

          return;
        }

        if (selectedPaymentMode === null || selectedPaymentMode === "COD") {
          const message = showButtons
            ? "🎉 Special Offer: Free Rice Container! 🎉\n\n" +
              "Buy 9 bags of 26kg / 10kg in 3 years OR refer 9 friends. " +
              "When they buy their first bag, the container is yours forever.\n\n" +
              "* No purchase in 45 days OR a 45-day gap between purchases = Container will be taken back."
            : "Your order has been placed successfully. Thank you for shopping with us!";

          const buttons = showButtons
            ? [
                {
                  text: "Interested",
                  onPress: () =>
                    handleOfferResponse(
                      response.data.orderId,
                      customerId,
                      "Interested"
                    ),
                },
                {
                  text: "Not Interested",
                  onPress: () =>
                    handleOfferResponse(
                      response.data.orderId,
                      customerId,
                      "Not Interested"
                    ),
                  style: "cancel",
                },
              ]
            : [
                {
                  text: "OK",
                  onPress: () => {
                    setLoading(false);
                    navigation.navigate("My Orders");
                  },
                },
              ];

          Alert.alert("Order Confirmed!", message, buttons);
        } else {
          setTransactionId(response.data.paymentId);

          const data = {
            mid: "1152305",
            amount: grandTotalAmount,
            // amount: 1,
            merchantTransactionId: response.data.paymentId,
            transactionDate: new Date(),
            terminalId: "getepay.merchant128638@icici",
            udf1: profileForm.customer_mobile,
            udf2: profileForm.customer_name,
            udf3: profileForm.customer_email,
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
          GoogleAnalyticsService.purchase(
            response.data.paymentId,
            cartData,
            grandTotalAmount,
            "ONLINE"
          );
        }
      })
      .catch((error) => {
        console.error("Order Placement Error:", error);
        Alert.alert("Error", error.response.data.error);
        setLoading(false);
      });
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
        // console.log(data);
        data = JSON.parse(data);
        setPaymentId(data.paymentId);
        // paymentID = data.paymentId
        Alert.alert(
          "Cart Summary",
          `The total amount for your cart is ₹${grandTotalAmount.toFixed(
            2
          )}. Please proceed to checkout to complete your purchase.`,
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
                Linking.openURL(data.qrIntent);
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

   const getOffers = async () => {
     console.log("Fetching offers for customerId:", customerId);
     setLoading(true);
     console.log("BASE_URL", BASE_URL);
 
     try {
       const response = await axios.get(
         BASE_URL + "order-service/getAllCoupons",
       );
       console.log("Response from getAllCoupons:", response);
 
       if (response && response.data) {
         console.log("Offers fetched successfully", response);
         // Filter only active coupons
        const activeCoupons = response.data.filter(
       (coupon) => coupon.isActive === true && coupon.status === "PUBLIC"
        );
        setCoupons(activeCoupons);
       setLoading(false);
       }
     } catch (error) {
       console.log("Error fetching coupons:", error);
       setLoading(false);
     }
   };

  const handleApplyCoupon = () => {
    const data = {
      couponCode: couponCode.toUpperCase(),
      customerId: customerId,
      subTotal: subTotal,
    };

     axios
      .post(BASE_URL + "order-service/applycoupontocustomer", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        // console.log("coupen applied", response.data);
        const { discount, grandTotal } = response.data;

        setCoupenDetails(discount);
        Alert.alert(response.data.message);
        setCoupenApplied(response.data.couponApplied);
      })
      .catch((error) => {
        console.log("error", error.response);
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
            console.log("Payment Result", data);
            setPaymentStatus(data.paymentStatus);
            console.log(data.paymentStatus);
            if (
              data.paymentStatus == "SUCCESS" ||
              data.paymentStatus == "FAILED"
            ) {
              // clearInterval(intervalId); 294182409
              if (data.paymentStatus === "SUCCESS") {
                axios({
                  method: "get",
                  url:
                    BASE_URL +
                    `/order-service/api/download/invoice?paymentId=${transactionId}&&userId=${customerId}`,
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                })
                  .then((response) => {
                    console.log(response.data);
                  })
                  .catch((error) => {
                    console.error("Error in payment confirmation:", error);
                  });
              }
              axios({
                method: "POST",
                url: BASE_URL + "order-service/orderPlacedPaymet",
                data: {
                  ...postData,
                  paymentId: transactionId,
                  paymentStatus: data.paymentStatus,
                },
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              })
                .then((secondResponse) => {
                  console.log(
                    "Order Placed with Payment API:",
                    secondResponse.data
                  );
                  const message = showButtons
                    ? "🎉 Special Offer: Free Rice Container! 🎉\n\n" +
                      "Buy 9 bags of 26kg / 10kg in 3 years OR refer 9 friends. " +
                      "When they buy their first bag, the container is yours forever.\n\n" +
                      "* No purchase in 45 days OR a 45-day gap between purchases = Container will be taken back."
                    : "Your order has been placed successfully. Thank you for shopping with us!";

                  const buttons = showButtons
                    ? [
                        {
                          text: "Interested",
                          onPress: () =>
                            handleOfferResponse(
                              secondResponse.data.orderId,
                              customerId,
                              "Interested"
                            ),
                        },
                        {
                          text: "Not Interested",
                          onPress: () =>
                            handleOfferResponse(
                              secondResponse.data.orderId,
                              customerId,
                              "Not Interested"
                            ),
                          style: "cancel",
                        },
                      ]
                    : [
                        {
                          text: "OK",
                          onPress: () => {
                            setLoading(false);
                            navigation.navigate("My Orders");
                          },
                        },
                      ];

                  Alert.alert("Order Confirmed!", message, buttons);
                })
                .catch((error) => {
                  console.error("Error in payment confirmation:", error);
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

  function grandTotalfunc() {
    let total = grandTotal + deliveryBoyFee;
    let usedWallet = 0;

    if (coupenApplied) {
      total -= coupenDetails;
    }

    if (useWallet && walletAmount > 0) {
      if (walletAmount >= total) {
        usedWallet = total; // Use only what's needed
        total = 0;
      } else {
        usedWallet = walletAmount; // Use full wallet balance
        total -= walletAmount;
      }
    }

    // Ensure total is never negative
    total = Math.max(0, total);

    setAfterWallet(walletAmount ? walletAmount - usedWallet : 0); // Update remaining wallet balance
    setUsedWalletAmount(usedWallet); // Store how much wallet is used
    setGrandTotalAmount(total);

    if (total === 0) {
      // console.log("Get all Values",{total});
      // setSelectedPaymentMode('COD');
    }

    // console.log("Used Wallet:", usedWallet);
    // console.log("Final Grand Total:", total);
  }

  useEffect(() => {
    grandTotalfunc();
  }, [
    coupenApplied,
    useWallet,
    grandTotalAmount,
    grandTotal,
    deliveryBoyFee,
    totalGstSum,
  ]);

  return (
    <View style={styles.container}>
      {/* Apply Coupon Section */}
      <ScrollView
        keyboardShouldPersistTaps="always"
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {coupons.length > 0 && (
        <View style={styles.activeCouponsCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
     
        <Text style={styles.cardHeader}>Available Coupons</Text>
       
      </View>
      
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={true}
        style={styles.couponsScrollView}
        // persistentScrollbar={true}
      >
        {coupons.map((coupon, index) => (
          <View key={index} style={styles.couponItem}>
            <View style={styles.couponContent}>
              <Text style={styles.couponCode}>{coupon.couponCode}</Text>
             
            </View>
            
            <View style={styles.couponActions}>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => copyToClipboard(coupon.couponCode,coupon.maxDiscount)}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
              
            
            </View>
          </View>
        ))}
      </ScrollView>
    </View>)}
    
        <View style={styles.card}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.cardHeader}>Apply Coupon</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter coupon code"
              value={couponCode}
              onChangeText={setCouponCode}
              editable={!coupenApplied}
            />
            {coupenApplied == true ? (
              <TouchableOpacity
                style={styles.delete}
                onPress={() => deleteCoupen()}
              >
                <Text
                  style={{
                    color: "#fd7e14",
                    fontSize: 15,
                    fontStyle: "normal",
                    fontWeight: "bold",
                  }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => handleApplyCoupon()}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* wallet amount */}
        {walletAmount > 0 ? (
          <View style={styles.walletContainer}>
            <View style={styles.walletHeader}>
              <Checkbox
                status={useWallet ? "checked" : "unchecked"}
                onPress={handleCheckboxToggle}
                color="#00bfff"
                uncheckedColor="#ccc"
              />
              <Text style={styles.checkboxLabel}>Use Wallet Balance</Text>
            </View>
            <Text style={styles.walletMessage}>
              You can use up to{" "}
              <Text style={styles.highlight}>₹{walletAmount}</Text> from your
              wallet for this order.
            </Text>
          </View>
        ) : (
          <View style={styles.wallet}>
            <Text style={styles.label}>Note:</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
        )}

      

        {Platform.OS === "android" && (
          <Text style={styles.headering}>
            Please select date and time slot :{" "}
          </Text>
        )}

        {Platform.OS === "ios" ? (
          <View
            style={styles.selectButton}
          >
            <Text style={[styles.selectButtonText, { marginBottom: 10 }]}>
              Your order will be delivered on:
            </Text>
            <Text style={styles.selectButtonText}>
              {!selectedDay && !selectedTimeSlot
                ? "Select Date & Time"
                : `${updatedDate} (${selectedDay}), ${selectedTimeSlot}`}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalVisible(true)}
            >
              {!selectedDay && !selectedTimeSlot ? (
                <Text style={styles.selectButtonText}>Select Date & Time</Text>
              ) : (
                <View>
                  <Text style={[styles.selectButtonText, { marginBottom: 4 }]}>
                    Your order will be delivered on:
                  </Text>
                  <Text style={styles.selectButtonText}>
                    {`${updatedDate} (${selectedDay}), ${selectedTimeSlot}`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
           )}
        <TimeSlotModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          days={days}
          timeSlots={timeSlots}
          selectedDay={selectedDay}
          selectedTimeSlot={selectedTimeSlot}
          onDayChange={handleDayChange}
          onTimeSlotChange={handleTimeSlotChange}
          onConfirm={() => {
            setModalVisible(false);
          }}
        />
        {/* Payment Methods */}
        <View
          style={[
            styles.paymentMethodContainer,
            { marginTop: 20, marginBottom: 20 },
          ]}
        >
          <Text style={styles.paymentHeader}>Choose Payment Method</Text>
         

          {paymentMethods.some(
                      (method) =>
                        method.paymentStatus === "ONLINE" && method.status === true
                    ) && (
                      <TouchableOpacity
                        style={[
                          styles.paymentOption,
                          selectedPaymentMode === "ONLINE" && styles.selectedOption,
                        ]}
                        onPress={() => handlePaymentModeSelect("ONLINE")}
                      >
                        <FontAwesome5
                          name="credit-card"
                          size={24}
                          color={
                            selectedPaymentMode === "ONLINE"
                              ? COLORS.backgroundcolour
                              : "black"
                          }
                        />
                        <Text style={styles.optionText}>Online Payment</Text>
                      </TouchableOpacity>
                    )}

          {grandTotalAmount > 100 && (
            <View>
              <TouchableOpacity
                style={styles.otherOptionContainer}
                onPress={() => setShowCOD(!showCOD)}
              >
                <View style={styles.otherOptionTextContainer}>
                  <Text style={styles.otherOptionText}>Other</Text>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={24}
                    color="black"
                    style={styles.otherOptionIcon}
                  />
                </View>
              </TouchableOpacity>
              <View>
                {showCOD &&  paymentMethods.some(
                              (method) =>
                                method.paymentStatus === "COD" && method.status === true
                            ) && (
                              <TouchableOpacity
                                style={[
                                  styles.paymentOption,
                                  selectedPaymentMode === "COD" && styles.selectedOption,
                                ]}
                                onPress={() => handlePaymentModeSelect("COD")}
                              >
                                <MaterialIcons
                                  name="delivery-dining"
                                  size={24}
                                  color={
                                    selectedPaymentMode === "COD"
                                      ? COLORS.backgroundcolour
                                      : "black"
                                  }
                                />
                                <Text style={styles.optionText}>Cash on Delivery</Text>
                              </TouchableOpacity>
                            )} 
                  
              </View>
            </View>
          )} 
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetails}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsChecked(!isChecked)}
          >
            <Ionicons
              name={isChecked ? "checkbox" : "square-outline"}
              size={24}
              color={isChecked ? "green" : "gray"}
            />
            <Text style={styles.label1}>
              You can request an exchange within{" "}
              <Text
                style={[
                  styles.label1,
                  { fontWeight: "bold", textTransform: "capitalize" },
                ]}
              >
                10 days
              </Text>{" "}
              of your order being delivered.
            </Text>
          </TouchableOpacity>
          <Text style={styles.detailsHeader}>Payment Details</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabel}>Sub Total</Text>
            <Text style={styles.detailsValue}>₹{subTotal}</Text>
          </View>
          {freeItemsDiscount!==0 && (
             <View style={styles.paymentRow}>
              <Text style={styles.detailsLabel}>Discount</Text>
              <Text style={styles.detailsValue}>-₹{freeItemsDiscount}</Text>
            </View>
          )}
          {coupenApplied == true && (
            <View style={styles.paymentRow}>
              <Text style={styles.detailsLabel}>Coupon Applied</Text>
              <Text style={styles.detailsValue}>-₹{coupenDetails}</Text>
            </View>
          )}
          {useWallet == true && (
            <View style={styles.paymentRow}>
              <Text style={styles.detailsLabel}>from Wallet</Text>
              <Text style={styles.detailsValue}>-₹{usedWalletAmount}</Text>
            </View>
          )}
          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabel}>Delivery Fee</Text>
            <Text style={styles.detailsValue}>+₹{deliveryBoyFee}</Text>
          </View>
            {/* {itemsGstAmount > 0 &&(
                  <View style={styles.paymentRow}>
                  <Text style={styles.detailsLabel}>Items GST:</Text>
                  <Text style={styles.detailsValue}>+ ₹{itemsGstAmount?.toFixed(2)}</Text>
                </View>
              )}
              {goldGstAmount > 0 &&(
                <View style={styles.paymentRow}>
                  <Text style={styles.detailsLabel}>Gold GST:</Text>
                  <Text style={styles.detailsValue}>+ ₹{goldGstAmount?.toFixed(2)}</Text>
                </View>
              )}
              {goldMakingCost > 0 && (
                <View style={styles.paymentRow}>
                  <Text style={styles.detailsLabel}>Gold Making Cost:</Text>
                  <Text style={styles.detailsValue}>+ ₹{goldMakingCost?.toFixed(2)}</Text>
                </View>
              )} */}

          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabel}>GST</Text>
            <Text style={styles.detailsValue}>
              +₹{Number((totalGstSum || 0.0).toFixed(2))}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.paymentRow}>
            <Text style={styles.detailsLabelBold}>Grand Total</Text>
            <Text style={styles.detailsValueBold}>
              ₹{Number(grandTotalAmount || 0).toFixed(2)}
            </Text>
          </View>

          {loading == true ? (
            <View style={styles.confirmButton}>
              <ActivityIndicator size="small" color="white" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmPayment}
            >
              <Text style={styles.confirmText}>Confirm Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      <DeliveryTimelineModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  orderDetails: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
  },
  itemName: { fontSize: 16, fontWeight: "bold" },
  itemQuantity: { fontSize: 14, color: "#555" },
  itemPrice: { fontSize: 16, fontWeight: "bold" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 8,
  },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "green" },
  paymentHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  
  paymentOption: {
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: width * 0.8,
    backgroundColor: "#c0c0c0",
    borderRadius: 10,
    // width: 180,
    height: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
  },
  selectedOption: { borderColor: COLORS.services, backgroundColor: "#e6f7ff" },
  optionText: {
    fontSize: 16,
    marginTop: 8,
    width: 150,
    textAlign: "center",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: COLORS.title,
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
  },
  card: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 7,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: COLORS.title,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  paymentHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  selectedOption: {
    borderColor: COLORS.services,
    borderWidth: 2,
  },
  paymentDetails: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  detailsLabel: {
    fontSize: 16,
    color: "#555",
  },
  detailsLabelBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  detailsValue: {
    fontSize: 16,
    color: "#555",
  },
  detailsValueBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.services,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  couponDetails: {
    flexDirection: "row",
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.backgroundcolour,
    borderRadius: 8,
  },
  couponText: {
    fontSize: 16,
    color: "#333",
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  delete: {
    marginLeft: 20,
    marginRight: 30,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  detailsContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  wallet: {
    padding: 16,
    margin: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    marginLeft: 10,
  },
  message: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  walletContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 10,
    color: "#333",
  },
  walletMessage: {
    fontSize: 12,
    color: "#000",
  },
  highlight: {
    color: COLORS.services,
    fontWeight: "bold",
  },
  container1: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: width * 1,
    alignSelf: "center",
  },

  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonActive: {
    backgroundColor: "#28a745",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginBottom: 15,
    // overflow: "hidden",
    width: width * 0.8,
    alignSelf: "center",
    paddingLeft: 20,
  },

  picker: {
    height: 50,
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  closeButton: {
    textAlign: "center",
    padding: 10,
    fontSize: 18,
    color: "blue",
  },
  label1: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    marginLeft: 18,
  },
  otherOptionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: width * 0.8,
    paddingHorizontal: 10,
    marginLeft: 5,
  },
  otherOptionTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    justifyContent: "space-between",
    width: width * 0.7,
  },
  otherOptionIcon: {
    fontSize: 24,
    color: "#333",
    alignSelf: "flex-end",
  },
  otherOptionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  paymentMethodContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: width * 0.9,
    alignSelf: "center",
  },
  radioGroupContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 10,
  },

  radioButtonLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 8,
  },
  container1: {
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  selectButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
  },
  selectButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  headering: {
    fontSize: 16,
    fontWeight: "bold",
    // marginBottom: 5,
    // color: "#333",
    marginTop: 10,
    marginLeft: 10,
  },
   activeCouponsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  availableCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  couponsScrollView: {
    marginTop: 12,
    // height: 140,
    
  },
  
  couponItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  
  couponContent: {
    marginBottom: 10,
  },
  
  couponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  couponDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  
  couponExpiry: {
    fontSize: 10,
    color: '#999',
  },
  
  couponActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  copyButton: {
    backgroundColor: COLORS.services,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 0.45,
    alignItems: 'center',
  },
  
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  useButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flex: 0.45,
    alignItems: 'center',
  },
  
  useButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PaymentDetails;
