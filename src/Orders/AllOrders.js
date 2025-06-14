// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
//   TextInput,
//   FlatList,
// } from "react-native";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { Dropdown } from "react-native-element-dropdown";
// import { Dimensions } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import BASE_URL from "../../config";

// const { width } = Dimensions.get("window");

// const AllOrders = () => {
//   const navigation = useNavigation();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchText, setSearchText] = useState("");
//   const accessToken = useSelector((state) => state.counter);
//   // const { BASE_URL } = config(); // Get values

//   // Date range states
//   const [startDate, setStartDate] = useState(
//     new Date(new Date().setDate(new Date().getDate() - 7))
//   ); // Default to 7 days ago
//   const [endDate, setEndDate] = React.useState(new Date()); // Default to today
//   const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
//   const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
//   const [initialLoad, setInitialLoad] = React.useState(true); // Added flag for initial load state

//   const [selectedValue, setSelectedValue] = React.useState("all"); // Default to show all orders
//   const [dropLoading, setDropLoading] = React.useState(false);

//   const orderStatusMap = {
//     all: "All Orders",
//     0: "Incomplete",
//     1: "Placed",
//     2: "Accepted",
//     3: "Assigned",
//     4: "Delivered",
//     5: "Rejected",
//     6: "Cancelled",
//     PickedUp: "Picked Up",
//   };

//   const fetchOrdersByDateRange = async () => {
//     setLoading(true);
//     setInitialLoad(false); // Mark that we've attempted to load data
//     try {
//       const formattedStartDate = formatDateForApi(startDate);
//       const formattedEndDate = formatDateForApi(endDate);

//       const response = await axios.get(
//         `${BASE_URL}order-service/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken.token}`,
//           },
//         }
//       );

//       console.log("Date range orders response", response.data);
//       setOrders(response.data);
//     } catch (error) {
//       console.error("Error fetching orders by date range:", error);
//       setError(
//         error.response?.data?.message ||
//           "Failed to fetch orders for selected date range."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Remove the useEffect that was automatically fetching orders
//   // useEffect(() => {
//   //   fetchOrdersByDateRange();
//   // }, []);

//   const formatDateForDisplay = (date) => {
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const formatDateForApi = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const formatOrderDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const onStartDateChange = (event, selectedDate) => {
//     setShowStartDatePicker(false);
//     if (selectedDate) {
//       setStartDate(selectedDate);
//     }
//   };

//   const onEndDateChange = (event, selectedDate) => {
//     setShowEndDatePicker(false);
//     if (selectedDate) {
//       setEndDate(selectedDate);
//     }
//   };

//   const filteredOrders = orders
//     .filter((item) => {
//       // Filter by status (if "all" is selected, include all orders)
//       return selectedValue === "all" || item.orderStatus === selectedValue;
//     })
//     .filter((item) => {
//       // Filter by search text - ONLY by orderId
//       const searchLower = searchText.toLowerCase().trim();

//       // Check if search text is empty
//       if (!searchLower) return true;

//       // Search ONLY through orderId
//       return (
//         // Search by orderId only
//         item.orderId &&
//         item.orderId.toString().toLowerCase().includes(searchLower)
//       );
//     });

//   const statusData = Object.keys(orderStatusMap).map((key) => ({
//     label: orderStatusMap[key],
//     value: key,
//   }));

//   const handleChange = (item) => {
//     setDropLoading(true);
//     setSelectedValue(item.value);
//     setTimeout(() => setDropLoading(false), 500);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       1: "#FF6B00", // Placed - Orange
//       2: "#00875A", // Accepted - Green
//       3: "#0052CC", // Assigned - Blue
//       PickedUp: "#0052CC", // Picked Up - Blue
//       4: "#403294", // Delivered - Purple
//       5: "#DE350B", // Rejected - Red
//       6: "#DE350B", // Cancelled - Red
//     };
//     return colors[status] || "#666666";
//   };

//   const getStatusBackgroundColor = (status) => {
//     const colors = {
//       1: "#FFF0E6", // Light Orange
//       2: "#E3FCEF", // Light Green
//       3: "#DEEBFF", // Light Blue
//       PickedUp: "#DEEBFF", // Light Blue
//       4: "#EAE6FF", // Light Purple
//       5: "#FFEBE6", // Light Red
//       6: "#FFEBE6", // Light Red
//     };
//     return colors[status] || "#F4F5F7";
//   };

//   const renderOrderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.orderItem}
//       onPress={() =>
//         navigation.navigate("Order Details", {
//           orderId: item.orderId,
//           orderStatus: item.orderStatus,
//         })
//       }
//     >
//       <View style={styles.orderHeader}>
//         <View style={styles.orderIdContainer}>
//           <Text style={styles.orderIdLabel}>ORDER ID</Text>
//           <Text style={styles.orderId}>
//             {item.orderId ? item.orderId.slice(-4) : "N/A"}
//           </Text>
//         </View>
//         <View
//           style={[
//             styles.statusContainer,
//             { backgroundColor: getStatusBackgroundColor(item.orderStatus) },
//           ]}
//         >
//           <Text
//             style={[
//               styles.statusValue,
//               { color: getStatusColor(item.orderStatus) },
//             ]}
//           >
//             {orderStatusMap[item.orderStatus] || "Unknown Status"}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.detailsContainer}>
//         <View style={styles.detailRow}>
//           <Text style={styles.detailLabel}>Order Date</Text>
//           <Text style={styles.detailValue}>
//             {formatOrderDate(item.createdAt)}
//           </Text>
//         </View>
//         <View style={styles.detailRow}>
//           <Text style={styles.detailLabel}>Grand Total</Text>
//           <Text style={styles.detailValue}>₹{item.grandTotal || "0"}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Date range selector */}
//       <View style={styles.dateRangeContainer}>
//         <TouchableOpacity
//           style={styles.dateSelector}
//           onPress={() => setShowStartDatePicker(true)}
//         >
//           <Text style={styles.dateLabel}>From:</Text>
//           <Text style={styles.dateText}>{formatDateForDisplay(startDate)}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.dateSelector}
//           onPress={() => setShowEndDatePicker(true)}
//         >
//           <Text style={styles.dateLabel}>To:</Text>
//           <Text style={styles.dateText}>{formatDateForDisplay(endDate)}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.applyButton}
//           onPress={fetchOrdersByDateRange}
//         >
//           <Text style={styles.applyButtonText}>Apply</Text>
//         </TouchableOpacity>
//       </View>

//       {showStartDatePicker && (
//         <DateTimePicker
//           value={startDate}
//           mode="date"
//           display="default"
//           onChange={onStartDateChange}
//           maximumDate={new Date()}
//         />
//       )}

//       {showEndDatePicker && (
//         <DateTimePicker
//           value={endDate}
//           mode="date"
//           display="default"
//           onChange={onEndDateChange}
//           minimumDate={startDate}
//           maximumDate={new Date()}
//         />
//       )}

//       <View style={styles.filterContainer}>
//         <TextInput
//           style={styles.searchBar}
//           placeholder="Search by Order ID..."
//           placeholderTextColor="#666666"
//           value={searchText}
//           onChangeText={setSearchText}
//         />
//         <Dropdown
//           style={styles.dropdown}
//           selectedTextStyle={styles.dropdownText}
//           placeholderStyle={styles.dropdownText}
//           containerStyle={styles.dropdownContainer}
//           data={statusData}
//           labelField="label"
//           valueField="value"
//           value={selectedValue}
//           onChange={handleChange}
//           placeholder="Select Status"
//         />
//       </View>

//       {loading ? (
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color="#0052CC" />
//         </View>
//       ) : error ? (
//         <View style={styles.centerContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity
//             style={styles.retryButton}
//             onPress={fetchOrdersByDateRange}
//           >
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : initialLoad ? (
//         <View style={styles.promptContainer}>
//           <Text style={styles.promptText}>
//             Select a date range and click 'Apply' to view orders
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredOrders}
//           renderItem={renderOrderItem}
//           keyExtractor={(item) =>
//             item.uniqueId?.toString() || Math.random().toString()
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>No orders found</Text>
//               <Text style={styles.emptySubtext}>
//                 Try adjusting your filters or date range
//               </Text>
//             </View>
//           }
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F5F7",
//     paddingHorizontal: 16,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F4F5F7",
//   },
//   promptContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F4F5F7",
//   },
//   promptText: {
//     fontSize: 16,
//     color: "#42526E",
//     textAlign: "center",
//     padding: 20,
//   },
//   dateRangeContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   dateSelector: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     padding: 12,
//     flex: 1,
//     marginRight: 8,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   dateLabel: {
//     fontSize: 12,
//     color: "#6B778C",
//     marginBottom: 4,
//   },
//   dateText: {
//     fontSize: 16,
//     color: "#172B4D",
//     fontWeight: "500",
//   },
//   applyButton: {
//     backgroundColor: "#0052CC",
//     borderRadius: 8,
//     padding: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   applyButtonText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     gap: 12,
//     marginVertical: 16,
//   },
//   searchBar: {
//     flex: 1,
//     height: 48,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   dropdown: {
//     width: width * 0.35,
//     height: 48,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: "#172B4D",
//   },
//   dropdownContainer: {
//     borderRadius: 8,
//     borderColor: "#DFE1E6",
//     marginTop: 4,
//   },
//   orderItem: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   orderHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//   },
//   orderIdContainer: {
//     gap: 4,
//   },
//   orderIdLabel: {
//     fontSize: 12,
//     color: "#6B778C",
//     letterSpacing: 0.5,
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#172B4D",
//   },
//   statusContainer: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#DFE1E6",
//     marginHorizontal: 16,
//   },
//   detailsContainer: {
//     padding: 16,
//     gap: 12,
//   },
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: "#6B778C",
//   },
//   detailValue: {
//     fontSize: 14,
//     color: "#172B4D",
//     fontWeight: "500",
//   },
//   statusValue: {
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   emptyContainer: {
//     alignItems: "center",
//     marginTop: 32,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: "#172B4D",
//     fontWeight: "500",
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#6B778C",
//     marginTop: 4,
//   },
//   errorText: {
//     fontSize: 16,
//     color: "#DE350B",
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   retryButton: {
//     backgroundColor: "#0052CC",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   retryText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
// });

// export default AllOrders;






import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BASE_URL from "../../config";

const { width } = Dimensions.get("window");

const AllOrders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for counting
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const accessToken = useSelector((state) => state.counter);

  // Date range states
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ); // Default to 7 days ago
  const [endDate, setEndDate] = useState(new Date()); // Default to today
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false); // Track if data has been loaded

  const [selectedValue, setSelectedValue] = useState("all"); // Default to show all orders
  const [dropLoading, setDropLoading] = useState(false);

  // Order counts state - removed accepted from counts
  const [orderCounts, setOrderCounts] = useState({
    total: 0,
    placed: 0,
    assigned: 0,
    pickedUp: 0,
    delivered: 0,
    rejected: 0,
    cancelled: 0,
    incomplete: 0,
  });

  // Removed accepted (status 2) from the order status map
  const orderStatusMap = {
    all: "All Orders",
    0: "Incomplete",
    1: "Placed",
    3: "Assigned",
    4: "Delivered",
    5: "Rejected",
    6: "Cancelled",
    PickedUp: "Picked Up",
  };

  // Calculate order counts from unique orders only (based on current status) - excluding accepted orders
  const calculateOrderCounts = (ordersData) => {
    const counts = {
      total: 0,
      placed: 0,
      assigned: 0,
      pickedUp: 0,
      delivered: 0,
      rejected: 0,
      cancelled: 0,
      incomplete: 0,
    };

    // Create a Map to track unique orders by orderId and their highest status
    const uniqueOrders = new Map();

    // Filter out accepted orders (status 2) before processing
    const filteredOrders = ordersData.filter(order => {
      const status = order.orderStatus;
      return status !== 2 && status !== '2'; // Exclude accepted orders
    });

    filteredOrders.forEach(order => {
      const orderId = order.orderId;
      const status = order.orderStatus;
      
      // Define status hierarchy (higher number = more advanced status) - removed accepted
      const statusHierarchy = {
        0: 0,    // Incomplete
        '0': 0,  // Incomplete (string)
        1: 1,    // Placed
        '1': 1,  // Placed (string)
        3: 3,    // Assigned
        '3': 3,  // Assigned (string)
        'PickedUp': 4, // Picked Up
        4: 5,    // Delivered
        '4': 5,  // Delivered (string)
        5: 6,    // Rejected
        '5': 6,  // Rejected (string)
        6: 7,    // Cancelled
        '6': 7,  // Cancelled (string)
      };

      const currentStatusLevel = statusHierarchy[status] || 0;
      
      if (!uniqueOrders.has(orderId)) {
        // First time seeing this order
        uniqueOrders.set(orderId, {
          order: order,
          statusLevel: currentStatusLevel,
          status: status
        });
      } else {
        // We've seen this order before, check if current status is higher
        const existingOrder = uniqueOrders.get(orderId);
        if (currentStatusLevel > existingOrder.statusLevel) {
          // Update to the higher status
          uniqueOrders.set(orderId, {
            order: order,
            statusLevel: currentStatusLevel,
            status: status
          });
        }
      }
    });

    // Now count each unique order only once based on its highest status
    counts.total = uniqueOrders.size;

    uniqueOrders.forEach(orderData => {
      const status = orderData.status;
      switch (status) {
        case 0:
        case '0':
          counts.incomplete++;
          break;
        case 1:
        case '1':
          counts.placed++;
          break;
        case 3:
        case '3':
          counts.assigned++;
          break;
        case 'PickedUp':
          counts.pickedUp++;
          break;
        case 4:
        case '4':
          counts.delivered++;
          break;
        case 5:
        case '5':
          counts.rejected++;
          break;
        case 6:
        case '6':
          counts.cancelled++;
          break;
      }
    });

    return counts;
  };

  const fetchOrdersByDateRange = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (startDate > endDate) {
      setError("Start date cannot be after end date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = formatDateForApi(startDate);
      const formattedEndDate = formatDateForApi(endDate);

      console.log("Fetching orders for date range:", formattedStartDate, "to", formattedEndDate);

      const response = await axios.get(
        `${BASE_URL}order-service/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 second timeout
        }
      );

      console.log("Date range orders response:", response.data);

      // Handle different response formats
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else {
        console.warn("Unexpected response format:", response.data);
        ordersData = [];
      }

      // Filter out accepted orders (status 2) from the data
      const filteredOrdersData = ordersData.filter(order => {
        const status = order.orderStatus;
        return status !== 2 && status !== '2'; // Exclude accepted orders
      });

      // Store all orders for counting and filtering
      setAllOrders(filteredOrdersData);
      setOrders(filteredOrdersData);
      setHasInitialData(true);
      
      // Calculate and set order counts
      const counts = calculateOrderCounts(filteredOrdersData);
      setOrderCounts(counts);

    } catch (error) {
      console.error("Error fetching orders by date range:", error);
      
      if (error.code === 'ECONNABORTED') {
        setError("Request timeout. Please try again.");
      } else if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response?.data?.message || error.response?.data?.error;
        
        if (statusCode === 401) {
          setError("Authentication failed. Please login again.");
        } else if (statusCode === 403) {
          setError("Access denied. You don't have permission to view these orders.");
        } else if (statusCode === 404) {
          setError("API endpoint not found. Please contact support.");
        } else if (statusCode >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(errorMessage || `Server error: ${statusCode}. Please try again.`);
        }
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to fetch orders. Please try again.");
      }
      
      setAllOrders([]);
      setOrders([]);
      setOrderCounts({
        total: 0,
        placed: 0,
        assigned: 0,
        pickedUp: 0,
        delivered: 0,
        rejected: 0,
        cancelled: 0,
        incomplete: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic data loading on component mount
  // useEffect(() => {
  //   fetchOrdersByDateRange();
  // }, []);

  // Filter orders when status or search text changes
  useEffect(() => {
    if (hasInitialData && allOrders.length > 0) {
      filterOrders();
    }
  }, [selectedValue, searchText, allOrders]);

  const filterOrders = () => {
    let filtered = [...allOrders];

    // Filter by status
    if (selectedValue !== "all") {
      filtered = filtered.filter((item) => {
        // Handle different status formats
        const itemStatus = item.orderStatus;
        const selectedStatus = selectedValue;
        
        // Convert both to string for comparison
        return itemStatus?.toString() === selectedStatus?.toString();
      });
    }

    // Filter by search text (Order ID only)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        return (
          item.orderId &&
          item.orderId.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    setOrders(filtered);
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForApi = (date) => {
    if (!date) return "";
    
    // Ensure we have a valid date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date object:", date);
      return "";
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    const formattedDate = `${year}-${month}-${day}`;
    console.log("Formatted date for API:", formattedDate);
    
    return formattedDate;
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "N/A";
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      console.log("Selected start date:", selectedDate);
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      console.log("Selected end date:", selectedDate);
      setEndDate(selectedDate);
    }
  };

  // Create status data with counts for dropdown - removed accepted status
  const getStatusDataWithCounts = () => {
    return Object.keys(orderStatusMap).map((key) => {
      let count = 0;
      if (key === 'all') {
        count = orderCounts.total;
      } else {
        switch (key) {
          case '0': count = orderCounts.incomplete; break;
          case '1': count = orderCounts.placed; break;
          case '3': count = orderCounts.assigned; break;
          case 'PickedUp': count = orderCounts.pickedUp; break;
          case '4': count = orderCounts.delivered; break;
          case '5': count = orderCounts.rejected; break;
          case '6': count = orderCounts.cancelled; break;
          default: count = 0;
        }
      }
      
      return {
        label: `${orderStatusMap[key]} (${count})`,
        value: key,
      };
    });
  };

  const statusData = getStatusDataWithCounts();

  const handleChange = (item) => {
    setDropLoading(true);
    setSelectedValue(item.value);
    setTimeout(() => setDropLoading(false), 300);
  };

  const getStatusColor = (status) => {
    const colors = {
      0: "#666666", // Incomplete - Gray
      1: "#FF6B00", // Placed - Orange
      3: "#0052CC", // Assigned - Blue
      PickedUp: "#0052CC", // Picked Up - Blue
      4: "#403294", // Delivered - Purple
      5: "#DE350B", // Rejected - Red
      6: "#DE350B", // Cancelled - Red
    };
    return colors[status] || "#666666";
  };

  const getStatusBackgroundColor = (status) => {
    const colors = {
      0: "#F4F5F7", // Light Gray
      1: "#FFF0E6", // Light Orange
      3: "#DEEBFF", // Light Blue
      PickedUp: "#DEEBFF", // Light Blue
      4: "#EAE6FF", // Light Purple
      5: "#FFEBE6", // Light Red
      6: "#FFEBE6", // Light Red
    };
    return colors[status] || "#F4F5F7";
  };

  const getCurrentFilterCount = () => {
    if (selectedValue === "all") {
      return orderCounts.total;
    }
    
    // Return the actual count from orderCounts based on selected status
    switch (selectedValue) {
      case '0': return orderCounts.incomplete;
      case '1': return orderCounts.placed;
      case '3': return orderCounts.assigned;
      case 'PickedUp': return orderCounts.pickedUp;
      case '4': return orderCounts.delivered;
      case '5': return orderCounts.rejected;
      case '6': return orderCounts.cancelled;
      default: return orders.length;
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() =>
        navigation.navigate("Order Details", {
          orderId: item.orderId,
          orderStatus: item.orderStatus,
        })
      }
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>ORDER ID</Text>
          <Text style={styles.orderId}>
            {item.orderId ? item.orderId.toString().slice(-4) : "N/A"}
          </Text>
        </View>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: getStatusBackgroundColor(item.orderStatus) },
          ]}
        >
          <Text
            style={[
              styles.statusValue,
              { color: getStatusColor(item.orderStatus) },
            ]}
          >
            {orderStatusMap[item.orderStatus] || "Unknown Status"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Date</Text>
          <Text style={styles.detailValue}>
            {formatOrderDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grand Total</Text>
          <Text style={styles.detailValue}>₹{item.grandTotal || "0"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderCounts = () => (
    <View style={styles.countsContainer}>
      <Text style={styles.countsTitle}>Order Summary (Unique Orders)</Text>
      <View style={styles.countsGrid}>
        <View style={styles.countItem}>
          <Text style={styles.countNumber}>{orderCounts.total}</Text>
          <Text style={styles.countLabel}>Total</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={[styles.countNumber, { color: "#666666" }]}>
            {orderCounts.incomplete}
          </Text>
          <Text style={styles.countLabel}>Incomplete</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={[styles.countNumber, { color: "#FF6B00" }]}>
            {orderCounts.placed}
          </Text>
          <Text style={styles.countLabel}>Placed</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={[styles.countNumber, { color: "#0052CC" }]}>
            {orderCounts.assigned}
          </Text>
          <Text style={styles.countLabel}>Assigned</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={[styles.countNumber, { color: "#0052CC" }]}>
            {orderCounts.pickedUp}
          </Text>
          <Text style={styles.countLabel}>Picked Up</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={[styles.countNumber, { color: "#403294" }]}>
            {orderCounts.delivered}
          </Text>
          <Text style={styles.countLabel}>Delivered</Text>
        </View>
        <View style={styles.countItem}>
          <Text style={[styles.countNumber, { color: "#DE350B" }]}>
            {orderCounts.rejected + orderCounts.cancelled}
          </Text>
          <Text style={styles.countLabel}>Rejected/Cancelled</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Date range selector */}
      <View style={styles.dateRangeContainer}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateLabel}>From:</Text>
          <Text style={styles.dateText}>{formatDateForDisplay(startDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateLabel}>To:</Text>
          <Text style={styles.dateText}>{formatDateForDisplay(endDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.applyButton, loading && styles.applyButtonDisabled]}
          onPress={fetchOrdersByDateRange}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}

      {/* Order Counts Section */}
      {hasInitialData && !loading && allOrders.length > 0 && renderOrderCounts()}

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by Order ID..."
          placeholderTextColor="#666666"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Dropdown
          style={styles.dropdown}
          selectedTextStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownText}
          containerStyle={styles.dropdownContainer}
          data={statusData}
          labelField="label"
          valueField="value"
          value={selectedValue}
          onChange={handleChange}
          placeholder="Select Status"
        />
      </View>

      {/* Current filter count */}
      {hasInitialData && !loading && (
        <View style={styles.filterCountContainer}>
          <Text style={styles.filterCountText}>
            Showing {orders.length} of {getCurrentFilterCount()} orders
            {selectedValue !== "all" && ` (${orderStatusMap[selectedValue]})`}
            {searchText && ` • Filtered by Order ID: "${searchText}"`}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Fetching orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrdersByDateRange}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !hasInitialData ? (
        <View style={styles.promptContainer}>
          <Text style={styles.promptText}>
            Select date range and click Apply to view orders
          </Text>
          <Text style={styles.promptSubtext}>
            Default range is set to last 7 days
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) =>
            item.uniqueId?.toString() || 
            item.orderId?.toString() || 
            Math.random().toString()
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                {searchText ? 
                  "Try adjusting your search term" : 
                  "Try adjusting your filters or date range"
                }
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
  },
  promptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
  },
  promptText: {
    fontSize: 18,
    color: "#172B4D",
    textAlign: "center",
    padding: 20,
    fontWeight: "500",
  },
  promptSubtext: {
    fontSize: 14,
    color: "#6B778C",
    textAlign: "center",
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#42526E",
  },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  dateSelector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: "#6B778C",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: "#172B4D",
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: "#0052CC",
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 80,
  },
  applyButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  countsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#172B4D",
    marginBottom: 12,
  },
  countsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  countItem: {
    alignItems: "center",
    width: "23%",
    marginBottom: 8,
  },
  countNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172B4D",
  },
  countLabel: {
    fontSize: 12,
    color: "#6B778C",
    marginTop: 2,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
  },
  filterCountContainer: {
    marginBottom: 8,
  },
  filterCountText: {
    fontSize: 14,
    color: "#6B778C",
    textAlign: "center",
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdown: {
    width: width * 0.35,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: "#172B4D",
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: "#DFE1E6",
    marginTop: 4,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  orderIdContainer: {
    gap: 4,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#6B778C",
    letterSpacing: 0.5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#172B4D",
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#DFE1E6",
    marginHorizontal: 16,
  },
  detailsContainer: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B778C",
  },
  detailValue: {
    fontSize: 14,
    color: "#172B4D",
    fontWeight: "500",
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#172B4D",
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B778C",
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#DE350B",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#0052CC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
});
export default AllOrders;
 