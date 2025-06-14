// import React,{useState,useEffect} from 'react';
// import { Text, View } from 'react-native';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// // import link from '../../config'
// import axios from 'axios';
// // import {useSelector} from 'react-redux';

// import NewOrders from './NewOrders';
// import AcceptedOrders from './AcceptedOrders';
// import AssignedOrders from './AssignedOrders';


// const Tab = createMaterialTopTabNavigator();

// export default function DealTabs({route }) {
//   const {isTestOrder} = route.params;
//   console.log("isTestOrder",isTestOrder);
  
//   // const userDetails = useSelector(state=>state.counter);
//   // const userDetail = useSelector(state=>state.logged);
//   //   var access = userDetails.headers.accesstoken;
//   //   var id = userDetails.data.id;

//     const[testUser,setTestUser]=useState()


    

//   return (
//     <Tab.Navigator
//       initialRouteName="New"
//       screenOptions={{
//         tabBarActiveTintColor: '#006700',
//         tabBarInactiveTintColor:"#808080",
//         tabBarLabelStyle: { fontSize: 18,fontWeight:"bold",marginTop:10 },
//         tabBarIndicatorStyle: {
//           backgroundColor: '#00cd00', // Active line color (indicator)
//         },
//         // tabBarStyle: { backgroundColor: 'powderblue' },
//       }}
      
//     >
//       <Tab.Screen
//         name="New Orders"
//         component={NewOrders}
//         options={{ tabBarLabel: 'New' }}
//         initialParams={{ isTestOrder: isTestOrder }}
//       />
//       <Tab.Screen
//         name="Accepted Orders"
//         component={AcceptedOrders}
//         options={{ tabBarLabel: 'Accepted' }} 
//         initialParams={{ isTestOrder: isTestOrder }}
//       />
//       <Tab.Screen
//         name="Assigned Orders"
//         component={AssignedOrders}
//         options={{ tabBarLabel: 'Assigned' }}
//         initialParams={{ isTestOrder: isTestOrder }}
//       />
      
//     </Tab.Navigator>
//   );
// }


 
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, StyleSheet, View } from 'react-native';
// Import all your tab screens here
import NewOrders from './NewOrders';
// import AcceptedOrders from './AcceptedOrders';
import AssignedOrders from './AssignedOrders';
import PickedUpOrders from './PickedupOrders';
// import DeliveredOrders from './deliveredOrders';
// import RejectedOrders from './RejectedOrders';
// import CancelledOrders from './CancelledOrders';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

export default function DealTabs({ route }) {
  const { isTestOrder } = route.params;

  // Calculate tabBarItemWidth for exactly 3 tabs visible at once
  const tabBarItemWidth = width / 3;
  
  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="New Orders"
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarActiveTintColor: '#006700',
          tabBarInactiveTintColor: '#808080',
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: { width: tabBarItemWidth },
          tabBarIndicatorStyle: styles.indicator,
          tabBarStyle: styles.tabBar,
          lazy: true,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen
          name="New Orders"
          component={NewOrders}
          options={{ tabBarLabel: 'New' }}
          initialParams={{ isTestOrder }}
        />
        {/* <Tab.Screen
          name="Accepted Orders"
          component={AcceptedOrders}
          options={{ tabBarLabel: 'Accepted' }}
          initialParams={{ isTestOrder }}
        /> */}
        <Tab.Screen
          name="Assigned Orders"
          component={AssignedOrders}
          options={{ tabBarLabel: 'Assigned' }}
          initialParams={{ isTestOrder }}
        />
        <Tab.Screen
          name="PickedUp Orders"
          component={PickedUpOrders}
          options={{ tabBarLabel: 'Picked Up' }}
          initialParams={{ isTestOrder }}
        />
        {/* <Tab.Screen
          name="Delivered Orders"
          component={DeliveredOrders}
          options={{ tabBarLabel: 'Delivered' }}
          initialParams={{ isTestOrder }}
        />
        <Tab.Screen
          name="Rejected Orders"
          component={RejectedOrders}
          options={{ tabBarLabel: 'Rejected' }}
          initialParams={{ isTestOrder }}
        />
          <Tab.Screen
          name="Cancelled Orders"
          component={CancelledOrders}
          options={{ tabBarLabel: 'Cancelled' }}
          initialParams={{ isTestOrder }}
        /> */}
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingVertical: 8,
  },
  indicator: {
    backgroundColor: '#00cd00',
    height: 3,
  },
});