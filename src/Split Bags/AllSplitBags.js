import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";

import BASE_URL from "../../config";
import { useFocusEffect } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

const AllSplitBags = () => {
  const accessToken = useSelector((state) => state.counter);

  const [splitBags, setSplitBags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // useEffect(() => {
  //   fetchSplitBags(currentPage, pageSize);
  // }, [currentPage, pageSize]);

  useFocusEffect(
    useCallback(() => {
      fetchSplitBags(currentPage, pageSize);
    },[currentPage, pageSize])
  )

  const fetchSplitBags = (page, size) => {
    setLoading(true);
    axios({
      method: "get",
      url: `${BASE_URL}product-service/getAllSplitBagsInfo?page=${page}&size=${size}`,
      headers: {
        Authorization: `Bearer ${accessToken.accessToken}`,
      },
    })
      .then(function (response) {
        console.log("Split Bags", response.data);
        setLoading(false);
        setSplitBags(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch(function (error) {
        setLoading(false);
        console.log("Error", error.response);
      });
  };

  const renderItem = ({ item }) => {
    return (
      <>
        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.dateText}>📅 {item?.splitAt}</Text>

          {/* Barcode Section */}
          <View style={styles.innerCard}>
            <Text style={styles.barcodeText}>{item?.barcode}</Text>
          </View>

          {/* Split Details */}
          <Text style={styles.text}>
            Split By:
            <Text style={{ fontWeight: "normal" }}> {item.splitedBy}</Text>
          </Text>
          <Text style={styles.text}>
            10kgs Bags:{" "}
            {item.tensCount > 0 && (
              <Text style={{ fontWeight: "normal" }}>
                {item.tensCount} {item.tensCount === 1 ? "Bag" : "Bags"}
              </Text>
            )}
            {item.tensCount === 0 && (
              <Text style={{ fontWeight: "normal" }}>0</Text>
            )}
          </Text>
          <Text style={styles.text}>
            5kgs Bags:{" "}
            {item.fivesCount > 0 && (
              <Text style={{ fontWeight: "normal" }}>
                {item.fivesCount} {item.fivesCount === 1 ? "Bag" : "Bags"}
              </Text>
            )}
            {item.fivesCount === 0 && (
              <Text style={{ fontWeight: "normal" }}>0</Text>
            )}
          </Text>

          <Text style={styles.text}>
            1kg Bags:{" "}
            {item.oncesCount > 0 && (
              <Text style={{ fontWeight: "normal" }}>
                {item.oncesCount} {item.oncesCount === 1 ? "Bag" : "Bags"}
              </Text>
            )}
            {item.oncesCount === 0 && (
              <Text style={{ fontWeight: "normal" }}>0</Text>
            )}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.text}>{item.resons}</Text>
        </View>
      </>
    );
  };

  const renderPagination = () => {
    // Create an array of page numbers based on totalPages
    const pageNumbers = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      0,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages - 1, startPage + maxVisibleButtons - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(0, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 0 && styles.disabledButton,
          ]}
          onPress={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage === 0 ? "#aaa" : "#3d2a71"}
          />
        </TouchableOpacity>

        {/* Page Number Buttons */}
        {startPage > 0 && (
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => setCurrentPage(0)}
          >
            <Text style={styles.paginationText}>1</Text>
          </TouchableOpacity>
        )}

        {startPage > 1 && <Text style={styles.ellipsis}>...</Text>}

        {pageNumbers.map((pageNumber) => (
          <TouchableOpacity
            key={pageNumber}
            style={[
              styles.paginationButton,
              currentPage === pageNumber && styles.activeButton,
            ]}
            onPress={() => setCurrentPage(pageNumber)}
          >
            <Text
              style={[
                styles.paginationText,
                currentPage === pageNumber && styles.activeText,
              ]}
            >
              {pageNumber + 1}
            </Text>
          </TouchableOpacity>
        ))}

        {endPage < totalPages - 2 && <Text style={styles.ellipsis}>...</Text>}

        {endPage < totalPages - 1 && (
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => setCurrentPage(totalPages - 1)}
          >
            <Text style={styles.paginationText}>{totalPages}</Text>
          </TouchableOpacity>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages - 1 && styles.disabledButton,
          ]}
          onPress={() =>
            currentPage < totalPages - 1 && setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === totalPages - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentPage === totalPages - 1 ? "#aaa" : "#3d2a71"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3d2a71" />
        </View>
      ) : (
        <>
          <FlatList
            data={splitBags}
            keyExtractor={(item, index) => `${item.barcode}-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={splitBags.length > 0 ? renderPagination : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No split bags found</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barcodeText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 15,
    color: "#777",
    alignSelf: "flex-end",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: "#555",
    margin: 5,
    fontWeight: "bold",
  },
  innerCard: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    marginVertical: 5,
  },
  divider: {
    borderBottomColor: "#c0c0c0",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: "#3d2a71",
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeText: {
    color: "#ffffff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
  },
  ellipsis: {
    marginHorizontal: 4,
    color: "#777",
    fontSize: 16,
  },
});

export default AllSplitBags;
