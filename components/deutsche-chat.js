import React, { Component } from "react";
import { Text, View } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import axios from "axios";

const baseAudioPostURL = "https://stof-backend-nbrcoenmvq-de.a.run.app/audio";

export default class DeutscheChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: null,
      currentId: 0,
      outputToggler: false,
      formOutput: [],
      data: "",
      template: [
        {
          id: "1",
          label: "Name",
          time: 5,
        },
        {
          id: "2",
          label: "Address",
          time: 10,
        },
      ],
    };
  }

  startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: ".mp3",
          numberOfChannels: 1,
          sampleRate: 44100,
        },
        ios: {
          extension: ".mp3",
          sampleRate: 44100,
          numberOfChannels: 1,
        },
      });
      await recording.startAsync();
      this.setState({ recording: recording });
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  stopRecording = async () => {
    console.log("Stopping recording..");
    await this.state.recording.stopAndUnloadAsync();
    const uri = this.state.recording.getURI();
    console.log("Recording stopped and stored at", uri);
    const response = await fetch(uri);
    const blob = await response.blob();
    console.log(`Blob : ${JSON.stringify(blob)}`);
    console.log(`Type of blob: ${typeof blob}`);
    var fd = new FormData();
    fd.append("audio", blob, "audio.mp3");

    const health = await axios
      .get(baseAudioPostURL + "/health")
      .then((response) => {
        console.log(`Health status : ${JSON.stringify(response)}`);
      });
    var request = new XMLHttpRequest();
    request.open("POST", baseAudioPostURL);
    request.send(fd);
    return;
  };

  promptLabel = () => {
    //  prompt label with current id
    let label = this.state.template[this.state.currentId].label;
    if (label) {
      Speech.speak(label);
    }
  };

  gcpSTOT = () => {
    return "Something";
  };

  getUserInput = () => {
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
    this.startRecording();
    setTimeout(() => {
      this.stopRecording().then((promise) => {
        if (this.state.template[holder]) {
          this.setState({ currentId: holder });
        } else {
          console.log(this.state.formOutput);
        }
      });
    }, t * 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentId != this.state.currentId) {
      this.processSingleFormInput();
    }
  }

  render() {
    return (
      <View>
        <Text>{this.state.template[this.state.currentId].label}</Text>
      </View>
    );
  }
}
