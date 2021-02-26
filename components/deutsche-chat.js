import React, { Component } from "react";
import { Text, View } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import axios from "axios";
import * as FileSystem from "expo-file-system";

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
    t = this.state.template[this.state.currentId].time;
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
