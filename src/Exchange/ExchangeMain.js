import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Dimensions, StyleSheet, View } from "react-native";

import ExchangeRequested from "./ExchangeRequested";
import AssignToCollect from "./AssignToCollect";
import Recompleted from "./Recompleted";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get("window");

export default function ExchangeMain() {
  const tabBarItemWidth = width / 3;

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Exchange Requested"
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarActiveTintColor: "#006700",
          tabBarInactiveTintColor: "#808080",
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: { width: tabBarItemWidth },
          tabBarIndicatorStyle: styles.indicator,
          tabBarStyle: styles.tabBar,
          lazy: true,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen
          name="Exchange Requested"
          component={ExchangeRequested}
          options={{ tabBarLabel: "Requested" }}
        />
        <Tab.Screen
          name="Assign To Collect"
          component={AssignToCollect}
          options={{ tabBarLabel: "Assigned" }}
        />
        <Tab.Screen
          name="Completed"
          component={Recompleted}
          options={{ tabBarLabel: "Completed" }}
        />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    paddingVertical: 8,
  },
  indicator: {
    backgroundColor: "#00cd00",
    height: 3,
  },
});
