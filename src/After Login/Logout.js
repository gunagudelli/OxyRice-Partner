import React from "react";
import { TouchableOpacity,Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Import icon library
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";


const Logout = () => {
    const navigation = useNavigation()

    const out = () =>{
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            AsyncStorage.removeItem("accessToken");
            navigation.navigate("LoginWithPassword");
          }
        }
      ]);

        // AsyncStorage.removeItem()
        //     navigation.navigate("Login")
    }

    return (
        <TouchableOpacity onPress={()=>out()}>
          <Ionicons
            name="log-out-outline"
            size={26}
            color="white"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>
    )
}

export default Logout