import { NavigationContainer, StackActions } from "@react-navigation/native";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Header } from "react-native-elements";
import DeutscheChat from "./components/deutsche-chat";
import { createStackNavigator } from "@react-navigation/stack";
import { FAB, Headline } from "react-native-paper";

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Headline>Welcome to the Form Bot</Headline>
      <FAB
        style={styles.fab}
        label="Continue to Form"
        onPress={() => navigation.navigate("Form")}
      ></FAB>
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen}></Stack.Screen>
        <Stack.Screen name="Form" component={DeutscheChat}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 30,
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
