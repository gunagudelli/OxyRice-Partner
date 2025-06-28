import AsyncStorage from "@react-native-async-storage/async-storage";
import React,{useState} from "react";
import { useSelector } from "react-redux";


const config=(value)=>{
  var userStage="Live"
	var BASE_URL;
 if(userStage=="Live"){
	//Live	
  BASE_URL='https://meta.oxyloans.com/api/';

 }else {
	//Test
  BASE_URL='https://meta.oxyglobal.tech/api/';
 } 
	
	return (BASE_URL);
}

export default config();    

export const userStage="Live1"



// import { useSelector } from "react-redux";

// export const config = () => {
//   const userStage = useSelector((state) => state.logged); // Get userStage from Redux

//   const BASE_URL = userStage === "Live"
//     ? "https://meta.oxyloans.com/api/"  // Live URL
//     : "https://meta.oxyglobal.tech/api/"; // Test URL

//   return { BASE_URL, userStage }; // Return both values
// };
