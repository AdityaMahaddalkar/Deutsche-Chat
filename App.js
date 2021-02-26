import { NavigationContainer, StackActions } from "@react-navigation/native";
import React from "react";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import { Header } from "react-native-elements";
import DeutscheChat from "./components/deutsche-chat";
import { createStackNavigator } from "@react-navigation/stack";
import { FAB, Headline } from "react-native-paper";
import { Avatar } from "react-native-paper";

function HomeScreen({ navigation }) {
  return (
    <View style={styles.view}>
      <Headline>Welcome to the FinnoBot</Headline>
      <Avatar.Image size={180} source={require("./assets/chatbot.jpg")} />

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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Home",
            headerStyle: {
              backgroundColor: "#45B39D",
            },
          }}
        ></Stack.Screen>
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
  view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  fab: {
    position: "absolute",
    backgroundColor: "#45B39D",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  image: {},
});
