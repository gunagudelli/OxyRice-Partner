import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import BASE_URL from "../../config";

const PlacedOrdersScreen = ({ route }) => {
  const { customerId } = route.params;

  const [placedOrders, setPlacedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPlacedOrders();
  }, []);

  const fetchPlacedOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}product-service/getStore`);
      const allStores = response.data;

      const filtered = allStores.filter((store) => {
        if (store.userId === customerId) {
          const list = store.listItems || [];
          return list.some((item) => item.status === "CLOSE");
        }
        return false;
      });

      setPlacedOrders(filtered);
    } catch (error) {
      console.error("Error fetching placed orders:", error);
      setPlacedOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlacedOrders();
  };

  const renderStoreItem = ({ item }) => {
    const placedItems = item.listItems.filter((li) => li.status === "CLOSE");
    
    return (
      <View style={styles.storeCard}>
        {/* Store Header */}
        <View style={styles.storeHeader}>
          <View style={styles.storeHeaderTop}>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Placed</Text>
            </View>
          </View>
          
          {/* Store Details */}
          <View style={styles.storeDetails}>
            <View style={styles.detailRow}>
  <Text style={styles.detailLabel}>Store ID:</Text>
  <Text style={styles.detailValue}>
    {item.storeId?.toString().slice(-4)}
  </Text>
</View>
           <View style={styles.detailRow}>
  <Text style={styles.detailLabel}>Customer ID:</Text>
  <Text style={styles.detailValue}>
    {customerId?.toString().slice(-4)}
  </Text>
</View>

            {item.ownerName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Owner:</Text>
                <Text style={styles.detailValue}>{item.ownerName}</Text>
              </View>
            )}
            {item.mobileNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile:</Text>
                <Text style={styles.detailValue}>{item.mobileNumber}</Text>
              </View>
            )}
          </View>
        </View>

         {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{placedItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>
              ₹{placedItems.reduce((sum, item) => sum + parseFloat(item.offerPrice || 0), 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsHeader}>Ordered Items ({placedItems.length})</Text>
          
          {placedItems.map((li, idx) => {
            const itemIdLastFour = li.itemId.slice(-4);
            
            return (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemIdContainer}>
                    <Text style={styles.itemId}>#{itemIdLastFour}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{li.itemName}</Text>
                    <View style={styles.itemSpecs}>
                      <Text style={styles.specText}>Qty: {li.qty}</Text>
                      <Text style={styles.specDivider}>•</Text>
                      <Text style={styles.specText}>Weight: {li.weight}kg</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Offer Price</Text>
                  <Text style={styles.price}>₹{li.offerPrice}</Text>
                </View>
              </View>
            );
          })}
        </View>

       
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>Placed Orders</Text>
        <Text style={styles.subtitle}>Your completed orders</Text>
      </View> */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : placedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={placedOrders}
          keyExtractor={(item) => item.storeId}
          renderItem={renderStoreItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
            />
          }
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

export default PlacedOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
  },
  flatListContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  storeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  storeHeader: {
    backgroundColor: "#4A90E2",
    padding: 20,
  },
  storeHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  storeDetails: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  itemsContainer: {
    padding: 20,
  },
  itemsHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemIdContainer: {
    marginRight: 12,
  },
  itemId: {
    backgroundColor: "#10B981",
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A202C",
    marginBottom: 6,
    lineHeight: 22,
  },
  itemSpecs: {
    flexDirection: "row",
    alignItems: "center",
  },
  specText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  specDivider: {
    marginHorizontal: 8,
    color: "#CBD5E0",
    fontSize: 12,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#059669",
  },
  orderSummary: {
    backgroundColor: "#F1F5F9",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1A202C",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    color: "#059669",
    fontWeight: "700",
  },
});