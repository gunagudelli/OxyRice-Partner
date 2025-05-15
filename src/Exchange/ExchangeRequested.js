// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   StyleSheet, 
//   TouchableOpacity, 
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Modal,
//   TextInput,
//   ScrollView
// } from 'react-native';
// import axios from 'axios';
// import { Card, RadioButton } from 'react-native-paper';
// import { MaterialIcons } from '@expo/vector-icons';
// import  BASE_URL  from '../../config';


// const ExchangeRequested = ({ accessToken }) => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Reassign modal states
//   const [reassignModalVisible, setReassignModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [deliveryBoys, setDeliveryBoys] = useState([]);
//   const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
//   const [collectNewBag, setCollectNewBag] = useState('Yes');
//   const [newBagBarCode, setNewBagBarCode] = useState('');
//   const [loadingDeliveryBoys, setLoadingDeliveryBoys] = useState(false);
//   const [assigningDeliveryBoy, setAssigningDeliveryBoy] = useState(false);
//   const [buttonsDisabled, setButtonsDisabled] = useState(false);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await axios.get(`${BASE_URL}order-service/getAllExchangeOrder`, {
//         headers: {
//           Authorization: `Bearer ${accessToken?.token}`,
//           'Content-Type': 'application/json',
//         }
//       });
       
//       // Filter only EXCHANGEREQUESTED orders
//       const requestedOrders = response.data.filter(order => 
//         order.status === 'EXCHANGEREQUESTED'
//       );
//       console.log("Requested Exchange Orders:", requestedOrders);
//       setOrders(requestedOrders);
//     } catch (err) {
//       setError('Failed to fetch orders. Please try again.');
//       Alert.alert('Error', 'Failed to load order data');
//       console.error("Error fetching exchange orders:", err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const fetchDeliveryBoys = async () => {
//     try {
//       setLoadingDeliveryBoys(true);
//       setButtonsDisabled(false);
      
//       const url = `${BASE_URL}user-service/deliveryBoyList`;
      
//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${accessToken?.token}`,
//           'Content-Type': 'application/json',
//         }
//       });
      
//       if (response.status === 200) {
//         // Filter only active delivery boys
//         const activeDeliveryBoys = response.data.filter(boy => boy.isActive === "true");
//         console.log("Active Delivery Boys:", activeDeliveryBoys);
//         setDeliveryBoys(activeDeliveryBoys || []);
//         setButtonsDisabled(true);
//       }
//     } catch (err) {
//       Alert.alert('Error', 'Failed to load delivery boy list');
//       console.error("Error fetching delivery boys:", err);
//     } finally {
//       setLoadingDeliveryBoys(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchOrders();
//   };

//   const handleReassignPress = (order) => {
//     setSelectedOrder(order);
//     // Reset selection states when opening modal
//     setSelectedDeliveryBoy(null);
//     setCollectNewBag('Yes');
//     setNewBagBarCode('');
//     setReassignModalVisible(true);
//     fetchDeliveryBoys();
//   };

//   const handleDeliveryBoySelect = (boy) => {
//     console.log("Selected delivery boy:", boy);
//     setSelectedDeliveryBoy(boy);
//   };

//   const handleAssignDeliveryBoy = async () => {
//     if (!selectedDeliveryBoy) {
//       Alert.alert('Error', 'Please select a delivery boy');
//       return;
//     }

//     if (collectNewBag === 'Yes' && !newBagBarCode.trim()) {
//       Alert.alert('Error', 'Please enter a new bag barcode');
//       return;
//     }

//     try {
//       setAssigningDeliveryBoy(true);
      
//       // Create payload with proper format based on the API requirements
//       const payload = {
//         exchangeId: selectedOrder.exchangeId,
//         deliveryBoyId: selectedDeliveryBoy.userId,
//         collectedNewBag: collectNewBag, // Send "Yes" or "No" as a string
//         newBagBarCode: collectNewBag === 'Yes' ? newBagBarCode : null
//       };

//       console.log("Sending payload to API:", payload);

//       const response = await axios.patch(
//         `${BASE_URL}order-service/exchangeBagCollect`, 
//         payload,
//         {
//           headers: {
//             'Authorization': `Bearer ${accessToken?.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       console.log("API response:", response.data);
      
//       Alert.alert(
//         'Success', 
//         `Exchange order #${selectedOrder.orderId} has been assigned to ${selectedDeliveryBoy.name} successfully`,
//         [{ text: 'OK', onPress: () => {
//           setReassignModalVisible(false);
//           fetchOrders(); // Refresh the list after successful assignment
//         }}]
//       );
//     } catch (err) {
//       console.error("API Error:", err.response?.data || err.message);
//       Alert.alert('Error', `Failed to assign delivery boy: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setAssigningDeliveryBoy(false);
//     }
//   };

//   const renderItem = ({ item }) => (
//     <Card style={styles.card}>
//       <Card.Content>
//         <View style={styles.cardHeader}>
//           <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
//           <View style={styles.statusContainer}>
//             <Text style={styles.statusText}>{item.status}</Text>
//           </View>
//         </View>

//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Customer:</Text>
//           <Text style={styles.value}>{item.userName}</Text>
//         </View>
        
//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Item:</Text>
//           <Text style={styles.value}>{item.itemName}</Text>
//         </View>
        
//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Price:</Text>
//           <Text style={styles.value}>₹{item.itemPrice}</Text>
//         </View>
        
//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Reason:</Text>
//           <Text style={styles.value}>{item.reason}</Text>
//         </View>
        
//         <View style={styles.detailRow}>
//           <Text style={styles.label}>Requested:</Text>
//           <Text style={styles.value}>{item.exchangeRequestDate} ({item.daysDifference} days ago)</Text>
//         </View>

//         <View style={styles.addressSection}>
//           <Text style={styles.addressLabel}>Delivery Address:</Text>
//           <Text style={styles.addressText}>{item.orderAddress}</Text>
//         </View>

//         <View style={styles.actionsContainer}>
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => handleReassignPress(item)}
//           >
//             <MaterialIcons name="assignment-ind" size={20} color="#006700" />
//             <Text style={styles.actionButtonText}>Reassign</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.actionButton}
//             onPress={() => Alert.alert('Details', `View complete details for order #${item.orderId}`)}
//           >
//             <MaterialIcons name="info-outline" size={20} color="#006700" />
//             <Text style={styles.actionButtonText}>Details</Text>
//           </TouchableOpacity>
//         </View>
//       </Card.Content>
//     </Card>
//   );

//   const renderReassignModal = () => (
//     <Modal
//       visible={reassignModalVisible}
//       transparent={true}
//       animationType="slide"
//       onRequestClose={() => setReassignModalVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Reassign Exchange Order</Text>
//             <TouchableOpacity onPress={() => setReassignModalVisible(false)}>
//               <MaterialIcons name="close" size={24} color="#757575" />
//             </TouchableOpacity>
//           </View>

//           {selectedOrder && (
//             <View style={styles.orderInfo}>
//               <Text style={styles.orderInfoText}>
//                 Order #{selectedOrder.orderId} - {selectedOrder.itemName}
//               </Text>
//             </View>
//           )}

//           <Text style={styles.sectionTitle}>Select Delivery Boy</Text>
          
//           {loadingDeliveryBoys ? (
//             <ActivityIndicator size="small" color="#006700" style={styles.loader} />
//           ) : deliveryBoys.length === 0 ? (
//             <Text style={styles.noDataText}>No active delivery boys available</Text>
//           ) : (
//             <>
//               <Text style={styles.selectionInstructions}>
//                 Please select a delivery boy from the list below
//               </Text>
//               <ScrollView style={styles.deliveryBoyList}>
//                 {deliveryBoys.map((boy) => (
//                   <TouchableOpacity
//                     key={boy.id}
//                     style={[
//                       styles.deliveryBoyItem,
//                       selectedDeliveryBoy?.id === boy.id && styles.selectedDeliveryBoy
//                     ]}
//                     onPress={() => handleDeliveryBoySelect(boy)}
//                     accessible={true}
//                     accessibilityLabel={`Select delivery boy ${boy.name}`}
//                     accessibilityRole="button"
//                     disabled={!buttonsDisabled}
//                   >
//                     <View style={styles.deliveryBoyItemContent}>
//                  <Text style={styles.deliveryBoyName}>
//   {boy.firstName} {boy.lastName?.trim()}
// </Text>
//                       <Text style={styles.deliveryBoyPhone}>{boy.phone}</Text>
//                     </View>
//                     {selectedDeliveryBoy?.id === boy.id && (
//                       <MaterialIcons name="check-circle" size={24} color="#006700" />
//                     )}
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </>
//           )}

//           <Text style={styles.sectionTitle}>Collect New Bag?</Text>
//           <View style={styles.radioContainer}>
//             <View style={styles.radioOption}>
//               <RadioButton
//                 value="Yes"
//                 status={collectNewBag === 'Yes' ? 'checked' : 'unchecked'}
//                 onPress={() => setCollectNewBag('Yes')}
//                 color="#006700"
//               />
//               <Text style={styles.radioLabel} onPress={() => setCollectNewBag('Yes')}>Yes</Text>
//             </View>
//             <View style={styles.radioOption}>
//               <RadioButton
//                 value="No"
//                 status={collectNewBag === 'No' ? 'checked' : 'unchecked'}
//                 onPress={() => setCollectNewBag('No')}
//                 color="#006700"
//               />
//               <Text style={styles.radioLabel} onPress={() => setCollectNewBag('No')}>No</Text>
//             </View>
//           </View>

//           {collectNewBag === 'Yes' && (
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>New Bag Barcode</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={newBagBarCode}
//                 onChangeText={setNewBagBarCode}
//                 placeholder="Enter barcode"
//               />
//             </View>
//           )}

//           <View style={styles.modalFooter}>
//             {selectedDeliveryBoy && (
//               <View style={styles.selectedSummary}>
//                 <Text style={styles.selectedSummaryText}>
//                   Selected: <Text style={styles.selectedName}>{selectedDeliveryBoy.name}</Text>
//                 </Text>
//               </View>
//             )}
            
//             <TouchableOpacity
//               style={[
//                 styles.submitButton,
//                 (!selectedDeliveryBoy || (collectNewBag === 'Yes' && !newBagBarCode.trim()) || !buttonsDisabled) && 
//                 styles.disabledButton
//               ]}
//               onPress={handleAssignDeliveryBoy}
//               disabled={!selectedDeliveryBoy || (collectNewBag === 'Yes' && !newBagBarCode.trim()) || assigningDeliveryBoy || !buttonsDisabled}
//             >
//               {assigningDeliveryBoy ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Confirm Assignment</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#006700" />
//         <Text style={styles.loaderText}>Loading requested orders...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <MaterialIcons name="error-outline" size={48} color="#D32F2F" />
//         <Text style={styles.errorText}>{error}</Text>
//         <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {orders.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <MaterialIcons name="inbox" size={48} color="#757575" />
//           <Text style={styles.emptyText}>No exchange requests found</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={orders}
//           renderItem={renderItem}
//           keyExtractor={item => item.exchangeId.toString()}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={['#006700']}
//             />
//           }
//         />
//       )}
//       {renderReassignModal()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F0F0F0',
//   },
//   listContent: {
//     padding: 12,
//     paddingBottom: 20,
//   },
//   card: {
//     marginBottom: 12,
//     borderRadius: 8,
//     elevation: 2,
//     backgroundColor: '#FFF',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   orderIdText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   statusContainer: {
//     backgroundColor: '#FFF9C4',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: '#FF8F00',
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 6,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#757575',
//     width: 80,
//   },
//   value: {
//     fontSize: 14,
//     color: '#212121',
//     flex: 1,
//   },
//   addressSection: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#EEEEEE',
//   },
//   addressLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#757575',
//     marginBottom: 4,
//   },
//   addressText: {
//     fontSize: 14,
//     color: '#212121',
//     lineHeight: 20,
//   },
//   actionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 16,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 4,
//     marginLeft: 8,
//   },
//   actionButtonText: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#006700',
//     fontWeight: '500',
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F0F0F0',
//   },
//   loaderText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#757575',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#F0F0F0',
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#757575',
//     textAlign: 'center',
//   },
//   retryButton: {
//     marginTop: 16,
//     backgroundColor: '#006700',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 4,
//   },
//   retryButtonText: {
//     fontSize: 16,
//     color: '#FFF',
//     fontWeight: '500',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F0F0F0',
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#757575',
//   },
//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     padding: 16,
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 8,
//     padding: 16,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEEEEE',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#212121',
//   },
//   orderInfo: {
//     backgroundColor: '#EDF7FF',
//     padding: 10,
//     borderRadius: 4,
//     marginBottom: 16,
//   },
//   orderInfoText: {
//     color: '#0D47A1',
//     fontWeight: '500',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#212121',
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   selectionInstructions: {
//     fontSize: 14,
//     color: '#757575',
//     marginBottom: 8,
//     fontStyle: 'italic',
//   },
//   deliveryBoyList: {
//     maxHeight: 200,
//     marginBottom: 8,
//   },
//   deliveryBoyItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   selectedDeliveryBoy: {
//     borderColor: '#4CAF50',
//     backgroundColor: '#E8F5E9',
//   },
//   deliveryBoyItemContent: {
//     flex: 1,
//   },
//   deliveryBoyName: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#212121',
//   },
//   deliveryBoyPhone: {
//     fontSize: 14,
//     color: '#757575',
//   },
//   radioContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   radioOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   radioLabel: {
//     fontSize: 14,
//     color: '#212121',
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   inputLabel: {
//     fontSize: 14,
//     color: '#757575',
//     marginBottom: 4,
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 4,
//     padding: 10,
//     fontSize: 16,
//   },
//   modalFooter: {
//     marginTop: 8,
//   },
//   selectedSummary: {
//     backgroundColor: '#E8F5E9',
//     padding: 8,
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   selectedSummaryText: {
//     fontSize: 14,
//     color: '#212121',
//   },
//   selectedName: {
//     fontWeight: 'bold',
//     color: '#006700',
//   },
//   submitButton: {
//     backgroundColor: '#006700',
//     padding: 14,
//     borderRadius: 4,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   disabledButton: {
//     backgroundColor: '#A5D6A7',
//   },
//   submitButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   loader: {
//     marginVertical: 16,
//   },
//   noDataText: {
//     fontSize: 14,
//     color: '#757575',
//     textAlign: 'center',
//     marginVertical: 16,
//   }
// });

// export default ExchangeRequested;















import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import { Card, RadioButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import BASE_URL from '../../config';


const ExchangeRequested = ({ accessToken }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Reassign modal states
  const [reassignModalVisible, setReassignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [collectNewBag, setCollectNewBag] = useState('Yes');
  const [newBagBarCode, setNewBagBarCode] = useState('');
  const [loadingDeliveryBoys, setLoadingDeliveryBoys] = useState(false);
  const [assigningDeliveryBoy, setAssigningDeliveryBoy] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  
  // Details modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [amountCollected, setAmountCollected] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [remarks, setRemarks] = useState('');
  const [returnBagWeight, setReturnBagWeight] = useState('');
  const [submittingDetails, setSubmittingDetails] = useState(false);
  const [currentDeliveryBoyId, setCurrentDeliveryBoyId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}order-service/getAllExchangeOrder`, {
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          'Content-Type': 'application/json',
        }
      });
       
      // Filter only EXCHANGEREQUESTED orders
      const requestedOrders = response.data.filter(order => 
        order.status === 'EXCHANGEREQUESTED'
      );
      console.log("Requested Exchange Orders:", requestedOrders);
      setOrders(requestedOrders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      Alert.alert('Error', 'Failed to load order data');
      console.error("Error fetching exchange orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      setLoadingDeliveryBoys(true);
      setButtonsDisabled(false);
      
      const url = `${BASE_URL}user-service/deliveryBoyList`;
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 200) {
        // Filter only active delivery boys
        const activeDeliveryBoys = response.data.filter(boy => boy.isActive === "true");
        console.log("Active Delivery Boys:", activeDeliveryBoys);
        setDeliveryBoys(activeDeliveryBoys || []);
        setButtonsDisabled(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load delivery boy list');
      console.error("Error fetching delivery boys:", err);
    } finally {
      setLoadingDeliveryBoys(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleReassignPress = (order) => {
    setSelectedOrder(order);
    // Reset selection states when opening modal
    setSelectedDeliveryBoy(null);
    setCollectNewBag('Yes');
    setNewBagBarCode('');
    setReassignModalVisible(true);
    fetchDeliveryBoys();
  };
  
  const handleDetailsPress = (order) => {
    // Reset form fields
    setAmountCollected('');
    setBarcodeValue('');
    setRemarks('');
    setReturnBagWeight('');
    setDetailsOrder(order);
    setCurrentDeliveryBoyId(order.deliveryBoyId || null);
    setDetailsModalVisible(true);
  };

  const handleDeliveryBoySelect = (boy) => {
    console.log("Selected delivery boy:", boy);
    setSelectedDeliveryBoy(boy);
  };

  const handleAssignDeliveryBoy = async () => {
    if (!selectedDeliveryBoy) {
      Alert.alert('Error', 'Please select a delivery boy');
      return;
    }

    if (collectNewBag === 'Yes' && !newBagBarCode.trim()) {
      Alert.alert('Error', 'Please enter a new bag barcode');
      return;
    }

    try {
      setAssigningDeliveryBoy(true);
      
      // Create payload with proper format based on the API requirements
      const payload = {
        exchangeId: selectedOrder.exchangeId,
        deliveryBoyId: selectedDeliveryBoy.userId,
        collectedNewBag: collectNewBag, // Send "Yes" or "No" as a string
        newBagBarCode: collectNewBag === 'Yes' ? newBagBarCode : null
      };

      console.log("Sending payload to API:", payload);

      const response = await axios.patch(
        `${BASE_URL}order-service/exchangeBagCollect`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken?.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("API response:", response.data);
      
      Alert.alert(
        'Success', 
        `Exchange order #${selectedOrder.orderId} has been assigned to ${selectedDeliveryBoy.name} successfully`,
        [{ text: 'OK', onPress: () => {
          setReassignModalVisible(false);
          fetchOrders(); // Refresh the list after successful assignment
        }}]
      );
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      Alert.alert('Error', `Failed to assign delivery boy: ${err.response?.data?.message || err.message}`);
    } finally {
      setAssigningDeliveryBoy(false);
    }
  };
  
  const handleSubmitDetails = async () => {
    // Validate form fields
    if (!amountCollected.trim()) {
      Alert.alert('Error', 'Please enter the amount collected');
      return;
    }
    
    if (!barcodeValue.trim()) {
      Alert.alert('Error', 'Please enter the barcode value');
      return;
    }
    
    if (!returnBagWeight.trim()) {
      Alert.alert('Error', 'Please enter the return bag weight');
      return;
    }
    
    try {
      setSubmittingDetails(true);
      
      // Create payload for the details API
      const payload = {
        amountCollected: parseFloat(amountCollected),
        barcodeValue: barcodeValue,
        remarks: remarks.trim() || null,
        returnBagWeight: parseFloat(returnBagWeight),
        exchangeId: detailsOrder.exchangeId,
        newDeliveryBoyId: currentDeliveryBoyId || detailsOrder.userId
      };
      
      console.log("Sending details payload to API:", payload);
      
      const response = await axios.post(
        `${BASE_URL}order-service/exchangeOrderReassign`, 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken?.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("API response:", response.data);
      
      Alert.alert(
        'Success', 
        `Exchange order #${detailsOrder.orderId} details have been submitted successfully`,
        [{ text: 'OK', onPress: () => {
          setDetailsModalVisible(false);
          fetchOrders(); // Refresh the list after successful submission
        }}]
      );
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      Alert.alert('Error', `Failed to submit details: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingDetails(false);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.userName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Item:</Text>
          <Text style={styles.value}>{item.itemName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>₹{item.itemPrice}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Reason:</Text>
          <Text style={styles.value}>{item.reason}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Requested:</Text>
          <Text style={styles.value}>{item.exchangeRequestDate} ({item.daysDifference} days ago)</Text>
        </View>

        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Delivery Address:</Text>
          <Text style={styles.addressText}>{item.orderAddress}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReassignPress(item)}
          >
            <MaterialIcons name="assignment-ind" size={20} color="#006700" />
            <Text style={styles.actionButtonText}>Reassign</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDetailsPress(item)}
          >
            <MaterialIcons name="info-outline" size={20} color="#006700" />
            <Text style={styles.actionButtonText}>See Details</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderReassignModal = () => (
    <Modal
      visible={reassignModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setReassignModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reassign Exchange Order</Text>
            <TouchableOpacity onPress={() => setReassignModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderInfoText}>
                Order #{selectedOrder.orderId} - {selectedOrder.itemName}
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Select Delivery Boy</Text>
          
          {loadingDeliveryBoys ? (
            <ActivityIndicator size="small" color="#006700" style={styles.loader} />
          ) : deliveryBoys.length === 0 ? (
            <Text style={styles.noDataText}>No active delivery boys available</Text>
          ) : (
            <>
              <Text style={styles.selectionInstructions}>
                Please select a delivery boy from the list below
              </Text>
              <ScrollView style={styles.deliveryBoyList}>
                {deliveryBoys.map((boy) => (
                  <TouchableOpacity
                    key={boy.id}
                    style={[
                      styles.deliveryBoyItem,
                      selectedDeliveryBoy?.id === boy.id && styles.selectedDeliveryBoy
                    ]}
                    onPress={() => handleDeliveryBoySelect(boy)}
                    accessible={true}
                    accessibilityLabel={`Select delivery boy ${boy.name}`}
                    accessibilityRole="button"
                    disabled={!buttonsDisabled}
                  >
                    <View style={styles.deliveryBoyItemContent}>
                      <Text style={styles.deliveryBoyName}>
                        {boy.firstName} {boy.lastName?.trim()}
                      </Text>
                      <Text style={styles.deliveryBoyPhone}>{boy.phone}</Text>
                    </View>
                    {selectedDeliveryBoy?.id === boy.id && (
                      <MaterialIcons name="check-circle" size={24} color="#006700" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.sectionTitle}>Collect New Bag?</Text>
          <View style={styles.radioContainer}>
            <View style={styles.radioOption}>
              <RadioButton
                value="Yes"
                status={collectNewBag === 'Yes' ? 'checked' : 'unchecked'}
                onPress={() => setCollectNewBag('Yes')}
                color="#006700"
              />
              <Text style={styles.radioLabel} onPress={() => setCollectNewBag('Yes')}>Yes</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton
                value="No"
                status={collectNewBag === 'No' ? 'checked' : 'unchecked'}
                onPress={() => setCollectNewBag('No')}
                color="#006700"
              />
              <Text style={styles.radioLabel} onPress={() => setCollectNewBag('No')}>No</Text>
            </View>
          </View>

          {collectNewBag === 'Yes' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Bag Barcode</Text>
              <TextInput
                style={styles.textInput}
                value={newBagBarCode}
                onChangeText={setNewBagBarCode}
                placeholder="Enter barcode"
              />
            </View>
          )}

          <View style={styles.modalFooter}>
            {selectedDeliveryBoy && (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryText}>
                  Selected: <Text style={styles.selectedName}>{selectedDeliveryBoy.name}</Text>
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedDeliveryBoy || (collectNewBag === 'Yes' && !newBagBarCode.trim()) || !buttonsDisabled) && 
                styles.disabledButton
              ]}
              onPress={handleAssignDeliveryBoy}
              disabled={!selectedDeliveryBoy || (collectNewBag === 'Yes' && !newBagBarCode.trim()) || assigningDeliveryBoy || !buttonsDisabled}
            >
              {assigningDeliveryBoy ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Assignment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  // New Details Modal
  const renderDetailsModal = () => (
    <Modal
      visible={detailsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exchange Order Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            {detailsOrder && (
              <View style={styles.orderInfo}>
                <Text style={styles.orderInfoText}>
                  Order #{detailsOrder.orderId} - {detailsOrder.itemName}
                </Text>
              </View>
            )}

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount Collected (₹) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={amountCollected}
                  onChangeText={setAmountCollected}
                  placeholder="Enter amount collected"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Barcode Value *</Text>
                <TextInput
                  style={styles.textInput}
                  value={barcodeValue}
                  onChangeText={setBarcodeValue}
                  placeholder="Enter barcode value"
                  returnKeyType="next"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Return Bag Weight (kg) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={returnBagWeight}
                  onChangeText={setReturnBagWeight}
                  placeholder="Enter return bag weight"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Remarks (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Enter any remarks or notes"
                  multiline={true}
                  textAlignVertical="top"
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!amountCollected.trim() || !barcodeValue.trim() || !returnBagWeight.trim()) && 
                  styles.disabledButton
                ]}
                onPress={handleSubmitDetails}
                disabled={!amountCollected.trim() || !barcodeValue.trim() || !returnBagWeight.trim() || submittingDetails}
              >
                {submittingDetails ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#006700" />
        <Text style={styles.loaderText}>Loading requested orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#D32F2F" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={48} color="#757575" />
          <Text style={styles.emptyText}>No exchange requests found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={item => item.exchangeId.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#006700']}
            />
          }
        />
      )}
      {renderReassignModal()}
      {renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF8F00',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  addressSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#006700',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F0F0',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#006700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  orderInfo: {
    backgroundColor: '#EDF7FF',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  orderInfoText: {
    color: '#0D47A1',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginTop: 8,
    marginBottom: 8,
  },
  selectionInstructions: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  deliveryBoyList: {
    maxHeight: 200,
    marginBottom: 8,
  },
  deliveryBoyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedDeliveryBoy: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  deliveryBoyItemContent: {
    flex: 1,
  },
  deliveryBoyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  deliveryBoyPhone: {
    fontSize: 14,
    color: '#757575',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioLabel: {
    fontSize: 14,
    color: '#212121',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    marginTop: 8,
  },
  selectedSummary: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  selectedSummaryText: {
    fontSize: 14,
    color: '#212121',
  },
  selectedName: {
    fontWeight: 'bold',
    color: '#006700',
  },
  submitButton: {
    backgroundColor: '#006700',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginVertical: 16,
  },
  noDataText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 16,
  },
  formContainer: {
    maxHeight: 300,
  }
});

export default ExchangeRequested;