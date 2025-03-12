import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useSelector } from 'react-redux';
import BASE_URL from '../../config';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const SPACING = 18;
const CARD_WIDTH = (width - SPACING * 3) / COLUMN_COUNT;

const Categories = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const accessToken = useSelector((state) => state.counter);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      return () => {
        console.log('Categories screen unfocused');
      };
    }, [])
  );

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}product-service/getItemsList`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
          },
        }
      );
      console.log('API Response:', response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToItems = (category) => {
    console.log('Navigating with items:', category.zakyaResponseList);
    navigation.navigate('Items', {
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      items: category.zakyaResponseList || [],
    });
  };

  const renderCategoryCard = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        { marginRight: (index + 1) % COLUMN_COUNT !== 0 ? SPACING : 0 }
      ]}
      onPress={() => navigateToItems(item)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        {item.categoryImage ? (
          <Image
            source={{ uri: item.categoryImage }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.categoryImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>{item.categoryName[0]}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.categoryName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item.categoryId?.toString() || item.categoryName}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          numColumns={COLUMN_COUNT}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: SPACING,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: SPACING,
  },
  card: {
    width: CARD_WIDTH,
    marginBottom: SPACING,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f8f8',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
  },
  cardContent: {
    padding: 8,
    backgroundColor: '#fff',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});

export default Categories;
