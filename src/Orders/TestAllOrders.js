 
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import BASE_URL from '../../config';
import { useSelector } from "react-redux";
import { Dropdown } from 'react-native-element-dropdown';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { userStage } from '../../config';

const { width } = Dimensions.get('window');

const TestAllOrders = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const accessToken = useSelector((state) => state.counter);
  //const { BASE_URL, userStage } = config(); // Get values

  const [selectedValue, setSelectedValue] = useState("1");
  const [dropLoading, setDropLoading] = useState(false);

  const orderStatusMap = {
    "0": "Incomplete",
    "1": "Placed",
    "2": "Accepted",
    "3": "Picked Up",
    "4": "Delivered",
    "5": "Rejected",
    "6": "Cancelled",
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          // userStage == "test" ? 
            BASE_URL + `order-service/getAllOrders` ,
            // : BASE_URL + 'erice-service/order/getAllOrders',
          {
            headers: {
              Authorization: `Bearer ${accessToken.token}`,
            },
          }
        );
        setOrders(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredOrders = orders
    .filter((item) => item.orderStatus === selectedValue &&  item.testUser===true)
    .filter((item) => {
      const searchLower = searchText.toLowerCase();
      return (
        item.uniqueId?.toLowerCase().includes(searchLower) ||
        orderStatusMap[item.orderStatus]?.toLowerCase().includes(searchLower) ||
        formatDate(item.orderDate).toLowerCase().includes(searchLower)
      );
    });

  const statusData = Object.keys(orderStatusMap).map((key) => ({
    label: orderStatusMap[key],
    value: key,
  }));

  const handleChange = (item) => {
    setDropLoading(true);
    setSelectedValue(item.value);
    setTimeout(() => setDropLoading(false), 500);
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('Order Details', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>ORDER ID</Text>
          <Text style={styles.orderId}>#{item.uniqueId || 'N/A'}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: getStatusBackgroundColor(item.orderStatus) }]}>
          <Text style={[styles.statusValue, { color: getStatusColor(item.orderStatus) }]}>
            {orderStatusMap[item.orderStatus]}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Date</Text>
          <Text style={styles.detailValue}>{formatDate(item.orderDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Amount</Text>
          <Text style={styles.detailValue}>₹{item.grandTotal || '0'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Delivery Fee</Text>
          <Text style={styles.detailValue}>₹{item.deliveryFee || '0'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Grand Total</Text>
          <Text style={styles.detailValue}>₹{item.grandTotal || '0'}</Text>
        </View>
     
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    const colors = {
      "1": "#FF6B00", // Placed - Orange
      "2": "#00875A", // Accepted - Green
      "3": "#0052CC", // Picked Up - Blue
      "4": "#403294", // Delivered - Purple
      "5": "#DE350B", // Rejected - Red
      "6": "#DE350B", // Cancelled - Red
    };
    return colors[status] || "#666666";
  };

  const getStatusBackgroundColor = (status) => {
    const colors = {
      "1": "#FFF0E6", // Light Orange
      "2": "#E3FCEF", // Light Green
      "3": "#DEEBFF", // Light Blue
      "4": "#EAE6FF", // Light Purple
      "5": "#FFEBE6", // Light Red
      "6": "#FFEBE6", // Light Red
    };
    return colors[status] || "#F4F5F7";
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.replace('AllOrders')}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search orders..."
          placeholderTextColor="#666666"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Dropdown
          style={styles.dropdown}
          selectedTextStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownText}
          containerStyle={styles.dropdownContainer}
          data={statusData}
          labelField="label"
          valueField="value"
          value={selectedValue}
          onChange={handleChange}
          placeholder="Select Status"
        />
      </View>

      {dropLoading ? (
        <ActivityIndicator size="small" color="#0052CC" style={styles.loader} />
      ) : null}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.uniqueId?.toString() || Math.random().toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdown: {
    width: width * 0.35,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: '#172B4D',
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: '#DFE1E6',
    marginTop: 4,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderIdContainer: {
    gap: 4,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#6B778C',
    letterSpacing: 0.5,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#172B4D',
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#DFE1E6',
    marginHorizontal: 16,
  },
  detailsContainer: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B778C',
  },
  detailValue: {
    fontSize: 14,
    color: '#172B4D',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#172B4D',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B778C',
    marginTop: 4,
  },
  loader: {
    marginVertical: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#DE350B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default TestAllOrders;