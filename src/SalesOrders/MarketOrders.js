import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Image,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import BASE_URL from '../../config';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MarketOrders = ({ route }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
    marketOrdersfunction();
  }, [])
)

  const marketOrdersfunction = () => {
    setLoading(true);
    setError(null); 
    axios({
      method: 'get',
      url: `${BASE_URL}user-service/getMarketUsers?marketId=${route.params.MarketDetails.marketId}`,
    })
      .then((response) => {
        console.log("Response",response.data)
        if (!response.data || !response.data.listMarketUserInfo) {
          setError('No data available');
        } else {
          setData(response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching market orders:", error);
        setError('Failed to fetch orders');
        setLoading(false);
      });
  };

  const getPaymentStatusColor = (status) => {
    return status === 'SUCCESS' ? '#10B981' : 
           status === 'FAILED' ? '#EF4444' : '#F59E0B';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split("-");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const renderItem = ({ item, paymentType, paymentStatus }) => {
    const formattedDate = formatDate(item.itemAddAt);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.itemName}</Text>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="scale-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Weight: {item.weight} kg</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="layers-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Quantity: {item.qty}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Price: ₹{item.price.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Order Date: {formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="card-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>Payment: {paymentType}</Text>
          </View>
          {/* <View style={styles.detailRow}>
            <View
              style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(paymentStatus) }]}
            >
              <Text style={styles.paymentText}>{paymentStatus}</Text>
            </View>
          </View> */}
        </View>
      </View>
    );
  };

  const renderPayment = (payment) => {
    return (
      <View key={payment.orderPaymentId} style={styles.paymentContainer}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentTitle}>
            Payment ID: {payment.paymentId}
          </Text>
          <View style={[styles.paymentStatus, { backgroundColor: getPaymentStatusColor(payment.paymentStatus) }]}>
            <Text style={styles.paymentStatusText}>{payment.paymentStatus}</Text>
          </View>
        </View>
        <Text style={styles.paymentDate}>Paid on: {formatDate(payment.paidDate)}</Text>
        <Text style={styles.paymentAmount}>Amount: ₹{payment.paidAmount ? payment.paidAmount.toLocaleString() : '0'}</Text>
        
        {payment.offlineItems && payment.offlineItems.length > 0 ? (
          payment.offlineItems.map((item) => 
            renderItem({
              item,
              paymentType: payment.paymentType,
              paymentStatus: payment.paymentStatus,
            })
          )
        ) : (
          <Text style={styles.noItemsText}>No items in this payment</Text>
        )}
      </View>
    );
  };

  const renderUser = ({ item: user }) => {
    return (
      <View style={styles.userSection}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userTitleRow}>
              <Ionicons name="person-circle" size={24} color="#4F46E5" />
              <Text style={styles.userName}>{user.userName}</Text>
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{user.mobileNumber}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.contactText}>{user.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {user.offlinePayments && user.offlinePayments.length > 0 ? (
          <View style={styles.paymentsContainer}>
            {user.offlinePayments.map(renderPayment)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No payments available</Text>
          </View>
        )}
      </View>
    );
  };

  // Calculate totals
  const calculateTotals = () => {
  if (!data || !data.listMarketUserInfo) return { 
    users: 0, 
    items: 0, 
    quantity: 0, 
    onlineValue: 0,
    offlineValue: 0,
    totalValue: 0
  };

  let users = 0;
  let items = 0;
  let quantity = 0;
  let onlineValue = 0;
  let offlineValue = 0;

  data.listMarketUserInfo.forEach(user => {
    if (user.offlinePayments && user.offlinePayments.length > 0) {
      users++;
      user.offlinePayments.forEach(payment => {
        if (payment.paymentType === 'ONLINE') {
          onlineValue += payment.paidAmount || 0;
        } else {
          offlineValue += payment.paidAmount || 0;
        }
        
        if (payment.offlineItems) {
          items += payment.offlineItems.length;
          payment.offlineItems.forEach(item => {
            quantity += item.qty || 0;
          });
        }
      });
    }
  });

  return { 
    users, 
    items, 
    quantity, 
    onlineValue, 
    offlineValue,
    totalValue: onlineValue + offlineValue 
  };
};

const { users, items, quantity, onlineValue, offlineValue, totalValue } = calculateTotals();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={marketOrdersfunction}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!data || !data.listMarketUserInfo || data.listMarketUserInfo.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>No user orders found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={marketOrdersfunction}
        >
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.header}>
  <Text style={styles.title}>{data.marketName || 'Market'} Orders</Text>
  
  {/* Overall Stats */}
  <View style={styles.overallStats}>
    <View style={styles.overallStatBox}>
      <Text style={styles.overallStatNumber}>{users}</Text>
      <Text style={styles.overallStatLabel}>Users</Text>
    </View>
    <View style={styles.overallStatBox}>
      <Text style={styles.overallStatNumber}>{items}</Text>
      <Text style={styles.overallStatLabel}>Items</Text>
    </View>
    <View style={styles.overallStatBox}>
      <Text style={styles.overallStatNumber}>{quantity}</Text>
      <Text style={styles.overallStatLabel}>Quantity</Text>
    </View>
  </View>

  {/* Payment Type Breakdown */}
  <View style={styles.paymentTypeContainer}>
    <View style={[styles.paymentTypeBox, styles.onlineBox]}>
      <Ionicons name="wifi-outline" size={20} color="#3B82F6" />
      <Text style={styles.paymentTypeAmount}>₹{onlineValue.toLocaleString()}</Text>
      <Text style={styles.paymentTypeLabel}>Online</Text>
    </View>
    
    <View style={[styles.paymentTypeBox, styles.offlineBox]}>
      <Ionicons name="cash-outline" size={20} color="#10B981" />
      <Text style={styles.paymentTypeAmount}>₹{offlineValue.toLocaleString()}</Text>
      <Text style={styles.paymentTypeLabel}>Cash</Text>
    </View>
    
    <View style={[styles.paymentTypeBox, styles.totalBox]}>
      <Ionicons name="wallet-outline" size={20} color="#8B5CF6" />
      <Text style={styles.paymentTypeAmount}>₹{totalValue.toLocaleString()}</Text>
      <Text style={styles.paymentTypeLabel}>Total</Text>
    </View>
  </View>
</View>

      <FlatList
        data={data.listMarketUserInfo}
        keyExtractor={(item) => item.userOfflineOrdersId}
        renderItem={renderUser}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No orders found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#EF4444',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 18,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  overallStatBox: { alignItems: 'center', flex: 1 },
  overallStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  overallStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: { padding: 16 },
  userSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    overflow: 'hidden',
  },
  userHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: { flex: 1 },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  contactInfo: { gap: 8 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  paymentsContainer: {
    padding: 16,
  },
  paymentTypeContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 16,
  gap: 8,
},
paymentTypeBox: {
  flex: 1,
  alignItems: 'center',
  padding: 12,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
},
onlineBox: {
  borderColor: '#BFDBFE',
  backgroundColor: '#EFF6FF',
},
offlineBox: {
  borderColor: '#A7F3D0',
  backgroundColor: '#ECFDF5',
},
totalBox: {
  borderColor: '#DDD6FE',
  backgroundColor: '#F5F3FF',
},
paymentTypeAmount: {
  fontSize: 16,
  fontWeight: 'bold',
  marginTop: 4,
},
paymentTypeLabel: {
  fontSize: 12,
  color: '#6B7280',
  marginTop: 4,
},
  paymentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  itemDetails: { gap: 8 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  noItemsText: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MarketOrders;