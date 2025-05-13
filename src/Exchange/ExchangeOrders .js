import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  SafeAreaView, 
  StatusBar,
  ScrollView, 
  Modal, 
  Alert, 
  TextInput,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Assuming you have a config file with BASE_URL
import BASE_URL from '../../config';

const { width } = Dimensions.get('window');

const ExchangeOrders = ({ navigation }) => {
  const userData = useSelector((state) => state.counter);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  // Form data states
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [collectedNewBag, setCollectedNewBag] = useState(null); // Changed from takingNewBag to collectedNewBag
  const [newBagBarcode, setNewBagBarcode] = useState('');
  const [loadingDeliveryBoys, setLoadingDeliveryBoys] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  
  // Return details form
  const [formData, setFormData] = useState({
    returnBagWeight: '',
    amountCollected: '',
    remarks: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    axios.get(`${BASE_URL}/order-service/getAllExchangeOrder`, {
      headers: { Authorization: `Bearer ${userData?.accessToken}` }
    })
    .then((response) => {
      setOrders(response.data);
      setLoading(false);
      setRefreshing(false);
      setError(null);
    })
    .catch((error) => {
      console.log("Error fetching exchange orders:", error.response);
      setError("Failed to load exchange orders. Please try again.");
      setLoading(false);
      setRefreshing(false);
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const fetchDeliveryBoys = (order) => {
    setSelectedOrder(order);
    setLoadingDeliveryBoys(true);
    
    axios.get(`${BASE_URL}/user-service/deliveryBoyList`, {
      headers: { Authorization: `Bearer ${userData?.accessToken}` }
    })
    .then((response) => {
      setDeliveryBoys(response.data);
      setAssignModalVisible(true);
      setLoadingDeliveryBoys(false);
    })
    .catch((error) => {
      console.log("Error fetching delivery boys:", error.response);
      Alert.alert("Error", "Failed to get delivery boy list. Please try again later.");
      setLoadingDeliveryBoys(false);
    });
  };

  const handleAssign = () => {
    // Validation
    if (!selectedDeliveryBoy) {
      Alert.alert("Warning", "Please select a delivery boy.");
      return;
    }
    
    if (collectedNewBag === null) {
      Alert.alert("Warning", "Please select if a new bag is being collected.");
      return;
    }
    
    if (collectedNewBag === 'yes' && !newBagBarcode) {
      Alert.alert("Warning", "Please enter the new bag barcode.");
      return;
    }
    
    setLoadingAssign(true);
    
    // Fixed request body according to API requirements
    const data = {
      collectedNewBag: collectedNewBag === 'yes' ? 'cow' : 'no', // Changed to match API expecting "cow" for yes
      exchangeId: selectedOrder?.exchangeId,
      deliveryBoyId: selectedDeliveryBoy.userId,
      newBagBarCode: collectedNewBag === 'yes' ? newBagBarcode : null,
    };
    
    // Send the request to assign delivery boy and collect new bag
    axios.patch(`${BASE_URL}/order-service/exchangeBagCollect`, data, {
      headers: {
        Authorization: `Bearer ${userData?.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      Alert.alert(
        "Success", 
        `Order assigned to ${selectedDeliveryBoy.firstName} ${selectedDeliveryBoy.lastName} ${collectedNewBag === 'yes' ? 'with new bag' : 'without new bag'}.`
      );
      resetAssignModal();
      fetchOrders();
    })
    .catch((error) => {
      console.log("Error assigning order:", error.response);
      Alert.alert("Error", "Failed to assign order. Please try again.");
    })
    .finally(() => {
      setLoadingAssign(false);
    });
  };

  const handleReturnSubmit = () => {
    // Validation
    if (!formData.returnBagWeight) {
      Alert.alert("Warning", "Please enter the return bag weight.");
      return;
    }
    
    if (!formData.amountCollected) {
      Alert.alert("Warning", "Please enter the amount collected.");
      return;
    }
    
    const requestData = {
      amountCollected: formData.amountCollected,
      exchangeId: selectedOrder?.exchangeId,
      remarks: formData.remarks,
      returnBagWeight: formData.returnBagWeight,
    };
    
    axios.post(`${BASE_URL}/order-service/exchangeOrderReassign`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData?.accessToken}`
      }
    })
    .then((response) => {
      Alert.alert("Success", "Return details submitted successfully!");
      setDetailsModalVisible(false);
      fetchOrders();
    })
    .catch((error) => {
      console.log("Error submitting data:", error.response);
      Alert.alert("Error", "Failed to submit return details!");
    });
  };

  const resetAssignModal = () => {
    setAssignModalVisible(false);
    setSelectedDeliveryBoy(null);
    setCollectedNewBag(null);
    setNewBagBarcode('');
  };

  const showDetailsModal = (order) => {
    setSelectedOrder(order);
    setFormData({
      returnBagWeight: '',
      amountCollected: '',
      remarks: ''
    });
    setDetailsModalVisible(true);
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return "#9E9E9E";
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA62B', '#9D65C9', '#66BB6A', '#5C6BC0'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Render functions
  const renderOrderItem = ({ item }) => {
    const avatarColor = getAvatarColor(item.userName);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userSection}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{getInitials(item.userName)}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.orderId}>{item.orderId}</Text>
              <Text style={styles.userName}>{item.userName}</Text>
              {item.mobileNumber && (
                <View style={styles.phoneTag}>
                  <Text style={styles.phoneTagText}>{item.mobileNumber}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.exchangeRequestDate)}</Text>
            <View style={styles.diffRow}>
              <Text style={styles.diffLabel}>Diff: </Text>
              <Text 
                style={[
                  styles.diffValue, 
                  { color: item.daysDifference <= 3 ? '#34C759' : '#FF3B30' }
                ]}
              >
                {item.daysDifference}
              </Text>
              <Text style={styles.diffUnit}> days</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.itemSection}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.itemPrice}>₹{item.itemPrice}</Text>
          </View>
          
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Address</Text>
            <Text style={styles.addressText} numberOfLines={2}>{item.orderAddress}</Text>
          </View>
        </View>

        <View style={styles.reasonSection}>
          <Text style={styles.sectionTitle}>Reason</Text>
          <Text style={styles.reasonText} numberOfLines={2}>{item.reason}</Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.reassignButton}
            onPress={() => fetchDeliveryBoys(item)}
          >
            <Text style={styles.buttonText}>Re-Assign</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => showDetailsModal(item)}
          >
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDeliveryBoyItem = (boy) => {
    const isSelected = selectedDeliveryBoy?.userId === boy.userId;
    
    return (
      <TouchableOpacity 
        key={boy.userId}
        style={[
          styles.deliveryBoyItem,
          isSelected && styles.selectedDeliveryBoyItem
        ]}
        onPress={() => setSelectedDeliveryBoy(boy)}
      >
        <View style={styles.radioButton}>
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={styles.deliveryBoyName}>
          {`${boy.firstName} ${boy.lastName} (${boy.whatsappNumber})`}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3A5A40" />
        <Text style={styles.loadingText}>Loading exchange orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exchange Orders</Text>
      </View>

      {/* Error or empty state */}
      {error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 && !loading ? (
        <View style={styles.centered}>
          <Ionicons name="document-outline" size={64} color="#9E9E9E" />
          <Text style={styles.noOrdersText}>No exchange orders found</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId?.toString() || Math.random().toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3A5A40']} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Assign Delivery Boy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={resetAssignModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Boy</Text>
              <TouchableOpacity style={styles.closeButton} onPress={resetAssignModal}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.modalContent}>
              {loadingDeliveryBoys ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3A5A40" />
                </View>
              ) : (
                <>
                  {deliveryBoys.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                      <Ionicons name="people-outline" size={48} color="#9E9E9E" />
                      <Text style={styles.emptyStateText}>No delivery boys available</Text>
                    </View>
                  ) : (
                    deliveryBoys.map(renderDeliveryBoyItem)
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.newBagSection}>
              <Text style={styles.newBagLabel}>Is delivery boy collecting a new bag?</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity 
                  style={[
                    styles.radioOption, 
                    collectedNewBag === 'yes' && styles.selectedRadioOption
                  ]}
                  onPress={() => setCollectedNewBag('yes')}
                >
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.radioOption, 
                    collectedNewBag === 'no' && styles.selectedRadioOption
                  ]}
                  onPress={() => setCollectedNewBag('no')}
                >
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>

              {collectedNewBag === 'yes' && (
                <View style={styles.newBagBarcodeContainer}>
                  <TextInput
                    style={styles.newBagBarcodeInput}
                    placeholder="Enter New Bag Barcode"
                    value={newBagBarcode}
                    onChangeText={setNewBagBarcode}
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.assignButton}
                onPress={handleAssign}
                disabled={loadingAssign}
              >
                {loadingAssign ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.assignButtonText}>Assign</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Return Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Return Details</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setDetailsModalVisible(false)}
              >
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.modalContent} 
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Return Bag Weight (kg)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter bag weight"
                  keyboardType="numeric"
                  value={formData.returnBagWeight}
                  onChangeText={(text) => setFormData({...formData, returnBagWeight: text})}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount Collected (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter amount collected"
                  keyboardType="numeric"
                  value={formData.amountCollected}
                  onChangeText={(text) => setFormData({...formData, amountCollected: text})}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Remarks</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  placeholder="Enter any additional remarks"
                  multiline
                  numberOfLines={4}
                  value={formData.remarks}
                  onChangeText={(text) => setFormData({...formData, remarks: text})}
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleReturnSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Return Details</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  userInfo: {},
  orderId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneTag: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  phoneTagText: {
    fontSize: 12,
    color: '#666',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diffLabel: {
    fontSize: 12,
    color: '#666',
  },
  diffValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  diffUnit: {
    fontSize: 12,
    color: '#666',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  itemSection: {
    flex: 1,
    marginRight: 10,
  },
  addressSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  itemName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 3,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  reasonSection: {
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reassignButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#F44336',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  noOrdersText: {
    color: '#9E9E9E',
    marginTop: 10,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  refreshButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 15,
  },
  deliveryBoyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedDeliveryBoyItem: {
    backgroundColor: '#E8F5E9',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3A5A40',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3A5A40',
  },
  deliveryBoyName: {
    fontSize: 15,
    color: '#333',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    color: '#9E9E9E',
    marginTop: 10,
  },
  newBagSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  newBagLabel: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  radioOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedRadioOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#3A5A40',
  },
  radioText: {
    color: '#333',
  },
  newBagBarcodeContainer: {
    marginBottom: 10,
  },
  newBagBarcodeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  assignButton: {
    backgroundColor: '#3A5A40',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  assignButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExchangeOrders;