import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Modal,
  FlatList,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import BASE_URL from '../../config';
import { useSelector } from 'react-redux'; // Import to access user data from redux store

const { width, height } = Dimensions.get('window');

export default function BarcodeScanner() {
  // State management
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState({});
  const [scanCount, setScanCount] = useState(0);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showManualMatch, setShowManualMatch] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [productNameInput, setProductNameInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [containerWeight, setContainerWeight] = useState(0);
  const [containerBarcode, setContainerBarcode] = useState('');
  const [containerScanned, setContainerScanned] = useState(false);
  const [containerPrice, setContainerPrice] = useState(0);
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [lastScanTime, setLastScanTime] = useState(0);
  const[fromMobileNumber,setFromMobileNumber]=useState('')
  const[fromMobileNumber_error,setFromMobileNumber_error]=useState(false)
  const[toMobileNumber,setToMobileNumber]=useState('')
  const[toMobileNumber_error,setToMobileNumber_error]=useState(false)
  const SCAN_COOLDOWN_MS = 2000; // 2 seconds cooldown
  // New state to track rice bags
  const [has10kgRice, setHas10kgRice] = useState(false);
  const [has26kgRice, setHas26kgRice] = useState(false);

  // Constants for container types
  const CONTAINER_TYPES = {
    SMALL: {
      BARCODE: "RICSTA10",
      WEIGHT: "10",
      NAME: "10kg Rice Container"
    },
    LARGE: {
      BARCODE: "RICPRE10",
      WEIGHT: "26",
      NAME: "26kg Rice Container"
    }
  };

  // Get user data from Redux store
  const userData = useSelector(state => state.counter);
  
  // Reference to camera
  const cameraRef = useRef(null);

  // Fetch all categories and products when component mounts
  useEffect(() => {
    getAllCategories();
  }, []);

  // Process products from API response
  useEffect(() => {
    if (categories.length > 0) {
      // Process all products from categories
      const allProducts = [];
      categories.forEach(category => {
        if (category.itemsResponseDtoList) {
          category.itemsResponseDtoList.forEach(item => {
            // Create a product object with similar structure to our productDatabase
            allProducts.push({
              barcode: item.barcodeValue, // Using itemId as barcode since there's no explicit barcode in the API data
              name: item.itemName,
              category: category.categoryName,
              price: item.itemPrice,
              weight: item.weight,
              image: item.itemImage,
              description: item.itemDescription,
              mrp: item.itemMrp,
              units: item.units,
              saveAmount: item.saveAmount,
              savePercentage: item.savePercentage,
              quantity: 0
            });
          });
        }
      });
      
      setProducts(allProducts);
      setLoading(false);
    }
  }, [categories]);

  // Check rice product scans to determine allowed container sizes
  useEffect(() => {
    // Reset rice bag flags
    let has10kg = false;
    let has26kg = false;
    
    // Check for rice products in scanned items
    Object.values(scannedItems).forEach(item => {
      // Check if the item is rice (basic check - you may need to adjust based on your data)
      if (item.category.toLowerCase().includes('rice')) {
        // Check the weight
        if (item.weight === 10 || item.weight === '10') {
          has10kg = true;
        } else if (item.weight === 26 || item.weight === '26') {
          has26kg = true;
        }
      }
    });
    
    setHas10kgRice(has10kg);
    setHas26kgRice(has26kg);
    
    // If container was already scanned, check if it's still valid based on the current rice bags
    if (containerScanned) {
      const validContainer = isContainerValid(containerWeight);
      if (!validContainer) {
        // If the container is no longer valid for the scanned rice bags, remove it
        Alert.alert(
          'Container Removed',
          'The selected container is not suitable for your current rice bag selection. Please select an appropriate container.',
          [{ text: 'OK' }]
        );
        setContainerScanned(false);
        setContainerBarcode('');
        setContainerPrice(0);
        setContainerWeight('');
      }
    }
  }, [scannedItems]);

  // Function to check if a container is valid for the current rice bags
  const isContainerValid = (containerSize) => {
    // Both 10kg and 26kg bags - allow 26kg container
    if (has10kgRice && has26kgRice) {
      return containerSize === CONTAINER_TYPES.LARGE.WEIGHT;
    }
    // Only 26kg bags - allow 26kg container
    else if (has26kgRice) {
      return containerSize === CONTAINER_TYPES.LARGE.WEIGHT;
    }
    // Only 10kg bags - allow 10kg container
    else if (has10kgRice) {
      return containerSize === CONTAINER_TYPES.SMALL.WEIGHT;
    }
    // No rice bags - any container is fine
    return true;
  };

  // Function to fetch categories from API
  const getAllCategories = () => {
    setLoading(true);
    axios
      .get(BASE_URL + "product-service/showItemsForCustomrs")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Error", "Failed to fetch product data");
        setLoading(false);
      });
  };

  // Request camera permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Calculate total price whenever scanned items or container price changes
  useEffect(() => {
    let total = 0;
    
    // Calculate total price of all scanned items
    Object.values(scannedItems).forEach(item => {
      total += item.price * item.quantity;
    });
    
    // Add the container price first
    total += containerPrice;
    
    // Then subtract it if a container is scanned
    if (containerScanned) {
      total -= containerPrice;
    }
    
    // Ensure total doesn't go below zero
    setTotalPrice(Math.max(0, total));
  }, [scannedItems, containerScanned, containerPrice]);

  // Handle barcode scanning
  const handleBarCodeScanned = ({ type, data }) => {
    const currentTime = Date.now();
    
    // Check if this is the same barcode scanned within the cooldown period
    if (data === lastScannedBarcode && currentTime - lastScanTime < SCAN_COOLDOWN_MS) {
      console.log("Ignoring duplicate scan within cooldown period");
      return;
    }
    
    // Update last scanned info
    setLastScannedBarcode(data);
    setLastScanTime(currentTime);
    
    setScanning(false);
    console.log("data", data);
    console.log("Item", type);
    processBarcodeScan(data);
  };

  // Process a barcode scan
  const processBarcodeScan = (barcode) => {
    if (!barcode) return;
    
    // Clean up the scanned barcode (remove spaces, convert to uppercase)
    const cleanBarcode = barcode.replace(/\s+/g, '').toUpperCase();
    console.log(`Processing cleaned barcode: ${cleanBarcode}`);
    
    // Check for container barcodes
    if (cleanBarcode.startsWith(CONTAINER_TYPES.SMALL.BARCODE) || 
        cleanBarcode.startsWith(CONTAINER_TYPES.LARGE.BARCODE)) {
      return handleContainerScan(cleanBarcode);
    }
    
    // Regular product handling
    const matchingProducts = products.filter(product => {
      // Add null check before accessing barcode property
      if (!product.barcode) return false;
      
      const normalizedProductBarcode = product.barcode.replace(/\s+/g, '').toUpperCase();
      return cleanBarcode.startsWith(normalizedProductBarcode) || 
             normalizedProductBarcode.startsWith(cleanBarcode);
    });
    
    if (matchingProducts.length === 1) {
      // Exact match found
      const product = matchingProducts[0];
      
      // Increment scan count
      setScanCount(scanCount + 1);
      
      // Add to scanned items or increment quantity using product.barcode as the key
      setScannedItems(prevItems => {
        const updatedItems = { ...prevItems };
        
        if (updatedItems[product.barcode]) {
          updatedItems[product.barcode].quantity++;
          // Always store the original scanned barcode
          if (!updatedItems[product.barcode].scannedBarcodes) {
            updatedItems[product.barcode].scannedBarcodes = [barcode];
          } else {
            updatedItems[product.barcode].scannedBarcodes.push(barcode);
          }
        } else {
          updatedItems[product.barcode] = {
            ...product,
            quantity: 1,
            scannedBarcode: barcode, // Maintain for backward compatibility
            scannedBarcodes: [barcode] // New array to store all scanned barcodes
          };
        }
        
        return updatedItems;
      });
      
      // Clear the input field
      setBarcodeInput('');
      
      return true;
    } else if (matchingProducts.length > 1) {
      // Multiple matches found, let user select
      setMatchedProducts(matchingProducts);
      setShowMatchesModal(true);
      return true;
    } else {
      // No match found
      Alert.alert('Product Not Found', `Barcode ${barcode} not found in database.`);
      return false;
    }
  };

  // Handle container scanning logic
  const handleContainerScan = (cleanBarcode) => {
    // Check if a container is already added
    if (containerScanned) {
      Alert.alert('Container Already Added', 'Only one container can be added per transaction.');
      return false;
    }
    
    // Determine container type
    let containerType = null;
    
    if (cleanBarcode.startsWith(CONTAINER_TYPES.SMALL.BARCODE)) {
      containerType = CONTAINER_TYPES.SMALL;
    } else if (cleanBarcode.startsWith(CONTAINER_TYPES.LARGE.BARCODE)) {
      containerType = CONTAINER_TYPES.LARGE;
    }
    
    if (!containerType) {
      Alert.alert('Invalid Container', 'The scanned container type is not recognized.');
      return false;
    }
    
    // Check if the container is valid for the current rice bags
    if (!isContainerValid(containerType.WEIGHT)) {
      // Determine what container is allowed
      let allowedContainer = '';
      
      if (has10kgRice && has26kgRice) {
        allowedContainer = CONTAINER_TYPES.LARGE.NAME;
      } else if (has26kgRice) {
        allowedContainer = CONTAINER_TYPES.LARGE.NAME;
      } else if (has10kgRice) {
        allowedContainer = CONTAINER_TYPES.SMALL.NAME;
      }
      
      Alert.alert(
        'Invalid Container Selection', 
        `Based on your rice bag selection, only ${allowedContainer} is allowed.`
      );
      return false;
    }
    
   // Find the exact container product to get its price
const containerProduct = products.find(product => {
  // Add null check before accessing barcode property
  if (!product.barcode) return false;
  
  const normalizedProductBarcode = product.barcode.replace(/\s+/g, '').toUpperCase();
  return cleanBarcode.startsWith(normalizedProductBarcode);
});

if (!containerProduct) {
  Alert.alert('Container Not Found', `Container barcode ${cleanBarcode} not found in database.`);
  return false;
}

// Set container details - STORE THE FULL SCANNED BARCODE HERE
setContainerWeight(containerType.WEIGHT);
setContainerPrice(containerProduct.price || 0);
setContainerBarcode(cleanBarcode); // Store the full scanned barcode instead of product.barcode
setContainerScanned(true);
    
    Alert.alert(
      'Container Added', 
      `${containerType.NAME} has been added. Container price will be deducted from total.`
    );
    
    setBarcodeInput('');
    return true;
  };
  
  // Calculate totals for the order summary
  const calculateTotal = () => {
    // Calculate the subtotal of all scanned items
    let subtotal = 0;
    Object.values(scannedItems).forEach(item => {
      subtotal += item.price * item.quantity;
    });
    
    // Get the container discount (if a container was scanned)
    const containerDiscount = containerScanned ? containerPrice : 0;
    
    // If container is scanned, add its price to subtotal first 
    if (containerScanned) {
      subtotal += containerDiscount;
    }
    
    // Calculate final total by subtracting container discount
    const total = Math.max(0, subtotal - containerDiscount);
    
    return {
      subtotal,
      containerDiscount,
      total
    };
  };

  // Find a product by category, name and weight
  const findProductByAttributes = () => {
    if (!categoryInput && !productNameInput) {
      Alert.alert('Input Required', 'Please enter at least a category or product name to search.');
      return;
    }
    
    // Get the first 3 letters of category and product name if provided
    const categoryPrefix = categoryInput ? categoryInput.substring(0, 3).toLowerCase() : '';
    const namePrefix = productNameInput ? productNameInput.substring(0, 3).toLowerCase() : '';
    
    // Convert weight to number
    const weightNum = parseFloat(weightInput);
    
    // Find products that match the criteria
    const possibleMatches = products.filter(p => {
      const categoryMatch = categoryInput ? 
        p.category.toLowerCase().startsWith(categoryPrefix) : true;
      const nameMatch = productNameInput ? 
        p.name.toLowerCase().startsWith(namePrefix) : true;
      const weightMatch = weightNum ? 
        Math.abs(p.weight - weightNum) < 1 : true; // Allow small difference in weight
      
      return categoryMatch && nameMatch && weightMatch;
    });
    
    if (possibleMatches.length === 0) {
      Alert.alert('No Match', 'No matching products found.');
      return null;
    } else {
      // Show all matches in a modal for user selection
      setMatchedProducts(possibleMatches);
      setShowMatchesModal(true);
      return possibleMatches;
    }
  };

  // Select a product from the matches modal
  const selectProduct = (product) => {
    processBarcodeScan(product.barcode);
    setShowMatchesModal(false);
    setShowManualMatch(false);
    clearManualInputs();
  };

  // Clear all manual input fields
  const clearManualInputs = () => {
    setCategoryInput('');
    setProductNameInput('');
    setWeightInput('');
  };

  // Clear all scanned items
  const clearAllItems = () => {
    setScannedItems({});
    setScanCount(0);
    setContainerScanned(false);
    setContainerBarcode('');
    setContainerPrice(0);
    setContainerWeight('');
  };

  // Process payment and submit barcode data
  const processPayment = async (paymentMethod) => {
    // Set processing state
    setProcessingPayment(true);
    
    try {
      // In a real app, you would handle payment processing here
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
     // Create an array to hold all the scanned barcodes
let allBarcodes = [];

// Get all individual barcodes from each scanned item
Object.values(scannedItems).forEach(item => {
  if (item.scannedBarcodes && item.scannedBarcodes.length > 0) {
    // If we have the new scannedBarcodes array, use all of those barcodes
    allBarcodes = [...allBarcodes, ...item.scannedBarcodes];
  } else if (item.scannedBarcode) {
    // Fallback to the old scannedBarcode property if needed
    allBarcodes.push(item.scannedBarcode);
  }
});

// If container is scanned, include its barcode
if (containerScanned && containerBarcode) {
  allBarcodes.push(containerBarcode);
}
      

      // Create the request payload
      const payload = {
        barCodeNumber: allBarcodes, // Now includes ALL scanned barcodes
        containerWeight: parseFloat(containerWeight) || 0,
        registerContactNumber: userData.mobileNumber || userData.whatsappNumber || fromMobileNumber, // Use user's phone from Redux store
        status: "DELIVERED",
        fromMObileNumber: fromMobileNumber,
        toMobileNumber: toMobileNumber,
      };
  
      console.log("payload", payload);
      console.log("Total barcodes being sent:", allBarcodes.length); 
      
      // Call the API (commented out for now)
  
      const response = await axios.post(
        BASE_URL + "product-service/individualBarcodeScanner", 
        payload
      );
      
      // Handle the response
      if (response.status === 200) {
        setProcessingPayment(false);
        setShowPaymentModal(false);
        setFromMobileNumber('')
        setToMobileNumber('')
        // Clear all data after successful submission
        clearAllItems();
        
        Alert.alert(
          "Success", 
          "Your items have been submitted successfully!"
        );
      } else {
        throw new Error("Failed to submit barcodes");
      }
    
      
      // For now, simulate successful submission
      setProcessingPayment(false);
      setShowPaymentModal(false);
      clearAllItems();
      Alert.alert(
        "Success", 
        "Your items have been submitted successfully!"
      );
    } catch (error) {
      console.error("Error submitting data:", error);
      setProcessingPayment(false);
      Alert.alert(
        "Error", 
        "There was a problem processing your payment or submitting your data. Please try again."
      );
    }
  };

  // Cancel the payment process
  const cancelPayment = () => {
    setShowPaymentModal(false);
  };

  // Show suggestions for containers based on rice bags
  const showContainerSuggestions = () => {
    // Only show suggestions if rice bags are detected and no container is scanned yet
    if ((has10kgRice || has26kgRice) && !containerScanned) {
      let suggestedContainer = '';
      
      if (has10kgRice && has26kgRice) {
        suggestedContainer = CONTAINER_TYPES.LARGE.NAME;
      } else if (has26kgRice) {
        suggestedContainer = CONTAINER_TYPES.LARGE.NAME;
      } else if (has10kgRice) {
        suggestedContainer = CONTAINER_TYPES.SMALL.NAME;
      }
      
      return (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionText}>
            Rice bags detected! We recommend a {suggestedContainer}.
          </Text>
          <Text style={styles.suggestionText}>
            Please scan the container barcode to add it to your order.
          </Text>
        </View>
      );
    }
    
    return null;
  };

  // Render each scanned item row
  const renderScannedItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemRow} 
      onPress={() => viewProductDetail(item)}
    >
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text>Category: {item.category}</Text>
        <Text>Price: ₹{item.price.toFixed(2)} × {item.quantity}</Text>
      </View>
      <Text style={styles.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</Text>
    </TouchableOpacity>
  );

  // Render each matched product in the selection modal
  const renderMatchedProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchedItemRow} 
      onPress={() => selectProduct(item)}
    >
      <View style={styles.matchedItemImageContainer}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.matchedItemImage} 
            onError={() => console.log("Error loading image")}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.matchedItemInfo}>
        <Text style={styles.matchedItemName}>{item.name}</Text>
        <Text>Category: {item.category}</Text>
        <Text>Price: ₹{item.price.toFixed(2)}</Text>
        {item.weight && <Text>Weight: {item.weight} {item.units}</Text>}
      </View>
    </TouchableOpacity>
  );

  // Render order summary
  const renderOrderSummary = () => {
    const { subtotal, containerDiscount, total } = calculateTotal();
    
    return (
      <View style={styles.orderSummaryContainer}>
        <Text style={styles.orderSummaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        
        {containerScanned && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Container Discount:</Text>
            <Text style={styles.discountValue}>-₹{containerDiscount.toFixed(2)}</Text>
          </View>
        )}
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  // Show product detail modal
  const viewProductDetail = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  // Handle submission of scanned items
  const handleSubmit = () => {
    if (Object.keys(scannedItems).length === 0) {
      Alert.alert("Error", "Please scan at least one item before submitting");
      return;
    }
    
    // Show the payment modal
    setShowPaymentModal(true);
  };

  // If camera permission hasn't been determined yet
  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  // If camera permission was denied
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  // Show loading indicator while fetching products
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* <Text style={styles.header}>Product Scanner</Text> */}
      
      {scanning ? (
        <View style={styles.scannerContainer}>
          <CameraView
            style={{ flex: 1 }}
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: [
                "code128",
                "ean13",
                "ean8",
                "qr",
                "pdf417",
                "upc_e",
                "datamatrix",
                "code39",
                "code93",
                "itf14",
                "codabar",
                "upc_a",
                "aztec",
              ],
            }}
          />
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => setScanning(false)}
          >
            <Text style={styles.buttonText}>Cancel Scan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter barcode manually"
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            autoCapitalize="characters"
            onSubmitEditing={() => processBarcodeScan(barcodeInput)}
          />
          
          {/* <View style={styles.buttonRow}> */}
          <View style={{justifyContent:'center',alignItems:"center",margin:10}}>
            <TouchableOpacity 
              style={[styles.button, styles.scanButton]} 
              onPress={() => setScanning(true)}
            >
              <Text style={styles.buttonText}>Scan Barcode</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity 
              style={[styles.button, styles.manualButton]} 
              onPress={() => setShowManualMatch(!showManualMatch)}
            >
              <Text style={styles.buttonText}>
                {showManualMatch ? 'Hide Manual Match' : 'Manual Match'}
              </Text>
            </TouchableOpacity> */}
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearAllItems}
            >
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit & Pay</Text>
            </TouchableOpacity>
          </View>
          
          {showManualMatch && (
            <View style={styles.manualMatchForm}>
              <TextInput
                style={styles.input}
                placeholder="Category Name"
                value={categoryInput}
                onChangeText={setCategoryInput}
              />
              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={productNameInput}
                onChangeText={setProductNameInput}
              />
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={[styles.button, styles.findButton]} 
                onPress={findProductByAttributes}
              >
                <Text style={styles.buttonText}>Find Match</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Display container suggestions if rice bags are detected */}
          {showContainerSuggestions()}
          
          {containerScanned ? (
            <View style={styles.containerInfo}>
              <Text style={styles.containerInfoText}>
                {containerWeight}kg Container Added (Discount: ₹{containerPrice.toFixed(2)})
              </Text>
              <TouchableOpacity 
                style={[styles.button, styles.removeButton]} 
                onPress={() => {
                  setContainerScanned(false);
                  setContainerBarcode('');
                  setContainerPrice(0);
                  setContainerWeight('');
                }}
              >
                <Text style={styles.buttonText}>Remove Container</Text>
              </TouchableOpacity>
            </View>
          ) : (
            (has10kgRice || has26kgRice) && (
              <View style={styles.containerScanInfo}>
                <Text style={styles.containerScanInfoText}>
                  Please scan the appropriate container barcode to add a container to your order.
                </Text>
              </View>
            )
          )}
        </View>
      )}
      
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Scanned Items ({Object.keys(scannedItems).length})</Text>
          <Text style={styles.scanCount}>Total Scans: {scanCount}</Text>
        </View>
        
        <FlatList
          data={Object.values(scannedItems)}
          renderItem={renderScannedItem}
          keyExtractor={item => item.barcode}
          style={styles.itemsList}
          ListEmptyComponent={<Text style={styles.emptyText}>No items scanned yet</Text>}
        />
        
        {renderOrderSummary()}
      </View>
      
      {/* Product Detail Modal */}
      <Modal
        visible={showProductDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProductDetail(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Image 
                  source={{ uri: selectedProduct.image }} 
                  style={styles.productImage} 
                  onError={() => console.log("Error loading image")}
                />
                <Text style={styles.productTitle}>{selectedProduct.name}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category: </Text>
                    {selectedProduct.category}
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price: </Text>
                    ₹{selectedProduct.price.toFixed(2)}
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity: </Text>
                    {selectedProduct.quantity}
                  </Text>
                  {selectedProduct.weight && (
                    <Text style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Weight: </Text>
                      {selectedProduct.weight} {selectedProduct.units}
                    </Text>
                  )}
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Barcode: </Text>
                    {selectedProduct.barcode}
                  </Text>
                  {selectedProduct.description && (
                    <Text style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description: </Text>
                      {selectedProduct.description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={[styles.button, styles.closeButton]} 
                  onPress={() => setShowProductDetail(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Matched Products Selection Modal */}
      <Modal
        visible={showMatchesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMatchesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Product</Text>
            <FlatList
              data={matchedProducts}
              renderItem={renderMatchedProduct}
              keyExtractor={item => item.barcode}
              style={styles.matchedList}
            />
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]} 
              onPress={() => setShowMatchesModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            
            {renderOrderSummary()}
            

            <TextInput
            style={styles.input}
            placeholder="Enter Your Mobile Number"
            value={fromMobileNumber}
            onChangeText={(number)=>setFromMobileNumber(number)}
            keyboardType='numeric'
            maxLength={10}
            // autoCapitalize="characters"
            // onSubmitEditing={() => processBarcodeScan(barcodeInput)}
          />

          {fromMobileNumber_error && <Text style={styles.errorText}>Please Enter Your Mobile Number</Text>}

<TextInput
            style={styles.input}
            placeholder="Enter Customer Mobile Number"
            value={toMobileNumber}
            onChangeText={(number)=>setToMobileNumber(number)}
            keyboardType='numeric'
            maxLength={10}
            // autoCapitalize="characters"
            // onSubmitEditing={() => processBarcodeScan(barcodeInput)}
          />
{toMobileNumber_error && <Text style={styles.errorText}>Please Enter Customer Mobile Number</Text>}

            {processingPayment ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.processingText}>Processing your payment...</Text>
              </View>
            ) : (
              <>
                <View style={styles.paymentOptions}>
                  <TouchableOpacity 
                    style={[styles.paymentButton, styles.cashButton]} 
                    onPress={() => processPayment('cash')}
                  >
                    <Text style={styles.paymentButtonText}>Submit</Text>
                  </TouchableOpacity>
                  
                  {/* <TouchableOpacity 
                    style={[styles.paymentButton, styles.cardButton]} 
                    onPress={() => processPayment('card')}
                  >
                    <Text style={styles.paymentButtonText}>Pay with Card</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentButton, styles.upiButton]} 
                    onPress={() => processPayment('upi')}
                  >
                    <Text style={styles.paymentButtonText}>Pay with UPI</Text>
                  </TouchableOpacity> */}
                </View>
                
                <TouchableOpacity 
                  style={[styles.paymentButton, styles.cancelButton]} 
                  onPress={cancelPayment}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// StyleSheet definition
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  scannerContainer: {
    height: height / 3,
    width: width,
    overflow: 'hidden',
    position: 'relative',
  },
  inputContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: width*0.42,

  },
  scanButton: {
    backgroundColor: '#4CAF50',
  },
  manualButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  submitButton: {
    backgroundColor: '#FF9800',
  },
  findButton: {
    backgroundColor: '#9C27B0',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#607D8B',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryContainer: {
    flex: 1,
    padding: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanCount: {
    fontSize: 14,
    color: '#666',
  },
  itemsList: {
    flex: 1,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  itemRow: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  manualMatchForm: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  matchedList: {
    maxHeight: height * 0.5,
  },
  matchedItemRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  matchedItemImageContainer: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  matchedItemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  matchedItemInfo: {
    flex: 1,
  },
  matchedItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDetails: {
    marginBottom: 15,
  },
  detailRow: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  orderSummaryContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  discountValue: {
    fontSize: 16,
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentOptions: {
    marginTop: 20,
  },
  paymentButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cashButton: {
    backgroundColor: '#4CAF50',
  },
  cardButton: {
    backgroundColor: '#2196F3',
  },
  upiButton: {
    backgroundColor: '#FF9800',
  },
  paymentButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
  },
  suggestionContainer: {
    padding: 10,
    backgroundColor: '#FFF9C4',
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  suggestionText: {
    fontSize: 14,
    marginBottom: 5,
  },
  containerInfo: {
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  containerInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  containerScanInfo: {
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  containerScanInfoText: {
    fontSize: 14,
    color: '#0D47A1',
  }
});