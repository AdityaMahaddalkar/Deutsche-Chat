import React, { Component, useCallback, useEffect } from "react";
import { Text, View } from "react-native";
import * as Speech from "expo-speech";

export default class DeutscheChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentId: 0,
      outputToggler: false,
      formOutput: [],
      data: "",
      template: [
        {
          id: "1",
          label: "Name",
          time: 10,
        },
        {
          id: "2",
          label: "Address",
          time: 20,
        },
      ],
    };
  }

  promptLabel = () => {
    //  prompt label with current id
    let label = this.state.template[this.state.currentId].label;
    if (label) {
      Speech.speak(label);
    }
  };

  gcpSTOT = (mp3) => {
    return "Something";
  };

  getUserInput = (time) => {
    //   take input from user for time t sec
    data = this.gcpSTOT("mp3");
    let holder = this.state.formOutput;
    holder.push({
      label: this.state.template[this.state.currentId].label,
      value: data,
    });
    this.setState({ formOutput: holder });
  };

  componentDidMount() {
    this.processSingleFormInput();
  }

  processSingleFormInput() {
    this.promptLabel();
    t = this.state.template[this.state.currentId].time;
    this.getUserInput(t);
    let holder = this.state.currentId + 1;
    if (this.state.template[holder]) {
      setTimeout(
        () =>
          this.setState({
            currentId: holder,
          }),
        5000
      );
    } else {
      console.log(this.state.formOutput);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentId != this.state.currentId) {
      this.processSingleFormInput();
    }
  }

  render() {
    const steps = this.state.steps;
    return (
      <View>
        <Text>{this.state.template[this.state.currentId].label}</Text>
      </View>
    );
  }
}
