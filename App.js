import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DeutscheChat from './components/deutsche-chat'

export default function App() {
  return (
    <View style={styles.container}>
    <DeutscheChat user={"kunal"}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
   borderTopWidth: 30,
   fontSize: 14
  },
});
