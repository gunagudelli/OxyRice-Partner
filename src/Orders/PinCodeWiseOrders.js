import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import BASE_URL from "../../config";
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const PinCodeWiseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2025-06-24'));
  const [endDate, setEndDate] = useState(new Date('2025-06-27'));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [orderStatus, setOrderStatus] = useState('1');
  const [loading, setLoading] = useState(false);
  const spinValue = new Animated.Value(0);

  const getOrderStats = () => {
    const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
    const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
    setLoading(true);
    axios.get(BASE_URL + `order-service/notification_to_dev_team_weekly?endDate=${formattedEndDate}&startDate=${formattedStartDate}&status=${orderStatus}`)
      .then(function (response) {
        setOrders(response.data);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error.response);
        setLoading(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      getOrderStats();
      const spinAnim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnim.start();
      return () => spinAnim.stop();
    }, [startDate, endDate, orderStatus])
  );

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Format currency in INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Aggregate pincode-wise performance
  const aggregatePincodeData = () => {
    const pincodeMap = {};
    orders.forEach(order => {
      if (!pincodeMap[order.pincode]) {
        pincodeMap[order.pincode] = {
          orders: 0,
          items: 0,
          revenue: 0,
          itemsList: []
        };
      }
      pincodeMap[order.pincode].orders += 1;
      pincodeMap[order.pincode].items += order.orderItems.length;
      pincodeMap[order.pincode].revenue += order.grandTotal;

      order.orderItems.forEach(item => {
        const existingItemIndex = pincodeMap[order.pincode].itemsList.findIndex(i => i.itemName === item.itemName);
        if (existingItemIndex !== -1) {
          pincodeMap[order.pincode].itemsList[existingItemIndex].quantity += item.itemQty || 0;
        } else {
          pincodeMap[order.pincode].itemsList.push({ 
            itemName: item.itemName, 
            quantity: item.itemQty || 0 
          });
        }
      });
    });

    // Sort items by quantity and get top 3 and low 3
    Object.values(pincodeMap).forEach(data => {
      data.itemsList.sort((a, b) => b.quantity - a.quantity);
      data.topItems = data.itemsList.slice(0, 3);
      data.lowItems = data.itemsList.slice(-3).reverse(); // Get last 3 and reverse for ascending order
    });

    return pincodeMap;
  };

  const pincodeData = aggregatePincodeData();

  // Calculate totals
  const totalOrders = Object.values(pincodeData).reduce((sum, data) => sum + data.orders, 0);
  const totalItems = Object.values(pincodeData).reduce((sum, data) => sum + data.items, 0);
  const totalRevenue = Object.values(pincodeData).reduce((sum, data) => sum + data.revenue, 0);

  const ItemCard = ({ item, index, type }) => (
    <View style={[styles.itemCard, type === 'top' ? styles.topItemCard : styles.lowItemCard]}>
      <View style={styles.itemHeader}>
        <View style={[styles.itemRank, type === 'top' ? styles.topRank : styles.lowRank]}>
          <Text style={styles.rankText}>{type === 'top' ? `Top ${index + 1}` : `Low ${index + 1}`}</Text>
        </View>
      </View>
      <Text style={styles.itemName} numberOfLines={2}>{item.itemName}</Text>
      <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.loaderCircle, { transform: [{ rotate: spin }] }]} />
          <Text style={styles.loaderText}>Loading Items...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          {/* <View style={styles.header}>
            <Text style={styles.headerTitle}>Pincode Item Performance Analysis</Text>
          </View> */}

          {/* Total Summary Card */}
          <View style={styles.totalSummaryCard}>
            <Text style={styles.totalSummaryTitle}>Overall Summary</Text>
            <View style={styles.totalSummaryRow}>
              <View style={styles.totalSummaryItem}>
                <Text style={styles.totalSummaryNumber}>{totalOrders}</Text>
                <Text style={styles.totalSummaryLabel}>Total Orders</Text>
              </View>
              <View style={styles.totalSummaryDivider} />
              <View style={styles.totalSummaryItem}>
                <Text style={styles.totalSummaryNumber}>{totalItems}</Text>
                <Text style={styles.totalSummaryLabel}>Total Items</Text>
              </View>
              <View style={styles.totalSummaryDivider} />
              <View style={styles.totalSummaryItem}>
                <Text style={styles.totalSummaryNumber}>{formatCurrency(totalRevenue)}</Text>
                <Text style={styles.totalSummaryLabel}>Total Revenue</Text>
              </View>
            </View>
          </View>

          {/* Date Range & Status Selector */}
          <View style={styles.filtersCard}>
            <View style={styles.dateRangeContainer}>
              <View style={styles.datePickerContainer}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton} 
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Icon name="calendar-today" size={18} color="#6366f1" />
                  <Text style={styles.dateText}>{moment(startDate).format('DD MMM YYYY')}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeStartDate}
                    maximumDate={endDate}
                  />
                )}
              </View>
              <View style={styles.datePickerContainer}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton} 
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Icon name="calendar-today" size={18} color="#6366f1" />
                  <Text style={styles.dateText}>{moment(endDate).format('DD MMM YYYY')}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeEndDate}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Order Status</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { label: 'Placed', value: '1' },
                  { label: 'Assigned', value: '3' },
                  { label: 'Picked Up', value: 'PickedUp' },
                  { label: 'Delivered', value: '4' },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select status"
                value={orderStatus}
                onChange={item => setOrderStatus(item.value)}
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
                itemTextStyle={styles.dropdownItemText}
                containerStyle={styles.dropdownList}
                activeColor="#f0f0f0"
                renderLeftIcon={() => (
                  <Icon name="local-shipping" size={18} color="#6366f1" style={{marginRight: 8}} />
                )}
              />
            </View>
          </View>

          {/* Pincode Performance Cards */}
          {Object.entries(pincodeData).map(([pincode, data]) => (
            <View key={pincode} style={styles.pincodeCard}>
              {/* Pincode Header */}
              <View style={styles.pincodeHeader}>
                <View style={styles.pincodeIconContainer}>
                  <Icon name="location-on" size={24} color="#fff" />
                </View>
                <View style={styles.pincodeInfo}>
                  <Text style={styles.pincodeTitle}>Pincode {pincode}</Text>
                  <View style={styles.pincodeStats}>
                    <Text style={styles.pincodeStatText}>{data.orders} Orders</Text>
                    <Text style={styles.pincodeStatSeparator}>•</Text>
                    <Text style={styles.pincodeStatText}>{data.items} Items</Text>
                    <Text style={styles.pincodeStatSeparator}>•</Text>
                    <Text style={styles.pincodeStatText}>{formatCurrency(data.revenue)}</Text>
                  </View>
                </View>
              </View>

              {/* Top 3 Items */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Top 3 Items</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScrollView}>
                  {data.topItems.map((item, index) => (
                    <ItemCard key={index} item={item} index={index} type="top" />
                  ))}
                </ScrollView>
              </View>

              {/* Low 3 Items */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Low 3 Items</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScrollView}>
                  {data.lowItems.map((item, index) => (
                    <ItemCard key={index} item={item} index={index} type="low" />
                  ))}
                </ScrollView>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  totalSummaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  totalSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  totalSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalSummaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  totalSummaryLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  totalSummaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  filtersCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#374151',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownSelectedText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
    fontSize: 14,
  },
  dropdownItemText: {
    color: '#374151',
    fontSize: 14,
  },
  dropdownList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
  },
  pincodeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  pincodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    padding: 16,
  },
  pincodeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pincodeInfo: {
    flex: 1,
  },
  pincodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  pincodeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pincodeStatText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  pincodeStatSeparator: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 6,
  },
  itemsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  itemsScrollView: {
    marginBottom: 8,
  },
  itemCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
  },
  topItemCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  lowItemCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemRank: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topRank: {
    backgroundColor: '#22c55e',
  },
  lowRank: {
    backgroundColor: '#ef4444',
  },
  rankText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 18,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height / 2,
  },
  loaderCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: "#6366f1",
    borderTopColor: "transparent",
  },
  loaderText: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
    marginTop: 16,
  },
});

export default PinCodeWiseOrders;