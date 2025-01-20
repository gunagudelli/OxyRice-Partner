import { useFocusEffect } from '@react-navigation/native';
import React,{useEffect,useCallback} from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Dimensions ,BackHandler,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');


const HomeScreen = ({ navigation }) => {


useFocusEffect(
  useCallback(() => {
    const handleBackPress = () => {
      // Custom logic on back press
      Alert.alert(
        'Go Back',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );
      return true; // Prevent default back button behavior
    };

    // Add event listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Cleanup event listener
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [])
)



  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome !</Text>
      <Text style={styles.partnerName}>AskOxy.AI Partner</Text>
      {/* <Text style={styles.partnerName}>Radha</Text> */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Orders',{isTestOrder : false})}>
          <Icon name="bag-outline" size={50} color="#4CAF50" />
          <Text style={styles.boxText}>Orders</Text> 
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('Items')}>
          <Icon name="list-outline" size={50} color="black" />
          <Text style={styles.boxText}>Items</Text> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('DeliveryBoys')}>
          <Icon name="people-outline" size={50} color="#3F51B5" />
          <Text style={styles.boxText}>Delivery Boys</Text> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.box} onPress={() => navigation.navigate('AllOrders')}>
          <Icon name="albums-outline" size={50} color="#FFC107" />
          <Text style={styles.boxText}>All Orders</Text> 
        </TouchableOpacity>

        <TouchableOpacity style={styles.TestUserButton}  onPress={() => navigation.navigate('Orders',{isTestOrder : true})}>
          <Text style={styles.TestUserText}>Test Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.TestAllOrders}   onPress={() => navigation.navigate('TestAllOrders',{isTestOrder : true})}>
          <Text style={styles.TestUserText}>Test AllOrders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeef1', 
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 36, 
    fontWeight: 'bold',
    color: '#03843b', 
    marginBottom: 8,
    textAlign: 'center',
  },
  partnerText: {
    fontSize: 30,
    fontWeight: '600',
    color: 'orange',
    marginBottom: 4,
    textAlign: 'center',
  },
  partnerName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3F51B5',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#ffffff',  
    width: width*0.3, 
    height: height*0.2, 
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 15,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  boxText: {
    fontSize: 20, 
    marginTop: 8,
    color: '#333333',
    textAlign: 'center',
  },
  TestUserButton: {
    backgroundColor:  'lightgrey',  
    width: width*0.3, 
    height: height*0.06, 
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 15,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
},
TestAllOrders: {
  backgroundColor: 'lightgrey',  
  width: width*0.3, 
  height: height*0.06, 
  justifyContent: 'center',
  alignItems: 'center',
  margin: 15,
  borderRadius: 15,  
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 5,
},
TestUserText:{
  color:"black",
  textAlign:"center",
  fontWeight:"bold",
},
});

export default HomeScreen;
