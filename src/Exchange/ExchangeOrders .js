 
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   Modal,
//   Alert,
//   TextInput,
//   Dimensions,
// } from "react-native";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { Ionicons } from "@expo/vector-icons";

// // Assuming you have a config file with BASE_URL
// import BASE_URL from "../../config";

// const { width } = Dimensions.get("window");

// const ExchangeOrders = ({ navigation }) => {
//   const userData = useSelector((state) => state.counter);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Modal states
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [assignModalVisible, setAssignModalVisible] = useState(false);
//   const [detailsModalVisible, setDetailsModalVisible] = useState(false);

//   // Form data states
//   const [deliveryBoys, setDeliveryBoys] = useState([]);
//   const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
//   const [collectedNewBag, setCollectedNewBag] = useState(null);
//   const [newBagBarcode, setNewBagBarcode] = useState("");
//   const [loadingDeliveryBoys, setLoadingDeliveryBoys] = useState(false);
//   const [loadingAssign, setLoadingAssign] = useState(false);

//   // Return details form
//   const [formData, setFormData] = useState({
//     returnBagWeight: "",
//     amountCollected: "",
//     remarks: "",
//   });

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/order-service/getAllExchangeOrder`,
//         {
//           headers: { Authorization: `Bearer ${userData?.accessToken}` },
//         }
//       );

    
//     if (response.data) {
//       console.log("Fetched exchange orders:", response.data);  // Logs the data to the console
//       setOrders(response.data);
//       setError(null);
//       } else {
//         throw new Error("No data received from server");
//       }
//     } catch (error) {
//       console.log(
//         "Error fetching exchange orders:",
//         error.response || error.message
//       );
//       setError("Failed to load exchange orders. Please try again.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchOrders();
//   };

//   const fetchDeliveryBoys = async (order) => {
//     setSelectedOrder(order);
//     setLoadingDeliveryBoys(true);

//     try {
//       const response = await axios.get(
//         `${BASE_URL}/user-service/deliveryBoyList`,
//         {
//           headers: { Authorization: `Bearer ${userData?.accessToken}` },
//         }
//       );

//       if (response.data) {
//         setDeliveryBoys(response.data);
//         setAssignModalVisible(true);
//       } else {
//         throw new Error("No delivery boys data received");
//       }
//     } catch (error) {
//       console.log(
//         "Error fetching delivery boys:",
//         error.response || error.message
//       );
//       Alert.alert(
//         "Error",
//         "Failed to get delivery boy list. Please try again later."
//       );
//     } finally {
//       setLoadingDeliveryBoys(false);
//     }
//   };

//   const handleAssign = async () => {
//     // Validation
//     if (!selectedDeliveryBoy) {
//       Alert.alert("Warning", "Please select a delivery boy.");
//       return;
//     }

//     if (collectedNewBag === null) {
//       Alert.alert("Warning", "Please select if a new bag is being collected.");
//       return;
//     }

//     if (collectedNewBag === "yes" && !newBagBarcode) {
//       Alert.alert("Warning", "Please enter the new bag barcode.");
//       return;
//     }

//     setLoadingAssign(true);

//     try {
//       // Fixed request body according to API requirements
//       const data = {
//         collectedNewBag: collectedNewBag === "yes" ? "yes" : "no",
//         exchangeId: selectedOrder?.exchangeId,
//         deliveryBoyId: selectedDeliveryBoy.userId,
//         newBagBarCode: collectedNewBag === "yes" ? newBagBarcode : null,
//       };

//       console.log({data})
//       // Send the request to assign delivery boy and collect new bag
//       const response = await axios.patch(
//         `${BASE_URL}/order-service/exchangeBagCollect`,
//         data,
//         {
//           headers: {
//             Authorization: `Bearer ${userData?.accessToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       console.log("Response from server:", response.data); // Log the response
//       if (response.status==200) {
//         Alert.alert(
//           "Success",
//           `Order assigned to ${selectedDeliveryBoy.firstName} ${
//             selectedDeliveryBoy.lastName
//           } ${collectedNewBag === "yes" ?"with new bag" :"without new bag"}.`
//         );
//         resetAssignModal();
//         fetchOrders();
//       } else {
//         throw new Error("Server returned an error");
//       }
//     } catch (error) {
//       console.log(
//         "Error assigning order:",
//         error.response?.data || error.message
//       );
//       Alert.alert("Error", "Failed to assign order. Please try again.");
//     } finally {
//       setLoadingAssign(false);
//     }
//   };

//   const handleReturnSubmit = async () => {
//     // Validation
//     if (!formData.returnBagWeight) {
//       Alert.alert("Warning", "Please enter the return bag weight.");
//       return;
//     }

//     if (!formData.amountCollected) {
//       Alert.alert("Warning", "Please enter the amount collected.");
//       return;
//     }

//     try {
//       const requestData = {
//         amountCollected: parseFloat(formData.amountCollected), // Convert to number
//         exchangeId: selectedOrder?.exchangeId,
//         remarks: formData.remarks || "",
//         returnBagWeight: parseFloat(formData.returnBagWeight), // Convert to number
//       };

//       const response = await axios.post(
//         `${BASE_URL}/order-service/exchangeOrderReassign`,
//         requestData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${userData?.accessToken}`,
//           },
//         }
//       );

//       if (response.status >= 200 && response.status < 300) {
//         Alert.alert("Success", "Return details submitted successfully!");
//         setDetailsModalVisible(false);
//         fetchOrders();
//       } else {
//         throw new Error("Server returned an error");
//       }
//     } catch (error) {
//       console.log(
//         "Error submitting data:",
//         error.response?.data || error.message
//       );
//       Alert.alert(
//         "Error",
//         "Failed to submit return details: " +
//           (error.response?.data?.message || "Unknown error")
//       );
//     }
//   };

//   const resetAssignModal = () => {
//     setAssignModalVisible(false);
//     setSelectedDeliveryBoy(null);
//     setCollectedNewBag(null);
//     setNewBagBarcode("");
//   };

//   const showDetailsModal = (order) => {
//     setSelectedOrder(order);
//     setFormData({
//       returnBagWeight: "",
//       amountCollected: "",
//       remarks: "",
//     });
//     setDetailsModalVisible(true);
//   };

//   // Helper functions
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "Invalid Date";

//       const month = date.toLocaleString("en-US", { month: "short" });
//       const day = date.getDate();
//       const year = date.getFullYear();
//       return `${month} ${day}, ${year}`;
//     } catch (error) {
//       return "N/A";
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return "??";
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   const getAvatarColor = (name) => {
//     if (!name) return "#9E9E9E";
//     const colors = [
//       "#FF6B6B",
//       "#4ECDC4",
//       "#45B7D1",
//       "#FFA62B",
//       "#9D65C9",
//       "#66BB6A",
//       "#5C6BC0",
//     ];
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   // Render functions
//   const renderOrderItem = ({ item }) => {
//     const avatarColor = getAvatarColor(item.userName);

//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <View style={styles.userSection}>
//             <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
//               <Text style={styles.avatarText}>
//                 {getInitials(item.userName)}
//               </Text>
//             </View>
//             <View style={styles.userInfo}>
//               <Text style={styles.orderId}>{item.orderId || "No ID"}</Text>
//               <Text style={styles.userName}>
//                 {item.userName || "Unknown User"}
//               </Text>
//               {item.mobileNumber && (
//                 <View style={styles.phoneTag}>
//                   <Text style={styles.phoneTagText}>{item.mobileNumber}</Text>
//                 </View>
//               )}
//             </View>
//           </View>

//           <View style={styles.dateContainer}>
//             <Text style={styles.dateText}>
//               {formatDate(item.exchangeRequestDate)}
//             </Text>
//             <View style={styles.diffRow}>
//               <Text style={styles.diffLabel}>Diff: </Text>
//               <Text
//                 style={[
//                   styles.diffValue,
//                   { color: item.daysDifference <= 3 ? "#34C759" : "#FF3B30" },
//                 ]}
//               >
//                 {item.daysDifference || "0"}
//               </Text>
//               <Text style={styles.diffUnit}> days</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.cardBody}>
//           <View style={styles.itemSection}>
//             <Text style={styles.sectionTitle}>Item Details</Text>
//             <Text style={styles.itemName}>
//               {item.itemName || "No item name"}
//             </Text>
//             <Text style={styles.itemPrice}>₹{item.itemPrice || "0"}</Text>
//           </View>

//           <View style={styles.addressSection}>
//             <Text style={styles.sectionTitle}>Address</Text>
//             <Text style={styles.addressText} numberOfLines={2}>
//               {item.orderAddress || "No address provided"}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.reasonSection}>
//           <Text style={styles.sectionTitle}>Reason</Text>
//           <Text style={styles.reasonText} numberOfLines={2}>
//             {item.reason || "No reason provided"}
//           </Text>
//         </View>

//         <View style={styles.actionsSection}>
//           <TouchableOpacity
//             style={styles.reassignButton}
//             onPress={() => fetchDeliveryBoys(item)}
//           >
//             <Text style={styles.buttonText}>Re-Assign</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.detailsButton}
//             onPress={() => showDetailsModal(item)}
//           >
//             <Text style={styles.buttonText}>Details</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // FIX: Generate unique keys for each delivery boy item
//   const renderDeliveryBoys = () => {
//     return deliveryBoys.map((boy) => {
//       const isSelected = selectedDeliveryBoy?.userId === boy.userId;

//       return (
//         <TouchableOpacity
//           key={`delivery-boy-${boy.userId}`} // Fixed: Ensure unique key
//           style={[
//             styles.deliveryBoyItem,
//             isSelected && styles.selectedDeliveryBoyItem,
//           ]}
//           onPress={() => setSelectedDeliveryBoy(boy)}
//         >
//           <View style={styles.radioButton}>
//             {isSelected && <View style={styles.radioButtonInner} />}
//           </View>
//           <Text style={styles.deliveryBoyName}>
//             {`${boy.firstName || ""} ${boy.lastName || ""} (${
//               boy.whatsappNumber || "No number"
//             })`}
//           </Text>
//         </TouchableOpacity>
//       );
//     });
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#3A5A40" />
//         <Text style={styles.loadingText}>Loading exchange orders...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Exchange Orders</Text>
//       </View>

//       {/* Error or empty state */}
//       {error ? (
//         <View style={styles.centered}>
//           <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : orders.length === 0 && !loading ? (
//         <View style={styles.centered}>
//           <Ionicons name="document-outline" size={64} color="#9E9E9E" />
//           <Text style={styles.noOrdersText}>No exchange orders found</Text>
//           <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
//             <Text style={styles.refreshButtonText}>Refresh</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={orders}
//           keyExtractor={(item) => 
//             // Fix: Ensure each item has a unique key
//             `order-${item.orderId || item.exchangeId || Math.random().toString(36).substring(2)}`
//           }
//           renderItem={renderOrderItem}
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={["#3A5A40"]}
//             />
//           }
//           showsVerticalScrollIndicator={false}
//         />
//       )}

//       {/* Assign Delivery Boy Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={assignModalVisible}
//         onRequestClose={resetAssignModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Delivery Boy</Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={resetAssignModal}
//               >
//                 <Ionicons name="close" size={22} color="#333" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView contentContainerStyle={styles.modalContent}>
//               {loadingDeliveryBoys ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="large" color="#3A5A40" />
//                 </View>
//               ) : (
//                 <>
//                   {deliveryBoys.length === 0 ? (
//                     <View style={styles.emptyStateContainer}>
//                       <Ionicons
//                         name="people-outline"
//                         size={48}
//                         color="#9E9E9E"
//                       />
//                       <Text style={styles.emptyStateText}>
//                         No delivery boys available
//                       </Text>
//                     </View>
//                   ) : (
//                     renderDeliveryBoys() // Use the new fixed rendering function
//                   )}
//                 </>
//               )}
//             </ScrollView>

//             <View style={styles.newBagSection}>
//               <Text style={styles.newBagLabel}>
//                 Is delivery boy collecting a new bag?
//               </Text>
//               <View style={styles.radioContainer}>
//                 <TouchableOpacity
//                   style={[
//                     styles.radioOption,
//                     collectedNewBag === "yes" && styles.selectedRadioOption,
//                   ]}
//                   onPress={() => setCollectedNewBag("yes")}
//                 >
//                   <Text style={styles.radioText}>Yes</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[
//                     styles.radioOption,
//                     collectedNewBag === "no" && styles.selectedRadioOption,
//                   ]}
//                   onPress={() => setCollectedNewBag("no")}
//                 >
//                   <Text style={styles.radioText}>No</Text>
//                 </TouchableOpacity>
//               </View>

//               {collectedNewBag === "yes" && (
//                 <View style={styles.newBagBarcodeContainer}>
//                   <TextInput
//                     style={styles.newBagBarcodeInput}
//                     placeholder="Enter New Bag Barcode"
//                     value={newBagBarcode}
//                     onChangeText={setNewBagBarcode}
//                     placeholderTextColor="#999"
//                   />
//                 </View>
//               )}
//             </View>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.assignButton}
//                 onPress={handleAssign}
//                 disabled={loadingAssign}
//               >
//                 {loadingAssign ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <Text style={styles.assignButtonText}>Assign</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Return Details Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={detailsModalVisible}
//         onRequestClose={() => setDetailsModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Return Details</Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setDetailsModalVisible(false)}
//               >
//                 <Ionicons name="close" size={22} color="#333" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               contentContainerStyle={styles.modalContent}
//               keyboardShouldPersistTaps="handled"
//             >
//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Return Bag Weight (kg)</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   placeholder="Enter bag weight"
//                   keyboardType="numeric"
//                   value={formData.returnBagWeight}
//                   onChangeText={(text) =>
//                     setFormData({ ...formData, returnBagWeight: text })
//                   }
//                   placeholderTextColor="#999"
//                 />
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Amount Collected (₹)</Text>
//                 <TextInput
//                   style={styles.formInput}
//                   placeholder="Enter amount collected"
//                   keyboardType="numeric"
//                   value={formData.amountCollected}
//                   onChangeText={(text) =>
//                     setFormData({ ...formData, amountCollected: text })
//                   }
//                   placeholderTextColor="#999"
//                 />
//               </View>

//               <View style={styles.formGroup}>
//                 <Text style={styles.formLabel}>Remarks</Text>
//                 <TextInput
//                   style={[styles.formInput, styles.multilineInput]}
//                   placeholder="Enter any additional remarks"
//                   multiline
//                   numberOfLines={4}
//                   value={formData.remarks}
//                   onChangeText={(text) =>
//                     setFormData({ ...formData, remarks: text })
//                   }
//                   placeholderTextColor="#999"
//                 />
//               </View>

//               <TouchableOpacity
//                 style={styles.submitButton}
//                 onPress={handleReturnSubmit}
//               >
//                 <Text style={styles.submitButtonText}>
//                   Submit Return Details
//                 </Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // styles for ExchangeOrders component
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F7FA",
//   },
//   header: {
//     padding: 16,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#E1E9EE",
//     elevation: 2,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#333",
//   },
//   listContainer: {
//     padding: 12,
//     paddingBottom: 20,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 16,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 8,
//   },
//   errorText: {
//     fontSize: 16,
//     color: "#F44336",
//     marginTop: 12,
//     textAlign: "center",
//   },
//   noOrdersText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 12,
//     textAlign: "center",
//   },
//   retryButton: {
//     marginTop: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: "#3A5A40",
//     borderRadius: 6,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   refreshButton: {
//     marginTop: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: "#3A5A40",
//     borderRadius: 6,
//   },
//   refreshButtonText: {
//     color: "#fff",
//     fontSize: 16,
//   },
  
//   // Card Styles
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 16,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   userSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 2,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   userInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   orderId: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 2,
//   },
//   userName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 4,
//   },
//   phoneTag: {
//     backgroundColor: "#E8F5E9",
//     paddingVertical: 2,
//     paddingHorizontal: 8,
//     borderRadius: 4,
//     alignSelf: "flex-start",
//   },
//   phoneTagText: {
//     fontSize: 12,
//     color: "#3A5A40",
//   },
//   dateContainer: {
//     flex: 1,
//     alignItems: "flex-end",
//   },
//   dateText: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 2,
//   },
//   diffRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   diffLabel: {
//     fontSize: 12,
//     color: "#666",
//   },
//   diffValue: {
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   diffUnit: {
//     fontSize: 12,
//     color: "#666",
//   },
  
//   // Card Body
//   cardBody: {
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: "#F0F0F0",
//     paddingTop: 12,
//     marginBottom: 12,
//   },
//   itemSection: {
//     flex: 1,
//     marginRight: 12,
//   },
//   addressSection: {
//     flex: 1.5,
//   },
//   sectionTitle: {
//     fontSize: 12,
//     color: "#999",
//     marginBottom: 4,
//     textTransform: "uppercase",
//   },
//   itemName: {
//     fontSize: 15,
//     color: "#333",
//     fontWeight: "500",
//     marginBottom: 2,
//   },
//   itemPrice: {
//     fontSize: 14,
//     color: "#3A5A40",
//     fontWeight: "600",
//   },
//   addressText: {
//     fontSize: 14,
//     color: "#666",
//     lineHeight: 20,
//   },
  
//   // Reason Section
//   reasonSection: {
//     borderTopWidth: 1,
//     borderTopColor: "#F0F0F0",
//     paddingTop: 12,
//     marginBottom: 16,
//   },
//   reasonText: {
//     fontSize: 14,
//     color: "#666",
//     lineHeight: 20,
//   },
  
//   // Action Buttons
//   actionsSection: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   reassignButton: {
//     backgroundColor: "#3A5A40",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     flex: 1,
//     marginRight: 8,
//     alignItems: "center",
//   },
//   detailsButton: {
//     backgroundColor: "#4A6FA5",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     flex: 1,
//     marginLeft: 8,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },
  
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     maxHeight: "90%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E1E9EE",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   closeButton: {
//     padding: 4,
//   },
//   modalContent: {
//     padding: 16,
//   },
//   loadingContainer: {
//     padding: 32,
//     alignItems: "center",
//   },
//   emptyStateContainer: {
//     padding: 32,
//     alignItems: "center",
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 8,
//     textAlign: "center",
//   },
  
//   // Delivery Boys List
//   deliveryBoyItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   selectedDeliveryBoyItem: {
//     backgroundColor: "#F0F7F4",
//   },
//   radioButton: {
//     height: 20,
//     width: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#3A5A40",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },
//   radioButtonInner: {
//     height: 10,
//     width: 10,
//     borderRadius: 5,
//     backgroundColor: "#3A5A40",
//   },
//   deliveryBoyName: {
//     fontSize: 16,
//     color: "#333",
//   },
  
//   // New Bag Section
//   newBagSection: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#E1E9EE",
//   },
//   newBagLabel: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#333",
//     marginBottom: 12,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     marginBottom: 16,
//   },
//   radioOption: {
//     borderWidth: 1,
//     borderColor: "#3A5A40",
//     paddingVertical: 8,
//     paddingHorizontal: 24,
//     borderRadius: 6,
//     marginRight: 12,
//   },
//   selectedRadioOption: {
//     backgroundColor: "#3A5A40",
//   },
//   radioText: {
//     color: "#3A5A40",
//     fontSize: 14,
//     fontWeight: "500",
//   },
//   newBagBarcodeContainer: {
//     marginTop: 8,
//   },
//   newBagBarcodeInput: {
//     height: 44,
//     borderWidth: 1,
//     borderColor: "#E1E9EE",
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: "#333",
//   },
  
//   // Modal Footer
//   modalFooter: {
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#E1E9EE",
//   },
//   assignButton: {
//     backgroundColor: "#3A5A40",
//     height: 48,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   assignButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
  
//   // Form Styles
//   formGroup: {
//     marginBottom: 16,
//   },
//   formLabel: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 6,
//     fontWeight: "500",
//   },
//   formInput: {
//     height: 44,
//     borderWidth: 1,
//     borderColor: "#E1E9EE",
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     fontSize: 16,
//     color: "#333",
//   },
//   multilineInput: {
//     height: 100,
//     paddingTop: 12,
//     textAlignVertical: "top",
//   },
//   submitButton: {
//     backgroundColor: "#3A5A40",
//     height: 48,
//     borderRadius: 8,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 16,
//   },
//   submitButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
// export default ExchangeOrders;







import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';

const API_URL = 'http://182.18.139.138:9029/api/order-service/getAllExchangeOrder';

// Enum for tab indices
const TABS = {
  EXCHANGE_REQUESTED: 'EXCHANGEREQUESTED',
  ASSIGN_TO_COLLECT: 'ASSIGNTOCOLLECT',
  RECOMPLETED: 'RECOMPLETED',
};

const ExchangeOrders = () => {
  const [exchangeOrders, setExchangeOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.EXCHANGE_REQUESTED);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch exchange orders from API
  const fetchExchangeOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setExchangeOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching exchange orders:', err);
      setError('Failed to fetch exchange orders. Please try again.');
      Alert.alert('Error', 'Failed to fetch exchange orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch orders on initial mount
  useEffect(() => {
    fetchExchangeOrders();
  }, []);

  // Pull to refresh function
  const onRefresh = () => {
    setRefreshing(true);
    fetchExchangeOrders();
  };

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    return exchangeOrders.filter(order => order.status === activeTab);
  };

  // Count orders by status for tab badges
  const getOrderCounts = () => {
    const counts = {
      [TABS.EXCHANGE_REQUESTED]: 0,
      [TABS.ASSIGN_TO_COLLECT]: 0,
      [TABS.RECOMPLETED]: 0,
    };
    
    exchangeOrders.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    
    return counts;
  };

  const orderCounts = getOrderCounts();

  // Render a single exchange order item
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Order #{item.orderId}</Text>
        <Text style={styles.price}>₹{item.itemPrice}</Text>
      </View>
      
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Text style={styles.userName}>Customer: {item.userName}</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Date: </Text>
        <Text>{item.exchangeRequestDate}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Days Ago: </Text>
        <Text>{item.daysDifference}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Reason: </Text>
        <Text>{item.reason}</Text>
      </View>
      
      <View style={styles.addressContainer}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.address}>{item.orderAddress}</Text>
      </View>
      
      {item.mobileNumber && item.mobileNumber.trim() !== "" && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Mobile: </Text>
          <Text>{item.mobileNumber}</Text>
        </View>
      )}
    </View>
  );

  // Render a tab button
  const renderTabButton = (tabName, displayName) => {
    const isActive = activeTab === tabName;
    const count = orderCounts[tabName];
    
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tabName)}
      >
        <Text style={[styles.tabButtonText, isActive && styles.activeTabText]}>
          {displayName} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  // Render main content based on loading state
  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading exchange orders...</Text>
        </View>
      );
    }

    const filteredOrders = getFilteredOrders();

    return (
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.exchangeId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No orders found in this category</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exchange Orders</Text>
      </View>
      
      <View style={styles.tabContainer}>
        {renderTabButton(TABS.EXCHANGE_REQUESTED, 'Exchange Requested')}
        {renderTabButton(TABS.ASSIGN_TO_COLLECT, 'Assigned to Collect')}
        {renderTabButton(TABS.RECOMPLETED, 'Re-Completed')}
      </View>
      
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#0066cc',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
    color: '#222',
  },
  userName: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  addressContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  address: {
    marginTop: 2,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ExchangeOrders;