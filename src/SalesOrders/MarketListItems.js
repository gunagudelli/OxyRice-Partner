import { StyleSheet, Text, View, FlatList, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import BASE_URL from "../../config";

const MarketListItems = ({ route }) => {
  const [groupedItems, setGroupedItems] = useState({});
  const [marketInfo, setMarketInfo] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchMarketListItems();
    }, [])
  );

  function fetchMarketListItems() {
    axios
      .get(BASE_URL + `product-service/market/${route.params?.MarketDetails.marketId}`)
      .then((response) => {
        const data = response.data;
        setMarketInfo({ name: data.marketName, address: data.address });

        // Group items by date and calculate totals
        const grouped = {};
        let itemCount = 0;
        let qtySum = 0;
        let weightSum = 0;

        data.listItems?.forEach(item => {
          const date = formatDate(item.itemAddedDate);
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(item);
          itemCount += 1; // Count each item as 1
          qtySum += item.qty; // Sum all quantities
          weightSum += item.weight * item.qty;
        });

        setGroupedItems(grouped);
        setTotalItems(itemCount);
        setTotalQty(qtySum);
        setTotalWeight(weightSum);
      })
      .catch((error) => {
        console.log("error", error.response);
      });
  }

  const formatDate = (isoDate) => {
    return isoDate; // Return the date as received from the response
  };

  const getItemIcon = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('rice') || name.includes('wheat') || name.includes('grain')) {
      return 'grain';
    } else if (name.includes('vegetable') || name.includes('tomato') || name.includes('onion')) {
      return 'carrot';
    } else if (name.includes('fruit') || name.includes('apple') || name.includes('orange')) {
      return 'food-apple';
    } else if (name.includes('milk') || name.includes('dairy')) {
      return 'cup';
    } else {
      return 'food';
    }
  };

  const renderDateSection = (date, items) => {
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    const totalSectionWeight = items.reduce((sum, item) => sum + (item.weight * item.qty), 0);
    const itemCount = items.length;

    return (
      <View key={date} style={styles.section}>
        <View style={styles.dateHeaderContainer}>
          <Icon name="event" size={20} color="#2A6B57" />
          <Text style={styles.dateHeader}>{date}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="package-variant" size={16} color="#666" />
            <Text style={styles.statText}>{itemCount} items</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="counter" size={16} color="#666" />
            <Text style={styles.statText}>{totalQty} qty</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="weight" size={14} color="#666" />
            <Text style={styles.statText}>{totalSectionWeight.toFixed(1)}kg</Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.itemId} style={[styles.itemRow, index === items.length - 1 && styles.lastItem]}>
              <View style={styles.itemIconContainer}>
                <MaterialCommunityIcons 
                  name={getItemIcon(item.itemName)} 
                  size={24} 
                  color="#2A6B57" 
                />
              </View>
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <View style={styles.itemDetails}>
                  <View style={styles.itemDetailItem}>
                    <Icon name="scale" size={14} color="#888" />
                    <Text style={styles.itemDetailText}>{item.weight}kg each</Text>
                  </View>
                  <View style={styles.itemDetailItem}>
                    <MaterialCommunityIcons name="counter" size={14} color="#888" />
                    <Text style={styles.itemDetailText}>Qty: {item.qty}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.totalWeightContainer}>
                <Text style={styles.totalWeightText}>
                  {(item.weight * item.qty).toFixed(1)}kg
                </Text>
                <Text style={styles.totalWeightLabel}>Total</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2A6B57', '#3A8C73', '#4A9B83']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <MaterialCommunityIcons name="store" size={28} color="#fff" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{marketInfo.name}</Text>
              <View style={styles.headerAddressContainer}>
                <Icon name="location-on" size={16} color="#e0e0e0" />
                <Text style={styles.headerSubtitle}>{marketInfo.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <MaterialCommunityIcons name="package-variant-closed" size={20} color="#fff" />
              <Text style={styles.headerStatNumber}>{totalItems}</Text>
              <Text style={styles.headerStatLabel}>Items</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <MaterialCommunityIcons name="counter" size={20} color="#fff" />
              <Text style={styles.headerStatNumber}>{totalQty}</Text>
              <Text style={styles.headerStatLabel}>Quantity</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStatItem}>
              <FontAwesome5 name="weight-hanging" size={18} color="#fff" />
              <Text style={styles.headerStatNumber}>{totalWeight.toFixed(1)}kg</Text>
              <Text style={styles.headerStatLabel}>Total Weight</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedItems).length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No items found</Text>
          </View>
        ) : (
          Object.entries(groupedItems)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, items]) => renderDateSection(date, items))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MarketListItems;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    gap: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  headerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#e0e0e0',
    marginTop: 2,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A6B57',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  itemsList: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  itemDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemDetailText: {
    fontSize: 12,
    color: '#888',
  },
  totalWeightContainer: {
    alignItems: 'flex-end',
  },
  totalWeightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A6B57',
  },
  totalWeightLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});