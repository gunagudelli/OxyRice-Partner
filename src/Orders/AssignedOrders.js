import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Pressable,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../config";
import { useFocusEffect } from "@react-navigation/native";
const { height, width } = Dimensions.get("window");
import { useSelector } from "react-redux";
import ModalDropdown from "react-native-modal-dropdown";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { Dropdown } from "react-native-element-dropdown";

const NewOrders = ({ navigation, route }) => {
  const accessToken = useSelector((state) => state.counter);
  //const { BASE_URL, userStage } = config(); // Get values

  const { isTestOrder } = route.params;
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [orderAddress, setOrderAddress] = useState();
  const [orderDetails, setOrderDetails] = useState("");
  const [visible, setVisible] = useState(false);
  const houseTypes = [
    "apartment",
    "villa",
    "pg",
    "gatedCommunity",
    "individualHouse",
  ];
  const [addressDetails, setAddressDetails] = useState({
    houseType: "",
    houseTypeName: "",
    houseNo: "",
    landmark: "",
    fullAddress: "",
    pincode: "",
    area: "",
    addressLabel: "Home",
  });

  const [selectedHouseType, setSelectedHouseType] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAreaEditable, setIsAreaEditable] = useState(true);
  // const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (orderAddress) {
      setAddressDetails({
        houseType: orderAddress.houseType || "",
        houseTypeName: orderAddress.residenceName || "",
        houseNo: orderAddress.flatNo || "",
        landmark: orderAddress.landMark || "",
        fullAddress: orderAddress.address || "",
        pincode: orderAddress.pincode ? orderAddress.pincode.toString() : "",
        area: orderAddress.area || "",
        addressLabel: orderAddress.addressType || "Home",
      });
      setSelectedHouseType(orderAddress.houseType || "");
    }
  }, [orderAddress]);

  const houseTypeOptions = houseTypes.map((type) => ({
    label:
      type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1"),
    value: type,
  }));

  useEffect(() => {
    const fetchAreaByPincode = async () => {
      if (addressDetails.pincode.length === 6) {
        setAreaLoading(true);
        try {
          const res = await axios.get(
            `https://api.postalpincode.in/pincode/${addressDetails.pincode}`
          );
          const result = res.data[0];
          setAreaLoading(false);
          if (result.Status === "Success" && result.PostOffice.length > 0) {
            const areaNames = result.PostOffice.map((post) => post.Name);
            const areaNamesWithDistrict = areaNames.map((area) => ({
              label: area,
              value: area,
            }));
            setAreaOptions(areaNamesWithDistrict);
            setIsAreaEditable(false);
          } else {
            setAreaOptions([]);
            setIsAreaEditable(true);
            Alert.alert("Invalid Pincode", "No area found for this pincode.");
          }
        } catch (error) {
          console.error("Error fetching area:", error);
          Alert.alert("Error", "Unable to fetch area for the entered pincode.");
          setIsAreaEditable(true);
          setAreaLoading(false);
        }
      } else {
        setAreaOptions([]);
        setIsAreaEditable(true);
      }
    };

    fetchAreaByPincode();
  }, [addressDetails.pincode]);

  const setAddressLabel = (label) => {
    setAddressDetails((prev) => ({
      ...prev,
      addressLabel: label,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!addressDetails.fullAddress.trim()) {
      newErrors.fullAddress = "Full address is required";
    }

    if (!addressDetails.pincode || addressDetails.pincode.length !== 6) {
      newErrors.pincode = "Valid 6-digit pincode is required";
    }

    if (!addressDetails.landmark.trim()) {
      newErrors.landmark = "Landmark is required";
    }

    if (selectedHouseType) {
      if (!addressDetails.houseTypeName.trim()) {
        newErrors.houseTypeName = `${selectedHouseType} name is required`;
      }
      if (!addressDetails.houseNo.trim()) {
        newErrors.houseNo = `${selectedHouseType} number is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCoordinates = async (address) => {
    console.log("Address:", address);
    const API_KEY = "AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`;

    try {
      const response = await axios.get(url);
      console.log("Coordinates response:", response.data);

      if (response.data.status === "OK") {
        const location = response.data.results[0].geometry.location;
        return {
          status: "success",
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        console.error("Error fetching coordinates:", response.data.status);
        Alert.alert(
          "Error",
          "Could not fetch coordinates for the given address."
        );
        return { status: "error" };
      }
    } catch (error) {
      console.error("Error making the API call:", error);
      Alert.alert(
        "Error",
        "An error occurred while fetching the address details."
      );
      return { status: "error" };
    }
  };
  const handleSaveAddress = async (details) => {
    console.log({ details });
    if (!validateForm()) return;

    const fullAddress = `${addressDetails.houseNo}, ${addressDetails.area}, ${addressDetails.landmark}, ${addressDetails.fullAddress}, ${addressDetails.pincode}`;

    try {
      const { status, latitude, longitude } = await getCoordinates(fullAddress);

      if (status !== "success") {
        return;
      }

      setAddressLoading(true);

      const updatedAddressData = {
        address: addressDetails.fullAddress,
        flatNo: addressDetails.houseNo,
        landMark: addressDetails.landmark,
        pincode: parseInt(addressDetails.pincode),
        area: addressDetails.area,
        houseType: selectedHouseType || "",
        residenceName: addressDetails.houseTypeName || "",
        latitude: latitude,
        longitude: longitude,
        orderId: details.orderId, // Make sure order_id is defined in your scope
      };

      const response = await axios.patch(
        BASE_URL + "order-service/orderAddressUpdate",
        updatedAddressData,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      console.log("Update Address Response:", response.data);
      Alert.alert("Success", "Address updated successfully!", [
        {
          text: "OK",
          onPress: () => setVisible(false), // Close the modal on success
        },
        fetchData(),
      ]);
    } catch (error) {
      console.error("Error updating address:", error);
      Alert.alert("Error", "Failed to update address. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getdata = async () => {
        await fetchData();
      };

      getdata();

      return () => {
        console.log("Screen is unfocused");
      };
    }, [])
  );

  // Auto-search when searchQuery changes
  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      setLoader(true);
      setSearchError("");

      const response = await axios.get(
        // userStage == "test" ?
        BASE_URL + `order-service/getAllOrdersBasedOnStatus?orderStatus=3`,
        // : BASE_URL + 'erice-service/order/getAllOrders',
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      setLoader(false);
      console.log("getAllOrders response", response.data);
      const acceptedOrders = response.data.filter((order) => {
        return order && order.orderStatus === "3";
      });
      const liveUsers = response.data.filter(
        (order) =>
          order && order.orderStatus === "3" && order.testUser === false
      );
      console.log("Live users", liveUsers);

      setOrders(acceptedOrders);
      setOrderAddress(acceptedOrders.orderAddress);
      setOrderDetails(acceptedOrders);
      setFilteredOrders(acceptedOrders);
    } catch (error) {
      setLoader(false);
      console.error("Error fetching user data or orders:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchQuery("");
    setSearchError("");
    await fetchData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
      setSearchError("");
      return;
    }

    const filtered = orders.filter(
      (order) =>
        order.uniqueId &&
        order.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      setSearchError(`No orders found with order ID: ${searchQuery}`);
    } else {
      setSearchError("");
    }

    setFilteredOrders(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredOrders(orders);
    setSearchError("");
  };

  const userBgColors = {
    ERICEUSER: "rgba(255, 182, 193, 0.3)",
    NEWUSER: "rgba(144, 238, 144, 0.3)", // light pastel green
    MOBILE: "rgba(173, 216, 230, 0.3)",
    android: "rgba(221, 160, 221, 0.3)",
    WEB: "rgba(240, 230, 140, 0.3)",
    ios: "rgba(255, 228, 181, 0.3)",
     MARKET: "rgba(176, 224, 230, 0.3)",
    WHATSAPP: "rgba(255, 222, 173, 0.3)",
  };


  const renderItem = ({ item }) => {
    return (
      <View>
        {item.orderStatus == 3 && item.testUser == isTestOrder ? (
          <View style={styles.orderItem}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Order Details", {
                  orderId: item.orderId,
                  orderStatus: item.orderStatus,
                  istestUser: route.params.isTestOrder,
                })
              }
            >
              <View style={styles.orderRow}>
                <Text style={styles.orderId1}>
                  Order Id:{" "}
                  <Text style={styles.orderIdValue}>{item?.uniqueId}</Text>
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ marginHorizontal: 10 }}>
                    <Text
                      style={[
                        {
                          padding: 5,
                          borderRadius: 10,
                          // fallback to a default light color if none matches
                          backgroundColor:
                            userBgColors[item?.userType] ??
                            "rgba(240, 248, 255, 0.3)",
                        },
                      ]}
                    >
                      {item?.userType}
                    </Text>
                  </View>
                  {item?.orderFrom != null ? (
                    <Text
                      style={[
                        {
                          padding: 5,
                          borderRadius: 10,
                          // fallback to a default light color if none matches
                          backgroundColor:
                            userBgColors[item?.orderFrom] ??
                            "rgba(240, 248, 255, 0.3)",
                        },
                      ]}
                    >
                      {item?.orderFrom}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.orderRow}>
                <View>
                  <Text style={styles.orderDate}>
                    Date :{" "}
                    <Text style={{ fontWeight: "normal" }}>
                      {item?.orderDate.substring(0, 10)}
                    </Text>{" "}
                  </Text>
                  <Text style={styles.orderDate}>
                    Status :{" "}
                    <Text style={styles.orderStatus}>
                      {" "}
                      {item?.orderStatus == 0
                        ? "Incomplete"
                        : item.orderStatus == 1
                        ? "Placed"
                        : item.orderStatus == 2
                        ? "Accepted"
                        : item.orderStatus == 3
                        ? "Assigned"
                        : item.orderStatus == 4
                        ? "Delivered"
                        : item.orderStatus == 5
                        ? "Rejected"
                        : item.orderStatus == 6
                        ? "Cancelled"
                        : item.orderStatus == "Pickedup"
                        ? "Picked Up"
                        : "Unknown"}
                    </Text>
                  </Text>
                </View>
                <View>
                  <Text style={styles.orderRupees}>
                    Rs :{" "}
                    <Text style={styles.orderPrice}>{item?.grandTotal}</Text>
                  </Text>
                </View>
              </View>

              {item?.dayOfWeek != "" ? (
                <View style={{ padding: 10 }}>
                  {/* <AntDesign name="clockcircle" size={15} /> */}
                  <Text style={{ fontWeight: "bold" }}>
                    Expected Date / Time :{" "}
                    <Text style={{ fontWeight: "normal" }}>
                      {item?.expectedDeliveryDate} , {item?.dayOfWeek} (
                      {item?.timeSlot})
                    </Text>
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setVisible(true), setOrderDetails(item);
              }}
            >
              {item?.orderAddress != null ? (
                <View
                  style={{
                    backgroundColor: "#f1f1f1",
                    padding: 10,
                    borderRadius: 10,
                    marginTop: 10,
                    flexDirection: "row",
                  }}
                >
                  <Icon name="location" size={16} style={{ marginRight: 15 }} />
                  <Text style={{ fontWeight: "bold", width: width * 0.75 }}>
                    {item?.orderAddress?.flatNo},{item?.orderAddress?.address},
                    {item?.orderAddress?.landMark},{item?.orderAddress?.pincode}
                  </Text>
                  <Icon name="create" size={16} style={{ marginRight: 15 }} />
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  function footer() {
    return (
      <View style={{ height: 100 }}>
        <Text style={{ alignSelf: "center", fontSize: 15, marginTop: 15 }}>
          {filteredOrders.length > 0 ? "No more data found" : ""}
        </Text>
      </View>
    );
  }

  const renderNoOrdersFound = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders available</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Only show search bar if orders exist */}
      {orders.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#555"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order ID"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#aaa"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search error message */}
      {searchError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      <View style={styles.listContainer}>
        {loader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={"large"} color="green" />
          </View>
        ) : orders.length === 0 ? (
          renderNoOrdersFound()
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderItem}
            keyExtractor={(item) => item.orderId.toString()}
            ListFooterComponentStyle={styles.footerStyle}
            ListFooterComponent={footer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              searchQuery.trim() !== "" ? (
                <View style={styles.emptySearchContainer}>
                  <Text style={styles.emptyText}>No orders found</Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No orders available</Text>
                </View>
              )
            }
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => {
          setVisible(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

          <View style={styles.modalHeader}>
            <Pressable onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
            <Text style={styles.modalTitle}>Update Address</Text>
            {/* <View style={{ width: 24 }} /> */}
            <Text></Text>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.card}>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.inputLabel}>
                  Residence Type <Text style={styles.required}>*</Text>
                </Text>

                <Dropdown
                  style={styles.dropdown}
                  data={houseTypeOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Residence Type"
                  placeholderStyle={{ color: "#999", fontSize: 14 }}
                  itemTextStyle={{ color: "#000", fontSize: 14 }}
                  selectedTextStyle={{ color: "#000", fontSize: 14 }}
                  value={selectedHouseType}
                  onChange={(item) => {
                    setSelectedHouseType(item.value);
                    setAddressDetails((prev) => ({
                      ...prev,
                      houseType: item.value,
                    }));
                    setErrors((prev) => ({ ...prev, houseType: "" }));
                  }}
                  maxHeight={150}
                  mode="modal"
                  iconStyle={{ width: 20, height: 20, tintColor: "#555" }}
                />
              </View>

              {selectedHouseType && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {selectedHouseType.charAt(0).toUpperCase() +
                        selectedHouseType
                          .slice(1)
                          .replace(/([A-Z])/g, " $1")}{" "}
                      Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.houseTypeName && styles.inputError,
                      ]}
                      placeholder={`Enter ${selectedHouseType} Name`}
                      value={addressDetails.houseTypeName}
                      onChangeText={(text) => {
                        setAddressDetails({
                          ...addressDetails,
                          houseTypeName: text,
                        });
                        setErrors((prev) => ({ ...prev, houseTypeName: "" }));
                      }}
                    />
                    {errors.houseTypeName && (
                      <Text style={styles.errorText}>
                        {errors.houseTypeName}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      {selectedHouseType.charAt(0).toUpperCase() +
                        selectedHouseType
                          .slice(1)
                          .replace(/([A-Z])/g, " $1")}{" "}
                      No <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.houseNo && styles.inputError,
                      ]}
                      placeholder={`Enter ${selectedHouseType} Number`}
                      value={addressDetails.houseNo}
                      onChangeText={(text) => {
                        setAddressDetails({ ...addressDetails, houseNo: text });
                        setErrors((prev) => ({ ...prev, houseNo: "" }));
                      }}
                    />
                    {errors.houseNo && (
                      <Text style={styles.errorText}>{errors.houseNo}</Text>
                    )}
                  </View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Landmark <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.landmark && styles.inputError]}
                  placeholder="Enter Landmark"
                  value={addressDetails.landmark}
                  onChangeText={(text) => {
                    setAddressDetails({ ...addressDetails, landmark: text });
                    setErrors((prev) => ({ ...prev, landmark: "" }));
                  }}
                />
                {errors.landmark && (
                  <Text style={styles.errorText}>{errors.landmark}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.addressInput,
                    errors.fullAddress && styles.inputError,
                  ]}
                  placeholder="Enter complete address"
                  value={addressDetails.fullAddress}
                  onChangeText={(text) => {
                    setAddressDetails({ ...addressDetails, fullAddress: text });
                    setErrors((prev) => ({ ...prev, fullAddress: "" }));
                  }}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {errors.fullAddress && (
                  <Text style={styles.errorText}>{errors.fullAddress}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Pincode <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.pincode && styles.inputError]}
                  placeholder="Enter Pincode"
                  value={addressDetails.pincode}
                  onChangeText={(text) => {
                    setAddressDetails({ ...addressDetails, pincode: text });
                    setErrors((prev) => ({ ...prev, pincode: "" }));
                  }}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {errors.pincode && (
                  <Text style={styles.errorText}>{errors.pincode}</Text>
                )}
              </View>

              {addressDetails.pincode.length === 6 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.inputLabel}>Area</Text>

                  {areaLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#4B0082"
                      style={{ marginTop: 10 }}
                    />
                  ) : !isAreaEditable ? (
                    <Dropdown
                      style={[styles.dropdown, { marginTop: 8 }]}
                      data={areaOptions}
                      labelField="label"
                      valueField="value"
                      value={addressDetails?.area}
                      onChange={(item) => {
                        setAddressDetails((prev) => ({
                          ...prev,
                          area: item.value,
                        }));
                        setErrors((prev) => ({ ...prev, area: "" }));
                      }}
                      placeholder="Select Area"
                      placeholderStyle={{ color: "#999", fontSize: 14 }}
                      itemTextStyle={{ color: "#000", fontSize: 14 }}
                      selectedTextStyle={{ color: "#000", fontSize: 14 }}
                      iconStyle={{ width: 20, height: 20, tintColor: "#555" }}
                      maxHeight={150}
                      scrollEnabled={true}
                      mode="modal"
                    />
                  ) : (
                    <TextInput
                      style={[styles.input, { marginTop: 8 }]}
                      placeholder="Enter area name"
                      value={addressDetails.area}
                      onChangeText={(text) => {
                        setAddressDetails((prev) => ({
                          ...prev,
                          area: text,
                        }));
                        setErrors((prev) => ({ ...prev, area: "" }));
                      }}
                    />
                  )}

                  {errors.area && (
                    <Text style={styles.errorText}>{errors.area}</Text>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { margin: 16 }]}
              onPress={() => handleSaveAddress(orderDetails)}
              disabled={addressLoading}
            >
              {addressLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>UPDATE ADDRESS</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default NewOrders;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#ffeeee",
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  loaderContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptySearchContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
  orderItem: {
    padding: 14,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    width: width - 20,
    alignSelf: "center",
    marginBottom: 6,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    width: width * 0.8,
    marginLeft: 5,
  },
  orderRupees: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  orderDate: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0052CC",
  },
  footerStyle: {
    marginBottom: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  addressInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#4B0082",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
