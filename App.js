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
import DeliveryBoys from './src/Delivery Boys/DeliveryBoys';
import AllOrders from './src/Orders/AllOrders';
import AddNewItem from './src/Extra Files/AddNewItem';
import AddDeliveryExecutive from './src/Extra Files/AddDeliveryExecutive';
import UpdateDeliveryBoy from './src/Extra Files/UpdateDeliveryBoy';
import OrderDetails from './src/Orders/OrderDetails';
import TestAllOrders from './src/Orders/TestAllOrders';
import Logout from './src/After Login/Logout';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import allReducers from './Redux/reducers'

const Stack = createNativeStackNavigator();
const store = createStore(
  allReducers
);

export default function App() {
  
  return (
    <Provider store={store}> 
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginWithPassword"
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
          name="OrderDetails"
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
          name="Home"
          component={HomeScreen}
          options={{
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
          name="Items"
          component={Items}
         
        />
        <Stack.Screen
          name="DeliveryBoys"
          component={DeliveryBoys}
          
        />
        <Stack.Screen
          name="AllOrders"
          component={AllOrders}
        
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
     
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
    </Provider>
  );
}
 