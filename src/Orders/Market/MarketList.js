import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { TextInput, Card, Button, Chip, Divider } from "react-native-paper";
import axios from "axios";
import BASE_URL from "../../../config";

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12; // Reduced from 16
const CARD_WIDTH = width - (CARD_MARGIN * 2);

const MarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedMarkets, setExpandedMarkets] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch markets data
  const fetchMarkets = async (page = 0, isRefresh = false) => {
    if (loading && !isRefresh) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const cleanBaseUrl = BASE_URL.replace(/\/+$/, '');
      const baseUrl = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;
      const apiUrl = `${baseUrl}/product-service/getAllMarket?page=${page}&size=10`;

      const response = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;

      if (!data) {
        throw new Error("No data received from server.");
      }

      let marketsData = [];
      let totalPages = 1;
      let totalElements = 0;

      if (Array.isArray(data)) {
        marketsData = data;
        totalPages = Math.ceil(data.length / 10);
        totalElements = data.length;
      } else if (data.content) {
        marketsData = data.content;
        totalPages = data.totalPages || 1;
        totalElements = data.totalElements || data.content.length;
      } else if (Array.isArray(data.markets)) {
        marketsData = data.markets;
        totalPages = data.totalPages || 1;
        totalElements = data.totalElements || data.markets.length;
      }

      if (isRefresh || page === 0) {
        setMarkets(marketsData);
        setCurrentPage(0);
      } else {
        setMarkets(prev => [...prev, ...marketsData]);
        setCurrentPage(page);
      }

      setTotalPages(totalPages);
      setTotalElements(totalElements);

    } catch (error) {
      console.error("API Error:", error);
      let errorMessage = "Failed to load markets";

      if (error.response) {
        const status = error.response.status;
        if (status === 404) errorMessage = "API endpoint not found.";
        else if (status === 500) errorMessage = "Internal server error.";
        else if (status === 401) errorMessage = "Please login again.";
        else if (status === 403) errorMessage = "Access denied.";
        else errorMessage = `Server error (${status})`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timed out.";
      } else if (error.message === 'Network Error') {
        errorMessage = "Check your internet connection.";
      }

      Alert.alert("Error", errorMessage);

      if (isRefresh || page === 0) {
        setMarkets([]);
        setTotalPages(0);
        setTotalElements(0);
        setCurrentPage(0);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarkets(0, true);
  }, []);

  const handleRefresh = () => {
    setExpandedMarkets(new Set());
    fetchMarkets(0, true);
  };

  const loadNextPage = () => {
    if (currentPage + 1 < totalPages && !loading) {
      fetchMarkets(currentPage + 1);
    }
  };

  const toggleMarketExpansion = (marketId) => {
    const newExpanded = new Set(expandedMarkets);
    if (newExpanded.has(marketId)) {
      newExpanded.delete(marketId);
    } else {
      newExpanded.add(marketId);
    }
    setExpandedMarkets(newExpanded);
  };

  const openLocationInMaps = (address, marketName) => {
    if (!address || address === 'No Address') {
      Alert.alert("Location Unavailable", "No address available for this market");
      return;
    }

    const encodedAddress = encodeURIComponent(`${marketName}, ${address}`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    Alert.alert(
      "Open Location",
      `Open ${marketName} location in maps?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Google Maps",
          onPress: () => Linking.openURL(googleMapsUrl)
        },
      ]
    );
  };

  const filteredMarkets = markets.filter(market => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (market.marketName && market.marketName.toLowerCase().includes(query)) ||
      (market.leadName && market.leadName.toLowerCase().includes(query)) ||
      (market.address && market.address.toLowerCase().includes(query))
    );
  });

  // Group items by date and calculate totals
  const groupItemsByDate = (items) => {
    if (!items || !Array.isArray(items)) return { grouped: {}, totals: { totalItems: 0, totalQuantity: 0 } };

    const grouped = items.reduce((acc, item) => {
      const date = item.itemAddedDate || 'No Date';
      if (!acc[date]) {
        acc[date] = { items: [], totalQuantity: 0 };
      }
      acc[date].items.push(item);
      acc[date].totalQuantity += Number(item.qty) || 0;
      return acc;
    }, {});

    const totals = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
    };

    return { grouped, totals };
  };

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={styles.itemImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>📦</Text>
            </View>
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.itemName || 'Unknown Item'}
          </Text>
          
          <View style={styles.itemMetrics}>
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Qty</Text>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{item.qty || '0'}</Text>
                  <Text style={styles.metricUnit}>pcs</Text>
                </View>
              </View>
              
              <View style={styles.metricDivider} />
              
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Weight</Text>
                <View style={styles.metricValueContainer}>
                  <Text style={styles.metricValue}>{item.weight || '0'}</Text>
                  <Text style={styles.metricUnit}>kg</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderMarket = ({ item }) => {
    const isExpanded = expandedMarkets.has(item.marketId);
    const { grouped, totals } = groupItemsByDate(item.listItems);

    return (
      <Card style={styles.marketCard}>
        <Card.Content style={styles.marketCardContent}>
          <View style={styles.marketHeader}>
            <View style={styles.marketTitleSection}>
              <Text style={styles.marketName} numberOfLines={2}>
                {item.marketName || 'Unknown Market'}
              </Text>
              <View style={styles.chipContainer}>
                <Chip 
                  mode="flat" 
                  style={[styles.itemCountChip, { backgroundColor: totals.totalItems > 0 ? '#d1fae5' : '#fef3c7' }]}
                  textStyle={[styles.itemCountText, { color: totals.totalItems > 0 ? '#065f46' : '#92400e' }]}
                >
                  {totals.totalItems} Items
                </Chip>
                <Chip 
                  mode="flat" 
                  style={[styles.itemCountChip, { backgroundColor: totals.totalQuantity > 0 ? '#d1fae5' : '#fef3c7' }]}
                  textStyle={[styles.itemCountText, { color: totals.totalQuantity > 0 ? '#065f46' : '#92400e' }]}
                >
                  {totals.totalQuantity} Qty
                </Chip>
              </View>
            </View>
          </View>

          <View style={styles.marketDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.iconText}>👤</Text>
              <Text style={styles.detailValue}>{item.leadName || 'No Lead Assigned'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.iconText}>📅</Text>
              <Text style={styles.detailValue}>{item.openDate || 'No Date'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.detailRow}
              onPress={() => openLocationInMaps(item.address, item.marketName)}
              disabled={!item.address || item.address === 'No Address'}
            >
              <Text style={styles.iconText}>📍</Text>
              <Text style={[
                styles.detailValue, 
                item.address && item.address !== 'No Address' ? styles.addressLink : null
              ]} numberOfLines={2}>
                {item.address || 'No Address Available'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            mode={isExpanded ? "outlined" : "contained"}
            onPress={() => toggleMarketExpansion(item.marketId)}
            style={styles.toggleButton}
            icon={isExpanded ? "chevron-up" : "chevron-down"}
            disabled={totals.totalItems === 0}
            contentStyle={styles.buttonContent}
            theme={{ colors: { primary: '#3b82f6' } }}
          >
            {totals.totalItems === 0 
              ? "No Items Available" 
              : (isExpanded ? "Hide Items" : `View ${totals.totalItems} Items`)
            }
          </Button>

          {isExpanded && totals.totalItems > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Available Items ({totals.totalItems})</Text>
              {Object.entries(grouped).map(([date, group]) => (
                <View key={date} style={styles.dateGroup}>
                  <View style={styles.dateHeader}>
                    <View style={styles.dateTitleContainer}>
                      <Text style={styles.dateTitle}>{date}</Text>
                      <View style={styles.dateTotals}>
                        <Text style={styles.dateTotalText}>
                          Items: {group.items.length} | Qty: {group.totalQuantity}
                        </Text>
                      </View>
                    </View>
                    <Divider style={styles.dateDivider} />
                  </View>
                  <FlatList
                    data={group.items}
                    keyExtractor={(item, index) => item.itemId ? item.itemId.toString() : `item-${index}`}
                    renderItem={renderItem}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                  />
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Markets Directory</Text>
        <Text style={styles.headerSubtitle}>
          {totalElements} markets • {filteredMarkets.length} shown
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="Search markets, leads, or locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
          right={searchQuery ? 
            <TextInput.Icon icon="close" onPress={() => setSearchQuery("")} /> : 
            null
          }
          theme={{ colors: { primary: '#3b82f6', outline: '#d1d5db' } }}
        />
      </View>

      <FlatList
        data={filteredMarkets}
        keyExtractor={(item, index) => item.marketId ? item.marketId.toString() : `market-${index}`}
        renderItem={renderMarket}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Loading markets...</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={styles.emptyText}>
                  {searchQuery ? "No markets match your search" : "No markets available"}
                </Text>
                <Button 
                  mode="contained" 
                  onPress={handleRefresh} 
                  style={styles.retryButton}
                  theme={{ colors: { primary: '#3b82f6' } }}
                >
                  Refresh
                </Button>
              </>
            )}
          </View>
        )}
      />

      {!loading && currentPage + 1 < totalPages && (
        <View style={styles.paginationContainer}>
  <TouchableOpacity onPress={loadNextPage} style={styles.loadMoreButton}>
    <Text style={styles.loadMoreText}>
      Load More ({currentPage + 1} of {totalPages})
    </Text>
  </TouchableOpacity>
</View>

      )}

      {loading && currentPage > 0 && (
        <View style={styles.paginationLoader}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.paginationText}>Loading more markets...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12, // Reduced from 16
    paddingBottom: 10, // Reduced from 12
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4, // Reduced from 6
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 12, // Reduced from 16
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    fontSize: 16,
    borderRadius: 12,
  },
  listContainer: {
    padding: CARD_MARGIN,
    paddingBottom: 80, // Reduced from 100
  },
  marketCard: {
    marginBottom: 12, // Reduced from 16
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  marketCardContent: {
    padding: 16, // Reduced from 20
  },
  marketHeader: {
    marginBottom: 12, // Reduced from 16
  },
  marketTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Added for spacing between chips
  },
  marketName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  itemCountChip: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  marketDetails: {
    marginBottom: 12, // Reduced from 16
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10, // Reduced from 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 12
    paddingVertical: 3, // Reduced from 4
  },
  iconText: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  addressLink: {
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  toggleButton: {
    borderRadius: 12,
    marginTop: 6, // Reduced from 8
  },
  buttonContent: {
    height: 48,
  },
  itemsSection: {
    marginTop: 12, // Reduced from 20
    paddingTop: 12, // Reduced from 16
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12, // Reduced from 16
  },
  dateGroup: {
    marginBottom: 12, // Reduced from 16
  },
  dateHeader: {
    marginBottom: 8, // Reduced from 12
  },
  dateTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 8
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  dateTotals: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTotalText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  dateDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  itemCard: {
    elevation: 2,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 6, // Reduced from 8
  },
  itemContent: {
    flexDirection: 'row',
    padding: 10, // Reduced from 12
    alignItems: 'center',
  },
  itemImageContainer: {
    marginRight: 10, // Reduced from 12
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 24,
    opacity: 0.4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6, // Reduced from 8
    lineHeight: 22,
  },
  itemMetrics: {
    marginVertical: 3, // Reduced from 4
  },
  metricsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8, // Reduced from 10
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24, // Reduced from 28
    backgroundColor: '#e5e7eb',
    marginHorizontal: 10, // Reduced from 12
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 3, // Reduced from 4
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemSeparator: {
    height: 6, // Reduced from 8
  },
 paginationContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6', // optional: border same as text color
  },
  loadMoreText: {
    color: '#3b82f6', // blue text (change as needed)
    fontWeight: 'bold',
    fontSize: 16,
  },
  paginationLoader: {
    position: 'absolute',
    bottom: 60, // Reduced from 80
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 40,
    elevation: 2,
  },
  paginationText: {
    marginLeft: 8,
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60, // Reduced from 80
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16, // Reduced from 20
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20, // Reduced from 24
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 12, // Reduced from 16
    fontSize: 16,
    color: '#6b7280',
  },
  retryButton: {
    borderRadius: 12,
  },
});

export default MarketList;