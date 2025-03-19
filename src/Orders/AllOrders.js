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
import DateTimePicker from '@react-native-community/datetimepicker';
import BASE_URL from '../../config';

const { width } = Dimensions.get("window");

const AllOrders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [searchText, setSearchText] = React.useState("");
  const accessToken = useSelector((state) => state.counter);
  // const { BASE_URL } = config(); // Get values

  // Date range states
  const [startDate, setStartDate] = React.useState(new Date(new Date().setDate(new Date().getDate() - 7))); // Default to 7 days ago
  const [endDate, setEndDate] = React.useState(new Date()); // Default to today
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);

  const [selectedValue, setSelectedValue] = React.useState("all"); // Default to show all orders
  const [dropLoading, setDropLoading] = React.useState(false);

  const orderStatusMap = {
    "all": "All Orders",
    "0": "Incomplete",
    "1": "Placed",
    "2": "Accepted",
    "3": "Assigned",
    "4": "Delivered",
    "5": "Rejected",
    "6": "Cancelled",
    
  };

  const fetchOrdersByDateRange = async () => {
    setLoading(true);
    try {
      const formattedStartDate = formatDateForApi(startDate);
      const formattedEndDate = formatDateForApi(endDate);
      
      const response = await axios.get(
        `${BASE_URL}order-service/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      
      // console.log("Date range orders response", response);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders by date range:", error);
      setError(error.response?.data?.message || "Failed to fetch orders for selected date range.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByDateRange();
  }, []);

  const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatOrderDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const filteredOrders = orders
    .filter((item) => {
      // Filter by status (if "all" is selected, include all orders)
      return selectedValue === "all" || item.orderStatus === selectedValue;
    })
    .filter((item) => {
      // Filter by search text - ONLY by orderId
      const searchLower = searchText.toLowerCase().trim();
      
      // Check if search text is empty
      if (!searchLower) return true;

      // Search ONLY through orderId
      return (
        // Search by orderId only
        (item.orderId && item.orderId.toString().toLowerCase().includes(searchLower))
      );
    });

  const statusData = Object.keys(orderStatusMap).map((key) => ({
    label: orderStatusMap[key],
    value: key,
  }));

  const handleChange = (item) => {
    setDropLoading(true);
    setSelectedValue(item.value);
    setTimeout(() => setDropLoading(false), 500);
  };

  const getStatusColor = (status) => {
    const colors = {
      1: "#FF6B00", // Placed - Orange
      2: "#00875A", // Accepted - Green
      3: "#0052CC", // Assigned - Blue
      "PickedUp": "#0052CC", // Picked Up - Blue
      4: "#403294", // Delivered - Purple
      5: "#DE350B", // Rejected - Red
      6: "#DE350B", // Cancelled - Red
    };
    return colors[status] || "#666666";
  };

  const getStatusBackgroundColor = (status) => {
    const colors = {
      1: "#FFF0E6", // Light Orange
      2: "#E3FCEF", // Light Green
      3: "#DEEBFF", // Light Blue
      "PickedUp": "#DEEBFF", // Light Blue
      4: "#EAE6FF", // Light Purple
      5: "#FFEBE6", // Light Red
      6: "#FFEBE6", // Light Red
    };
    return colors[status] || "#F4F5F7";
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate("Order Details", { order: item })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>ORDER ID</Text>
          <Text style={styles.orderId}>
  {item.orderId ? (item.orderId).slice(-4) : "N/A"}
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
          <Text style={styles.detailValue}>{formatOrderDate(item.orderDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grand Total</Text>
          <Text style={styles.detailValue}>₹{item.grandTotal || "0"}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          style={styles.applyButton}
          onPress={fetchOrdersByDateRange}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
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
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) =>
            item.uniqueId?.toString() || Math.random().toString()
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters or date range</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
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
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 16,
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
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: "#DE350B",
    textAlign: "center",
    marginBottom: 16,
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
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default AllOrders;







// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   TextInput,
//   Modal,
//   ScrollView,
//   StatusBar,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Picker } from '@react-native-picker/picker';
// import { Dropdown } from 'react-native-element-dropdown';

// // Get screen dimensions
// const { width, height } = Dimensions.get('window');

// const AllOrders = () => {
//   // States for date selection
//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
  
//   // States for data and UI
//   const [orders, setOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchText, setSearchText] = useState('');
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
  
//   // Add a state to track if a search has been performed
//   const [hasSearched, setHasSearched] = useState(false);
  
//   // State for status filter with updated status options
//   const [selectedStatus, setSelectedStatus] = useState('All');
//   const statusOptions = [
//     { label: 'All', value: '0' },
//     { label: 'Incomplete', value: '1' },
//     { label: 'Placed', value: '2' },
//     { label: 'Accepted', value: '3' },
//     { label: 'Picked Up', value: '4' },
//     { label: 'Delivered', value: '5' },
//     { label: 'Rejected', value: '6' },
//     { label: 'Cancelled', value: '7' }
//   ];
//   // Status mapping for API integration
//   const statusMapping = {
//     "Incomplete": "0",
//     "Placed": "1",
//     "Accepted": "2",
//     "Picked Up": "3",
//     "Delivered": "4",
//     "Rejected": "5",
//     "Cancelled": "6"
//   };
  
//   // Reverse mapping from status code to display name
//   const statusCodeToText = {
//     "0": "Incomplete",
//     "1": "Placed",
//     "2": "Accepted",
//     "3": "Picked Up",
//     "4": "Delivered",
//     "5": "Rejected",
//     "6": "Cancelled"
//   };

//   // Date formatting functions
//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   const displayDate = (date) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return date.toLocaleDateString(undefined, options);
//   };

//   // Handle date picker changes
//   const handleStartDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || startDate;
//     setShowStartPicker(Platform.OS === 'ios');
//     setStartDate(currentDate);
//   };

//   const handleEndDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || endDate;
//     setShowEndPicker(Platform.OS === 'ios');
//     setEndDate(currentDate);
//   };

//   // Format order ID to show only last 4 digits/characters
//   const formatOrderId = (orderId) => {
//     if (!orderId) return 'N/A';
//     return orderId.length > 4 ? orderId.slice(-4) : orderId;
//   };

//   // Process API response to standardize order data
//   const processOrderData = (data) => {
//     if (!data || !Array.isArray(data)) {
//       console.warn('Invalid API response format:', data);
//       return [];
//     }
    
//     return data.map(order => {
//       // Extract the status code and convert to display text
//       const statusCode = order.statusCode || order.status || '';
//       const statusText = statusCodeToText[statusCode] || 'Unknown';
      
//       // Create a standardized order object with consistent property names
//       return {
//         id: order.orderId || order.id || '',
//         orderId: order.orderId || order.id || '',
//         customerName: order.customerName || order.customer || '',
//         mobileNumber: order.mobileNumber || order.mobile || '',
//         orderDate: order.orderDate || order.date || '',
//         orderStatus: statusText,
//         statusCode: statusCode,
//         grandTotal: order.grandTotal || order.total || '0',
//         placedDate: order.placedDate || '',
//         acceptedDate: order.acceptedDate || '',
//         pickedUpDate: order.pickedUpDate || '',
//         deliveredDate: order.deliveredDate || '',
//         deliveryPerson: order.deliveryPerson || '',
//         rejectedDate: order.rejectedDate || '',
//         cancelledDate: order.cancelledDate || '',
//         notes: order.notes || ''
//       };
//     });
//   };

//   // Fetch orders based on date range and status
//   const fetchOrders = async () => {
//     if (endDate < startDate) {
//       Alert.alert(
//         'Invalid Date Range', 
//         'End date cannot be before start date. Please select a valid date range.',
//         [{ text: 'OK', onPress: () => console.log('Invalid date alert closed') }]
//       );
//       return;
//     }

//     setLoading(true);
//     setOrders([]);
//     setFilteredOrders([]);
//     setHasSearched(true);

//     try {
//       const formattedStartDate = formatDate(startDate);
//       const formattedEndDate = formatDate(endDate);
      
//       // Build the API URL with date range
//       let apiUrl = `https://meta.oxyglobal.tech/api/order-service/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      
//       // Add status filter if not "All"
//       const statusCode = statusMapping[selectedStatus];
//       if (selectedStatus !== 'All') {
       
        
//         if (statusCode !== undefined) {
//           apiUrl += `&status=${statusCode}`;
//           console.log(`Filtering by status: ${selectedStatus} (code: ${statusCode})`);
//         }
//       }
      
//       console.log('Fetching from:', apiUrl);
      
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`);
//       }
      
//       // First try to parse response as JSON
//       let responseText = await response.text();
//       let data;
      
//       try {
//         // Attempt to parse JSON response
//         data = JSON.parse(responseText);
//         console.log('Response parsed successfully');
//       } catch (parseError) {
//         console.error('JSON parse error:', parseError);
//         console.log('Raw response:', responseText);
//         throw new Error('Failed to parse API response');
//       }

//       // console.log('Data structure:', Array.isArray(data) ? 'Array' : typeof data);
      
     
//       const orderData = Array.isArray(data) ? data : 
//                         (data && typeof data === 'object' && Array.isArray(data.data)) ? data.data : 
//                         (data && typeof data === 'object' && data.orders && Array.isArray(data.orders)) ? data.orders : 
//                         [];
      
//       console.log(`Processing ${orderData.length} orders`);
      
//       // Process and standardize the order data
//       const processedOrders = processOrderData(orderData);
      
//       // Apply status filter if needed
//       const filteredByStatus = selectedStatus === 'All' 
//         ? processedOrders
//         : processedOrders.filter(order => order.orderStatus === selectedStatus);
      
//       console.log(`Filtered ${processedOrders.length} orders to ${filteredByStatus.length} that match status "${selectedStatus}"`);

//       setOrders(filteredByStatus);
//       setFilteredOrders(filteredByStatus);

//       if (filteredByStatus.length === 0) {
//         Alert.alert(
//           'No Orders Found', 
//           `No ${selectedStatus !== 'All' ? selectedStatus + ' ' : ''}orders found for the selected date range. Try adjusting your filters.`,
//           [{ text: 'OK', onPress: () => console.log('No orders alert closed') }]
//         );
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       Alert.alert(
//         'Error Retrieving Orders', 
//         `Failed to fetch orders: ${err.message}. Please check your connection and try again.`,
//         [{ text: 'Retry', onPress: () => fetchOrders() }, { text: 'Cancel', style: 'cancel' }]
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter orders based on search text
//   useEffect(() => {
//     if (orders.length === 0) return;

//     let result = [...orders];
    
//     // Filter by search text (order ID or customer name)
//     if (searchText) {
//       const searchLower = searchText.toLowerCase();
//       result = result.filter(order => 
//         (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
//         (order.customerName && order.customerName.toLowerCase().includes(searchLower))
//       );
//     }
    
//     setFilteredOrders(result);
//   }, [searchText, orders]);

//   useEffect(()=>{
//     if (hasSearched) {
//         fetchOrders();
//     }
//   },[selectedStatus])
 
//   const handleStatusChange = (item) => {
//     setSelectedStatus(item.value);
//     if (item.value === selectedStatus) return; 
//     console.log(`Status filter changed from "${selectedStatus}" to "${item.value}" this is changed value`);
  
//   };

//   // Open order details modal
//   const viewOrderDetails = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };

//   // Render each order item in the list
//   const renderOrderItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.orderItem}
//       onPress={() => viewOrderDetails(item)}
//     >
//       <View style={styles.orderHeader}>
//         <Text style={styles.orderId}>Order #{formatOrderId(item.orderId || item.id || 'N/A')}</Text>
//         <View style={[
//           styles.statusBadge,
//           { backgroundColor: getStatusColor(item.orderStatus) }
//         ]}>
//           <Text style={styles.statusText}>{item.orderStatus || 'Unknown'}</Text>
//         </View>
//       </View>
    
//       <View style={styles.orderRow}>
//         <Text style={styles.orderLabel}>Date:</Text>
//         <Text style={styles.orderValue}>{item.orderDate || 'N/A'}</Text>
//       </View>
     
//       <View style={styles.orderRow}>
//         <Text style={styles.orderLabel}>Total:</Text>
//         <Text style={styles.orderTotal}>₹{item.grandTotal || '0'}</Text>
//       </View>
      
//       <View style={styles.orderRow}>
//         <Text style={styles.orderLabel}>Customer:</Text>
//         <Text style={styles.orderValue}>{item.customerName || 'N/A'}</Text>
//       </View>
      
//       <Text style={styles.viewDetails}>View Details ›</Text>
//     </TouchableOpacity>
//   );

//   // Status color helper
//   const getStatusColor = (status) => {
//     if (!status) return '#999';
    
//     switch(status.toLowerCase()) {
//       case 'incomplete': return '#999999';
//       case 'placed': return '#3498db';
//       case 'accepted': return '#f39c12';
//       case 'picked up': return '#9b59b6';
//       case 'delivered': return '#2ecc71';
//       case 'rejected': return '#e74c3c';
//       case 'cancelled': return '#7f8c8d';
//       default: return '#999';
//     }
//   };

//   // Render order details modal
//   const renderOrderDetailsModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={modalVisible}
//       onRequestClose={() => setModalVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           {selectedOrder ? (
//             <ScrollView>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Order Details</Text>
//                 <TouchableOpacity onPress={() => setModalVisible(false)}>
//                   <Text style={styles.closeButton}>✕</Text>
//                 </TouchableOpacity>
//               </View>
              
//               <View style={styles.detailSection}>
//                 <Text style={styles.detailHeader}>Order Information</Text>
                
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Order ID:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.orderId || 'N/A'}</Text>
//                 </View>
                
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Customer:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.customerName || 'N/A'}</Text>
//                 </View>
                
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Mobile:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.mobileNumber || 'N/A'}</Text>
//                 </View>
                
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Total:</Text>
//                   <Text style={styles.detailValue}>₹{selectedOrder.grandTotal || '0'}</Text>
//                 </View>
                
//                 <View style={styles.statusRow}>
//                   <Text style={styles.detailLabel}>Status:</Text>
//                   <View style={[
//                     styles.statusBadgeLarge,
//                     { backgroundColor: getStatusColor(selectedOrder.orderStatus) }
//                   ]}>
//                     <Text style={styles.statusTextLarge}>{selectedOrder.orderStatus || 'Unknown'}</Text>
//                   </View>
//                 </View>
//               </View>
              
//               <View style={styles.detailSection}>
//                 <Text style={styles.detailHeader}>Timeline</Text>
                
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Placed:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.placedDate || 'N/A'}</Text>
//                 </View>
                
//                 <View style={styles.detaislRow}>
//                   <Text style={styles.detailLabel}>Accepted:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.acceptedDate || 'N/A'}</Text>
//                 </View>
                
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Picked Up:</Text>
//                   <Text style={styles.detailValue}>{selectedOrder.pickedUpDate || 'N/A'}</Text>
//                 </View>
                
//                 {selectedOrder.orderStatus === 'Delivered' && (
//                   <>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Delivered:</Text>
//                       <Text style={styles.detailValue}>{selectedOrder.deliveredDate || 'N/A'}</Text>
//                     </View>
//                     <View style={styles.detailRow}>
//                       <Text style={styles.detailLabel}>Delivered By:</Text>
//                       <Text style={styles.detailValue}>{selectedOrder.deliveryPerson || 'N/A'}</Text>
//                     </View>
//                   </>
//                 )}
                
//                 {(selectedOrder.orderStatus === 'Rejected' || selectedOrder.orderStatus === 'Cancelled') && (
//                   <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Rejected/Cancelled:</Text>
//                     <Text style={styles.detailValue}>{selectedOrder.rejectedDate || selectedOrder.cancelledDate || 'N/A'}</Text>
//                   </View>
//                 )}
//               </View>
              
//               {selectedOrder.notes && (
//                 <View style={styles.detailSection}>
//                   <Text style={styles.detailHeader}>Notes</Text>
//                   <Text style={styles.notesText}>{selectedOrder.notes}</Text>
//                 </View>
//               )}
//             </ScrollView>
//           ) : (
//             <Text style={styles.loadingText}>Loading order details...</Text>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
      
//       <Text style={styles.header}>Order Management</Text>
      
//       {/* Date Range Selector */}
//       <View style={styles.datePickerContainer}>
//         <View style={styles.dateContainer}>
//           <Text style={styles.dateLabel}>From Date</Text>
//           <TouchableOpacity 
//             style={styles.dateButton}
//             onPress={() => setShowStartPicker(true)}
//           >
//             <Text style={styles.dateText}>{displayDate(startDate)}</Text>
//           </TouchableOpacity>
//           {showStartPicker && (
//             <DateTimePicker
//               value={startDate}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={handleStartDateChange}
//             />
//           )}
//         </View>
        
//         <View style={styles.dateContainer}>
//           <Text style={styles.dateLabel}>To Date</Text>
//           <TouchableOpacity 
//             style={styles.dateButton}
//             onPress={() => setShowEndPicker(true)}
//           >
//             <Text style={styles.dateText}>{displayDate(endDate)}</Text>
//           </TouchableOpacity>
//           {showEndPicker && (
//             <DateTimePicker
//               value={endDate}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={handleEndDateChange}
//             />
//           )}
//         </View>
//       </View>
      
//       {/* Status Dropdown */}
//       <View style={styles.statusFilterSection}>
//         <Text style={styles.filterSectionTitle}>Filter by Status</Text>
//         <View style={styles.pickerContainer}>
//         <Dropdown
//   style={styles.dropdown}
//   selectedTextStyle={styles.selectedTextStyle}
//   placeholderStyle={styles.placeholderStyle}
//   data={statusOptions}
//   maxHeight={400}
//   labelField="label"
//   valueField="value"
//   placeholder="Select Status"
//   value={selectedStatus}
//   onChange={handleStatusChange}
// />
//         </View>
//       </View>
      
//       {/* Search Button */}
//       <TouchableOpacity 
//         style={styles.searchButton} 
//         onPress={fetchOrders}
//         disabled={loading}
//       >
//         <Text style={styles.searchButtonText}>
//           {loading ? 'Searching...' : 'Search Orders'}
//         </Text>
//       </TouchableOpacity>
      
//       {/* Filter Section */}
//       {hasSearched && orders.length > 0 && (
//         <View style={styles.filterSection}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search by Order ID or Customer"
//             value={searchText}
//             onChangeText={setSearchText}
//             placeholderTextColor="#999"
//           />
//         </View>
//       )}
      
//       {/* Results Section */}
//       <View style={styles.resultsContainer}>
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#0066CC" />
//             <Text style={styles.loadingText}>Loading orders...</Text>
//           </View>
//         ) : hasSearched ? (
//           orders.length > 0 ? (
//             <>
//               <View style={styles.resultsHeader}>
//                 <Text style={styles.resultsTitle}>
//                   {selectedStatus !== 'All' ? `${selectedStatus} Orders` : 'All Orders'}
//                 </Text>
//                 <Text style={styles.resultsCount}>
//                   {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
//                 </Text>
//               </View>
//               {filteredOrders.length > 0 ? (
//                 <FlatList
//                   data={filteredOrders}
//                   renderItem={renderOrderItem}
//                   keyExtractor={(item, index) => (item.orderId || item.id || index.toString())}
//                   contentContainerStyle={styles.ordersList}
//                   ListEmptyComponent={
//                     <View style={styles.emptyContainer}>
//                       <Text style={styles.emptyText}>No orders match your current search</Text>
//                     </View>
//                   }
//                 />
//               ) : (
//                 <View style={styles.emptyContainer}>
//                   <Text style={styles.emptyText}>No orders match your filters</Text>
//                 </View>
//               )}
//             </>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>
//                 {selectedStatus !== 'All' 
//                   ? `No ${selectedStatus} orders found for the selected date range` 
//                   : 'No orders found for the selected date range and status'}
//               </Text>
//               <Text style={styles.emptySubText}>Try adjusting your filters or selecting a different status</Text>
//             </View>
//           )
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>
//               Select a date range and status, then tap Search to view orders
//             </Text>
//             <Text style={styles.emptySubText}>
//               Or select a status from the dropdown to see all orders with that status
//             </Text>
//           </View>
//         )}
//       </View>
      
//       {renderOrderDetailsModal()}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//     width: Dimensions.get('window').width,
//     height: Dimensions.get('window').height,
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   datePickerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   dateContainer: {
//     width: '48%',
//   },
//   dateLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 8,
//     color: '#555',
//   },
//   dateButton: {
//     padding: 12,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   statusFilterSection: {
//     marginBottom: 16,
//   },
//   filterSectionTitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 8,
//     color: '#555',
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     backgroundColor: '#fff',
//     marginBottom: 8,
//   },
//   picker: {
//     height: 50,
//   },
//   pickerItem: {
//     height: 46,
//     fontSize: 14,
//   },
//   searchButton: {
//     backgroundColor: '#0066CC',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   searchButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   filterSection: {
//     marginBottom: 16,
//   },
//   searchInput: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     fontSize: 14,
//   },
//   resultsContainer: {
//     flex: 1,
//   },
//   resultsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   resultsTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   resultsCount: {
//     fontSize: 14,
//     color: '#666',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#555',
//   },
//   ordersList: {
//     paddingBottom: 20,
//   },
//   orderItem: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#eee',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   orderRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   orderLabel: {
//     width: 80,
//     fontWeight: '500',
//     color: '#555',
//     fontSize: 14,
//   },
//   orderValue: {
//     flex: 1,
//     color: '#333',
//     fontSize: 14,
//   },
//   orderTotal: {
//     flex: 1,
//     color: '#0066CC',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   viewDetails: {
//     alignSelf: 'flex-end',
//     color: '#0066CC',
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderStyle: 'dashed',
//     borderRadius: 8,
//     padding: 20,
//   },
//   emptyText: {
//     color: '#888',
//     textAlign: 'center',
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   emptySubText: {
//     color: '#aaa',
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '90%',
//     maxHeight: '80%',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   closeButton: {
//     fontSize: 20,
//     color: '#999',
//     padding: 4,
//   },
//   detailSection: {
//     marginBottom: 20,
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//   },
//   detailHeader: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   detailLabel: {
//     width: 100,
//     fontWeight: '500',
//     color: '#555',
//   },
//   detailValue: {
//     flex: 1,
//     color: '#333',
//   },
//   statusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   statusBadgeLarge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   statusTextLarge: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   notesText: {
//     color: '#666',
//     lineHeight: 20,
//   },
// });

// export default AllOrders;