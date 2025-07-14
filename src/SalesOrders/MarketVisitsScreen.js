import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated,BackHandler,Alert } from 'react-native';
import { useEffect, useState,useCallback } from 'react';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import BASE_URL from '../../config';
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
const { height,width } = Dimensions.get('window');
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MarketVisitsScreen() {
  const navigation = useNavigation();
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const spinValue = new Animated.Value(0);
  const userData = useSelector((state) => state.auth); // Adjust the path to your auth slice


useFocusEffect(
  useCallback(() => {
    let isActive = true;

    // Start spinner animation
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }) 
    );
    spinAnim.start();

    // Fetch data
    const fetchData = async () => {
      if (isActive) {
        await getAllMarkets();
      }
    };
    fetchData();

    // BackHandler to exit app or log out
    const onBackPress = () => {
      Alert.alert('Logout App', 'Do you want to logout the app?', [
        { text: 'Cancel', style: 'cancel' },

        { text: 'Yes', onPress: () =>{ console.log({userData})
           AsyncStorage.removeItem("userData");
          console.log("Logout pressed");
          // dispatch(clearAccessToken());  // <-- Clear Redux token
          navigation.navigate("LoginWithPassword");},
      }
      ]);
      return true;
    };
    // BackHandler.addEventListener('hardwareBackPress', onBackPress);
     const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    onBackPress
  );

    return () => {
      isActive = false;
      spinAnim.stop(); // stop the animation
      // BackHandler.removeEventListener('hardwareBackPress', onBackPress); // clean up back handler
      backHandler.remove();
    };
  }, [page])
);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });



const getAllMarkets = () => {
  setLoading(true);
  axios({
    method: 'get',
    url: `${BASE_URL}product-service/getAllMarket?page=${page}&size=${pageSize}`,
  })
    .then((response) => {
      if (response.data && response.data.content) {
        const { content, totalPages } = response.data;
        setMarketData(content || []);
        setTotalPages(totalPages || 1);
      } else {
        setMarketData([]);
        setTotalPages(1);
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error('Error fetching markets:', error);
      setMarketData([]);
      setTotalPages(1);
      setLoading(false);
    });
};

  useEffect(() => {
    getAllMarkets();
  }, [page]);

  const handlePrevPage = () => {
    if (page > 0 && !loading) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1 && !loading) {
      setPage(page + 1);
    }
  };


const isTodayItemAdded = (listItems = []) => {
  if (!listItems || !Array.isArray(listItems)) return false;
  
  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${today.getFullYear()}`;

  return listItems.some(
    (item) => item.itemAddedDate === todayFormatted
  );
};


  const renderVisitItem = ({ item }) => (
    <View style={styles.visitItem}>
      <View style={styles.visitHeader}>
        <Text style={styles.visitMarket}>{item.marketName}</Text>
         <TouchableOpacity
          style={[styles.visitButton, {backgroundColor: 'orange'}]}
          onPress={() => navigation.navigate('Market Orders', { MarketDetails: item,type:"Market" })}
        >
          <Text style={styles.primaryButtonText}>View Orders</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.visitDetails}>
        <View style={styles.visitRow}>
          <Ionicons name="location-outline" size={16} color="#777" style={styles.visitIcon} />
          <Text style={styles.visitDetailText}>{item.address}</Text>
        </View>
        <View style={styles.visitRow}>
          <Ionicons name="people-outline" size={16} color="#777" style={styles.visitIcon} />
          <Text style={styles.visitDetailText}>{item.leadName}</Text>
        </View>
        {item.notes && (
          <View style={styles.visitRow}>
            <MaterialIcons name="notes" size={16} color="#777" style={styles.visitIcon} />
            <Text style={styles.visitDetailText}>{item.notes}</Text>
          </View>
        )}
      </View>
      <View style={styles.visitActions}>
        
        <TouchableOpacity
          style={[styles.visitButton, {backgroundColor: '#2A6B57'}]}
          onPress={() => navigation.navigate('All Categories', { MarketDetails: item,type:"Market" })}
        >
          <Text style={styles.primaryButtonText}>Add market items</Text>
        </TouchableOpacity>

         {/* <TouchableOpacity
          style={[styles.visitButton, {backgroundColor: '#0384d5'}]}
          onPress={() => navigation.navigate('Place Order', { MarketDetails: item,type:"Market" })}
        >
          <Text style={styles.primaryButtonText}>Place Order</Text>
        </TouchableOpacity> */}

       <TouchableOpacity
  style={[
    styles.visitButton,
    {
      backgroundColor: isTodayItemAdded(item.listItems) ? '#0384d5' : '#d3d3d3',
      opacity: isTodayItemAdded(item.listItems) ? 1 : 0.6
    }
  ]}
  onPress={() =>
    isTodayItemAdded(item.listItems) &&
    navigation.navigate('Place Order', { MarketDetails: item, type: "Market" })
  }
  disabled={!isTodayItemAdded(item.listItems)}
>
  <Text
    style={[
      styles.primaryButtonText,
      { color: isTodayItemAdded(item.listItems) ? '#fff' : '#000' }
    ]}
  >
    Place Order
  </Text>
</TouchableOpacity>


      </View>

      <TouchableOpacity
          style={[styles.visitButton,{alignItems:"center",borderTopWidth:0.4,borderTopColor:"#000",width:width*0.9}]}
          onPress={() => navigation.navigate('Market List Items', { MarketDetails: item })}
        >
          <Text style={styles.visitButtonText}>List Items</Text>
        </TouchableOpacity>
    </View>
  );

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <Animated.View style={[styles.loaderCircle, { transform: [{ rotate: spin }] }]} />
      <Text style={styles.loaderText}>Loading Items...</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, page === 0 && styles.disabledButton]}
        onPress={handlePrevPage}
        disabled={page === 0 || loading}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={page === 0 || loading ? '#a0a0a0' : '#fff'}
        />
        <Text style={[styles.paginationText, page === 0 && styles.disabledText]}>Previous</Text>
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        Page {page + 1} of {totalPages}
      </Text>
      <TouchableOpacity
        style={[styles.paginationButton, page >= totalPages - 1 && styles.disabledButton]}
        onPress={handleNextPage}
        disabled={page >= totalPages - 1 || loading}
      >
        <Text style={[styles.paginationText, page >= totalPages - 1 && styles.disabledText]}>Next</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={page >= totalPages - 1 || loading ? '#a0a0a0' : '#fff'}
        />
      </TouchableOpacity>
    </View>
  );

    function footer() {
    return (
      <View style={{ alignSelf: "center" }}>
        <Text>No more data Found </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        renderLoader()
      ) : (
        <>
        <View style={{flexDirection:"row",alignSelf:"center"}}>
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => navigation.navigate('Add Market')}
          >
            <FontAwesome5 name="calendar-plus" size={16} color="#fff" style={styles.scheduleIcon} />
            <Text style={styles.scheduleButtonText}>Schedule New Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={() => navigation.navigate('Weekly Orders')}
          >
            <FontAwesome5 name="shopping-cart" size={16} color="#fff" style={styles.scheduleIcon} />
            <Text style={styles.scheduleButtonText}>Online Orders</Text>
          </TouchableOpacity>
</View>
          {renderPagination()}
         <FlatList
  data={marketData}
  renderItem={renderVisitItem}
  keyExtractor={(item) => item.id || Math.random().toString()}
  style={styles.visitsList}
  ListEmptyComponent={
    !loading && (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No markets found</Text>
      </View>
    )
  }
  ListFooterComponent={marketData.length > 0 ? footer : null}
  ListFooterComponentStyle={styles.footerStyle}
/>
        </>
      )}
      <View style={styles.bottomPadding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  visitsList: {
    padding: 15,
  },
  visitItem: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 0.6,
    borderColor: '#000',
  },
  visitHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#808080',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:"center"

  },
  visitMarket: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width:width*0.6
  },
  visitDetails: {
    padding: 15,
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitIcon: {
    marginRight: 8,
  },
  visitDetailText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  visitButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 8,
  },
  visitButtonText: {
    fontSize: 14,
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#2A6B57',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height / 1.5,
  },
  loaderCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#4A90E2',
    borderTopColor: 'transparent',
    marginBottom: 10,
  },
  emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
emptyText: {
  fontSize: 16,
  color: '#777',
},
  loaderText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#2A6B57',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    // paddingHorizontal: 20,
    alignSelf: 'center',
    marginVertical: 20,
    margin:5,
    width:"auto"
  },
  scheduleIcon: {
    marginRight: 8,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  paginationButton: {
    flexDirection: 'row',
    backgroundColor: '#2A6B57',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    // flex: 1,
    marginHorizontal: 5,
    width:"auto"
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  paginationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 5,
  },
  disabledText: {
    color: '#e0e0e0',
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
  footerStyle:{
    marginBottom:100
  }
});