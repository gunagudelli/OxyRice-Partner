
import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import BASE_URL from "../../config";
import { useSelector } from "react-redux";

export default function ScanExchangeOrders() {
const userDetails = useSelector((state) => state.counter); // Get userStage from Redux
// console.log("userDetails",userDetails)
  const [hasPermission, setHasPermission] = useState(null);
  const [barcodes, setBarcodes] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [responseItems, setResponseItems] = useState([]);
  const [showCamera, setShowCamera] = useState(true);
//   console.log({BASE_URL})
  // User and store info input fields
  const [scanedBy, setScanedBy] = useState("");
  const [storeName, setStoreName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [reason, setReason] = useState("");
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  
  // Track if a barcode is being processed to prevent duplicates
  const processingBarcode = useRef(false);
  // Track all scanned barcodes with timestamp for debugging
  const barcodeScanLog = useRef([]);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Function to validate barcode format (6 letters followed by digits)
  const isValidBarcodeFormat = (barcode) => {
    // Remove leading/trailing spaces
    barcode = barcode.trim();
    
    // Check: must start with 3 to 6 letters, then at least one digit (number)
    const regex = /^[A-Za-z]{3,6}.*\d.*$/;
    return regex.test(barcode);
  };

  // Debug function to log all scan activity
  const addToScanLog = (barcode, action) => {
    const timestamp = new Date().toISOString();
    barcodeScanLog.current.push({ timestamp, barcode, action });
    console.log(`SCAN LOG [${timestamp}]: ${action} - ${barcode}`);
  };

  // Delete individual barcode
  const deleteBarcode = (barcodeToDelete) => {
    Alert.alert(
      "Delete Barcode",
      `Are you sure you want to delete this barcode: ${barcodeToDelete}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setBarcodes(currentBarcodes => 
              currentBarcodes.filter(barcode => barcode !== barcodeToDelete)
            );
            addToScanLog(barcodeToDelete, "DELETED");
          }
        }
      ]
    );
  };

  const handleDetailsSubmit = () => {
    if (!scanedBy.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!storeName.trim()) {
      Alert.alert("Error", "Please enter the store name");
      return;
    }

    setDetailsSubmitted(true);
    setIsScanning(true);
    setShowCamera(true);
    // Alert.alert("Success", "Details saved successfully. Camera is now ready for scanning.");
  };

  const handleBarCodeScanned = ({ data }) => {
    // Prevent processing multiple scans of the same barcode in quick succession
    if (processingBarcode.current) {
      return;
    }
    
    processingBarcode.current = true;
    
    // Add to scan log for debugging
    addToScanLog(data, "SCANNED");
    
    // Check if barcode f//ormat is valid (6 letters followed by digits)
    if (!isValidBarcodeFormat(data)) {
      console.log(`Invalid barcode format rejected: ${data}`);
      addToScanLog(data, "INVALID_FORMAT");
      
      // Re-enable scanning after a short delay
      setTimeout(() => {
        processingBarcode.current = false;
      }, 1000);
      return;
    }
    
    if (barcodes.includes(data)) {
      Alert.alert("Already Scanned", `Barcode: ${data} is already scanned.`);
      addToScanLog(data, "DUPLICATE");
    } else {
      // Use functional update to ensure we're working with latest state
      setBarcodes(currentBarcodes => {
        const updated = [...currentBarcodes, data];
        // Log the entire updated array to verify
        console.log("Updated barcodes array:", JSON.stringify(updated));
        addToScanLog(data, "ADDED");
        return updated;
      });
      
      // Show success indicator
      setScanSuccess(true);
      setTimeout(() => setScanSuccess(false), 800);
    }
    
    // Temporarily disable scanning to prevent multiple reads
    setIsScanning(false);
    setTimeout(() => {
      setIsScanning(true);
      processingBarcode.current = false;
    }, 1000);
  };

  const sendBarcodesToAPI = async () => {
    if (barcodes.length === 0) {
      Alert.alert("No Barcodes", "Please scan at least one barcode first.");
      return;
    }
    
    // Debug log before sending
    console.log("PREPARING TO SEND BARCODES:");
    console.log(`Total barcodes: ${barcodes.length}`);
    barcodes.forEach((code, index) => {
      console.log(`${index + 1}. ${code}`);
    });
    
      // Make a copy of the barcodes array to prevent any unexpected modifications
      const barcodesToSend = [...barcodes];
      
      // Format the request exactly as required
      const requestBody =
      {
        "adminName": scanedBy,
        "barcodes":barcodesToSend,
        "reason": reason,
        "storeName": storeName,
        "vendorName": vendorName
      }
      console.log({requestBody})
      setIsSending(true);

      // Log the complete request body to the console in the exact format required
      
     axios.post(BASE_URL+`product-service/vendorExhange`,requestBody, {
        headers: {
         accessToken:`Bearer ${userDetails.accessToken}`,
        },
      })
      .then((response) => {
        setIsSending(false)
            console.log("API Response:", response.data);
            Alert.alert("Success",  response.data);
            setDetailsSubmitted(true)
        })
        .catch((error) => {
            setIsSending(false)
            console.log(error.response.status)
            if(error.response.status === 404){
              Alert.alert("Error", error.response.data);
            }else{
              console.log("API Error:", error.response.data);
              Alert.alert("Error",  error.response.data.error);
            }
  })
  };

  const clearBarcodes = () => {
    if (barcodes.length > 0) {
      Alert.alert(
        "Clear Barcodes",
        "Are you sure you want to clear all scanned barcodes?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => {
            setBarcodes([]);
            setApiResponse(null);
            setResponseItems([]);
            // Clear scan log
            barcodeScanLog.current = [];
            addToScanLog("ALL", "CLEARED");
          }}
        ]
      );
    }
  };

  const resetApplication = () => {
    Alert.alert(
      "Reset Details",
      "Are you sure you want to reset and enter details again?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", onPress: () => {
          setDetailsSubmitted(false);
          setIsScanning(false);
          setShowCamera(false);
          setBarcodes([]);
          setApiResponse(null);
          setResponseItems([]);
          setScanedBy("");
          setStoreName("");
          // Clear scan log
          barcodeScanLog.current = [];
          addToScanLog("ALL", "RESET");
        }}
      ]
    );
  };

  // Display all the barcodes in console for verification
  const logAllBarcodes = () => {
    console.log("All Scanned Barcodes:");
    barcodes.forEach((code, index) => {
      console.log(`${index + 1}. ${code}`);
    });
    
    // Log the entire scan history
    console.log("Complete Scan Log:");
    barcodeScanLog.current.forEach((entry, index) => {
      console.log(`${index + 1}. [${entry.timestamp}] ${entry.action}: ${entry.barcode}`);
    });
  };

  const printDebugInfo = () => {
    console.log("========== DEBUG INFO ==========");
    console.log("Current barcodes in state:", JSON.stringify(barcodes));
    console.log("Scan log entries:", barcodeScanLog.current.length);
    console.log("================================");
    
    Alert.alert("Debug Info", `${barcodes.length} barcodes currently in memory. Check console for details.`);
  };

  const toggleCamera = () => {
    setShowCamera(!showCamera);
    if (!showCamera) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a6aff" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-off-outline" size={50} color="#ff6347" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubText}>Camera permission is required to scan barcodes</Text>
      </View>
    );
  }

  if (!detailsSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        
        {/* <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Exchanged Bar Codes</Text>
        </View> */}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          <View style={styles.formCard}>
            {/* <Text style={styles.inputLabel1}>Enter Your Name and Store Details</Text> */}
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Scanned By:</Text>
              <TextInput
                style={styles.input}
                value={scanedBy}
                onChangeText={setScanedBy}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Store Name:</Text>
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="Enter store name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vendor Name:</Text>
              <TextInput
                style={styles.input}
                value={vendorName}
                onChangeText={setVendorName}
                placeholder="Enter Vendor name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason:</Text>
              <TextInput
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="Enter Reason"
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: (!scanedBy.trim() || !storeName.trim() || !vendorName.trim() || !reason.trim()) ? "#ccc" : "#4a6aff" }
              ]}
              onPress={handleDetailsSubmit}
              disabled={!scanedBy.trim() || !storeName.trim() || !vendorName.trim() || !reason.trim()}
            >
              <Text style={styles.buttonText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barcode Scanner</Text>
        <View style={styles.userInfoContainer}>
          <Text style={styles.headerSubtitle}>{storeName} • {scanedBy}</Text>
          <TouchableOpacity onPress={resetApplication} style={styles.resetButton}>
            <Ionicons name="refresh-outline" size={18} color="#4a6aff" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.mainContent}>
        {showCamera && (
          <View style={styles.cameraContainer}>
            {isScanning && (
              <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "code128", "code39", "ean13", "ean8", "upc_a", "upc_e", "pdf417"],
                }}
              />
            )}
            
            {/* Scan frame overlay */}
            <View style={styles.overlay}>
              <View style={styles.scanFrame}>
                {scanSuccess && (
                  <View style={styles.successOverlay}>
                    <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.scanInstructions}>
              <Text style={styles.scanText}>Position barcode within frame</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.closeCamera} 
              onPress={toggleCamera}
            >
              <Ionicons name="close-circle" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.listContainer, !showCamera && {flex: 1}]}>
          <View style={styles.listHeader}>
            <Text style={styles.title}>
              {responseItems.length > 0 
                ? "API Response"
                : `Scanned Barcodes (${barcodes.length})`
              }
            </Text>
            
            <View style={styles.actionButtons}>
              {!showCamera && barcodes.length > 0 && !responseItems.length && (
                <TouchableOpacity onPress={toggleCamera} style={[styles.scanButton, {marginRight: 10}]}>
                  <Ionicons name="camera-outline" size={22} color="#4a6aff" />
                </TouchableOpacity>
              )}
              {barcodes.length > 0 && !responseItems.length && (
                <>
                  {/* <TouchableOpacity onPress={printDebugInfo} style={styles.actionButton}>
                    <Ionicons name="bug-outline" size={22} color="#7e57c2" />
                  </TouchableOpacity> */}
                  {/* <TouchableOpacity onPress={logAllBarcodes} style={styles.actionButton}>
                    <Ionicons name="list-outline" size={22} color="#4a6aff" />
                  </TouchableOpacity> */}
                  <TouchableOpacity onPress={clearBarcodes} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={22} color="#ff6347" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          
          {barcodes.length === 0 && responseItems.length === 0 ? (
            <View style={styles.emptyList}>
              <Ionicons name="barcode-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No barcodes scanned yet</Text>
              <Text style={styles.emptySubText}>Scanned items will appear here</Text>
              {!showCamera && (
                <TouchableOpacity 
                  style={styles.startScanButton} 
                  onPress={toggleCamera}
                >
                  <Ionicons name="camera-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Open Camera</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : responseItems.length > 0 ? (
            <FlatList
              data={responseItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.itemCard}>
                  <View style={[
                    styles.indexBadge, 
                    {backgroundColor: item.status && item.status.includes("SUCCESS") ? '#4CAF50' : 
                                    item.status && item.status.includes("Count") ? '#4a6aff' : '#FF9800'}
                  ]}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.responseItemContent}>
                    <Text style={styles.item}>{item.barcode}</Text>
                    <Text style={[
                      styles.statusText, 
                      {color: item.status && item.status.includes("SUCCESS") ? '#4CAF50' : 
                              item.status && item.status.includes("Count") ? '#4a6aff' : '#FF9800'}
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              )}
              style={styles.list}
            />
          ) : (
            <FlatList
              data={barcodes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.itemCard}>
                  <View style={styles.indexBadge}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.item}>{item}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteBarcode(item)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={22} color="#ff6347" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.list}
              extraData={barcodes} // Ensure list re-renders when barcodes change
            />
          )}

          {barcodes.length > 0 && !responseItems.length && (
            <View style={styles.bottomButtonContainer}>
              {!showCamera && (
                <TouchableOpacity 
                  style={styles.resumeScanButton} 
                  onPress={toggleCamera}
                >
                  <Ionicons name="camera-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Resume Scanning</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: barcodes.length === 0 ? "#ccc" : "#4a6aff" }
                ]}
                onPress={sendBarcodesToAPI}
                disabled={barcodes.length === 0 || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Save {barcodes.length} Item{barcodes.length !== 1 ? 's' : ''}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          {responseItems.length > 0 && (
            <TouchableOpacity
              style={styles.scanMoreButton}
              onPress={() => {
                setResponseItems([]);
                setApiResponse(null);
                setShowCamera(true);
                setIsScanning(true);
              }}
            >
              <Ionicons name="scan-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Scan More</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  permissionSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  userInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    padding: 4,
  },
  resetText: {
    color: "#4a6aff",
    fontSize: 12,
    marginLeft: 2,
  },
  formContainer: {
    // flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  inputLabel1: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#4a6aff",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: "#4a6aff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  mainContent: {
    flex: 1,
    flexDirection: "column",
  },
  cameraContainer: {
    height: "45%",
    position: "relative",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#4a6aff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanInstructions: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanText: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    padding: 10,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  closeCamera: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  scanButton: {
    padding: 5,
  },
  list: {
    flex: 1,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  indexBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4a6aff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  indexText: {
    color: "#fff",
    fontWeight: "bold",
  },
  item: {
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  deleteButton: {
    padding: 8,
  },
  responseItemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },
  emptySubText: {
    color: "#999",
    fontSize: 14,
    marginTop: 5,
  },
  bottomButtonContainer: {
    marginTop: 15,
  },
  sendButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4a6aff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#4a6aff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resumeScanButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7e57c2",
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: "#7e57c2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startScanButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4a6aff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#4a6aff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanMoreButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 15,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
});