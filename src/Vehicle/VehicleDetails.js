import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import BASE_URL from '../../config';

const VehicleDetails = () => {
  const [vehicles, setVehicles] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarketVehicles = async (pageNum, isRefreshing = false) => {
    if (loading && !isRefreshing) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}user-service/getAllMarketsVahicles?page=${pageNum}&size=10`
      );
      setVehicles(response.data.content);
      setHasMore(!response.data.last);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.log('Error:', error.response);
      setError('Failed to load vehicles. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketVehicles(page);
  }, [page]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMarketVehicles(0, true);
    setPage(0);
  };

  const handlePrevious = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderVehicleItem = ({ item }) => (
    <View style={styles.vehicleCard}>
      <View style={styles.cardHeader}>
        <FontAwesome name="truck" size={24} color="#4a6fa5" />
        <Text style={styles.vehicleTitle}>{item.vehicleName} ({item.vehicleNumber})</Text>
      </View>
      
      <View style={styles.driverInfo}>
        <MaterialIcons name="person" size={18} color="#666" />
        <Text style={styles.driverText}>{item.firstName} {item.lastName}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.infoText}>{item.marketAddress}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Fuel Cost</Text>
          <Text style={styles.statValue}>${item.fuelCost.toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Fuel Liters</Text>
          <Text style={styles.statValue}>{item.fuelLiters} L</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Odometer</Text>
          <Text style={styles.statValue}>{item.vehicleStartingReading}-{item.vehicleEndingReading} km</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <MaterialIcons name="access-time" size={14} color="#888" />
        <Text style={styles.dateText}>{new Date(item.cratedAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={50} color="#d32f2f" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchMarketVehicles(page)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Market Vehicles</Text>
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>Page {page + 1}</Text>
        </View>
      </View>
      
      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6fa5" />
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => `${item.deliveryBoyId}-${item.vehicleNumber}`}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="directions-car" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No vehicles found</Text>
            </View>
          }
          ListFooterComponent={
            loading && (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#4a6fa5" />
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
          />
      )}
      
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, page === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={page === 0}
        >
          <MaterialIcons name="chevron-left" size={24} color={page === 0 ? '#ccc' : '#fff'} />
          <Text style={[styles.buttonText, page === 0 && styles.disabledButtonText]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.paginationButton, !hasMore && styles.disabledButton]}
          onPress={handleNext}
          disabled={!hasMore}
        >
          <Text style={[styles.buttonText, !hasMore && styles.disabledButtonText]}>Next</Text>
          <MaterialIcons name="chevron-right" size={24} color={!hasMore ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  pageIndicator: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pageIndicatorText: {
    color: '#4a6fa5',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 80,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4a6fa5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverText: {
    fontSize: 15,
    color: '#4b5563',
    marginLeft: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  statItem: {
    backgroundColor: '#f0f4ff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e3a8a',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoading: {
    paddingVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: '#f8fafc',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a6fa5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#e2e8f0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  disabledButtonText: {
    color: '#94a3b8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#4a6fa5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleDetails;