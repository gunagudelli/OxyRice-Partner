import { Dimensions, StyleSheet, Text, View, FlatList ,Pressable, TouchableOpacity,BackHandler,Alert} from 'react-native'
import React,{useCallback, useEffect, useState} from 'react'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import Icon from "react-native-vector-icons/Ionicons"
import axios from "axios";
import { useSelector } from "react-redux";
import BASE_URL from "../../config"
import AssignedOrders from './AssignedOrders';
import DeliveredOrders from './DeliveredOrders';
import PickedupOrders from './Pickedup';
const { height, width } = Dimensions.get('window')



const AssignedAndDelivered = ({route}) => {
console.log("routes",route)

    const accessToken = useSelector((state) => state.counter);
  
  
  const [activeTab, setActiveTab] = useState(0);
  const[details,setDetails]=useState()
  const navigation = useNavigation()
  const handleTabPress = (index) => {
    setActiveTab(index);
  };


  
 
 


  return (
    <View>
      {/* <Text>AssignedAndDelivered</Text> */}
      {/* <View style={{margin:10}}>
        <FlatList
          horizontal
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
        />
      </View> */}

      <View>
      <View style={styles.container}>
        <Pressable
          style={[
            styles.buttonRice,
            activeTab === 0 ? styles.activeTabButton : styles.tabButton,
          ]}
          onPress={() => handleTabPress(0)}
        >
          <Text
            style={[
              activeTab === 0
                ? styles.activeTabTextButton
                : styles.tabTextButton,
            ]}
          >
           Assigned Orders
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.buttonPicked,
            activeTab === 2 ? styles.activeTabButton : styles.tabButton,
          ]}
          onPress={() => handleTabPress(2)}
        >
          <Text
            style={[
              activeTab === 2
                ? styles.activeTabTextButton
                : styles.tabTextButton,
            ]}
          >
            Picked up Orders
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.buttonGrocery,
            activeTab === 1 ? styles.activeTabButton : styles.tabButton,
          ]}
          onPress={() => handleTabPress(1)}
        >
          <Text
            style={[
              activeTab === 1
                ? styles.activeTabTextButton
                : styles.tabTextButton,
            ]}
          >
            Delivered Orders
          </Text>
        </Pressable>
      </View>

      <View style={{alignSelf:"flex-end",margin:10,marginRight:20}}>
        {/* <TouchableOpacity onPress={()=>navigation.navigate('Location Map')}>
          <Icon name="map" size={20}/>
        </TouchableOpacity> */}
      </View>

      <View>
        {activeTab === 0 && <AssignedOrders navigation={navigation} id={route.params.id}/>}
        {activeTab === 1 && <DeliveredOrders navigation={navigation} id={route.params.id}/>}
        {activeTab === 2 && <PickedupOrders navigation={navigation} id={route.params.id}/>}
      </View>

      </View>

      
    </View>
  )
}

export default AssignedAndDelivered

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'white',
    elevation: 5,
    width: width * 0.43,
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius:5
  },
  subHeader: {
    fontWeight: 'bold',
    fontSize: 18
  },
  container: {
    flexDirection: "row",
    justifyContent: "center",
    // elevation: 2,
    padding: 10,
  },
  tabButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  activeTabButton: {
    backgroundColor: "#3d2a71",
  },
  buttonRice: {
    color: "#fff",
    padding: 10,
    width: width*0.3,
    paddingHorizontal:20,
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  buttonPicked:{
    color: "#fff",
    padding: 10,
    width: width*0.3,
    paddingHorizontal:20,
//     alignContent:"center",
// justifyContent:"center",
// alignSelf:"center"
  },
  buttonGrocery: {
    color: "#fff",
      width: width*0.3,
      paddingHorizontal:20,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    padding:10
  },
  button: {
    color: "#fff",
    padding: 10,
    width: 100,
    textAlign: "center",
  },
  tabTextButton: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontSize:13
  },
  activeTabTextButton: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize:13
  },
})

