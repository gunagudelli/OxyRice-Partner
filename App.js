import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons"; // Import icon library
import { Text, TouchableOpacity, View } from "react-native";
import Register from "./src/Authorization/Register";
import LoginScreen from "./src/Authorization/Login";
import LoginWithPassword from "./src/Authorization/LoginWithPassword";
import HomeScreen from "./src/After Login/Home";
import Orders from "./src/Extra Files/Orders";
import Main from "./src/Orders/Main";
import ExchangeMain from "./src/Exchange/ExchangeMain";
import Items from "./src/Items/Items";
import AddstoreScreen from "./src/Items/AddstoreScreen";
import StoreDetailsScreen from "./src/Items/StoreDetailsScreen";
import PlacedOrdersScreen from "./src/Items/PlacedOrdersScreen.js";
import CategoriesScreen from "./src/Items/CategoriesScreen";
import DeliveryBoys from "./src/Delivery Boys/DeliveryBoys";
import AssignedAndDelivered from "./src/Delivery Boys/AssignedAndDelivered";
import AllOrders from "./src/Orders/AllOrders";
import AddNewItem from "./src/Extra Files/AddNewItem";
import AddDeliveryExecutive from "./src/Extra Files/AddDeliveryExecutive";
import UpdateDeliveryBoy from "./src/Extra Files/UpdateDeliveryBoy";
import OrderDetails from "./src/Orders/OrderDetails";
import TestAllOrders from "./src/Orders/TestAllOrders";
import AllSplitBags from "./src/Split Bags/AllSplitBags";
import Logout from "./src/After Login/Logout";
import NetworkAlert from "./src/After Login/NetworkAlert";
import CustomerFeedback from "./src/Feedback/CustomerFeedback";
import Checkout from "./src/Items/Checkout";
import AppUpdateScreen from "./src/After Login/AppUpdateScreen";
import SplitBags from "./src/Split Bags/SplitBags";
import PaymentStatusScreen from "./src/Payment/PaymentStatusScreen";
import ImageUploader from "./src/ImageUpload/ImageUploader";
import OfferImagesScreen from "./src/ImageUpload/OfferImagesScreen";

import BarcodeScanner from "./src/After Login/BarcodeScanner";
import Barcode from "./src/After Login/Barcode";
import { Provider } from "react-redux";
import { createStore } from "redux";

import Userqueries from "./src/All Queries/Userqueries";
import Querycomments from "./src/All Queries/Querycomments";
import ExchangeOrders from "./src/Exchange/ExchangeOrders ";
import CartScreen from "./src/Items/CartScreen";
import DashboardScreen from "./src/SalesOrders/WeeklyDashboard";

import ScanExchangeOrders from "./src/Exchange/ScanExchangeOrders";

import WeeklyOrders from "./src/SalesOrders/WeeklyOrders";
import AllCategories from "./src/SalesOrders/AllCategories";
import WeeklyDashboard from "./src/SalesOrders/WeeklyDashboard";
import InventoryScreen from "./src/SalesOrders/InventoryScreen";
import MarketOrdersScreen from "./src/SalesOrders/MarketOrdersScreen";
import MarketVisitsScreen from "./src/SalesOrders/MarketVisitsScreen";
import MarketListItems from "./src/SalesOrders/MarketListItems";
import RecordInventoryScreen from "./src/SalesOrders/RecordInventoryScreen";
import CreateOrderScreen from "./src/SalesOrders/CreateOrderScreen";
import AddMarket from "./src/SalesOrders/AddMarket";

import PlaceOrder from "./src/SalesOrders/Place Orders/PlaceOrder";
import ProceedtoCheckout from "./src/SalesOrders/Place Orders/ProceedtoCheckout";
import Address from "./src/SalesOrders/Place Orders/Address";

import MarketOrders from "./src/SalesOrders/MarketOrders";

import allReducers from "./Redux/reducers";
import OrdersReport from "./src/Orders/OrdersReport";
import OrderStats from "./src/Orders/OrderStats";
import PinCodeWiseOrders from "./src/Orders/PinCodeWiseOrders";

const Stack = createNativeStackNavigator();
const store = createStore(allReducers);

export default function App() {
  return (
    <Provider store={store}>
      <NetworkAlert />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="App Update"
          // initialRouteName='Address Book'
          // initialRouteName="LoginWithPassword"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#3d2a71",
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
            options={{
              headerShown: false,
              headerRight: () => <Logout />,
              headerLeft: () => <></>,
            }}
          />

          {/* <Stack.Screen
          name="Orders"
          component={Orders}
          
        /> */}
          {/* <Stack.Screen name="Orders" component={Main} /> */}
          <Stack.Screen
            name="Orders"
            component={Main}
            initialParams={{ isTestOrder: false }} // fallback for first load
            options={({ route }) => ({
              title: route.params?.isTestOrder ? "Test Orders" : "Orders",
            })}
          />
          <Stack.Screen name="Exchange" component={ExchangeMain} />
          <Stack.Screen name="Products" component={Items} />
          <Stack.Screen name="Orders Report" component={OrdersReport} />
          <Stack.Screen name="Orders Stats" component={OrderStats} />
          <Stack.Screen
            name="Pincode wise orders"
            component={PinCodeWiseOrders}
          />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Delivery Boys" component={DeliveryBoys} />
          <Stack.Screen
            name="Delivery Boy Orders"
            component={AssignedAndDelivered}
          />
          <Stack.Screen name="All Orders" component={AllOrders} />
          <Stack.Screen name="Split Bags" component={SplitBags} />
          <Stack.Screen name="All Split Bags" component={AllSplitBags} />
          <Stack.Screen name="Exchange Orders" component={ExchangeOrders} />
          <Stack.Screen name="Customer Feedback" component={CustomerFeedback} />
          <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
          <Stack.Screen name="ImageUploader" component={ImageUploader} />
          <Stack.Screen name="Add Store" component={AddstoreScreen} />
          <Stack.Screen name="Store Details" component={StoreDetailsScreen} options={{
              headerShown: true,
              headerRight: () => <Logout />,
              headerLeft: () => <></>,
            }}/>
          {/* <Stack.Screen
            name="Store Details"
            component={StoreDetailsScreen}
            options={{
              headerShown: true,
              headerRight: () => <Logout />,
              headerLeft: () => <></>,
              headerStyle: {
                backgroundColor: "#3B82F6", // or any visible color
              },
              headerTintColor: "white", // icon/text color
            }}
          /> */}

          <Stack.Screen name="Store Orders" component={PlacedOrdersScreen} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />

          <Stack.Screen
            name="OfferImagesScreen"
            component={OfferImagesScreen}
          />
          <Stack.Screen name="TestAllOrders" component={TestAllOrders} />
          <Stack.Screen name="AddNewItem" component={AddNewItem} />
          <Stack.Screen
            name="AddDeliveryExecutive"
            component={AddDeliveryExecutive}
          />
          <Stack.Screen
            name="UpdateDeliveryBoy"
            component={UpdateDeliveryBoy}
          />
          <Stack.Screen name="Scan Multiple Barcodes" component={Barcode} />
          <Stack.Screen name="User Queries" component={Userqueries} />
          <Stack.Screen name="Query Comments" component={Querycomments} />
          <Stack.Screen name="Scan Bar Code" component={BarcodeScanner} />
          <Stack.Screen name="Stock Exchange" component={ScanExchangeOrders} />

          <Stack.Screen name="All Categories" component={AllCategories} />
          <Stack.Screen name="Weekly Orders" component={WeeklyOrders} />
          {/* <Stack.Screen name="Sales Dashboard" component={WeeklyDashboard} options={{
              headerShown: true,

              headerRight: () => <Logout />,
              headerLeft: () => <></>,
            }}/> */}
          <Stack.Screen
            name="Sales Dashboard"
            component={WeeklyDashboard}
            options={{
              headerShown: true,
              headerRight: () => <Logout />,
              headerLeft: () => <></>,
              headerStyle: {
                backgroundColor: "#3B82F6", // or any visible color
              },
              headerTintColor: "white", // icon/text color
            }}
          />

          <Stack.Screen name="Inventory" component={InventoryScreen} />
          <Stack.Screen name="MarketOrders" component={MarketOrdersScreen} />
          {/* <Stack.Screen name="Market Visits" component={MarketVisitsScreen} options={{
              headerShown: true,
              headerRight: () => <Logout />,
              headerLeft: () => <></>,
            }}
             /> */}
          <Stack.Screen
            name="Market Visits"
            component={MarketVisitsScreen}
            options={{
              headerShown: true,
              headerRight: () => <Logout />,
              headerLeft: () => <></>,
              headerStyle: {
                backgroundColor: "#3d2a71", // or any visible color
              },
              headerTintColor: "white", // icon/text color
            }}
          />

          <Stack.Screen name="Market List Items" component={MarketListItems} />
          <Stack.Screen
            name="Record Inventory"
            component={RecordInventoryScreen}
            options={{ title: "Record Inventory Movement" }}
          />
          <Stack.Screen
            name="CreateOrder"
            component={CreateOrderScreen}
            options={{ title: "Create New Order" }}
          />
          <Stack.Screen
            name="Add Market"
            component={AddMarket}
            options={{ title: "Schedule Market Visit" }}
          />
          <Stack.Screen name="Place Order" component={PlaceOrder} />
          <Stack.Screen
            name="Proceed to Checkout"
            component={ProceedtoCheckout}
          />
          <Stack.Screen name="Address Book" component={Address} />

          <Stack.Screen name="Market Orders" component={MarketOrders} />
          {/* Add more screens as needed */}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </Provider>
  );
}
