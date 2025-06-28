import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import BASE_URL from "../../config";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 24;

const CategoriesScreen = ({ route, navigation }) => {
  const [allData, setAllData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});
  const [error, setError] = useState(null);
  const [cartQuantities, setCartQuantities] = useState({});
  const [showCartItems, setShowCartItems] = useState([]);
  const [showGoToCart, setShowGoToCart] = useState(false);
  
  const customerId = route.params?.storeDetails?.userId;
  const storeDetails = route.params?.storeDetails;

  useFocusEffect(
    useCallback(() => {
      fetchAllCategoryInventory();
      fetchCartData();
    }, [])
  );

  const fetchAllCategoryInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${BASE_URL}product-service/showItemsForCustomrs`
      );
      const data = res.data;

      const flattenedData = [];
      data.forEach((category) => {
        if (
          category.itemsResponseDtoList &&
          category.itemsResponseDtoList.length > 0
        ) {
          category.itemsResponseDtoList.forEach((item) => {
            const itemWeight = item.weight + "" + item.units;

            if (itemWeight === "1kgs" || itemWeight === "5kgs") {
              flattenedData.push({
                ...item,
                catName: category.categoryName,
              });
            }
          });
        }
      });

      const uniqueCategories = [
        "All",
        ...Array.from(
          new Set(data.map((item) => item.categoryName).filter(Boolean))
        ),
      ];

      setCategories(uniqueCategories);
      setAllData(flattenedData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to load products. Please try again.");
      Alert.alert(
        "Error",
        "Failed to load products. Please check your internet connection and try again.",
        [
          {
            text: "Retry",
            onPress: () => fetchAllCategoryInventory(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    console.log("Fetching cart data for customerId:", customerId);
    if (!customerId) return;

    try {
      const res = await axios.get(
        `${BASE_URL}cart-service/cart/customersCartItems`,
        {
          params: { customerId },
        }
      );
      
      const cartItems = res.data;
      console.log("Cart Items:", cartItems);
      
      setShowCartItems(cartItems?.customerCartResponseList || []);
      
      const quantities = {};
      cartItems?.customerCartResponseList?.forEach((item) => {
        quantities[item.itemId] = item.cartQuantity;
      });

      console.log("Cart Quantities:", quantities);
      setCartQuantities(quantities);
      setShowGoToCart(Object.keys(quantities).length > 0);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const addItemfunc = async (itemId) => {
    if (!customerId) {
      Alert.alert("Error", "Customer ID not found. Please login again.");
      return;
    }

    setCartLoading((prev) => ({ ...prev, [itemId]: true }));

    try {
      const response = await axios.post(
        `${BASE_URL}cart-service/cart/add_Items_ToCart`,
        {
          itemId,
          customerId,
        }
      );

      console.log("Add to cart response:", response.data);
      
      // Update local state immediately for better UX
      setCartQuantities((prev) => ({ ...prev, [itemId]: 1 }));
      setShowGoToCart(true);
      
      // Refresh cart data to sync with server
      await fetchCartData();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Alert.alert("Error", "Could not add item to cart. Please try again.");
    } finally {
      setCartLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const incrementQty = async (itemId) => {
    if (!customerId) return;

    setCartLoading((prev) => ({ ...prev, [itemId]: true }));

    try {
      await axios.patch(`${BASE_URL}cart-service/cart/incrementCartData`, {
        itemId,
        customerId,
      });

      // Update local state immediately
      setCartQuantities((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));
      
      // Refresh cart data to sync with server
      await fetchCartData();
    } catch (error) {
      console.error("Error incrementing quantity:", error);
      Alert.alert("Error", "Could not update cart. Please try again.");
    } finally {
      setCartLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const decrementQty = async (itemId) => {
    if (!customerId) return;

    setCartLoading((prev) => ({ ...prev, [itemId]: true }));

    const cartItem = showCartItems.find((item) => item.itemId === itemId);
    const cartId = cartItem?.cartId;
    console.log("Cart ID for item:", cartId);

    // If quantity is 1 or less, remove the item from the cart
    if (cartQuantities[itemId] <= 1) {
      if (!cartId) {
        console.error("Cart ID not found for itemId:", itemId);
        setCartLoading((prev) => ({ ...prev, [itemId]: false }));
        return;
      }

      try {
        const res = await axios({
          url: `${BASE_URL}cart-service/cart/remove`,
          method: "DELETE",
          data: { id: cartId },
        });

        console.log("Cart item deleted:", res.data);
        
        // Update local state immediately
        setCartQuantities((prev) => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
        
        // Update showGoToCart state
        const updatedQuantities = { ...cartQuantities };
        delete updatedQuantities[itemId];
        setShowGoToCart(Object.keys(updatedQuantities).length > 0);
        
        // Refresh cart data to sync with server
        await fetchCartData();
      } catch (error) {
        console.error("Error removing item from cart:", error);
        Alert.alert("Error", "Could not remove item from cart. Please try again.");
      } finally {
        setCartLoading((prev) => ({ ...prev, [itemId]: false }));
      }
      return;
    }

    // If quantity > 1, decrement the quantity
    try {
      const res = await axios.patch(
        `${BASE_URL}cart-service/cart/decrementCartData`,
        {
          itemId,
          customerId,
        }
      );

      console.log("Decrement response:", res.data);

      // Update local state immediately
      setCartQuantities((prev) => {
        const newQty = (prev[itemId] || 1) - 1;
        const updated = { ...prev };
        if (newQty <= 0) {
          delete updated[itemId];
        } else {
          updated[itemId] = newQty;
        }
        return updated;
      });

      // Refresh cart data to sync with server
      await fetchCartData();
    } catch (error) {
      console.error("Error decrementing quantity:", error);
      Alert.alert("Error", "Could not update cart. Please try again.");
    } finally {
      setCartLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const goToCart = () => {
    navigation.navigate("Cart", {
      storeDetails: route.params?.storeDetails,
    });
  };

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabContainer}
      contentContainerStyle={styles.categoryTabContent}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          onPress={() => setSelectedCategory(cat)}
          style={[
            styles.categoryTab,
            selectedCategory === cat && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.categoryTabText,
              selectedCategory === cat && styles.activeTabText,
            ]}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.itemImage }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>
          {item.itemName}
        </Text>
        <Text style={styles.weight}>
          {item.weight} {item.units}
        </Text>
        <Text style={styles.price}>₹{item.itemPrice}</Text>

        {/* Cart Controls */}
        <View style={styles.cartControlContainer}>
          {cartQuantities[item.itemId] ? (
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                onPress={() => decrementQty(item.itemId)}
                style={[styles.qtyControlBtn, styles.decrementBtn]}
                disabled={cartLoading[item.itemId]}
              >
                {cartLoading[item.itemId] ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.qtyControlText}>−</Text>
                )}
              </TouchableOpacity>

              <View style={styles.qtyTextContainer}>
                <Text style={styles.qtyText}>
                  {cartQuantities[item.itemId]}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => incrementQty(item.itemId)}
                style={[styles.qtyControlBtn, styles.incrementBtn]}
                disabled={cartLoading[item.itemId]}
              >
                {cartLoading[item.itemId] ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.qtyControlText}>+</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addButton,
                cartLoading[item.itemId] && styles.addButtonDisabled,
              ]}
              onPress={() => addItemfunc(item.itemId)}
              disabled={cartLoading[item.itemId]}
            >
              {cartLoading[item.itemId] ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.addButtonText}>Add to Cart</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchAllCategoryInventory}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredItems =
    selectedCategory === "All"
      ? allData
      : allData.filter((item) => item.catName === selectedCategory);

  if (loading) {
    return <View style={styles.container}>{renderLoader()}</View>;
  }

  if (error && allData.length === 0) {
    return <View style={styles.container}>{renderError()}</View>;
  }

  return (
    <View style={styles.container}>
      {renderCategoryTabs()}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) =>
          item.itemId?.toString() || Math.random().toString()
        }
        numColumns={2}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No items found in this category.
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={() => {
          fetchAllCategoryInventory();
          fetchCartData();
        }}
      />

      {/* Go to Cart Button */}
      {showGoToCart && (
        <TouchableOpacity style={styles.goToCartButton} onPress={goToCart}>
          <Text style={styles.goToCartText}>View Cart</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  categoryTabContainer: {
    marginBottom: 15,
    maxHeight: 50,
  },
  categoryTabContent: {
    paddingHorizontal: 5,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeTab: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  categoryTabText: {
    color: "#333333",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "white",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    margin: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  cardContent: {
    padding: 14,
    alignItems: "center",
    minHeight: 130,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
    color: "#2C3E50",
    marginBottom: 6,
    lineHeight: 20,
    height: 40,
  },
  weight: {
    fontSize: 13,
    color: "#7F8C8D",
    marginBottom: 8,
    fontWeight: "600",
  },
  price: {
    fontSize: 18,
    color: "#27AE60",
    fontWeight: "800",
    marginBottom: 14,
  },
  cartControlContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "#E8F4FD",
    elevation: 2,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qtyControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  decrementBtn: {
    backgroundColor: "#E74C3C",
  },
  incrementBtn: {
    backgroundColor: "#27AE60",
  },
  qtyControlText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  qtyTextContainer: {
    minWidth: 45,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  qtyText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#2C3E50",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 28,
    minWidth: 120,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: "#BDC3C7",
    elevation: 1,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  goToCartButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  goToCartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  flatListContent: {
    paddingBottom: 100,
    paddingTop: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
});