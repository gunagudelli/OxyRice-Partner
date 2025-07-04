// import React from "react";
// import { TouchableOpacity,Alert } from "react-native";
// import { Ionicons } from '@expo/vector-icons'; // Import icon library
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from "@react-native-async-storage/async-storage";


// const Logout = () => {
//     const navigation = useNavigation()

//     const out = () =>{
//       Alert.alert("Logout", "Are you sure you want to logout?", [
//         {
//           text: "Cancel",
//           onPress: () => console.log("Cancel Pressed"),
//           style: "cancel"
//         },
//         {
//           text: "OK",
//           onPress: () => {
//             AsyncStorage.removeItem("accessToken");
//             navigation.navigate("LoginWithPassword");
//           }
//         }
//       ]);

//         // AsyncStorage.removeItem()
//         //     navigation.navigate("Login")
//     }

//     return (
//         <TouchableOpacity onPress={()=>out()}>
//           <Ionicons
//             name="log-out-outline"
//             size={26}
//             color="white"
//             style={{ marginRight: 15 }}
//           />
//         </TouchableOpacity>
//     )
// }

// export default Logout


import { useNavigation } from '@react-navigation/native';
import { useDispatch,useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Alert, TouchableOpacity } from 'react-native';
import { clearAccessToken } from '../../Redux/Slice/authSlice'; // adjust path as needed


const Logout = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth); // Adjust the path to your auth slice

  const out = () => {
       Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          console.log({userData})
          await AsyncStorage.removeItem("userData");
          console.log("Logout pressed");
          // dispatch(clearAccessToken());  // <-- Clear Redux token
          navigation.navigate("LoginWithPassword");
        }
      }
    ]);
  };

  return (
    <TouchableOpacity onPress={()=>out()}>
      <Ionicons
        name="log-out-outline"
        size={26}
        color="white"
        style={{ marginRight: 15 }}
      />
    </TouchableOpacity>
  );
};

export default Logout
