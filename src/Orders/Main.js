import React,{useState,useEffect} from 'react';
import { Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import link from '../../config'
import axios from 'axios';
// import {useSelector} from 'react-redux';

import NewOrders from './NewOrders';
import AcceptedOrders from './AcceptedOrders';
import AssignedOrders from './AssignedOrders';


const Tab = createMaterialTopTabNavigator();

export default function DealTabs({route }) {
  const {isTestOrder} = route.params;
  console.log("isTestOrder",isTestOrder);
  
  // const userDetails = useSelector(state=>state.counter);
  // const userDetail = useSelector(state=>state.logged);
  //   var access = userDetails.headers.accesstoken;
  //   var id = userDetails.data.id;

    const[testUser,setTestUser]=useState()


    

  return (
    <Tab.Navigator
      initialRouteName="New"
      screenOptions={{
        tabBarActiveTintColor: '#006700',
        tabBarInactiveTintColor:"#808080",
        tabBarLabelStyle: { fontSize: 18,fontWeight:"bold",marginTop:10 },
        tabBarIndicatorStyle: {
          backgroundColor: '#00cd00', // Active line color (indicator)
        },
        // tabBarStyle: { backgroundColor: 'powderblue' },
      }}
      
    >
      <Tab.Screen
        name="New Orders"
        component={NewOrders}
        options={{ tabBarLabel: 'New' }}
        initialParams={{ isTestOrder: isTestOrder }}
      />
      <Tab.Screen
        name="Accepted Orders"
        component={AcceptedOrders}
        options={{ tabBarLabel: 'Accepted' }} 
        initialParams={{ isTestOrder: isTestOrder }}
      />
      <Tab.Screen
        name="Assigned Orders"
        component={AssignedOrders}
        options={{ tabBarLabel: 'Assigned' }}
        initialParams={{ isTestOrder: isTestOrder }}
      />
      
    </Tab.Navigator>
  );
}