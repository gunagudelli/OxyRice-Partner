import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import BASE_URL, { userStage } from "../../config";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#2A4BA0",
  secondary: "#153075",
  success: "#28C76F",
  danger: "#EA1601",
  background: "#F8F9FB",
  text: "#1E222B",
  border: "#EBEBFB",
  lightGray: "#F0F0F0",
  textSecondary: "#616161",
};

const Items = () => {
  // const { BASE_URL,userStage } = config();

  const userData = useSelector((state) => state.counter);
  console.log({ userData });
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toggleItemId, setToggleItemId] = useState(null);
  const accessToken = useSelector((state) => state.counter);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  useEffect(() => {
    if (items.length > 0) {
      filterItems();
    }
  }, [searchQuery, items]);

  const filterItems = () => {
    const filtered = items.filter((item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}product-service/ItemsGetTotal`,
        { headers: { Authorization: `Bearer ${accessToken.token}` } }
      );
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const openUpdatePriceModal = (item) => {
    setSelectedItem(item);
    setMrp(item.itemMrp.toString());
    setPrice(item.itemPrice.toString());
    setModalVisible(true);
  };

  const submitUpdatePrice = async () => {
    if (!validatePrices()) return;
    setUpdating(true);
    // console.log("sregfb")
    const data = {
      sellerId: accessToken.id,
      itemMrp: parseFloat(mrp),
      active: selectedItem.active,
      itemId: selectedItem.itemId,
      itemPrice: parseFloat(price),
    };

    console.log({ data });

    try {
      await axios.patch(`${BASE_URL}product-service/sellerItemPriceFix`, data, {
        headers: { Authorization: `Bearer ${accessToken.token}` },
      });
      Alert.alert("Success", "Price updated successfully!");
      setModalVisible(false);
      fetchItems();
    } catch (error) {
      Alert.alert("Error", "Failed to update price");
      console.error("Error updating price:", error);
    } finally {
      setUpdating(false);
    }
  };

  const toggleActiveStatus = async (item) => {
    setToggling(true);
    setToggleItemId(item.itemId);
    try {
      await axios.patch(`${BASE_URL}product-service/itemActiveAndInActive`, {
        itemId: item.itemId,
        status: !item.active,
      });
      fetchItems();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setToggling(false);
    }
  };

  const validatePrices = () => {
    const priceValue = parseFloat(price);
    const mrpValue = parseFloat(mrp);

    if (!price || !mrp || isNaN(priceValue) || isNaN(mrpValue)) {
      Alert.alert("Error", "Please enter valid prices");
      return false;
    }

    if (priceValue >= mrpValue) {
      Alert.alert("Error", "Price should be less than MRP");
      return false;
    }

    return true;
  };

  const formatPrice = (price) => parseFloat(price).toFixed(2);

  const calcDiscount = (mrp, price) => Math.round(((mrp - price) / mrp) * 100);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: item.itemImage || "https://via.placeholder.com/70" }}
          style={styles.itemImage}
        />

        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.itemName}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{formatPrice(item.itemPrice)}</Text>
            <Text style={styles.mrpText}>₹{formatPrice(item.itemMrp)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {calcDiscount(item.itemMrp, item.itemPrice)}% off
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="scale" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>
                {item.weight || 0} {item.units || "units"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="layers" size={14} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>Stock: {item.quantity || 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {userStage == "Live" ? (
            <TouchableOpacity
              onPress={() => toggleActiveStatus(item)}
              style={[
                styles.statusButton,
                {
                  backgroundColor: item.active ? COLORS.success : COLORS.danger,
                },
              ]}
              disabled={toggling && toggleItemId === item.itemId}
            >
              {toggling && toggleItemId === item.itemId ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.statusText}>
                  {item.active ? "Active" : "Inactive"}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View
              onPress={() => toggleActiveStatus(item)}
              style={[
                styles.statusButton,
                {
                  backgroundColor: item.active ? COLORS.success : COLORS.danger,
                },
              ]}
              disabled={toggling && toggleItemId === item.itemId}
            >
              {toggling && toggleItemId === item.itemId ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.statusText}>
                  {item.active ? "Active" : "Inactive"}
                </Text>
              )}
            </View>
          )}
          <TouchableOpacity
            onPress={() => openUpdatePriceModal(item)}
            style={styles.editButton}
          >
            <Icon name="edit" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textSecondary}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.itemId.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>No items found</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Prices</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MRP (₹)</Text>
              <View style={styles.inputWrapper}>
                <Icon name="currency-rupee" size={20} color={COLORS.text} />
                <TextInput
                  style={styles.input}
                  value={mrp}
                  onChangeText={setMrp}
                  keyboardType="numeric"
                  placeholder="Enter MRP"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Selling Price (₹)</Text>
              <View style={styles.inputWrapper}>
                <Icon name="currency-rupee" size={20} color={COLORS.text} />
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="Enter selling price"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false), setUpdating(false);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={submitUpdatePrice}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
    maxWidth: width * 0.45,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    flexShrink: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mrpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#E6F7EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.success,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    justifyContent: "space-between",
    minWidth: 100,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F0F4FF",
    alignSelf: "flex-end",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
    minHeight: height * 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 8,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default Items;
