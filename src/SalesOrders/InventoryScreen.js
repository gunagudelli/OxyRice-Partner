import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useState } from 'react';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function InventoryScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  
  const stores = [
    'All Stores',
    'Main Warehouse',
    'Eastern Depot',
    'Western Depot',
    'Northern Depot'
  ];
  
  // Sample inventory data
  const inventoryData = [
    { id: '1', name: 'Premium Basmati', quantity: 85, store: 'Main Warehouse', type: 'Basmati' },
    { id: '2', name: 'Special Jasmine', quantity: 62, store: 'Eastern Depot', type: 'Jasmine' },
    { id: '3', name: 'Brown Rice', quantity: 41, store: 'Main Warehouse', type: 'Brown' },
    { id: '4', name: 'Wild Rice', quantity: 28, store: 'Western Depot', type: 'Wild' },
    { id: '5', name: 'White Rice', quantity: 95, store: 'Northern Depot', type: 'White' },
    { id: '6', name: 'Arborio Rice', quantity: 34, store: 'Main Warehouse', type: 'Arborio' },
    { id: '7', name: 'Sushi Rice', quantity: 48, store: 'Eastern Depot', type: 'Short-grain' },
    { id: '8', name: 'Black Rice', quantity: 18, store: 'Western Depot', type: 'Black' },
  ];
  
  // Filter inventory based on search and selected store
  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStore = selectedStore === 'All Stores' || item.store === selectedStore;
    return matchesSearch && matchesStore;
  });
  
  // Recent actions data
  const recentActions = [
    { id: '1', action: 'OUT', quantity: 20, product: 'Premium Basmati', store: 'Main Warehouse', time: '2h ago' },
    { id: '2', action: 'IN', quantity: 50, product: 'Special Jasmine', store: 'Eastern Depot', time: '4h ago' },
    { id: '3', action: 'OUT', quantity: 15, product: 'Brown Rice', store: 'Main Warehouse', time: '1d ago' },
  ];

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity style={styles.inventoryItem}>
      <View style={styles.itemRow}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemType}>{item.type} • {item.store}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Text style={styles.quantityLabel}>Bags</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActionItem = ({ item }) => (
    <View style={styles.actionItem}>
      <View style={[
        styles.actionBadge,
        item.action === 'OUT' ? styles.outAction : styles.inAction
      ]}>
        <Text style={styles.actionBadgeText}>{item.action}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>
          {item.action === 'OUT' ? 'Released' : 'Received'} {item.quantity} bags of {item.product}
        </Text>
        <Text style={styles.actionSubtitle}>{item.store} • {item.time}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Inventory Tracking</Text>
          <Text style={styles.headerSubtitle}>Monitor rice bag distribution</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('Record Inventory')}
        >
          <FontAwesome5 name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or type..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Store filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {stores.map((store, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedStore === store && styles.activeFilter
            ]}
            onPress={() => setSelectedStore(store)}
          >
            <Text style={[
              styles.filterText,
              selectedStore === store && styles.activeFilterText
            ]}>{store}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#3498db' }]}>
            <MaterialCommunityIcons name="rice" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.summaryValue}>248</Text>
            <Text style={styles.summaryLabel}>Total Bags</Text>
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#e74c3c' }]}>
            <FontAwesome5 name="truck-loading" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.summaryValue}>45</Text>
            <Text style={styles.summaryLabel}>Out Today</Text>
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#2ecc71' }]}>
            <FontAwesome5 name="warehouse" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.summaryValue}>4</Text>
            <Text style={styles.summaryLabel}>Stores</Text>
          </View>
        </View>
      </View>

      {/* Inventory list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Inventory</Text>
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.inventoryList}
        />
      </View>

      {/* Recent actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Actions</Text>
        <FlatList
          data={recentActions}
          renderItem={renderActionItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.actionsList}
        />
      </View>

      {/* Record movement button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('RecordInventory')}
      >
        <Text style={styles.floatingButtonText}>Record Movement</Text>
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
  searchContainer: {
    padding: 15,
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
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '31%',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#777',
  },
  section: {
    padding: 15,
    paddingTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inventoryList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inventoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemType: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },
  quantityContainer: {
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A6B57',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#777',
  },
  actionsList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  inAction: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  outAction: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  floatingButton: {
    backgroundColor: '#2A6B57',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});