import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import BASE_URL from "../../config";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 30;

const AllCategories = () => {
  const [allData, setAllData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAllCategoryInventory();
  }, []);

  const fetchAllCategoryInventory = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}product-service/showItemsForCustomrs`
      );
      const data = res.data;

      // Extract items from itemInventoryResponseList and flatten the data
      const flattenedData = [];
      data.forEach((category) => {
        if (category.itemsResponseDtoList && category.itemsResponseDtoList.length > 0) {
          category.itemsResponseDtoList.forEach((item) => {
            flattenedData.push({
              ...item,
              catName: category.categoryName, // Add category name to each item
            });
          });
        }
      });

      // Get unique categories and add "All" as the first option
      const uniqueCategories = ["All", ...Array.from(
        new Set(data.map((item) => item.categoryName))
      )];
      
      setCategories(uniqueCategories);
      setAllData(flattenedData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const renderCategoryTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabContainer}>
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          onPress={() => setSelectedCategory(cat)}
          style={[
            styles.categoryTab,
            selectedCategory === cat && styles.activeTab,
          ]}
        >
          <Text
            style={{
              color: selectedCategory === cat ? "white" : "black",
              fontWeight: "bold",
            }}
          >
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.itemImage }} // Use itemImage from API response
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{item.itemName}</Text>
      <Text style={styles.price}>₹{item.itemPrice}</Text>
    </View>
  );

  // Filter items based on selected category; if "All" is selected, show all items
  const filteredItems = selectedCategory === "All"
    ? allData
    : allData.filter((item) => item.catName === selectedCategory);

  return (
    <View style={styles.container}>
      {renderCategoryTabs()}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.itemId} // Use itemId as unique key
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No items in this category.
          </Text>
        }
      />
    </View>
  );
};

export default AllCategories;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  categoryTabContainer: {
    marginBottom: 10,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: "#4A90E2",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFF",
    margin: 10,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: CARD_WIDTH - 40,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "bold",
    marginTop: 4,
  },
});