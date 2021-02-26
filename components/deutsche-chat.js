import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Chip } from "react-native-paper";
import { color } from "react-native-reanimated";

const baseAudioPostURL = "https://stof-backend-nbrcoenmvq-de.a.run.app/audio";

const styles = StyleSheet.create({
  chipLeft: {
    width: "100%",
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#45B39D",
    color: "#F7F9F9",
    fontSize: 14,
    textDecorationColor: "#F7F9F9",
  },
  chipRight: {
    width: "100%",
    marginRight: 10,
    marginTop: 40,
    fontSize: 14,
  },
  viewLeft: {
    width: "50%",
  },
  viewRight: {
    width: "50%",
  },
});

export default class DeutscheChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: null,
      currentId: 0,
      outputToggler: false,
      formOutput: [],
      formComplete: false,
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
          time: 5,
        },
        {
          id: "3",
          label: "Phone",
          time: 5,
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
          extension: ".m4a",
          numberOfChannels: 1,
          sampleRate: 44100,
        },
        ios: {
          extension: ".m4a",
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

    const info = await FileSystem.getInfoAsync(this.state.recording.getURI());
    const uri = info.uri;
    console.log(`URI from FileSys info : ${uri}`);

    var fd = new FormData();
    fd.append("audio", {
      uri,
      type: "audio/m4a",
      name: "s2t",
    });

    const health = await axios
      .get(baseAudioPostURL + "/health")
      .then((response) => {
        console.log(`Health status : ${JSON.stringify(response)}`);
      });

    const promise = await axios
      .post(baseAudioPostURL, fd)
      .then((response) => {
        console.log(`Response from POST : ${JSON.stringify(response)}`);
        if (response.data.transcript) {
          let transcript = response.data.transcript;
          let holder = this.state.formOutput;
          holder.push({
            id: this.state.template[this.state.currentId].id,
            label: this.state.template[this.state.currentId].label,
            value: transcript,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  wait(ms) {
    var start = Date.now(),
      now = start;
    while (now - start < ms) {
      now = Date.now();
    }
  }

  promptLabel = () => {
    //  prompt label with current id
    let label = this.state.template[this.state.currentId].label;
    if (label) {
      Speech.speak(label);
    }
  };

  componentDidMount() {
    this.processSingleFormInput();
  }

  processSingleFormInput() {
    this.promptLabel();
    this.wait(1000);
    if (this.state.template[this.state.currentId]) {
      t = this.state.template[this.state.currentId].time;
      let holder = this.state.currentId + 1;
      this.startRecording();
      setTimeout(() => {
        this.stopRecording().then((promise) => {
          if (this.state.template[holder]) {
            this.setState({ currentId: holder });
          } else {
            console.log(this.state.formOutput);
            this.setState({ formComplete: true });
          }
        });
      }, t * 1000);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentId != this.state.currentId) {
      this.processSingleFormInput();
    }

    if (this.state.formComplete) {
      console.log("Form complete");
      let reiteration = "I'll be re iterating the form now";
      Speech.speak(reiteration);
      this.wait(1000);
      this.state.formOutput.map((value) => {
        Speech.speak(value.label);
        this.wait(1000);
        Speech.speak(value.value);
        this.wait(1000);
      });

      let correctPrompt = "is this information correct?";
      Speech.speak(correctPrompt);
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignSelf: "stretch",
          justifyContent: "space-between",
          alignContent: "space-between",
        }}
      >
        <View style={styles.viewLeft}>
          {this.state.template.map((value, index) => {
            if (index <= this.state.currentId) {
              return (
                <Chip key={index} style={styles.chipLeft}>
                  {value.label}
                </Chip>
              );
            }
          })}
        </View>
        <View style={styles.viewRight}>
          {this.state.formOutput.map((value, index) => {
            if (value) {
              return (
                <Chip key={index} style={styles.chipRight}>
                  {value.value}
                </Chip>
              );
            }
          })}
        </View>
      </View>
    );
  }
}
