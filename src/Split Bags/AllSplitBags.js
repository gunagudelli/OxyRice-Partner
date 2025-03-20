import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Modal,
    FlatList,
    Alert,
    TextInput,
    ActivityIndicator,
  } from "react-native";
  import React, { useState,useEffect } from "react";
  import BarCodeScannerScreen from "./BarCode";
  import Checkbox from "expo-checkbox";
  import axios from "axios";
  import { useSelector } from "react-redux";
  import { Dropdown } from 'react-native-element-dropdown';
  import { Card } from "react-native-paper";

  import BASE_URL from "../../config";
  
  const { height, width } = Dimensions.get("window");
  

const AllSplitBags = () => {
  const accessToken = useSelector((state) => state.counter);

const[splitBags,setSplitBags]=useState([])
const[loading,setLoading]=useState(false)

useEffect(()=>{
    fetchSplitBags()
},[])

const fetchSplitBags=()=>{

    setLoading(true)

    axios({
        method:"get",
        url:BASE_URL+"product-service/getAllSplitBagsInfo?page=0&size=10",
        headers:{
            "Authorization":`Bearer ${accessToken.accessToken}`
        }
    })
    .then(function(response){
        console.log("Split Bags",response.data)
        setLoading(false)
        setSplitBags(response.data.content)
    })
    .catch(function(error){
        setLoading(false)
        console.log("Error",error.resposne)
    })
}


const renderItem=({item})=>{
    return(
        <>
          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.dateText}>📅 {item?.splitAt}</Text>

            {/* Barcode Section */}
            <View style={styles.innerCard}>
              <Text style={styles.barcodeText}>{item?.barcode}</Text>
            </View>

            {/* Split Details */}
            <Text style={styles.text}>Split By:<Text style={{fontWeight:"normal"}}>{item.splitedBy}</Text></Text>
            <Text style={styles.text}>10kgs Bags: <Text style={{fontWeight:"normal"}}>{item.tensCount}</Text></Text>
            <Text style={styles.text}>5kgs Bags: <Text style={{fontWeight:"normal"}}>{item.fivesCount}</Text></Text>
            <Text style={styles.text}>1kg Bags: <Text style={{fontWeight:"normal"}}>{item.oncesCount}</Text></Text>

            <View style={styles.divider} />

            <Text style={styles.text}>Testing</Text>

            {/* Get Split Bags Button */}

            {/* <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Get Split Bags</Text>
            </TouchableOpacity> */}
          </View>
        </>
    )
}


return (
    <View style={styles.container}>
         {loading==true ? (
                            <ActivityIndicator size="large" color="#3d2a71" />
                        ) : (
                            <>
    <FlatList
        data={splitBags}
        keyExtractor={(item) => item.barcode}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}    
    />
    </>
 )}  

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barcodeText: {
    fontSize: 20,
    color: "#333",
    fontWeight:"bold"
  },
  dateText: {
    fontSize: 15,
    color: "#777",
    alignSelf:"flex-end"
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: "#555",
    margin:5,
    fontWeight:"bold"
  },
  innerCard:{
    backgroundColor:"#f5f5f5",
    padding:8,
    borderRadius:8,
    marginBottom:8,
    marginVertical:5
  },
  divider:{
   borderBottomColor:"#c0c0c0",
   borderBottomWidth:1,
   marginVertical:10
  }
});

export default AllSplitBags;
