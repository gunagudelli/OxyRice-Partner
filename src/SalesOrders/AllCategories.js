import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import axios from "axios";
import BASE_URL from "../../config";
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 30;

const AllCategories = ({ route, navigation }) => {
  const [allData, setAllData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});

  const [weightOptions, setWeightOptions] = useState(["All"]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [quantityInput, setQuantityInput] = useState("");
  const [cartQuantities, setCartQuantities] = useState({});
  const spinValue = new Animated.Value(0);
  // const customerId = "939d875f-af3e-4292-b45e-5ade22366428";
  const customerId = route.params?.userId; //Offline user
  const userType = route.params?.type;
  useEffect(() => {
    console.log("All Categories", route.params);  
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
if(route.params?.type=="Market" || route.params?.type=="ONLINE"){
    fetchAllCategoryInventory();
}else{
  if(route.params?.type=="OFFLINE"){
  fetchRiceMarketInventory()
  }
}
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });




const fetchRiceMarketInventory = async () => {
  try {
    setLoading(true);
    const res = await axios.get(
      `${BASE_URL}product-service/market/${route.params?.marketId}`
    );
    const marketData = res.data;
console.log("Offlijne fetchRiceMarketInventory",res.data)
    // Filter only rice items (1kg and 5kg)
    const riceItems = marketData.listItems.filter(item => {
      const isRice = item.itemName.toLowerCase().includes('rice');
      const isValidWeight = item.weight === 1 || item.weight === 5;
      const isValidUnit = !item.itemName.toLowerCase().includes('gms'); // Exclude grams
      return isRice && isValidWeight && isValidUnit;
    });

    // Transform data to match your expected format
    const transformedData = riceItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      itemMrp: item.itemPrice, // Assuming itemPrice is MRP
      units: "kgs",
      weight: item.weight,
      itemPrice: item.offerPrice || item.itemPrice, // Use offer price if available
      quantity: item.qty,
      displayWeight: `${item.weight}kgs`,
      catName: "Rice" // Since the API doesn't provide categories, we'll group all as Rice
    }));

    // Get unique weights for filter options
    const weightSet = new Set();
    transformedData.forEach(item => weightSet.add(item.displayWeight));
    
    const sortedWeights = Array.from(weightSet).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      return aNum - bNum;
    });

    // Set state
    setCategories(["All", "Rice"]); // Only Rice category available
    setWeightOptions(["All", ...sortedWeights]);
    setAllData(transformedData);

  } catch (error) {
    console.error("Error fetching rice market inventory:", error.response);
  } finally {
    setLoading(false);
  }
};




const fetchAllCategoryInventory = async () => {
  try {
    setLoading(true);
    const res = await axios.get(
      `${BASE_URL}product-service/showGroupItemsForCustomrs`
    );
    const data = res.data;

    const riceData = data.find(item => item.categoryType === "RICE");
    
    if (!riceData) {
      setAllData([]);
      setWeightOptions(["All"]);
      setCategories(["All"]);
      return;
    }

    const flattenedData = [];
    const weightSet = new Set();

    riceData.categories.forEach((category) => {
      if (category.itemsResponseDtoList?.length) {
        category.itemsResponseDtoList.forEach((item) => {
          // Filter: Only weight 1 or 5 AND units = 'kgs' (case-insensitive)
          const isValidWeight = item.weight === 1 || item.weight === 5;
          const isValidUnit = item.units?.toLowerCase() === "kgs";

          if (isValidWeight && isValidUnit) {
            const flattenedItem = {
              ...item,
              catName: category.categoryName,
              displayWeight: `${item.weight}${item.units}`,
            };
            flattenedData.push(flattenedItem);
            weightSet.add(flattenedItem.displayWeight);
          }
        });
      }
    });

    const sortedWeights = Array.from(weightSet).sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      return aNum - bNum; // Simple numeric sort since we only have kgs
    });

    setCategories(["All", ...new Set(riceData.categories.map(cat => cat.categoryName))]);
    setWeightOptions(["All", ...sortedWeights]);
    setAllData(flattenedData);
  } catch (error) {
    console.error("Error fetching rice inventory:", error);
  } finally {
    setLoading(false);
  }
};

  const openQuantityModal = (item) => {
    setCurrentItem(item);
    setQuantityInput("");
    setModalVisible(true);
  };

  const handleAddItemsQuantity = () => {
    const qty = parseInt(quantityInput);
    if (!qty || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid number.");
      return;
    }

    const itemPayload = {
      itemId: currentItem.itemId,
      qty,
      weight: currentItem.weight || 0,
    };

    setSelectedItems((prevItems) => {
      const updatedItems = prevItems.filter(
        (i) => i.itemId !== currentItem.itemId
      );
      return [...updatedItems, itemPayload];
    });
    setModalVisible(false);
  };

  const handleSubmitQuantity = () => {
    let finalItems = [...selectedItems];
    if (modalVisible && currentItem && quantityInput) {
      const qty = parseInt(quantityInput);
      if (!qty || qty <= 0) {
        Alert.alert("Invalid Quantity", "Please enter a valid number.");
        return;
      }
      const newItem = {
        itemId: currentItem.itemId,
        qty,
        weight: currentItem.weight || 0,
      };
      finalItems = finalItems
        .filter((i) => i.itemId !== currentItem.itemId)
        .concat(newItem);
    }

    if (!finalItems.length) {
      Alert.alert("No Items", "Please add items before submitting.");
      return;
    }
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = today.getFullYear();

    console.log({ finalItems });
    const payload = {
      listItems: finalItems,
      marketId: route.params.MarketDetails.marketId,
      visitDate: `${year}-${month}-${day}`,
    };
    console.log({ payload });
    axios
      .post(`${BASE_URL}product-service/addMarketItems`, payload)
      .then((response) => {
        Alert.alert(
          "Success",
          `Items added successfully for market ${route.params.MarketDetails.marketName}`
        );
        setSelectedItems([]);
        setModalVisible(false);
      })
      .catch((error) =>
        console.error("Error adding market items:", error.response)
      );
  };

  const addItemfunc = async (itemId) => {
    try {
      await axios.post(`${BASE_URL}cart-service/cart/addAndIncrementCart`, {
        itemId,
        customerId,
      });
      setCartQuantities((prev) => ({ ...prev, [itemId]: 1 }));
    } catch (error) {
      console.error("Error addAndIncrementCart:", error.response);
    }
  };

  const incrementQty = async (itemId) => {
    try {
      await axios.post(`${BASE_URL}cart-service/cart/addAndIncrementCart`, {
        itemId,
        customerId,
      });
      setCartQuantities((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1,
      }));
    } catch (error) {
      console.error("Error incrementing:", error);
    }
  };

  const decrementQty = async (itemId) => {
    try {
      await axios.patch(`${BASE_URL}cart-service/cart/minusCartItem`, {
        itemId,
        customerId,
      });
      setCartQuantities((prev) => {
        const newQty = (prev[itemId] || 1) - 1;
        const updated = { ...prev, [itemId]: newQty };
        if (newQty <= 0) delete updated[itemId];
        return updated;
      });
    } catch (error) {
      console.error("Error decrementing:", error);
    }
  };

  const addorminusOfflineItem = async (itemId, AddOrMinusItem) => {
    console.log(
      "Adding or decrementing offline item with ID:",
      itemId,
      ",",
      AddOrMinusItem
    );

    const currentQty = parseInt(quantities[itemId]) || 0;
    const newofflineQty =
      AddOrMinusItem === "ADD" ? currentQty + 1 : Math.max(0, currentQty - 1);
    console.log("djgcj", itemId, newofflineQty);

    setQuantities({ ...quantities, [itemId]: newofflineQty });
    console.log({ currentQty });
    let data = {
      itemId,
      qty: 1,
      type: AddOrMinusItem,
      userOfflineOrdersId: customerId, // pass from route or state
    };
    axios
      .post(`${BASE_URL}user-service/addOrMinusOfflineItems`, data)
      .then((res) => {
        console.log("Updated:", res);
        Alert.alert("Success", `Item quantity updated successfully!`);
      })
      .catch((err) => {
        console.error("Error updating offline item:", err);
        Alert.alert(
          "Error",
          "Failed to update item quantity. Please try again."
        );
      });
  };

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
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
            style={{
              color: selectedCategory === cat ? "white" : "black",
              fontWeight: "bold",
            }}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWeightTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weightTabContent}
    >
      {weightOptions.map((weight) => (
        <TouchableOpacity
          key={weight}
          onPress={() => setSelectedWeight(weight)}
          style={[
            styles.weightTab,
            selectedWeight === weight && styles.activeWeightTab,
          ]}
        >
          <Text
            style={{
              color: selectedWeight === weight ? "white" : "black",
              fontWeight: "bold",
            }}
          >
            {weight}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }) => {
    const existingItem = selectedItems.find((i) => i.itemId === item.itemId);
    const offlineQty = quantities[item.itemId] || 0;
    const onlineQty = cartQuantities[item.itemId] || 0;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.itemImage }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{item.itemName}</Text>
        <Text style={styles.price}>₹{item.itemPrice}</Text>
        <Text style={styles.weight}>
          {item.weight} {item.weight === 1 ? "Kg" : "Kgs"}
        </Text>
        {route.params.type === "Market" ? (
          existingItem ? (
            <>
              <Text style={styles.qtyText}>Qty: {existingItem.qty}</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#FFA500" }]}
                onPress={() => openQuantityModal(item)}
              >
                <Text style={styles.addButtonText}>Update</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: "#4A90E2" }]}
              onPress={() => openQuantityModal(item)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )
        ) : (
          <>
            {(userType === "ONLINE" && onlineQty > 0) ||
            (userType === "OFFLINE" && offlineQty > 0) ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    userType === "ONLINE"
                      ? decrementQty(item.itemId)
                      : addorminusOfflineItem(item.itemId, "MINUS");
                  }}
                  style={styles.qtyControlBtn}
                >
                  <Text style={{ fontSize: 18 }}>−</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 10, fontWeight: "bold" }}>
                  {userType === "ONLINE" ? onlineQty : offlineQty}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    userType === "ONLINE"
                      ? incrementQty(item.itemId)
                      : addorminusOfflineItem(item.itemId, "ADD");
                  }}
                  style={styles.qtyControlBtn}
                >
                  <Text style={{ fontSize: 18 }}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#4A90E2" }]}
                onPress={() => {
                  userType === "ONLINE"
                    ? addItemfunc(item.itemId)
                    : addorminusOfflineItem(item.itemId, "ADD");
                }}
              >
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  const handleOfflineCheckout = async () => {
    // Create array of offline items from quantities state
    const offlineItems = Object.keys(quantities)
      .filter((itemId) => quantities[itemId] > 0)
      .map((itemId) => ({
        itemId: itemId,
        qty: quantities[itemId],
      }));

    if (offlineItems.length === 0) {
      Alert.alert("No Items", "Please add items before checkout.");
      return;
    }

    const payload = {
      id: route.params?.userId,
      offlineItems: offlineItems,
    };
console.log({offlineItems})
    console.log({payload})
    try {
      const response = await axios.post(
        `${BASE_URL}user-service/offlineOrdersItems`,
        payload
      );
      Alert.alert("Success", response.data, [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("Proceed to Checkout", {
              MarketDetails: route.params,
            }),
        },
      ]);
      // Clear quantities after successful submission
      setQuantities({});
      console.log("Offline order response:", response.data);
    } catch (error) {
      console.error("Error submitting offline order:", error.response);
      Alert.alert("Error", "Failed to submit offline order. Please try again.");
    }
  };

  const filteredItems = allData.filter((item) => {
    const categoryMatch =
      selectedCategory === "All" || item.catName === selectedCategory;
    const weightMatch =
      selectedWeight === "All" ||
      (item.weight &&
        item.units &&
        `${item.weight}${item.units}` === selectedWeight);
    return categoryMatch && weightMatch;
  });

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <Animated.View
        style={[styles.loaderCircle, { transform: [{ rotate: spin }] }]}
      />
      <Text style={styles.loaderText}>Loading Items...</Text>
    </View>
  );

  const footer = () => (
    <View style={{ alignSelf: "center" }}>
      <Text>No Data Found</Text>
    </View>
  );

  const hasItemsInCart =
    userType === "ONLINE"
      ? Object.keys(cartQuantities).length > 0
      : Object.keys(quantities).some((key) => quantities[key] > 0);

  return (
    <View style={styles.container}>
      {loading ? (
        renderLoader()
      ) : (
        <View style={styles.contentContainer}>
          {hasItemsInCart && (
            <View>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={() => {
                  if (userType === "ONLINE") {
                    navigation.navigate("Proceed to Checkout", {
                      MarketDetails: route.params,
                    });
                  } else {
                    handleOfflineCheckout();
                    // Alert.alert("smdhcg")
                  }
                }}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {renderCategoryTabs()}
          {renderWeightTabs()}
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.itemId.toString()}
            numColumns={2}
            contentContainerStyle={[styles.flatListContent]} // Added padding to avoid overlap with footer
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No items found for selected filters.
                </Text>
              </View>
            }
            ListFooterComponent={footer}
            ListFooterComponentStyle={styles.footerStyle}
          />
        </View>
      )}
      {modalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Enter quantity for {currentItem?.itemName}
            </Text>
            <TextInput
              value={quantityInput}
              onChangeText={setQuantityInput}
              keyboardType="numeric"
              label="Enter quantity"
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              >
                <Text style={{ color: "#000" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddItemsQuantity}
                style={[styles.modalButton, { backgroundColor: "#4A90E2" }]}
              >
                <Text style={{ color: "#fff" }}>Add Items</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitQuantity}
                style={[styles.modalButton, { backgroundColor: "#4A90E2" }]}
              >
                <Text style={{ color: "#fff" }}>Submit Items</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AllCategories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    padding: 10,
  },
  categoryTabContent: {
    paddingHorizontal: 5,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    marginRight: 8,
    // minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  activeTab: {
    backgroundColor: "#4A90E2",
    // marginBottom:20
  },
  weightTabContent: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  weightTab: {
    paddingHorizontal: 16,
    // paddingVertical: 10,
    borderRadius: 16,
    marginHorizontal: 5,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  activeWeightTab: {
    backgroundColor: "#FF6347",
  },
  flatListContent: {
    paddingBottom: 200,
  },
  qtyControlBtn: {
    padding: 6,
    backgroundColor: "#eee",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF",
    margin: 10,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: CARD_WIDTH - 40,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "bold",
    marginTop: 4,
  },
  weight: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  qtyText: {
    fontSize: 14,
    color: "#333",
    marginTop: 6,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height / 1.5,
  },
  loaderCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: "#4A90E2",
    borderTopColor: "transparent",
    marginBottom: 10,
  },
  loaderText: {
    fontSize: 16,
    color: "#4A90E2",
    fontWeight: "bold",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: 50,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  contentContainer: {
    // flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 80, // Add padding equal to footer height + some extra space
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 70,
    // marginBottom:300
  },
  checkoutButton: {
    backgroundColor: "#6ea6e7",
    // paddingVertical: 12,
    // paddingHorizontal: 30,
    borderRadius: 5,
    width: width*0.5,
    alignSelf:"flex-end",
    alignItems: "center",
    margin:10,
    elevation:10
  },
  checkoutButtonText: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    // marginLeft: 250,
    marginBottom: 10,
  },
  footerStyle: {
    // marginBottom: 80, // Adjusted to ensure footer doesn't overlap with content
  },
});
