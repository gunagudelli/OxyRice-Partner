import { StatusBar } from 'expo-status-bar';
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; // Import icon library
import { TouchableOpacity } from 'react-native';
import Register from './src/Authorization/Register';
import LoginScreen from './src/Authorization/Login';
import LoginWithPassword from './src/Authorization/LoginWithPassword';
import HomeScreen from './src/After Login/Home';
import Orders from './src/Extra Files/Orders';
import Main from './src/Orders/Main'
import Items from './src/Items/Items';
import CategoriesScreen from './src/Items/CategoriesScreen';
import DeliveryBoys from './src/Delivery Boys/DeliveryBoys';
import AssignedAndDelivered from './src/Delivery Boys/AssignedAndDelivered';
import AllOrders from './src/Orders/AllOrders';
import AddNewItem from './src/Extra Files/AddNewItem';
import AddDeliveryExecutive from './src/Extra Files/AddDeliveryExecutive';
import UpdateDeliveryBoy from './src/Extra Files/UpdateDeliveryBoy';
import OrderDetails from './src/Orders/OrderDetails';
import TestAllOrders from './src/Orders/TestAllOrders';
import AllSplitBags from './src/Split Bags/AllSplitBags';
import Logout from './src/After Login/Logout';
import NetworkAlert from './src/After Login/NetworkAlert';

import AppUpdateScreen from './src/After Login/AppUpdateScreen';
import SplitBags from './src/Split Bags/SplitBags';

import BarcodeScanner from './src/After Login/BarcodeScanner';

import { Provider } from 'react-redux';
import { createStore } from 'redux';


import Userqueries from './src/All Queries/Userqueries';
import Querycomments from './src/All Queries/Querycomments';

import allReducers from './Redux/reducers'

const Stack = createNativeStackNavigator();
const store = createStore(
  allReducers
);

export default function App() {
  
  return (
    <Provider store={store}> 
    <NetworkAlert/>
    <NavigationContainer>
      <Stack.Navigator
       initialRouteName="App Update"
      // initialRouteName='Dashboard'
        // initialRouteName="LoginWithPassword"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#3d2a71"
          },
          headerTintColor: "white",
    headerTitleStyle: {
      fontSize: 24,  
      fontWeight: "bold", 
      
    },
        }}
      >
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Order Details"
          component={OrderDetails}
          options={{ headerShown: true }}
        />
       
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginWithPassword"
          component={LoginWithPassword}
          options={{ headerShown: false }}
        />

<Stack.Screen
        name="App Update"
        component={AppUpdateScreen}
        options={{ headerShown: false }}
      />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false ,
            
            headerRight: () => (
              <Logout />
            )
            ,headerLeft: () => (
              <></>
            ),
          }}
          
        />
        
        {/* <Stack.Screen
          name="Orders"
          component={Orders}
          
        /> */}
        <Stack.Screen 
        name="Orders" 
        component={Main}
        />

        <Stack.Screen
          name="Products"
          component={Items}
         
        />
         <Stack.Screen
          name="CategoriesScreen"
          component={CategoriesScreen}
         
        />
        <Stack.Screen
          name="Delivery Boys"
          component={DeliveryBoys}
          
        />
         <Stack.Screen
          name="Delivery Boy Orders"
          component={AssignedAndDelivered}
          
        />
        <Stack.Screen
          name="All Orders"
          component={AllOrders}
        
        />
         <Stack.Screen
          name="Split Bags"
          component={SplitBags}
        />

         <Stack.Screen
          name="All Split Bags"
          component={AllSplitBags}
        />


        
<Stack.Screen
          name="TestAllOrders"
          component={TestAllOrders}
        
        />
        <Stack.Screen
          name="AddNewItem"
          component={AddNewItem}
          
        />
        <Stack.Screen
          name="AddDeliveryExecutive"
          component={AddDeliveryExecutive}
          
        />
        <Stack.Screen
          name="UpdateDeliveryBoy"
          component={UpdateDeliveryBoy}
         
        />

<Stack.Screen
          name="User Queries"
          component={Userqueries}
          
        />
         <Stack.Screen
          name="Query Comments" 
          component={Querycomments}
          
        />

        <Stack.Screen name="Scan Bar Code" component={BarcodeScanner}/>
     
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
    </Provider>
  );
}
 