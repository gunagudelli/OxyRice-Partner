import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import BASE_URL from "../../config";

const StoreDetailsScreen = ({ navigation }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Get access token from Redux store
  const accessToken = useSelector((state) => state.auth?.accessToken);

  // Debug logging function
  const debugLog = (message, data = null) => {
    // console.log(`🐛 [StoreDetails Debug] ${message}`);
    if (data) {
      // console.log('📊 Data:', JSON.stringify(data, null, 2));
    }
  };

  // Sort stores function - available stores first
  const sortStores = (storesArray) => {
    return [...storesArray].sort((a, b) => {
      // Convert to boolean to handle any truthy/falsy values
      const aAvailable = Boolean(a.isavailable);
      const bAvailable = Boolean(b.isavailable);
      
      // Available stores (true) should come first
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      
      // If both have same availability status, maintain original order
      return 0;
    });
  };

  // Fetch stores from API
  const fetchStores = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const apiUrl = `${BASE_URL}product-service/getStore`;
      debugLog("Fetching stores from API", {
        url: apiUrl,
        hasAccessToken: !!accessToken?.token,
        tokenPreview: accessToken?.token
          ? `${accessToken.token.substring(0, 20)}...`
          : "No token",
      });

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(accessToken?.token && {
            Authorization: `Bearer ${accessToken.token}`,
          }),
        },
        timeout: 30000,
      };

      const response = await axios.get(apiUrl, config);
      console.log("API Response:", response.data);
      
      debugLog("API Response Success", {
        status: response.status,
        dataLength: response.data?.length || 0,
        data: response.data,
      });

      if (response.status === 200) {
        const fetchedStores = response.data || [];
        const sortedStores = sortStores(fetchedStores);
        setStores(sortedStores);
      }
    } catch (error) {
      debugLog("API Request Failed", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // console.error('🚨 Fetch Stores Error:', error);

      let errorMessage = "Failed to load stores. Please try again.";

      if (error.response?.status === 404) {
        errorMessage =
          "Store service not found. Please check server configuration.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 403) {
        errorMessage =
          "Access denied. You don't have permission to view stores.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      }

      setError(errorMessage);
      if (!isRefresh) {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStores();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchStores();
    }, [])
  );

  // Handle refresh
  const handleRefresh = () => {
    fetchStores(true);
  };

  // Navigate to Add Store screen
  const handleAddStore = () => {
    navigation.navigate("Add Store");
  };

  // Handle navigation to All Categories with store details and customer ID
  const handleNavigateToCategories = (store) => {
    const customerId = store.userId;

    // Log for debugging
    console.log("Navigating to All Categories with:", {
      storeId: store.storeId,
      storeName: store.storeName,
      customerId: customerId,
      hasCustomerId: !!customerId,
      address: store.address,
    });

    // Check if customerId exists
    if (!customerId) {
      Alert.alert(
        "Customer ID Missing",
        "This store doesn't have a customer ID associated with it. Please contact support.",
        [{ text: "OK" }]
      );
      return;
    }

    // Navigate with both store details and customer ID
    navigation.navigate("All Categories", {
      storeDetails: store,
      // customerId: customerId,
      // storeId: store.storeId,
      // storeName: store.storeName,
    });
  };

  // Render individual store card
  const renderStoreCard = (store, index) => (
    <View key={store.storeId || index} style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <View style={styles.storeNameContainer}>
          <Icon name="store" size={24} color="#3B82F6" />
          <Text style={styles.storeName}>{store.storeName}</Text>
        </View>
        <View style={styles.storeHeaderRight}>
          <View
            style={[
              styles.availabilityBadge,
              store.isavailable
                ? styles.availableBadge
                : styles.unavailableBadge,
            ]}
          >
            <Icon
              name={store.isavailable ? "check-circle" : "cancel"}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.availabilityText}>
              {store.isavailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.storeInfo}>
        <View style={styles.infoRow}>
          <Icon name="person" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Owner:</Text>
          <Text style={styles.infoValue}>{store.ownerName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="phone" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>{store.mobileNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-on" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {store.address}
          </Text>
        </View>

        {store.referBy && (
          <View style={styles.infoRow}>
            <Icon name="how-to-reg" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Referred by:</Text>
            <Text style={styles.infoValue}>{store.referBy}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="description" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Description:</Text>
          <Text style={styles.infoValue} numberOfLines={3}>
            {store.description}
          </Text>
        </View>

        {/* Display Customer ID if available */}
        {store.userId && (
          <View style={styles.infoRow}>
            <Icon name="account-circle" size={18} color="#6B7280" />
            <Text style={styles.infoLabel}>Customer ID:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {store.userId}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="date-range" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>{store.createdAt}</Text>
        </View>
      </View>

      {/* Add Button for each store */}
      <View style={styles.storeActions}>
        <TouchableOpacity
          style={[styles.addButton, !store.userId && styles.disabledButton]}
          onPress={() => handleNavigateToCategories(store)}
          activeOpacity={0.7}
          disabled={!store.userId}
        >
          <Icon
            name="add"
            size={20}
            color={store.userId ? "#FFFFFF" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.addButtonText,
              !store.userId && styles.disabledButtonText,
            ]}
          >
            {store.userId ? "Add Products" : "No Customer ID"}
          </Text>
        </TouchableOpacity>

        {/* Show warning if no customer ID */}
        {!store.userId && (
          <Text style={styles.warningText}>
            Customer ID is required to add products
          </Text>
        )}
      </View>
    </View>
  );

  // Render card header component
  const renderCardHeader = () => (
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <Text style={styles.cardHeaderTitle}>Registered Stores</Text>
        <Text style={styles.cardHeaderCount}>
          {stores.length} store{stores.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cardHeaderButton}
        onPress={handleAddStore}
        activeOpacity={0.7}
      >
        <Icon name="add" size={20} color="#3B82F6" />
        <Text style={styles.cardHeaderButtonText}>Add Store</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="store" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Stores Found</Text>
      <Text style={styles.emptySubtitle}>
        There are no stores registered yet. Click the "Add Store" button to
        register your first store.
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Icon name="error-outline" size={64} color="#EF4444" />
      <Text style={styles.errorTitle}>Failed to Load Stores</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchStores()}
      >
        <Icon name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Loading stores...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <>
            {/* Card Header */}
            {renderCardHeader()}

            {stores.length === 0 ? (
              renderEmptyState()
            ) : (
              <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={["#3B82F6"]}
                    tintColor="#3B82F6"
                  />
                }
              >
                <View style={styles.storeList}>
                  {stores.map((store, index) => renderStoreCard(store, index))}
                </View>
              </ScrollView>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  // Card Header Styles
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginTop: -45,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  cardHeaderCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  cardHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  cardHeaderButtonText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  storeList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  storeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  storeHeaderRight: {
    alignItems: "flex-end",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableBadge: {
    backgroundColor: "#10B981",
  },
  unavailableBadge: {
    backgroundColor: "#EF4444",
  },
  availabilityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  storeInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
    marginLeft: 8,
  },
  // Store Actions Styles
  storeActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  warningText: {
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
});

export default StoreDetailsScreen;