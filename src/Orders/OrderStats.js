import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions,Animated } from 'react-native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import BASE_URL from "../../config";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';


const { width,height } = Dimensions.get('window');

const OrderStats = () => {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2025-06-24'));
  const [endDate, setEndDate] = useState(new Date('2025-06-27'));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [orderStatus, setOrderStatus] = useState('1');
  const[loading,setLoading]=useState(false)
  const[revenueOpen,setRevenueOpen]=useState(false)
  const[paymentOpen,setPaymentOpen]=useState(false)
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState([
    { label: 'Placed', value: '1' },
    { label: 'Shipped', value: '2' },
    { label: 'Delivered', value: '3' },
    { label: 'Cancelled', value: '4' },
  ]);
  const spinValue = new Animated.Value(0);

  const getOrderStats = () => {
    const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
    const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
    setLoading(true)
    axios.get(BASE_URL+`order-service/notification_to_dev_team_weekly?endDate=${formattedEndDate}&startDate=${formattedStartDate}&status=${orderStatus}`)
      .then(function(response) {
        setOrders(response.data);
        setLoading(false)
        setSelectedDateData(null); // Reset selected date when data changes
      })
      .catch(function(error) {
        console.log(error.response);
        setLoading(false)
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

  // Calculate revenue metrics
  const calculateRevenue = () => {
    let totalRevenue = 0;
    let codRevenue = 0;
    let onlineRevenue = 0;
    let codCount = 0;
    let onlineCount = 0;
    
    orders.forEach(order => {
      totalRevenue += order.grandTotal;
      if (order.paymentType === 1) {
        codRevenue += order.grandTotal;
        codCount++;
      } else if (order.paymentType === 2) {
        onlineRevenue += order.grandTotal;
        onlineCount++;
      }
    });
    
    return { 
      totalRevenue, 
      codRevenue, 
      onlineRevenue,
      codCount,
      onlineCount,
      totalCount: orders.length
    };
  };

  const { totalRevenue, codRevenue, onlineRevenue, codCount, onlineCount, totalCount } = calculateRevenue();

  // Prepare data for daily trends chart
  const prepareDailyTrendsData = () => {
    const dateMap = {};
    
    // Initialize dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = moment(currentDate).format('YYYY-MM-DD');
      dateMap[dateStr] = { 
        cod: 0, 
        online: 0, 
        codCount: 0,
        onlineCount: 0,
        date: dateStr 
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Populate with order data
    orders.forEach(order => {
      const orderDate = moment(order.orderPlacedDate).format('YYYY-MM-DD');
      if (dateMap[orderDate]) {
        if (order.paymentType === 1) {
          dateMap[orderDate].cod += order.grandTotal;
          dateMap[orderDate].codCount++;
        } else if (order.paymentType === 2) {
          dateMap[orderDate].online += order.grandTotal;
          dateMap[orderDate].onlineCount++;
        }
      }
    });
    
    // Convert to array and sort by date
    const result = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return result;
  };

  const dailyTrendsData = prepareDailyTrendsData();

  // Handle bar click
  const handleBarClick = (data, index) => {
    if (data.dataset && data.dataset.dataPoints) {
      const selectedData = dailyTrendsData[index];
      setSelectedDateData({
        date: selectedData.date,
        cod: selectedData.cod,
        online: selectedData.online,
        codCount: selectedData.codCount,
        onlineCount: selectedData.onlineCount
      });
    }
  };

  // Format for chart display
  const chartData = {
    labels: dailyTrendsData.map(item => moment(item.date).format('MMM DD')),
    datasets: [
      {
        data: dailyTrendsData.map(item => item.cod),
        color: (opacity = 1) => `rgba(234, 67, 53, ${opacity})`, // red for COD
        label: 'COD',
        dataPoints: dailyTrendsData
      },
      {
        data: dailyTrendsData.map(item => item.online),
        color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`, // blue for Online
        label: 'Online',
        dataPoints: dailyTrendsData
      }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Analytics</Text>
      </View> */}
      <>
      {loading==false?
      <> 
      {/* Date Range Selector */}
      <View style={styles.card}>
        {/* <Text style={styles.cardTitle}>Date Range</Text> */}
        <View style={styles.dateRangeContainer}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowStartDatePicker(true)}
            >
              <Icon name="calendar-today" size={18} color="#555" />
              <Text style={styles.dateText}>{moment(startDate).format('DD MMM YYYY')}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
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
              <Icon name="calendar-today" size={18} color="#555" />
              <Text style={styles.dateText}>{moment(endDate).format('DD MMM YYYY')}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onChangeEndDate}
                minimumDate={startDate}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>
        
        {/* Status Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Order Status</Text>
          <Dropdown
            style={styles.dropdown}
            data={statusDropdown}
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
          />
        </View>
      </View>
      
      {/* Revenue Summary */}
      <View style={styles.card}>
        <TouchableOpacity style={{flexDirection:"row",justifyContent:"space-between"}} onPress={()=>setRevenueOpen(!revenueOpen)}>
            <Text style={[styles.cardTitle,{color:"#0384d5"}]}>Revenue Summary</Text>
            <Ionicons name="chevron-down-sharp" size={25}/>        
        </TouchableOpacity>
        {revenueOpen &&
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.totalRevenueCard]}>
            <View style={styles.summaryIcon}>
              <Icon name="attach-money" size={24} color="#fff" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
              <Text style={styles.summaryCount}>{totalCount} orders</Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.halfWidth, styles.codCard]}>
              <View style={styles.summaryIcon}>
                <Icon name="money-off" size={20} color="#fff" />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryLabel}>COD Revenue</Text>
                <Text style={styles.summaryValue}>{formatCurrency(codRevenue)}</Text>
                <Text style={styles.summaryCount}>{codCount} orders</Text>
              </View>
            </View>
            
            <View style={[styles.summaryCard, styles.halfWidth, styles.onlineCard]}>
              <View style={styles.summaryIcon}>
                <Icon name="credit-card" size={20} color="#fff" />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryLabel}>Online Revenue</Text>
                <Text style={styles.summaryValue}>{formatCurrency(onlineRevenue)}</Text>
                <Text style={styles.summaryCount}>{onlineCount} orders</Text>
              </View>
            </View>
          </View>
        </View>
        }
      </View>
      
      {/* Daily Payment Trends Chart */}
      <View style={styles.card}>
        <TouchableOpacity style={{flexDirection:"row",justifyContent:"space-between"}} onPress={()=>setPaymentOpen(!paymentOpen)}>
        <Text  style={[styles.cardTitle,{color:"green"}]}>Daily Payment Trends</Text>
        <Ionicons name="chevron-down-sharp" size={25}/>
        </TouchableOpacity>

        {paymentOpen&&
        <BarChart
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets,
          }}
          width={width - 40}
          height={280}
          yAxisLabel="₹"
          fromZero
        chartConfig={{
//   backgroundColor: '#ffffff',
backgroundGradientFrom: '#e6f0ff',
backgroundGradientTo: '#ffffff',
// colors: [
//   (opacity = 1) => `rgba(30, 136, 229, ${opacity})`, 
//   (opacity = 1) => `rgba(0, 188, 212, ${opacity})`,
// ]
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  barPercentage: 0.6,
  propsForBackgroundLines: {
    strokeWidth: 0.5,
    strokeColor: 'rgba(0, 0, 0, 0.1)',
  },
  propsForLabels: {
    fontSize: 11,
    fontWeight: '500',
  },
  style: {
    borderRadius: 16,
  },
  fillShadowGradient: '#4285F4', // Base color for gradient
  fillShadowGradientOpacity: 0.8,
  // Custom colors for each dataset
  colors: [
    (opacity = 1) => `rgba(234, 67, 53, ${opacity})`, // Red for COD
    (opacity = 1) => `rgba(66, 133, 244, ${opacity})`, // Blue for Online
  ],
  // Gradient for each bar
  barGradient: {
    from: '#ffffff',
    to: (opacity = 1, index) => {
      return index === 0 
        ? `rgba(234, 67, 53, ${opacity})` // COD gradient
        : `rgba(66, 133, 244, ${opacity})`; // Online gradient
    },
    stops: [0, 1]
  },
  // Optional: Add this if you want rounded bars
  barRadius: 4,
  // Optional: Add this for better legend
  legend: {
    enabled: true,
    textSize: 12,
    form: 'CIRCLE',
    position: 'BELOW_CHART_RIGHT',
  },
}}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          onDataPointClick={(data) => handleBarClick(data, data.index)}
        />
}
        
        {/* Selected Date Details */}
        {selectedDateData && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateTitle}>
              {moment(selectedDateData.date).format('DD MMM YYYY')} Details
            </Text>
            <View style={styles.selectedDateRow}>
              <View style={styles.selectedDateItem}>
                <Text style={styles.selectedDateLabel}>COD Revenue</Text>
                <Text style={[styles.selectedDateValue, styles.codText]}>
                  {formatCurrency(selectedDateData.cod)}
                </Text>
                <Text style={styles.selectedDateCount}>{selectedDateData.codCount} orders</Text>
              </View>
              <View style={styles.selectedDateItem}>
                <Text style={styles.selectedDateLabel}>Online Revenue</Text>
                <Text style={[styles.selectedDateValue, styles.onlineText]}>
                  {formatCurrency(selectedDateData.online)}
                </Text>
                <Text style={styles.selectedDateCount}>{selectedDateData.onlineCount} orders</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      
      {/* Recent Orders */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text  style={[styles.cardTitle,{color:"#3d2a71"}]}>Recent Orders</Text>
          <Text style={styles.ordersCount}>{totalCount} total orders</Text>
        </View>
        {orders.map((order, index) => (
          <View key={index} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>{index+1} Order #{order.orderId.slice(-4)}</Text>
                <Text style={styles.orderDate}>
                  {moment(order.orderPlacedDate).format('DD MMM YYYY, hh:mm A')}
                </Text>
              </View>
              <View style={[
                styles.paymentBadge,
                order.paymentType === 1 ? styles.codBadge : styles.onlineBadge
              ]}>
                <Text style={styles.paymentText}>
                  {order.paymentType === 1 ? 'COD' : 'Online'}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderDetails}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.customerPhone}>{order.mobileNumber}</Text>
              </View>
              
              <Text style={styles.amount}>{formatCurrency(order.grandTotal)}</Text>
            </View>
            
            <View style={styles.addressInfo}>
              <Icon name="location-on" size={14} color="#666" />
              <Text style={styles.pincode}>Pincode: {order.pincode}</Text>
            </View>
          </View>
        ))}
        {/* {orders.length > 5 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Orders</Text>
            <Icon name="chevron-right" size={18} color="#4285F4" />
          </TouchableOpacity>
        )} */}
      </View>
       </> 
      :
       <View style={styles.loaderContainer}>
            <Animated.View style={[styles.loaderCircle, { transform: [{ rotate: spin }] }]} />
            <Text style={styles.loaderText}>Loading Items...</Text>
        </View>
      }
      </>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    // marginBottom: 16,
    color: '#333',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    marginLeft: 8,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  dropdownSelectedText: {
    color: '#333',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  dropdownItemText: {
    color: '#333',
    fontSize: 14,
  },
  dropdownList: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
  },
  summaryContainer: {
    margin: 8,
  },
  summaryCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalRevenueCard: {
    backgroundColor: '#4285F4',
  },
  codCard: {
    backgroundColor: 'orange',
  },
  onlineCard: {
    backgroundColor: '#34A853',
  },
   loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: height / 3,
  },
  loaderCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: "#4F46E5",
    borderTopColor: "transparent",
  },
  loaderText: {
    fontSize: 16,
    color: "#4F46E5",
    fontWeight: "bold",
    marginTop: 16,
  },
  halfWidth: {
    width: '48%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  summaryCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  selectedDateContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  selectedDateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  selectedDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedDateItem: {
    width: '48%',
  },
  selectedDateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedDateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  codText: {
    color: '#EA4335',
  },
  onlineText: {
    color: '#4285F4',
  },
  selectedDateCount: {
    fontSize: 12,
    color: '#888',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ordersCount: {
    fontSize: 12,
    color: '#666',
  },
  orderCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  orderDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  customerPhone: {
    color: '#666',
    fontSize: 12,
  },
  paymentBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  codBadge: {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
  },
  onlineBadge: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  pincode: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  viewAllText: {
    color: '#4285F4',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default OrderStats;