import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import BASE_URL from '../../config'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Dropdown } from 'react-native-element-dropdown'

const { width } = Dimensions.get('window')

const MyFuelReport = () => {
  const [fuelReports, setFuelReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [isFocus, setIsFocus] = useState(false);
  
  const currentUserId = useSelector((state) => state.counter.userId);

  const filterOptions = [
    { label: 'All Reports', value: 'ALL' },
    { label: 'Market', value: 'MARKET' },
    { label: 'Delivery', value: 'DELIVERY' },
  ];
  
  const fetchFuelReports = async () => {
    setLoading(true)
    axios({
      method:"get",
      url:`${BASE_URL}user-service/getAllMarketsVahicles?page=0&size=10`
    })
    .then((response) => {
      console.log("Fuel reports fetched successfully:", response.data);
      const data = response.data?.content || [];
      setFuelReports(data);
      applyFilter(filterType, data); // Apply filter immediately after fetch
      setRefreshing(false)
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching fuel reports:", error.response);
      setRefreshing(false)
      setLoading(false);
    })
  };

  const applyFilter = (type, reports) => {
    if (!reports) return;
    let filtered;
    switch (type) {
      case 'MARKET':
        filtered = reports.filter(report => report.marketAddress && report.marketAddress.toLowerCase().includes('market'));
        break;
      case 'DELIVERY':
        filtered = reports.filter(report => !report.marketAddress || !report.marketAddress.toLowerCase().includes('market'));
        break;
      default:
        filtered = reports;
    }
    setFilteredReports(filtered);
  };
  
  useEffect(() => {
    fetchFuelReports();
  }, [currentUserId]);

  // Reapply filter when filter type changes or data changes
  useEffect(() => {
    if (fuelReports?.length > 0) {
      applyFilter(filterType, fuelReports);
    }
  }, [filterType, fuelReports]);

  const calculateTotals = () => {
    return filteredReports.reduce((acc, report) => {
      acc.totalFuel += parseFloat(report.fuelLiters) || 0
      acc.totalCost += parseFloat(report.fuelCost) || 0
      return acc
    }, { totalFuel: 0, totalCost: 0 })
  }

  const { totalFuel, totalCost } = calculateTotals()

  const onRefresh = () => {
    setRefreshing(true)
    fetchFuelReports()
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading fuel reports...</Text>
      </View>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`
  }

  const renderItem = ({ item, index }) => (
    <View style={[styles.reportCard, { marginTop: index === 0 ? 8 : 0 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{item.vehicleName}</Text>
          <View style={styles.vehicleNumberContainer}>
            <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(item.cratedAt)}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.iconText}>⛽</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Fuel</Text>
              <Text style={styles.detailValue}>{item.fuelLiters}L</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.iconText}>💰</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Cost</Text>
              <Text style={styles.detailValue}>{formatCurrency(item.fuelCost)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.iconText}>📍</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{item.marketAddress}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
              <Icon name="person" size={24}/>
            </View>
            <View>
              <Text style={styles.detailLabel}>Full Name</Text>
              <Text style={styles.detailValue}>{item.firstName} {item.lastName}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )

 const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: '#4A90E2' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          data={filterOptions}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder="Select filter"
          value={filterType}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setFilterType(item.value);
            setIsFocus(false);
          }}
          renderRightIcon={() => (
            <Icon
              name={isFocus ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color={isFocus ? '#4A90E2' : '#666'}
            />
          )}
        />
      </View>
      <Text style={styles.headerSubtitle}>
        {filteredReports?.length} {filteredReports?.length === 1 ? 'report' : 'reports'} found
      </Text>
      {filteredReports.length > 0 && (
        <View style={styles.totalsContainer}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Fuel:</Text>
            <Text style={styles.totalValue}>{totalFuel.toFixed(2)}L</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Cost:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>
      )}
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>⛽</Text>
      </View>
      <Text style={styles.emptyTitle}>No Fuel Reports</Text>
      <Text style={styles.emptySubtitle}>
        You haven't created any fuel reports yet.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
      >
        {renderHeader()}
        
        {filteredReports.length > 0 ? (
          filteredReports.map((item, index) => renderItem({ item, index }))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  )
}

export default MyFuelReport

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFE',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    margin:5
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  vehicleNumberContainer: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  vehicleNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dateContainer: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    width:width*0.3
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  dropdown: {
    flex: 1,
    height: 40,
    borderColor: '#E8E8E8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
    fontWeight: '500',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
})