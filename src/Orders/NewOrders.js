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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from '../../config';
import { useFocusEffect } from "@react-navigation/native";
const { height, width } = Dimensions.get("window");
import { useSelector } from "react-redux";
import ModalDropdown from "react-native-modal-dropdown";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";

const NewOrders = ({ navigation, route }) => {
  const { isTestOrder } = route.params;
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderAddress, setOrderAddress] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const accessToken = useSelector((state) => state.counter);

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
        BASE_URL + `order-service/getAllOrdersBasedOnStatus?orderStatus=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      setLoader(false);
      const acceptedOrders = response.data.filter((order) => {
        return order && order.orderStatus === "1";
      });
      const liveUsers = response.data.filter(
        (order) =>
          order && order.orderStatus === "1" && order.testUser === false
      );

      setOrders(acceptedOrders);
      setOrderAddress(acceptedOrders.orderAddress);
      setFilteredOrders(acceptedOrders);
    } catch (error) {
      setLoader(false);
      console.error("Error fetching user data or orders:", error.response);
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
      (order) => order.uniqueId && order.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filtered.length === 0) {
      setSearchError(`No orders found with order ID: ${searchQuery}`);
    } else {
      setSearchError("");
    }
    
    setFilteredOrders(filtered);
  };

  const formatPrice = (price) => {
    if (!price) return "0";
    const rounded = Math.round(price * 10) / 10;
    const decimalPart = rounded % 1;
  
    if (decimalPart < 0.5) {
      return Math.floor(rounded);
    }
    return rounded.toFixed(1); 
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredOrders(orders);
    setSearchError("");
  };

  const renderItem = ({ item }) => {
    return (
      <View>
        {item.orderStatus == 1 && item.testUser == isTestOrder ? (
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() => navigation.navigate("Order Details", { order: item, istestUser: route.params.isTestOrder })}
          >
            <Text style={styles.orderId}>
              Order Id: <Text style={styles.orderIdValue}>{item?.uniqueId}</Text>
            </Text>

            <View style={styles.orderRow}>
              <View>
                <Text style={styles.orderDate}>
                  Order Date: <Text style={styles.orderDateValue}>{item?.orderDate.substring(0, 10)}</Text>
                </Text>
                <Text style={styles.orderDate}>
                  Order Status: 
                  <Text style={styles.orderStatus}>
                    {item?.orderStatus == 0
                      ? " Incomplete"
                      : item.orderStatus == 1
                      ? " Placed"
                      : item.orderStatus == 2
                      ? " Accepted"
                      : item.orderStatus == 3
                      ? " Picked Up"
                      : item.orderStatus == 4
                      ? " Delivered"
                      : item.orderStatus == 5
                      ? " Rejected"
                      : item.orderStatus == 6
                      ? " Cancelled"
                      : " Unknown"}
                  </Text>
                </Text>
              </View>
              <View>
                <Text style={styles.orderPrice}>Rs: {formatPrice(item?.grandTotal)}</Text>
              </View>
            </View>

            {item?.dayOfWeek !== "" ? (
              <View style={styles.deliveryTimeContainer}>
                <Text style={styles.deliveryTimeLabel}>
                  Expected Date / Time: <Text style={styles.deliveryTimeValue}>{item?.expectedDeliveryDate}, {item?.dayOfWeek} ({item?.timeSlot})</Text>
                </Text>
              </View>
            ) : null}

            {item?.orderAddress != null ? (
              <View style={styles.addressContainer}>
                <Icon name="location" size={16} style={styles.locationIcon} />
                <Text style={styles.addressText}>
                  {item?.orderAddress?.flatNo}, {item?.orderAddress?.address}, {item?.orderAddress?.landMark}, {item?.orderAddress?.pincode}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  function footer() {
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
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
      {orders.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order ID"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#aaa"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {searchError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      ) : null}

      <View style={styles.listContainer}>
        {loader ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={"large"} color="#28a745" />
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
                colors={["#28a745"]}
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
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    width: width - 20,
    alignSelf: "center",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  orderIdValue: {
    fontWeight: "normal",
  },
  orderDate: {
    fontSize: 14,
    color: "#555",
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderDateValue: {
    fontWeight: "normal",
  },
  orderStatus: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "normal",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  deliveryTimeContainer: {
    paddingVertical: 8,
  },
  deliveryTimeLabel: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 14,
  },
  deliveryTimeValue: {
    fontWeight: "normal",
  },
  addressContainer: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    marginRight: 10,
    marginTop: 2,
    color: "#555",
  },
  addressText: {
    fontWeight: "bold",
    width: width * 0.75,
    color: "#444",
    fontSize: 14,
    lineHeight: 20,
  },
  footerContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#777",
  },
  footerStyle: {
    marginBottom: 100,
  },
});





// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import BASE_URL from '../../config';
// import { useFocusEffect } from "@react-navigation/native";
// const { height, width } = Dimensions.get("window");
// import { useSelector } from "react-redux";
// import ModalDropdown from "react-native-modal-dropdown";
// import { Ionicons } from "@expo/vector-icons";
// import Icon from "react-native-vector-icons/Ionicons";

// const NewOrders = ({ navigation, route }) => {
//   const { isTestOrder } = route.params;
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [orderAddress, setOrderAddress] = useState();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [loader, setLoader] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchError, setSearchError] = useState("");
//   const accessToken = useSelector((state) => state.counter);

//   useFocusEffect(
//     useCallback(() => {
//       const getdata = async () => {
//         await fetchData();
//       };

//       getdata();

//       return () => {
//         console.log("Screen is unfocused");
//       };
//     }, [])
//   );

//   // Auto-search when searchQuery changes
//   useEffect(() => {
//     handleSearch();
//   }, [searchQuery]);

//   const fetchData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem("userData");
//       setLoader(true);
//       setSearchError("");
//       const response = await axios.get(
//         BASE_URL + `order-service/getAllOrdersBasedOnStatus?orderStatus=1`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken.token}`,
//           },
//         }
//       );
//       setLoader(false);
//       const acceptedOrders = response.data.filter((order) => {
//         return order && order.orderStatus === "1";
//       });
//       const liveUsers = response.data.filter(
//         (order) =>
//           order && order.orderStatus === "1" && order.testUser === false
//       );

//       setOrders(acceptedOrders);
//       setOrderAddress(acceptedOrders.orderAddress);
//       setFilteredOrders(acceptedOrders);
//     } catch (error) {
//       setLoader(false);
//       console.error("Error fetching user data or orders:", error.response);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     setSearchQuery("");
//     setSearchError("");
//     await fetchData();
//     setRefreshing(false);
//   };

//   const handleSearch = () => {
//     if (searchQuery.trim() === "") {
//       setFilteredOrders(orders);
//       setSearchError("");
//       return;
//     }

//     const filtered = orders.filter(
//       (order) => order.uniqueId && order.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
//     );
    
//     if (filtered.length === 0) {
//       setSearchError(`No orders found with order ID: ${searchQuery}`);
//     } else {
//       setSearchError("");
//     }
    
//     setFilteredOrders(filtered);
//   };

//   const formatPrice = (price) => {
//     if (!price) return "0";
//     const rounded = Math.round(price * 10) / 10;
//     const decimalPart = rounded % 1;
  
//     if (decimalPart < 0.5) {
//       return Math.floor(rounded);
//     }
//     return rounded.toFixed(1); 
//   };

//   const clearSearch = () => {
//     setSearchQuery("");
//     setFilteredOrders(orders);
//     setSearchError("");
//   };

//   const renderItem = ({ item }) => {
//     return (
//       <View>
//         {item.orderStatus == 1 && item.testUser == isTestOrder ? (
//           <TouchableOpacity
//             style={styles.orderItem}
//             onPress={() => navigation.navigate("Order Details", { order: item, istestUser: route.params.isTestOrder })}
//           >
//             <Text style={styles.orderId}>
//               Order Id: <Text style={styles.orderIdValue}>{item?.uniqueId}</Text>
//             </Text>

//             <View style={styles.orderRow}>
//               <View>
//                 <Text style={styles.orderDate}>
//                   Order Date: <Text style={styles.orderDateValue}>{item?.orderDate.substring(0, 10)}</Text>
//                 </Text>
//                 <Text style={styles.orderDate}>
//                   Order Status: 
//                   <Text style={styles.orderStatus}>
//                     {item?.orderStatus == 0
//                       ? " Incomplete"
//                       : item.orderStatus == 1
//                       ? " Placed"
//                       : item.orderStatus == 2
//                       ? " Accepted"
//                       : item.orderStatus == 3
//                       ? " Picked Up"
//                       : item.orderStatus == 4
//                       ? " Delivered"
//                       : item.orderStatus == 5
//                       ? " Rejected"
//                       : item.orderStatus == 6
//                       ? " Cancelled"
//                       : " Unknown"}
//                   </Text>
//                 </Text>
//               </View>
//               <View>
//                 <Text style={styles.orderPrice}>Rs: {formatPrice(item?.grandTotal)}</Text>
//               </View>
//             </View>

//             {item?.dayOfWeek !== "" ? (
//               <View style={styles.deliveryTimeContainer}>
//                 <Text style={styles.deliveryTimeLabel}>
//                   Expected Date / Time: <Text style={styles.deliveryTimeValue}>{item?.expectedDeliveryDate}, {item?.dayOfWeek} ({item?.timeSlot})</Text>
//                 </Text>
//               </View>
//             ) : null}

//             {item?.orderAddress != null ? (
//               <View style={styles.addressContainer}>
//                 <Icon name="location" size={16} style={styles.locationIcon} />
//                 <Text style={styles.addressText}>
//                   {item?.orderAddress?.flatNo}, {item?.orderAddress?.address}, {item?.orderAddress?.landMark}, {item?.orderAddress?.pincode}
//                 </Text>
//               </View>
//             ) : null}
//           </TouchableOpacity>
//         ) : null}
//       </View>
//     );
//   };

//   function footer() {
//     return (
//       <View style={styles.footerContainer}>
//         <Text style={styles.footerText}>
//           {filteredOrders.length > 0 ? "No more data found" : ""}
//         </Text>
//       </View>
//     );
//   }

//   const renderNoOrdersFound = () => {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>No orders available</Text>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.screen}>
//       {orders.length > 0 && (
//         <View style={styles.searchContainer}>
//           <View style={styles.searchInputContainer}>
//             <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search by order ID"
//               value={searchQuery}
//               onChangeText={setSearchQuery}
//               placeholderTextColor="#aaa"
//             />
//             {searchQuery.length > 0 && (
//               <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
//                 <Ionicons name="close-circle" size={20} color="#555" />
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       )}

//       {searchError ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{searchError}</Text>
//         </View>
//       ) : null}

//       <View style={styles.listContainer}>
//         {loader ? (
//           <View style={styles.loaderContainer}>
//             <ActivityIndicator size={"large"} color="#28a745" />
//           </View>
//         ) : orders.length === 0 ? (
//           renderNoOrdersFound()
//         ) : (
//           <FlatList
//             data={filteredOrders}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.orderId.toString()}
//             ListFooterComponentStyle={styles.footerStyle}
//             ListFooterComponent={footer}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={handleRefresh}
//                 colors={["#28a745"]}
//               />
//             }
//             ListEmptyComponent={
//               searchQuery.trim() !== "" ? (
//                 <View style={styles.emptySearchContainer}>
//                   <Text style={styles.emptyText}>No orders found</Text>
//                 </View>
//               ) : (
//                 <View style={styles.emptyContainer}>
//                   <Text style={styles.emptyText}>No orders available</Text>
//                 </View>
//               )
//             }
//           />
//         )}
//       </View>
//     </View>
//   );
// };

// export default NewOrders;

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: "#FFF",
//     paddingHorizontal: 10,
//   },
//   searchContainer: {
//     padding: 10,
//     backgroundColor: "#fff",
//     zIndex: 1,
//   },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     height: 45,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     height: 40,
//     fontSize: 16,
//     color: "#333",
//   },
//   clearButton: {
//     padding: 5,
//   },
//   errorContainer: {
//     padding: 10,
//     backgroundColor: "#ffeeee",
//     borderRadius: 10,
//     marginHorizontal: 10,
//     marginBottom: 10,
//   },
//   errorText: {
//     color: "#d32f2f",
//     fontSize: 14,
//     textAlign: "center",
//   },
//   listContainer: {
//     flex: 1,
//     paddingBottom: 10,
//   },
//   loaderContainer: {
//     marginTop: 30,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 50,
//   },
//   emptySearchContainer: {
//     padding: 20,
//     alignItems: "center",
//   },
//   emptyText: {
//     textAlign: "center",
//     fontSize: 16,
//     color: "#555",
//   },
//   orderItem: {
//     padding: 16,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 16,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 3,
//     width: width - 20,
//     alignSelf: "center",
//   },
//   orderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 8,
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 8,
//   },
//   orderIdValue: {
//     fontWeight: "normal",
//   },
//   orderDate: {
//     fontSize: 14,
//     color: "#555",
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   orderDateValue: {
//     fontWeight: "normal",
//   },
//   orderStatus: {
//     fontSize: 14,
//     color: "#28a745",
//     fontWeight: "normal",
//   },
//   orderPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#28a745",
//   },
//   deliveryTimeContainer: {
//     paddingVertical: 8,
//   },
//   deliveryTimeLabel: {
//     fontWeight: "bold",
//     color: "#333",
//     fontSize: 14,
//   },
//   deliveryTimeValue: {
//     fontWeight: "normal",
//   },
//   addressContainer: {
//     backgroundColor: "#f1f1f1",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 10,
//     flexDirection: "row",
//     alignItems: "flex-start",
//   },
//   locationIcon: {
//     marginRight: 10,
//     marginTop: 2,
//     color: "#555",
//   },
//   addressText: {
//     fontWeight: "bold",
//     width: width * 0.75,
//     color: "#444",
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   footerContainer: {
//     height: 100,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   footerText: {
//     fontSize: 14,
//     color: "#777",
//   },
//   footerStyle: {
//     marginBottom: 100,
//   },

// });