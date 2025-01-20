
import React, { useEffect, useState, useCallback } from "react"
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, ActivityIndicator,RefreshControl } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import BASE_URL from "../../config";
import { useFocusEffect } from "@react-navigation/native"
const { height, width } = Dimensions.get('window')
import { useSelector } from "react-redux";


const AssignedOrders = ({ navigation,route }) => {
    const {isTestOrder} = route.params;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [accessToken, setAccessToken] = useState(null)
    const [userId, setUserId] = useState(null)
    const[loader,setLoader]=useState(false)
    const [refreshing, setRefreshing] = useState(false); 
    // const [testUser, setTestUser]=useState(true)
    // const isFocused = useIsFocused();
    const accessToken = useSelector((state) => state.counter);

    // useFocusEffect(
    //     useCallback(() => {
    //         // Functions to run when the screen is focused
    //         const getdata = async () => {
    //             await fetchData();
    //         };

    //         getdata();

    //         // Cleanup function (if needed) to run when the screen is unfocused
    //         return () => {
    //             console.log('Screen is unfocused');
    //         };
    //     }, [])
    // );

    useEffect(() => {
        const getdata = async () => {
            await fetchData();
        };
        getdata();
    }, []);

    // const getUserData = async () => {

    //     try {
    //         const userData = await AsyncStorage.getItem("userData");
    //         if (userData) {
    //             const parsedData = JSON.parse(userData);
    //             console.log("User ID:", parsedData.userId);
    //             setUserId(parsedData.userId)
    //             console.log("Access Token:", parsedData.accessToken);
    //             setAccessToken(parsedData.accessToken)
    //         } else {
    //             console.log("No user data found in AsyncStorage");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching user data:", error);
    //     }
    // };
    
    const fetchData = async () => {
        try {
            // Fetch user data from AsyncStorage
            const userData = await AsyncStorage.getItem("userData");
            // if (userData) {
            //     const parsedData = JSON.parse(userData);
            //     console.log("User ID:", parsedData.userId);
            //     setUserId(parsedData.userId);
            //     console.log("Access Token:", parsedData.accessToken);
            //     setAccessToken(parsedData.accessToken);
                setLoader(true)
                // Call API to fetch all orders
                const response = await axios.get(
                    BASE_URL+'erice-service/order/getAllOrders',
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken.token}`,
                        },
                    }
                );
                setLoader(false)
                console.log("getAllOrders response", response.data);
                const acceptedOrders = response.data.filter(
                    (order) => {
                        return order && order.orderStatus === "3"
                    }
                );
                console.log("getAllOrders response", acceptedOrders);

                setOrders(acceptedOrders);
            // }

            // else {
            //     console.log("No user data found in AsyncStorage");
            // }


        }
        catch (error) {
            setLoader(false)
            console.error("Error fetching user data or orders:", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };



        renderItem = ({ item }) => {
        return (
            <View>
                {item.orderStatus == 3 && item.testUser==isTestOrder ?
                    <TouchableOpacity style={styles.orderItem} onPress={() => navigation.navigate('OrderDetails', { order: item })} >
                        <Text style={styles.orderId}>OrderId : <Text styles={{fontWeight:"normal"}}>{item?.uniqueId}</Text></Text>

                        <View style={styles.orderRow}>

                            <View>
                                <Text style={styles.orderDate}>Date : <Text style={{fontWeight:"normal"}}>{item?.orderDate.substring(0, 10)}</Text> </Text>
                                <Text style={styles.orderDate}>Status : <Text style={styles.orderStatus}> {item?.orderStatus == 0 ? "Incomplete" :
                                    item.orderStatus == 1 ? "Placed" :
                                       item.orderStatus == 2 ? "Accepted" :
                                            item.orderStatus == 3 ? "Picked Up" :
                                                item.orderStatus == 4 ? "Delivered" :
                                                    item.orderStatus == 5 ? "Rejected" :
                                                       item.orderStatus == 6 ? "Cancelled" : "Unknown"}</Text></Text>

                            </View>
                            <View>
                                <Text style={styles.orderRupees}>Rs : <Text style={styles.orderPrice}>{item?.grandTotal}</Text></Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    : null}
            </View>
        )
    }

    function footer() {
        return (
            <View style={{ height: 100 }}>
                <Text style={{alignSelf:"center",fontSize:15,marginTop:15}}>No more data found</Text>
            </View>
        )
    }

    return (
        <View>
            {/* <View>
                <TouchableOpacity style={styles.TestUserButton} onPress={()=>setTestUser(!testUser)}>
                    {
                        testUser?
                        <Text style={styles.TestUserText}>Test Users</Text>
                        
                        :
                        <Text style={styles.LiveUserText}>Live Users</Text>
                    }
                </TouchableOpacity>
                </View> */}
            <View>
{loader==false?
       
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.orderId.toString()}
                // ListEmptyComponent={
                //     <View style={styles.emptyContainer}>
                //         <Text style={styles.emptyText}>No orders available.</Text>
                //     </View>
                // }
                ListFooterComponentStyle={styles.footerStyle}
                ListFooterComponent={footer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                
            />
            :
            <View style={{marginTop:30}}>
            <ActivityIndicator size={"large"} color="green"/>

            </View>
}
                 </View>

        </View>
    )
}
export default AssignedOrders  


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingHorizontal: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 24,
        color: '#555',
    },
    orderItem: {
        padding: 14,
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
        width:width,
        alignSelf:"center",
        marginBottom:6
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 6,
        // padding:15
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        width: width * 0.8,
        marginLeft:5
        // color:"orange"
    },
    orderRupees: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    orderPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
    },
    orderDate: {
        fontSize: 14,
        color: '#555',
        // marginBottom: 3,
        fontWeight:"bold"
    },
    orderStatus: {
        fontSize: 16,
        color: '#28a745',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    TestUserButton: {
        backgroundColor: '#28a745',
        padding:10,
        borderRadius: 28,
        margin: 10,
        width: width * 0.3,
        alignSelf: 'flex-end', 
    },
    TestUserText:{
        color:"white",
        textAlign:"center",
        fontWeight:"bold",
    },

    LiveUserText:{
        color:"white",
        textAlign:"center",
        fontWeight:"bold",
    },
    footerStyle:{
        marginBottom:100,
        // marginTop:200
    }
});