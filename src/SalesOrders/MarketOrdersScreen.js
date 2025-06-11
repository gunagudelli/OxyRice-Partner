import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useState } from 'react';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function MarketOrdersScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  
  // Tabs data
  const tabs = ['All', 'Pending', 'Completed'];
  
  // Filters data
  const timeFilters = ['This Week', 'Last Week', 'This Month', 'Last Month'];
  
  // Sample market orders data
  const ordersData = [
    { 
      id: '1', 
      market: 'Central Market', 
      date: '08 Jun 2025', 
      quantity: 45, 
      status: 'Pending',
      types: ['Premium Basmati', 'White Rice'],
      value: '$1,350'
    },
    { 
      id: '2', 
      market: 'Eastern Market', 
      date: '07 Jun 2025', 
      quantity: 30, 
      status: 'Completed',
      types: ['Special Jasmine'],
      value: '$950'
    },
    { 
      id: '3', 
      market: 'Northern Market', 
      date: '06 Jun 2025', 
      quantity: 60, 
      status: 'Completed',
      types: ['Brown Rice', 'Wild Rice', 'White Rice'],
      value: '$1,800'
    },
    { 
      id: '4', 
      market: 'Western Market', 
      date: '05 Jun 2025', 
      quantity: 35, 
      status: 'Pending',
      types: ['Premium Basmati', 'Black Rice'],
      value: '$1,250'
    },
    { 
      id: '5', 
      market: 'Southern Market', 
      date: '04 Jun 2025', 
      quantity: 25, 
      status: 'Completed',
      types: ['Sushi Rice', 'Arborio Rice'],
      value: '$880'
    },
    { 
      id: '6', 
      market: 'Central Market', 
      date: '03 Jun 2025', 
      quantity: 40, 
      status: 'Completed',
      types: ['Special Jasmine', 'White Rice'],
      value: '$1,150'
    },
  ];
  
  // Filter orders based on search, tab, and time filter
  const filteredOrders = ordersData.filter(item => {
    const matchesSearch = item.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.types.some(type => type.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedTab === 'All' || item.status === selectedTab;
    // For time filter we would add more logic based on real dates
    return matchesSearch && matchesStatus;
  });
  
  // Stats data
  const statsData = [
    { id: '1', label: 'Orders', value: '35', icon: 'clipboard-list', color: '#3498db' },
    { id: '2', label: 'Pending', value: '12', icon: 'hourglass-half', color: '#f39c12' },
    { id: '3', label: 'Completed', value: '23', icon: 'check-circle', color: '#2ecc71' },
    { id: '4', label: 'Revenue', value: '$9,450', icon: 'money-bill-wave', color: '#9b59b6' },
  ];

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.marketContainer}>
          <Text style={styles.marketName}>{item.market}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Pending' ? styles.pendingBadge : styles.completedBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Pending' ? styles.pendingText : styles.completedText
          ]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rice Types:</Text>
          <Text style={styles.detailValue}>{item.types.join(', ')}</Text>
        </View>
        
        <View style={styles.orderFooter}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{item.quantity} Bags</Text>
          </View>
          <Text style={styles.orderValue}>{item.value}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Market Orders</Text>
          <Text style={styles.headerSubtitle}>Weekly order management</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateOrder')}
        >
          <FontAwesome5 name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        {statsData.map(stat => (
          <View key={stat.id} style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
              <FontAwesome5 name={stat.icon} size={16} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search markets or rice types..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {timeFilters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilter
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.activeFilterText
            ]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>Sort by</Text>
            <AntDesign name="caretdown" size={12} color="#2A6B57" style={styles.sortIcon} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.ordersList}
        />
      </View>

      {/* Create Order Button */}
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateOrder')}
      >
        <FontAwesome5 name="plus" size={16} color="#fff" style={styles.createIcon} />
        <Text style={styles.createButtonText}>Create New Order</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#2A6B57',
    padding: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -15,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    fontWeight: '500',
    color: '#2A6B57',
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilter: {
    backgroundColor: '#2A6B57',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    padding: 15,
    paddingTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    color: '#2A6B57',
    marginRight: 5,
  },
  sortIcon: {
    marginTop: 2,
  },
  ordersList: {
    backgroundColor: 'transparent',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketContainer: {
    flex: 1,
  },
  marketName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  pendingBadge: {
    backgroundColor: 'rgba(243, 156, 18, 0.15)',
  },
  completedBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pendingText: {
    color: '#f39c12',
  },
  completedText: {
    color: '#2ecc71',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    width: '30%',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3498db',
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A6B57',
  },
  createButton: {
    backgroundColor: '#2A6B57',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});