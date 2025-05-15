import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const Recompleted = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://182.18.139.138:9029/api/order-service/getAllExchangeOrder');
      
      // Filter only ASSIGNTOCOLLECT orders
      const assignedOrders = response.data.filter(order => 
        order.status === 'RECOMPLETED'
      );
      
      setOrders(assignedOrders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      Alert.alert('Error', 'Failed to load order data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.orderIdText}>Order #{item.orderId}</Text>
          <View style={[styles.statusContainer, { backgroundColor: '#E1F5FE' }]}>
            <Text style={[styles.statusText, { color: '#0277BD' }]}>ASSIGNED</Text>
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

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FFF8E1' }]}
            onPress={() => Alert.alert('Track', `Track collection status for order #${item.orderId}`)}
          >
            <MaterialIcons name="local-shipping" size={20} color="#FF8F00" />
            <Text style={[styles.actionButtonText, { color: '#FF8F00' }]}>Track</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]}
            onPress={() => Alert.alert('Complete', `Mark order #${item.orderId} as completed?`)}
          >
            <MaterialIcons name="check-circle-outline" size={20} color="#2E7D32" />
            <Text style={[styles.actionButtonText, { color: '#2E7D32' }]}>Complete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Details', `View complete details for order #${item.orderId}`)}
          >
            <MaterialIcons name="info-outline" size={20} color="#006700" />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#006700" />
        <Text style={styles.loaderText}>Loading assigned orders...</Text>
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
          <Text style={styles.emptyText}>No assigned orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={item => item.exchangeId}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#FFF',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#006700',
    fontWeight: '500',
  },
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
});

export default Recompleted;