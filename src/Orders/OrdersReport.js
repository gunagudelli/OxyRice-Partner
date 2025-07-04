import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  FlatList,
  Animated,
  TextInput,
  Modal,
  ScrollView,
  Share,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons"
import BASE_URL from "../../config";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get("window");

const OrdersReport = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [salesLoader, setSalesLoader] = useState(false);
  const [ordersReports, setOrdersReports] = useState({});
  const [salesReport, setSalesReport] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [showFilters, setShowFilters] = useState(false);
  const spinValue = new Animated.Value(0);

  const excludedItemIds = [
    "53d7f68c-f770-4a70-ad67-ee2726a1f8f3",
    "9b5c671a-32bb-4d18-8b3c-4a7e4762cc61"
  ];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const filteredSalesReport = salesReport.filter(item => !excludedItemIds.includes(item.itemId));
  
  const grandTotal = filteredSalesReport?.reduce?.((acc, item) => acc + (Math.round(item.profit) || 0), 0);

  useFocusEffect(
    useCallback(() => {
      getOrdersCount();
      getSalesOrder();
      const spinAnim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnim.start();
      return () => spinAnim.stop();
    }, [])
  );



const downloadReport = async () => {
  try {
    const exportData = salesReport.filter(
      (item) => !excludedItemIds.includes(item.itemId)
    );

    const csvContent = [
      ["Item Name", "Weight", "Quantity", "Profit"],
      ...exportData.map((item) => [
        item.itemName,
        `${item.weigth} ${item.weigth === 1 ? "Kg" : "Kgs"}`,
        item.totalItemQuantity,
        `₹${Math.round(item.profit).toLocaleString()}`,
      ]),
      ["Grand Total", "", "", `₹${exportData?.reduce?.(
        (acc, item) => acc + (Math.round(item.profit) || 0),
        0
      ).toLocaleString()}`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Use Share API to share the CSV content
    await Share.share({
      message: csvContent,
      title: `Sales Report ${formatDate(startDate)}_to_${formatDate(endDate)}`,
      url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`, // Optional, for apps that support file sharing
    });
  } catch (error) {
    console.error("Error sharing CSV content:", error);
    alert("Failed to share the report. Please try again.");
  }
};





  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onChangeStart = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const getOrdersCount = () => {
    axios
      .get(BASE_URL + `order-service/ordersCount`)
      .then((response) => setOrdersReports(response.data))
      .catch((error) => console.log("Error orders count", error?.response));
  };

  const getSalesOrder = () => {
    setSalesLoader(true);
    axios
      .get(
        `${BASE_URL}order-service/notification_to_dev_team_monthly?endDate=${formatDate(endDate)}&startDate=${formatDate(startDate)}`
      )
      .then((response) => {
        setSalesReport(response.data);
        setFilteredData(response.data.filter(item => !excludedItemIds.includes(item.itemId)));
        setSalesLoader(false);
      })
      .catch((error) => {
        console.log("Sales order error", error?.response);
        setSalesLoader(false);
      });
  };

  const applyFilters = () => {
    let result = filteredSalesReport;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply weight filter
    if (selectedWeight !== "all") {
      result = result.filter(item => item.weigth == selectedWeight);
    }
    
    // Apply sorting
    if (sortOrder === "highest") {
      result = [...result].sort((a, b) => b.profit - a.profit);
    } else if (sortOrder === "lowest") {
      result = [...result].sort((a, b) => a.profit - b.profit);
    }
    
    setFilteredData(result);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedWeight("all");
    setSortOrder("none");
    setFilteredData(filteredSalesReport);
    // setShowFilters(false);
  };



  const getCardStyle = (item) => {
    if (filteredData.length < 2) return styles.itemCard;
    
    const sortedByProfit = [...filteredData].sort((a, b) => a.profit - b.profit);
    const lowestProfit = sortedByProfit[0].profit;
    const highestProfit = sortedByProfit[sortedByProfit.length - 1].profit;
    
    if (item.profit === highestProfit) {
      return [styles.itemCard, styles.highestProfitCard];
    } else if (item.profit === lowestProfit) {
      return [styles.itemCard, styles.lowestProfitCard];
    }
    return styles.itemCard;
  };

  const renderItem = ({ item, index }) => (
    <View style={getCardStyle(item)}>
      <Text style={styles.itemName}>{index + 1}. {item.itemName}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>Weight: {item.weigth} {item.weigth == 1 ? "Kg" : "Kgs"}</Text>
        <Text style={styles.itemText}>Quantity: {item.totalItemQuantity}</Text>
        <Text style={styles.itemText}>Profit: ₹{Math.round(item.profit)?.toLocaleString()}</Text>
      </View>
    </View>
  );

  function footer() {
    return (
      <View style={{ alignSelf: "center", padding: 16 }}>
        <Text style={styles.footerText}>No more data found</Text>
      </View>
    );
  }

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <Animated.View style={[styles.loaderCircle, { transform: [{ rotate: spin }] }]} />
      <Text style={styles.loaderText}>Loading Items...</Text>
    </View>
  );

  const weightOptions = [
    { label: "All Weights", value: "all" },
    { label: "1 Kg", value: "1" },
    { label: "5 Kg", value: "5" },
    { label: "10 Kg", value: "10" },
    { label: "26 Kg", value: "26" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* <Text style={styles.header}>Orders Analytics Dashboard</Text> */}

      <View style={styles.statusContainer}>
        {[
          { label: "Orders Placed", count: ordersReports.orderPlacedCount, color: "#A7F3D0", icon: "bag-outline" },
          { label: "Orders Assigned", count: ordersReports.orderAssignedCount, color: "#FDE68A", icon: "clipboard-outline" },
          { label: "Orders Picked Up", count: ordersReports.orderPickedUpCount, color: "#E9D5FF", icon: "bus-outline" },
          { label: "Orders Delivered", count: ordersReports.orderDeliveredCount, color: "#BFDBFE", icon: "cube-outline" },
        ].map((box, idx) => (
          <View key={idx} style={[styles.statusBox, { backgroundColor: box.color }]}>
            <Ionicons name={box.icon} size={30} color="#1F2937" />
            <View>
              <Text style={styles.statusLabel}>{box.label}</Text>
              <Text style={styles.statusCount}>{box.count || 0}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.subHeader}>Sales Performance</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#4F46E5" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={styles.exportButton} 
            onPress={downloadReport}
          >
            <Ionicons name="download" size={20} color="#FFF" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>From:</Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>To:</Text>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.getDataButton} onPress={getSalesOrder}>
          <Text style={styles.getDataText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker 
          value={startDate} 
          mode="date"   
          display="default" 
          onChange={onChangeStart} 
          maximumDate={new Date()} 
        />
      )}

      {showEndPicker && (
        <DateTimePicker 
          value={endDate} 
          mode="date" 
          display="default" 
          onChange={onChangeEnd} 
          maximumDate={new Date()} 
          minimumDate={startDate}
        />
      )}

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={()=>setShowFilters(false)}>
              <Icon name="close" size={25} style={{alignSelf:"flex-end"}}/>
            </TouchableOpacity>
            <Text style={styles.modalHeader}>Filter Options</Text>
            <Text style={styles.filterLabel}>Search by Item Name</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter item name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <Text style={styles.filterLabel}>Filter by Weight</Text>
            <View style={styles.weightOptions}>
              {weightOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.weightOption,
                    selectedWeight === option.value && styles.selectedWeightOption
                  ]}
                  onPress={() => setSelectedWeight(option.value)}
                >
                  <Text style={selectedWeight === option.value ? styles.selectedWeightText : styles.weightOptionText}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.filterLabel}>Sort by Profit</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortOrder === "highest" && styles.selectedSortOption
                ]}
                onPress={() => setSortOrder("highest")}
              >
                <Text style={sortOrder === "highest" ? styles.selectedSortText : styles.sortOptionText}>
                  Highest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortOrder === "lowest" && styles.selectedSortOption
                ]}
                onPress={() => setSortOrder("lowest")}
              >
                <Text style={sortOrder === "lowest" ? styles.selectedSortText : styles.sortOptionText}>
                  Lowest First
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={resetFilters}
              >
                <Text style={styles.cancelButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {salesLoader ? (
        renderLoader()
      ) : (
        <View style={styles.salesContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Sales Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{filteredData.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Profit:</Text>
              <Text style={[styles.summaryValue, styles.profitValue]}>₹{grandTotal.toLocaleString()}</Text>
            </View>
          </View>

          {filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              ListFooterComponent={footer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No sales data available</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters or date range</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default OrdersReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F2937",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    gap: 6,
  },
  exportButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusBox: {
    width: width / 2 - 24,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: "#374151",
  },
  statusCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  dateInputContainer: {
    flex: 1,
    minWidth: 120,
  },
  dateLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateText: {
    marginLeft: 6,
    color: "#1F2937",
  },
  getDataButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  getDataText: {
    color: "#FFF",
    fontWeight: "600",
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
  salesContainer: {
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  profitValue: {
    color: "#059669",
  },
  itemCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  highestProfitCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    backgroundColor: "#ECFDF5",
  },
  lowestProfitCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1F2937",
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#4B5563",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
  footerText: {
    color: "#9CA3AF",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  filterLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    marginTop: 12,
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
  },
  weightOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  weightOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  selectedWeightOption: {
    backgroundColor: "#4F46E5",
  },
  weightOptionText: {
    color: "#6B7280",
  },
  selectedWeightText: {
    color: "#FFF",
  },
  sortOptions: {
    flexDirection: "row",
    gap: 8,
  },
  sortOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedSortOption: {
    backgroundColor: "#4F46E5",
  },
  sortOptionText: {
    color: "#6B7280",
  },
  selectedSortText: {
    color: "#FFF",
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
}); 