import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import BASE_URL from "../../config";

const { width, height } = Dimensions.get("window");

const CartScreen = ({ route }) => {
  const navigation = useNavigation();

  const [cartData, setCartData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loadingItems, setLoadingItems] = useState({});
  const [removalLoading, setRemovalLoading] = useState({});

  // Price management states
  const [offerPrices, setOfferPrices] = useState({}); // User entered prices
  const [originalPrices, setOriginalPrices] = useState({}); // Store original prices
  const [nofDaysAfterMeetAgain, setNofDaysAfterMeetAgain] = useState(0);
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);

  // Get route params
  const storeId = route.params?.storeDetails.storeId;
  const customerId = route.params?.storeDetails.userId;
  const token = useSelector((state) => state.auth?.token);

  useEffect(() => {
    console.log("CartScreen mounted with params:", route.params);
    fetchCartData();
  }, []);

  // Navigate to Categories page
  const navigateToCategories = () => {
    const storeDetails = {
      storeId: storeId,
      userId: customerId,
    };
    navigation.navigate("All Categories", {
      storeDetails: storeDetails,
    });
  };

  // Save Store Request and Navigate to Checkout
  const saveRequestAndCheckout = async () => {
    // if (cartData.length === 0) {
    //   Alert.alert("Empty Cart", "Please add items to your cart first");
    //   return;
    // }

    try {
      setCheckoutProcessing(true);

      // Create request with proper structure according to API
      const listItems = cartData.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName, // Adding itemName as required by API
        offerPrice: getEffectivePrice(item.itemId),
        qty: item.cartQuantity,
        userId: customerId, // Adding userId to each item as required by API
        weight: parseFloat(item.weight) || 0,
      }));

      const requestBody = {
        intrestPlaceOrder: "YES",
        listItems: listItems,
        marketId: storeId, 
        nofDaysAfterMeetAgain: parseInt(nofDaysAfterMeetAgain) || 0,
      };

      console.log("Sending Store Request:", requestBody);

      const response = await axios.post(
        `${BASE_URL}product-service/placeStoreRequest`,
        requestBody,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log("Store Request Response:", response.data);
      
      // After successful save, navigate to checkout with proper parameters
      const checkoutItems = cartData.map((item) => ({
        ...item,
        effectivePrice: getEffectivePrice(item.itemId),
        originalPrice: originalPrices[item.itemId] || item.itemPrice,
        offerPrice: offerPrices[item.itemId] || "",
      }));

      navigation.navigate("Checkout", {
        cartItems: checkoutItems,
        grandTotal: grandTotal,
        storeDetails: {
          storeId: storeId,
          userId: customerId, // Passing customerId properly
        },
        customerId: customerId, // Also passing as direct prop for fallback
        storeId: storeId, // Also passing as direct prop for fallback
        nofDaysAfterMeetAgain: nofDaysAfterMeetAgain,
      });

    } catch (error) {
      console.error("Error saving store request:", error);
      Alert.alert("Error", "Failed to save your request. Please try again.");
    } finally {
      setCheckoutProcessing(false);
    }
  };

  // Fetch cart data
  const fetchCartData = async () => {
    if (!customerId) {
      setError("Customer ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
       const response = await axios.get(`${BASE_URL}cart-service/cart/customersCartItems?customerId=${customerId}`);
      console.log("Response from getStore:", response.data);
      const cartItems = response.data || [];

   
        setCartData(cartItems?.customerCartResponseList);

        const originalPricesObj = {};
        const offerPricesObj = {};

        cartItems?.customerCartResponseList.forEach((item) => {
          originalPricesObj[item.itemId] = item.itemPrice;
          offerPricesObj[item.itemId] = "";
        });

        setOriginalPrices(originalPricesObj);
        setOfferPrices(offerPricesObj);

        // Calculate total with original prices initially
        calculateTotalWithPrices(cartItems?.customerCartResponseList, offerPricesObj, originalPricesObj);

    } catch (error) {
      console.error("Error fetching cart data:", error);
      setError("Failed to load cart data");
      setCartData([]);
      setGrandTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fixed calculation function that takes offer prices as parameter
  const calculateTotalWithPrices = (
    items,
    currentOfferPrices,
    currentOriginalPrices
  ) => {
    const total = items.reduce((sum, item) => {
      // Use offer price if entered, otherwise use original price
      const offerPrice = currentOfferPrices[item.itemId];
      const priceToUse =
        offerPrice && offerPrice !== ""
          ? parseFloat(offerPrice)
          : currentOriginalPrices[item.itemId] || item.itemPrice;

      return sum + priceToUse * item.cartQuantity;
    }, 0);
    setGrandTotal(total);
  };

  // Update offer price when user enters price - FIXED VERSION
  const updateOfferPrice = (itemId, priceText) => {
    const newOfferPrices = { ...offerPrices, [itemId]: priceText };
    setOfferPrices(newOfferPrices);

    // Recalculate total with the new offer prices
    calculateTotalWithPrices(cartData, newOfferPrices, originalPrices);
  };

  // Get effective price for an item (offer price or original price)
  const getEffectivePrice = (itemId) => {
    const offerPrice = offerPrices[itemId];
    if (offerPrice && offerPrice !== "") {
      return parseFloat(offerPrice) || 0;
    }
    return originalPrices[itemId] || 0;
  };

  // Increment quantity
  const incrementQuantity = async (item) => {
    if (!customerId || !item.itemId) return;

    try {
      setLoadingItems((prev) => ({ ...prev, [item.itemId]: true }));

      await axios.patch(`${BASE_URL}cart-service/cart/incrementCartData`, {
        customerId,
        itemId: item.itemId,
      });

      await fetchCartData();
    } catch (error) {
      console.error("Error incrementing:", error);
      Alert.alert("Error", "Failed to update quantity");
    } finally {
      setLoadingItems((prev) => ({ ...prev, [item.itemId]: false }));
    }
  };

  // Decrement quantity
  const decrementQuantity = async (item) => {
    if (!customerId || !item.itemId) return;

    try {
      setLoadingItems((prev) => ({ ...prev, [item.itemId]: true }));

      if (item.cartQuantity <= 1) {
        await removeCartItem(item);
      } else {
        await axios.patch(`${BASE_URL}cart-service/cart/decrementCartData`, {
          customerId,
          itemId: item.itemId,
        });

        await fetchCartData();
      }
    } catch (error) {
      console.error("Error decrementing:", error);
      Alert.alert("Error", "Failed to update quantity");
    } finally {
      setLoadingItems((prev) => ({ ...prev, [item.itemId]: false }));
    }
  };

  // Remove item
  const removeCartItem = async (item) => {
  setRemovalLoading((prev) => ({ ...prev, [item.cartId]: true }));

  try {
    await axios.delete(`${BASE_URL}cart-service/cart/remove`, {
      data: { id: item.cartId }, // Make sure this key matches your backend
    });

    fetchCartData(); // Refresh cart after removal
    Alert.alert("Success", `${item.itemName} removed from cart`);
  } catch (error) {
    console.error("Error removing item:", error);
    Alert.alert("Error", "Failed to remove item");
  } finally {
    setRemovalLoading((prev) => ({ ...prev, [item.cartId]: false }));
  }
};


  const handleRemoveItem = (item) => {

    console.log("Removing item:", item);
    
    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${item.itemName}" from your cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeCartItem(item),
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    fetchCartData();
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      fetchCartData();
    }, [customerId])
  );

  // Render cart item
  const renderCartItem = ({ item }) => {
    const originalPrice = originalPrices[item.itemId] || item.itemPrice;
    const offerPriceText = offerPrices[item.itemId] || "";
    const effectivePrice = getEffectivePrice(item.itemId);
    const isUpdating = loadingItems[item.itemId];
    const isRemoving = removalLoading[item.itemId];

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />

          <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.itemName}
            </Text>
            <Text style={styles.itemWeight}>
              {item.weight} {item.units}
            </Text>

            {/* Original Price Display */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Market Price:</Text>
              <Text style={styles.originalPrice}>
                ₹{item.itemPrice.toFixed(2)}
              </Text>
            </View>

            {/* Offer Price Input */}
            <View style={styles.offerPriceContainer}>
              <Text style={styles.priceLabel}>Your Offer Price:</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  value={offerPriceText}
                  onChangeText={(text) => updateOfferPrice(item.itemId, text)}
                  keyboardType="numeric"
                  placeholder={Number(originalPrice) > 0 ? originalPrice.toString() : "0"}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Quantity Controls */}
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => decrementQuantity(item)}
                  disabled={isUpdating}
                >
                  <MaterialIcons name="remove" size={18} color="white" />
                </TouchableOpacity>

                {isUpdating ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.quantityText}>{item.cartQuantity}</Text>
                )}

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => incrementQuantity(item)}
                  disabled={isUpdating}
                >
                  <MaterialIcons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Item Total */}
            <View style={styles.itemTotalContainer}>
              <Text style={styles.itemTotalLabel}>Subtotal:</Text>
              <Text style={styles.itemTotal}>
                ₹{(item.itemPrice * item.cartQuantity).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#FF3B30" />
            ) : (
              <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Error State
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCartData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty Cart State
  // if (!loading && cartData.length === 0) {
  //   return (
  //     <View style={styles.centerContainer}>
  //       <MaterialIcons name="shopping-cart" size={64} color="#ccc" />
  //       <Text style={styles.emptyText}>Your cart is empty</Text>
  //       <Text style={styles.emptySubText}>Add some items to get started</Text>
  //       <TouchableOpacity
  //         style={styles.shopButton}
  //         onPress={()=>navigateToCategories()}
  //       >
  //         <MaterialIcons name="storefront" size={20} color="white" />
  //         <Text style={styles.shopButtonText}>Browse Categories</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {/* My Cart ({cartData.length} items) */}
          My cart
        </Text>
        <TouchableOpacity
          onPress={navigateToCategories}
          style={styles.addMoreButton}
        >
          <MaterialIcons name="shopping-cart" size={20} color="#007AFF" />
          <Text style={styles.addMoreText}>Add More</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartData}
        renderItem={renderCartItem}
        keyExtractor={(item) =>
         item.itemId
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Days Input */}
      <View style={styles.daysContainer}>
        <MaterialIcons name="schedule" size={20} color="#666" />
        <Text style={styles.daysLabel}>Meet again after:</Text>
        <TextInput
          style={styles.daysInput}
          value={nofDaysAfterMeetAgain.toString()}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, ""); // Only allow numbers
            setNofDaysAfterMeetAgain(parseInt(numericValue) || 0);
          }}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#999"
        />
        <Text style={styles.daysUnit}>days</Text>
      </View>

      {/* Bottom Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Grand Total</Text>
            {/* <Text style={styles.totalSubtext}>({cartData.length} items)</Text> */}
            <Text>Items: </Text>
          </View>
          <Text style={styles.totalAmount}>₹{grandTotal.toFixed(2)}</Text>
        </View>

        {/* Single Checkout Button that saves request and navigates */}
        <TouchableOpacity
          style={[styles.button, styles.checkoutButton]}
          onPress={saveRequestAndCheckout}
          disabled={checkoutProcessing}
        >
          {checkoutProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="payment" size={20} color="white" />
              <Text style={styles.checkoutButtonText}>Save & Checkout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
  },
  addMoreText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 200,
  },
  cartItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemContainer: {
    flexDirection: "row",
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#F5F5F5",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 4,
    lineHeight: 20,
  },
  itemWeight: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginRight: 8,
    fontWeight: "500",
  },
  originalPrice: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  offerPriceContainer: {
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    marginTop: 4,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    padding: 0,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginRight: 12,
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#007AFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  itemTotalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTotalLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginRight: 8,
    fontWeight: "500",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  daysContainer: {
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  daysLabel: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 12,
    color: "#1D1D1F",
  },
  daysInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    width: 60,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  daysUnit: {
    fontSize: 16,
    marginLeft: 8,
    color: "#8E8E93",
  },
  summaryContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  totalSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#007AFF",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  checkoutButton: {
    backgroundColor: "#007AFF",
    width: "100%",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1D1D1F",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  shopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default CartScreen;