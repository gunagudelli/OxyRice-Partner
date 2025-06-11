

 import React, { useState, useEffect, useCallback } from 'react';
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
import { CameraView, Camera } from "expo-camera";
import BASE_URL from '../../config';
 

const Recompleted = ({ accessToken }) => {
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
  
  // Camera/Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  
  // Details modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [amountCollected, setAmountCollected] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [remarks, setRemarks] = useState('');
  const [returnBagWeight, setReturnBagWeight] = useState('');
  const [submittingDetails, setSubmittingDetails] = useState(false);
  const [currentDeliveryBoyId, setCurrentDeliveryBoyId] = useState(null);

  // Request camera permission
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

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
       
      // Filter onlyASSIGNTOCOLLECT orders
      const requestedOrders = response.data.filter(order => 
        order.status === 'COLLECTED'
      );
      console.log("COLLECT Exchange Orders:", requestedOrders);
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
        // Filter only active delivery boys (isActive should be string "true" or boolean true)
        const activeDeliveryBoys = response.data.filter(boy => 
          boy.isActive === "true" || boy.isActive === true
        );
        console.log("All Delivery Boys:", response.data);
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
    setCurrentDeliveryBoyId(order.userId || null);
    setDetailsModalVisible(true);
  };

  const handleDeliveryBoySelect = (boy) => {
    console.log("Selected delivery boy:", boy);
    setSelectedDeliveryBoy(boy);
  };

  // Camera/Scanner handlers
  const handleScanPress = async () => {
    if (hasPermission === null) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    }
    
    if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes');
      return;
    }
    
    setScanned(false);
    setShowScanner(true);
  };

  const handleBarcodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      setNewBagBarCode(data);
      setShowScanner(false);
      Alert.alert('Barcode Scanned', `Barcode: ${data}`);
    }
  };

  const handleClearBarcode = () => {
    setNewBagBarCode('');
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
      
      // Create delivery boy full name for display
      const deliveryBoyName = `${selectedDeliveryBoy.firstName} ${selectedDeliveryBoy.lastName || ''}`.trim();
      
      Alert.alert(
        'Success', 
        `Exchange order #${selectedOrder.orderId} has been assigned to ${deliveryBoyName} successfully`,
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
<View
  style={[
    styles.statusContainer,
    {
      backgroundColor:
        item.status === 'ASSIGNTOCOLLECT' ? '#FFF9C4' :
        item.status === 'RECOMPLETED' ? '#C8E6C9' :
        item.status === 'PENDING' ? '#FFCDD2' :
        item.status === 'DELIVERED' ? '#B3E5FC' :
        item.status === 'CANCELLED' ? '#E0E0E0' :
        '#F5F5F5' // default
    }
  ]}
>
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

        {/* <View style={styles.actionsContainer}>
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
            <Text style={styles.actionButtonText}>Collect Bag</Text>
          </TouchableOpacity>
        </View> */}
      </Card.Content>
    </Card>
  );

  // Scanner Modal
  const renderScannerModal = () => (
    <Modal
      visible={showScanner}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowScanner(false)}
    >
      <View style={styles.scannerModalOverlay}>
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Barcode</Text>
            <TouchableOpacity onPress={() => setShowScanner(false)}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "pdf417", "ean13", "ean8", "code128", "code39"],
              }}
            />
          </View>
          
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerInstructions}>
              Position the barcode within the frame to scan
            </Text>
          </View>
        </View>
      </View>
    </Modal>
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
                Please select a delivery boy from the list below ({deliveryBoys.length} active delivery boys available)
              </Text>
              <ScrollView style={styles.deliveryBoyList}>
                {deliveryBoys.map((boy) => (
                  <TouchableOpacity
                    key={boy.userId || boy.id}
                    style={[
                      styles.deliveryBoyItem,
                      selectedDeliveryBoy?.userId === boy.userId && styles.selectedDeliveryBoy
                    ]}
                    onPress={() => handleDeliveryBoySelect(boy)}
                    accessible={true}
                    accessibilityLabel={`Select delivery boy ${boy.firstName} ${boy.lastName || ''}`}
                    accessibilityRole="button"
                    disabled={!buttonsDisabled}
                  >
                    <View style={styles.deliveryBoyItemContent}>
                      <Text style={styles.deliveryBoyName}>
                        {boy.firstName} {boy.lastName || ''}
                      </Text>
                      <Text style={styles.deliveryBoyPhone}>{boy.phone}</Text>
                      <Text style={styles.deliveryBoyStatus}>
                        Status: <Text style={styles.activeStatus}>Active</Text>
                      </Text>
                    </View>
                    {selectedDeliveryBoy?.userId === boy.userId && (
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
              <Text style={styles.inputLabel}>New Bag Barcode *</Text>
              <View style={styles.barcodeInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.barcodeInput]}
                  value={newBagBarCode}
                  onChangeText={setNewBagBarCode}
                  placeholder="Enter or scan barcode"
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanPress}
                >
                  <MaterialIcons name="qr-code-scanner" size={20} color="#006700" />
                </TouchableOpacity>
                {newBagBarCode.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearBarcode}
                  >
                    <MaterialIcons name="clear" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.modalFooter}>
            {selectedDeliveryBoy && (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryText}>
                  Selected: <Text style={styles.selectedName}>
                    {selectedDeliveryBoy.firstName} {selectedDeliveryBoy.lastName || ''}
                  </Text>
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
  
  // Details Modal (unchanged)
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
      {renderScannerModal()}
    </View>
  );
};
const styles = StyleSheet.create({
  // Main Container Styles
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  
  // Card Styles
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
    backgroundColor: 'purple',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'purple',
  },
  
  // Detail Row Styles
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    width: 80,
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
    flexWrap: 'wrap',
  },
  
  // Address Section Styles
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
  
  // Action Button Styles
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#006700',
    fontWeight: '500',
  },
  
  // Loading and Error States
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
  loader: {
    marginVertical: 20,
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
  noDataText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 20,
  },
  
  // Modal Overlay and Base Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  
  // Order Info Section
  orderInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 6,
  },
  orderInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  
  // Section Titles
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  
  // Delivery Boy List Styles
  deliveryBoyList: {
    maxHeight: 200,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  deliveryBoyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedDeliveryBoy: {
    backgroundColor: '#E8F5E9',
    borderColor: '#006700',
    borderWidth: 2,
  },
  deliveryBoyItemContent: {
    flex: 1,
  },
  deliveryBoyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  deliveryBoyPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  deliveryBoyStatus: {
    fontSize: 12,
    color: '#757575',
  },
  activeStatus: {
    color: '#006700',
    fontWeight: '500',
  },
  selectionInstructions: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  
  // Radio Button Styles
  radioContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  
  // Input Styles
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  // Barcode Input Styles
  barcodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeInput: {
    flex: 1,
    marginRight: 8,
  },
  scanButton: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 6,
    marginRight: 4,
  },
  clearButton: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 6,
  },
  
  // Submit Button Styles
  submitButton: {
    backgroundColor: '#006700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  
  // Selected Summary Styles
  selectedSummary: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  selectedSummaryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  selectedName: {
    fontWeight: '600',
    color: '#006700',
  },
  
  // Form Container
  formContainer: {
    maxHeight: 300,
  },
  
  // Scanner Modal Styles
  scannerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    width: '90%',
    height: '70%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  scannerFooter: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerInstructions: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
export default Recompleted; 
