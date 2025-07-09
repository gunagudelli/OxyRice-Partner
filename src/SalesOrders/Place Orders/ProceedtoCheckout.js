import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import axios from "axios";
import { Checkbox, TextInput, Button } from "react-native-paper";
import BASE_URL from "../../../config";
import Ionicons from "react-native-vector-icons/Ionicons";
import encryptEas from "../Payments/encryptEas";
import decryptEas from "../Payments/decryptEas";

const { height, width } = Dimensions.get("window");

const ProceedtoCheckout = ({ route, navigation }) => {
  const [cartData, setCartData] = useState(null);
  const [total, setTotal] = useState("");
  const [amountwithoutGst, setAmountWihoutGst] = useState("");
  const [gstValue, setGstValue] = useState("");
  const [couponValue, setCouponValue] = useState("");
  const [couponChecked, setCouponChecked] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [placedLoader, setPlacedLoader] = useState(false);
  const customerId = route.params.MarketDetails?.userId;
  //   const customerId = "939d875f-af3e-4292-b45e-5ade22366428";
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrShowModal, setQrShowModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [transactionId, setTransactionId] = useState();
  const [paymentId, setPaymentId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("1");
  const [loading, setLoading] = useState(false);
  const [useMarketAddress, setUseMarketAddress] = useState("");
  const [addressError, setAddressError] = useState(false);

  const GOOGLE_MAPS_API_KEY = "AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M";

  useEffect(() => {
    console.log("Checkout Routes", route.params.MarketDetails);
    if (route.params.MarketDetails.type == "ONLINE") {
      getCartDetails();
    } else {
      getCartOfflineDetails();
    }
  }, []);

  function getCartDetails() {
    axios({
      method: "get",
      url: `${BASE_URL}cart-service/cart/userCartInfo?customerId=${customerId}`,
    })
      .then(function (response) {
        console.log("userCartInfo", response.data);
        const data = response.data;
        // if (
        //   !data.customerCartResponseList ||
        //   data.customerCartResponseList.length === 0
        // ) {
        //   // Navigate back to AllCategories if cart is empty
        //   navigation.replace("AllCategories", {
        //     customerId: customerId,
        //   });
        // }
        // else {
        setCartData(data);
        setTotal(response.data.amountToPay);
        setAmountWihoutGst(response.data.totalCartValue);
        setGstValue(response.data.totalGstAmountToPay);
        // }
      })
      .catch(function (error) {
        console.log(error.response);
      });
  }
  function getCartOfflineDetails() {
    axios({
      method: "get",
      url: `${BASE_URL}user-service/getUserOfflineCheckout/${customerId}`,
    })
      .then(function (response) {
        console.log("userCartInfo process to checkout", response.data);
        const data = response.data;
        // if (
        //   !data.offlineItems ||
        //   data.offlineItems.length === 0
        // ) {
        //   // Navigate back to AllCategories if cart is empty
        //   navigation.replace("AllCategories", {
        //     customerId: customerId,
        //   });
        // } else {
        setCartData(data);
        setTotal(response.data.overalAmt);
        setAmountWihoutGst(response.data.amtToPay);
        setGstValue(response.data.gstToPay);
        // }
      })
      .catch(function (error) {
        console.log(error.response);
      });
  }

  const handleIncrement = (item) => {
    axios
      .post(`${BASE_URL}cart-service/cart/addAndIncrementCart`, {
        itemId: item.itemId,
        customerId: customerId,
      })
      .then((response) => {
        console.log(response), getCartDetails();
      })
      .catch((err) => console.log("Increment Error", err.response));
  };

  const handleDecrement = (item) => {
    console.log({ item });
    axios
      .patch(`${BASE_URL}cart-service/cart/minusCartItem`, {
        itemId: item.itemId,
        customerId: customerId,
      })
      .then((response) => {
        console.log(response), getCartDetails();
      })
      .catch((err) => console.log("Decrement Error", err));
  };

  const handleRemove = (item) => {
    console.log({ item });
    if (item.status == "FREE") {
      // Confirm delete for FREE item
      Alert.alert(
        "Remove Free Item",
        "Are you sure you want to remove this free item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            onPress: () => {
              axios
                .delete(`${BASE_URL}cart-service/cart/removeFreeContainer`, {
                  data: {
                    id: item.cartId,
                    customerId: customerId,
                    itemId: item.itemId,
                    status: "FREE",
                  },
                })
                .then((response) => {
                  console.log(response.status),
                    Alert.alert(
                      "Free item removed",
                      "FREE item removed successfully from cart"
                    ),
                    getCartDetails();
                })
                .catch((err) => console.log("Delete FREE Error", err.response));
            },
          },
        ]
      );
    } else {
      // Regular item remove
      Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            axios
              .delete(`${BASE_URL}cart-service/cart/remove`, {
                data: { id: item.cartId },
              })
              .then((response) => {
                console.log(response.status);
                Alert.alert(
                  "Remove cart",
                  "Successfully removed item from cart"
                );
                getCartDetails();
              })
              .catch((err) => console.log("remove Error", err.response));
          },
        },
      ]);
    }
  };

  function handleRemoveOfflineItem(item) {
    Alert.alert('Confirmation', 'Are you sure you want to remove this item?', [{
      text: 'No',
      style: 'cancel',
    },
    {
      text: 'Yes',
      onPress: () =>   axios({
      method: "delete",
      url: `${BASE_URL}user-service/deleteOfflineItem/${item.offlineUserItemsId}`,
    })
      .then((response) => {
        console.log("Offline Item Removed:", response.data);
        getCartOfflineDetails();
      })
      .catch((error) => {
        console.error("Error removing offline item:", error);
        Alert.alert("Error", "Failed to remove item. Please try again.");
      }),
    }])
  }

  const applyCouponfunc = () => {
    const requestBody = {
      couponCode: couponCode.toUpperCase(),
      customerId: customerId,
      subTotal: total,
    };
    console.log({ requestBody });
    axios({
      method: "post",
      url: BASE_URL + `order-service/applycoupontocustomer`,
      data: requestBody,
    })
      .then(function (response) {
        console.log(response.data);
        if (response.data.couponApplied == true) {
          Alert.alert("Success", response.data.message);
          setCouponValue(response.data.discount);
          setTotal(response.data.grandTotal);
        } else {
          Alert.alert("Failed", response.data.message);
        }
        getCartDetails();
      })
      .catch(function (error) {
        console.log(error.response);
      });
  };

  const addorminusOfflineItem = async (item, AddOrMinusItem) => {
    console.log(
      "Adding or decrementing offline item with ID:",
      item.itemId,
      ",",
      AddOrMinusItem
    );

    const currentQty = parseInt(item.qty) || 0;
    // console.log("sdngv");
    const newofflineQty =
      AddOrMinusItem === "ADD" ? currentQty + 1 : Math.max(0, currentQty - 1);
    // console.log("djgcj", item.itemId, newofflineQty);

    console.log({ currentQty });
    let data = {
      itemId: item.itemId,
      qty: 1,
      type: AddOrMinusItem,
      userOfflineOrdersId: customerId, // pass from route or state
    };
    axios
      .post(`${BASE_URL}user-service/addOrMinusOfflineItems`, data)
      .then((res) => {
        console.log("Updated:", res);
        Alert.alert("Success", `Item quantity updated successfully!`);
        getCartOfflineDetails();
      })
      .catch((err) => {
        console.error("Error updating offline item:", err);
        Alert.alert(
          "Error",
          "Failed to update item quantity. Please try again."
        );
      });
  };

  const renderItem = ({ item }) => {
    // console.log({item})
    return (
      <>
        {route.params?.MarketDetails.type == "ONLINE" ? (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.itemName}>{item.itemName}</Text>
                <TouchableOpacity onPress={() => handleRemove(item)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemWeight}>
                Weight: {item.weight} {item.weight == 1 ? "Kg" : "Kgs"}
              </Text>
              <Text style={styles.itemPrice}>Price: ₹{item.totalPrice}</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  onPress={() => handleDecrement(item)}
                  style={styles.iconButton}
                >
                  <Text style={styles.iconText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.itemQuantity}>{item.cartQuantity}</Text>
                <TouchableOpacity
                  onPress={() => handleIncrement(item)}
                  style={styles.iconButton}
                >
                  <Text style={styles.iconText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.itemContainer}>
            {/* <Image source={{ uri: item.image }} style={styles.itemImage} /> */}
            <View style={styles.itemDetails}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.itemName}>{item.itemName}</Text>
                <TouchableOpacity onPress={() => handleRemoveOfflineItem(item)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemWeight}>
                Weight: {item.weight} {item.weight == 1 ? "Kg" : "Kgs"}
              </Text>
              <Text style={styles.itemPrice}>Price: ₹{item.price}</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  onPress={() => {
                    route.params.MarketDetails.type == "ONLINE"
                      ? handleDecrement(item)
                      : addorminusOfflineItem(item, "MINUS");
                  }}
                  style={styles.iconButton}
                >
                  <Text style={styles.iconText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.itemQuantity}>Quantity : {item.qty}</Text>
                <TouchableOpacity
                  onPress={() => {
                    route.params.MarketDetails.type == "ONLINE"
                      ? handleIncrement(item)
                      : addorminusOfflineItem(item, "ADD");
                  }}
                  style={styles.iconButton}
                >
                  <Text style={styles.iconText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </>
    );
  };

  var payload;
  const RegisteredUserPaymentfunc = async () => {
    if (!address || address.trim() === "") {
      setAddressError(true);
      return;
    }

    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = today.getFullYear();

    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

    try {
      const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}`;

      const geoResponse = await axios.get(geocodeURL);
      if (
        geoResponse.data.status === "OK" &&
        geoResponse.data.results &&
        geoResponse.data.results.length > 0
      ) {
        const location = geoResponse.data.results[0].geometry.location;
        console.log("Coordinates:", location);
        setCoordinates(location);

        // Now call order placement API
        payload = {
          customerId,
          address,
          paymentMode: selectedPaymentMode,
          latitude: location.lat,
          longitude: location.lng,
          amount: couponValue == "" ? cartData?.amountToPay : total,
          orderStatus: selectedPaymentMode,
          flatNo: "",
          landMark: "",
          pincode: pincode,
          area: "",
          houseType: "",
          residenceName: "",
          walletAmount: 0,
          couponCode: couponCode.toUpperCase(),
          couponValue: couponValue,
          deliveryBoyFee: 0,
          subTotal: amountwithoutGst,
          gstAmount: gstValue,
          orderFrom: "MARKET",
          dayOfWeek: `${weekday}`,
          expectedDeliveryDate: `${day}-${month}-${year}`,
          timeSlot: `10:00 AM - 07:00 PM`,
          freeTicketAvailable: null,
        };

        console.log({ payload });
        setPlacedLoader(true);
        axios
          .post(`${BASE_URL}order-service/orderPlacedPaymet`, payload)
          .then((res) => {
            console.log("Order Placed:", res);
            if (selectedPaymentMode == "COD") {
              Alert.alert("Order Placed", "Order Placed Successfully!", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("Place Order"),
                },
              ]);
                setPlacedLoader(false);
            } else {
              setTransactionId(res.data.paymentId);
              paymentInitiation();
            }
            //   setPaymentModalVisible(false);
          })
          .catch((err) => {
            setPlacedLoader(false);
            console.log("Order Placement Error:", err);
            Alert.alert("Order failed", "Something went wrong");
          });
      } else {
        setPlacedLoader(false);
        Alert.alert("Unable to fetch location", "Please check the address");
      }
    } catch (error) {
        setPlacedLoader(false);
      console.log("Geocode API Error:", error || error);
      Alert.alert("Error", "Failed to get coordinates");
    }
  };

  const OfflineUserPaymentfunc = () => {
    if (selectedPaymentMode == "COD") {
      var data = {
        paidAmount: cartData?.overalAmt - couponValue,
        paymentType: selectedPaymentMode == "COD" ? "COD" : "ONLINE",
          totalGst: gstValue,
          totalPrice: cartData?.overalAmt - couponValue,
          totalQty: cartData?.totalCount,
        userOfflineOrdersId: customerId,
      };
    } else {
      var data = {
        paymentType: "ONLINE",
        userOfflineOrdersId: customerId,
      };
    }
        setPlacedLoader(true)

    console.log({ data });
    axios({
      method: "post",
      url: `${BASE_URL}user-service/offlinePayments`,
      data: data,
    })
      .then((response) => {
        console.log("response", response.data);
        if (selectedPaymentMode == "COD") {
          Alert.alert("Order Placed", "Order Placed Successfully!", [
            {
              text: "OK",
              onPress: () => navigation.navigate("Place Order"),
            },
          ]);
          setPlacedLoader(false)
        } else {
          setTransactionId(response.data);
          paymentInitiation();
        }
      })
      .catch((error) => {
        console.log("Error in Offline Payment:", error.response);
        setPlacedLoader(false)
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

  const paymentInitiation = () => {
    setPlacedLoader(true)
    const data = {
      mid: "1152305",
      // amount: couponValue==''?cartData?.amountToPay : total,
      amount: 1,
      merchantTransactionId: transactionId,
      transactionDate: new Date(),
      terminalId: "getepay.merchant128638@icici",
      udf1: route.params.MarketDetails.mobileNumber,
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
  };

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
        console.log({ data });
        data = JSON.parse(data);
        setPaymentId(data.paymentId);
        // paymentID = data.paymentId
        Alert.alert(
          "Cart Summary",
          `The total amount for your cart is ₹${
            route.params.MarketDetails.type == "ONLINE"
                ? cartData?.amountToPay - couponValue
                : cartData?.overalAmt - couponValue}. Please proceed to checkout to complete your purchase.`,
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
                setQrShowModal(true);
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
                setQrShowModal(false);

                // axios({
                //   method: "get",
                //   url:
                //     BASE_URL +
                //     `order-service/api/download/invoice?paymentId=${transactionId}&&userId=${customerId}`,
                //   //   headers: {
                //   //     "Content-Type": "application/json",
                //   //     Authorization: `Bearer ${token}`,
                //   //   },
                // })
                //   .then((response) => {
                //     // console.log(response.data);
                //   })
                //   .catch((error) => {
                //     console.error("Error in payment confirmation:", error);
                //   });
              }
              if (route.params.MarketDetails.type == "ONLINE") {
                var requestBody = {
                  //   ...payload,
                  paymentId: transactionId,
                  paymentStatus: data.paymentStatus,
                };
              } else {
                var requestBody = {
                  paymentId: transactionId,
                  paymentStatus: "SUCCESS",
                  paidAmount: cartData?.overalAmt - couponValue,
                  paymentType: selectedPaymentMode == "COD" ? "CASH" : "ONLINE",
                  totalGst: gstValue,
                  totalPrice: cartData?.overalAmt - couponValue,
                  totalQty: cartData?.totalCount,
                  userOfflineOrdersId: customerId,
                };
              }
              axios({
                method: "POST",
                url:
                  route.params.MarketDetails.type == "ONLINE"
                    ? BASE_URL + "order-service/orderPlacedPaymet"
                    : BASE_URL + `user-service/offlinePayments`,
                data: requestBody,
                // headers: {
                //   "Content-Type": "application/json",
                //   Authorization: `Bearer ${token}`,
                // },
              })
                .then((secondResponse) => {
                  console.log(
                    "Order Placed with Payment API:",
                    secondResponse.data
                  );
                  setPlacedLoader(false)
                  Alert.alert("Order Confirmed!", "Order Placed Successfully", [
                    {
                      text: "OK",
                      onPress: () => navigation.navigate("Place Order"),
                    },
                  ]);
                })
                .catch((error) => {
                  console.error(
                    "Error in payment confirmation:",
                    error.response
                  );
                  setLoading(false);
                });
            } else {
                          setPlacedLoader(false)

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.couponBox}>
        <View style={styles.couponContainer}>
          <Checkbox
            status={couponChecked ? "checked" : "unchecked"}
            onPress={() => setCouponChecked(!couponChecked)}
          />
          <Text style={styles.couponText}>Apply Coupon</Text>
        </View>
        {couponChecked && (
          <View style={styles.couponContainer}>
            {couponValue == 0 ? (
              <>
                <TextInput
                  label="Enter Coupon Code"
                  value={couponCode}
                  onChangeText={(text) => setCouponCode(text)}
                  style={styles.couponInput}
                  //   textTransform="capitalize"
                  mode="outlined"
                  dense={true}
                />
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: "#0384d5" }]}
                  onPress={() => applyCouponfunc()}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text
                  style={{
                    width: width * 0.65,
                    fontSize: 18,
                    color: "green",
                    fontWeight: "bold",
                  }}
                >
                  🥳🎉Coupon Applied Successfully
                </Text>
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: "red" }]}
                  onPress={() => setCouponValue(0)}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {cartData && (
        <>
          <FlatList
            data={
              route.params.MarketDetails.type == "ONLINE"
                ? cartData.customerCartResponseList
                : cartData.offlineItems
            }
            renderItem={renderItem}
            keyExtractor={(item) => item.cartId}
            contentContainerStyle={styles.listContainer}
          />
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Total Cart Value: ₹
              {route.params.MarketDetails.type == "ONLINE"
                ? cartData.totalCartValue
                : cartData.amtToPay}
            </Text>
            <Text style={styles.summaryText}>
              Total GST: ₹
              {route.params.MarketDetails.type == "ONLINE"
                ? cartData.totalGstAmountToPay
                : cartData.gstToPay}
            </Text>

            <Text style={styles.summaryText}>
              Discounted by Free Items: ₹{cartData.discountedByFreeItems>0? cartData.discountedByFreeItems :0}
            </Text>

            {couponValue > 0 ? (
              <Text style={styles.summaryText}>
                Coupon Value ₹{couponValue}
              </Text>
            ) : null}

            <Text style={styles.summaryText}>
              Amount to Pay: ₹
              {route.params.MarketDetails.type == "ONLINE"
                ? cartData?.amountToPay - couponValue
                : cartData?.overalAmt - couponValue}
            </Text>
          </View>
          <View style={styles.payButtonContainer}>
            <Button
              mode="contained"
              //   onPress={() =>
              //     console.log("Pay Now", {
              //       amount: cartData.amountToPay,
              //       coupon: couponCode,
              //     })
              //   }
              onPress={() => setPaymentModalVisible(true)}
              style={styles.payButton}
            >
              Pay ₹
              {route.params.MarketDetails.type == "ONLINE"
                ? cartData?.amountToPay - couponValue
                : cartData?.overalAmt - couponValue}
            </Button>
          </View>
        </>
      )}

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Address & Payment</Text>

            {/* <TextInput
              label="Enter Address"
              value={address}
              onChangeText={(text) => setAddress(text)}
              style={styles.input}
              // textTransform="capitalize"
              mode="outlined"
              numberOfLines={5}
              multiline
              dense={true}
            /> */}

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              label="Enter Address"
              value={address}
              onChangeText={(text) => {
                setAddress(text), setAddressError(false);
              }}
              // editable={!useMarketAddress}
              multiline
              mode="outlined"
              numberOfLines={4}
              dense={true}
            />
            {addressError == true && (
              <Text style={styles.errorText}>Address is mandatory</Text>
            )}

            <View
              style={{
                marginTop: 10,
                alignSelf: "flex-start",
                paddingLeft: 10,
              }}
            >
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  const checked = !useMarketAddress;
                  setUseMarketAddress(checked);
                  if (checked) {
                    setAddress(route.params.MarketDetails.address);
                  } else {
                    setAddress("");
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={
                    useMarketAddress
                      ? "checkbox-marked"
                      : "checkbox-blank-outline"
                  }
                  size={24}
                  color="#2A6B57"
                />
                <Text style={{ marginLeft: 8 }}>Save as Market Address</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              label="Enter Pincode"
              value={pincode}
              onChangeText={(number) => setPincode(number)}
              style={styles.input}
              keyboardType="number"
              mode="outlined"
              dense={true}
              maxLength={6}
            />

            {/* <Text >Select Payment Method</Text> */}
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMode === "ONLINE" && styles.selectedOption,
                ]}
                onPress={() => setSelectedPaymentMode("ONLINE")}
              >
                <Text style={styles.optionText}>Online</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentMode === "COD" && styles.selectedOption,
                ]}
                onPress={() => setSelectedPaymentMode("COD")}
              >
                <Text style={styles.optionText}>CASH</Text>
              </TouchableOpacity>
            </View>

            {placedLoader == false ? (
              <>
                <Pressable
                  onPress={() => {
                    setPaymentModalVisible(false);
                    {
                      route.params.MarketDetails.type == "ONLINE"
                        ? RegisteredUserPaymentfunc()
                        : OfflineUserPaymentfunc();
                    }
                    // console.log("Pay Now:", {
                    //   mode: selectedPaymentMode,
                    //   amount: cartData?.amountToPay,
                    // });
                  }}
                  style={styles.modalPayButton}
                >
                  <Text style={styles.payButtonText}>
                    Pay ₹
                    {route.params.MarketDetails.type == "ONLINE"
                      ? cartData?.amountToPay - couponValue
                      : cartData?.overalAmt - couponValue}
                  </Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.modalPayButton}>
                <Text style={styles.payButtonText}>
                  Pay ₹{couponValue == "" ? cartData?.amountToPay : total}{" "}
                  <ActivityIndicator size="small" color="#fff" />
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={qrShowModal}
        transparent
        animationType="slide"
        onRequestClose={() => setQrShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Payment Rs.{couponValue == "" ? cartData?.amountToPay : total}
            </Text>
            <Image
              source={{ uri: qrCode }}
              style={{ width: 200, height: 200 }}
            />
            {/* <Text style={}>Rs.{couponValue==''?cartData?.amountToPay : total}</Text> */}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProceedtoCheckout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 150, // Ensure space for fixed button and summary
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemWeight: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemPrice: {
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  iconText: {
    fontSize: 18,
  },

  itemSavings: {
    fontSize: 14,
    color: "green",
    marginBottom: 4,
  },
  itemGst: {
    fontSize: 14,
    color: "#555",
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    marginBottom: height / 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 8,
  },
  couponBox: {
    backgroundColor: "#c0c0c0",
    width: width * 0.9,
    padding: 10,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
  },
  couponContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8, // Optional: for spacing between input and button
  },

  couponInput: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    width: width * 0.65,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    flex: 1,
  },
  toggleButtonActive: {
    backgroundColor: "#2A6B57",
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
  },
  toggleTextActive: {
    color: "#fff",
  },
  applyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    // backgroundColor: "#007AFF",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  payButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  payButton: {
    backgroundColor: "#007AFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  paymentOption: {
    width: width * 0.3,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    margin: 6,
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#E6F0FF",
  },
  optionText: {
    fontSize: 16,
  },
  modalPayButton: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
