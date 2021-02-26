import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Chip } from "react-native-paper";
import { color } from "react-native-reanimated";
import { baseurls } from "../utils/BaseURLs";
import * as LocalAuthentication from "expo-local-authentication";

const baseAudioPostURL = baseurls.AUDIO_POST_URL;
const formTemplateGetURL = baseurls.FORM_TEMPLATE_GET_URL;
const formStoragePostURL = baseurls.FORM_STORAGE_POST_URL;

const AUTH_TOKEN =
  "94d002c0eae883c64d57e67d32a3c39553b7431051d3a3f8c8f230f9415c4f3e";

axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

const styles = StyleSheet.create({
  chipLeft: {
    width: "90%",
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#45B39D",
    color: "#F7F9F9",
    height: 50,
    textDecorationColor: "#F7F9F9",
    alignContent: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  chipRight: {
    width: "90%",
    marginRight: 10,
    marginTop: 40,
    height: 50,
    alignContent: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  viewLeft: {
    width: "50%",
  },
  viewRight: {
    width: "50%",
  },
  text: {
    marginTop: 10,
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
      template: [],
      fingerPrint: false,
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

    const promise = await axios
      .post(baseAudioPostURL, fd)
      .then((response) => {
        console.log(`Response from POST : ${JSON.stringify(response)}`);
        if (response.status === 200 && response.data.transcript) {
          let transcript = response.data.transcript;
          let holder = this.state.formOutput;
          holder.push({
            id: this.state.template[this.state.currentId].id,
            label: this.state.template[this.state.currentId].label,
            value: transcript,
          });
        } else {
          let holder = this.state.formOutput;
          holder.push({
            id: this.state.template[this.state.currentId].id,
            label: this.state.template[this.state.currentId].label,
            value: "NA",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        let holder = this.state.formOutput;
        holder.push({
          id: this.state.template[this.state.currentId].id,
          label: this.state.template[this.state.currentId].label,
          value: "NA",
        });
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
    // fill in the template
    console.log(`Component did mount called`);
    axios
      .get(formTemplateGetURL)
      .then((response) => {
        if (response.status === 200) {
          console.log(`Received data from form template : ${response.data}`);
          this.setState({ template: response.data.values });
        }
      })
      .catch((err) => {
        console.error(err);
      });

    // this.processSingleFormInput();
  }

  processSingleFormInput() {
    this.promptLabel();
    this.wait(1000);
    if (this.state.template[this.state.currentId]) {
      let t = this.state.template[this.state.currentId].time || 10;
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
    if (
      prevState.currentId !== this.state.currentId ||
      prevState.template !== this.state.template
    ) {
      this.processSingleFormInput();
    }

    if (
      prevState.formComplete != this.state.formComplete &&
      this.state.formComplete
    ) {
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
      this.wait(1000);

      let correctPrompt =
        "is this information correct? Press on fingerprint to confirm";
      Speech.speak(correctPrompt);
      this.wait(2000);

      this.onAuthentication().then(() => {
        if (this.state.fingerPrint) {
          let authenticated = "Form submitted";
          Speech.speak(authenticated);
          let values = {
            values: this.state.formOutput,
          };
          axios.post(baseurls.FORM_STORAGE_POST_URL, JSON.stringify(values));
        }
      });
    }
  }

  async onAuthentication() {
    const hasHadware = await LocalAuthentication.hasHardwareAsync();
    if (hasHadware) {
      const typeAuthentication = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (typeAuthentication.includes(1)) {
        const enrollment = await LocalAuthentication.isEnrolledAsync();
        if (enrollment) {
          const authenticate = await LocalAuthentication.authenticateAsync();
          if (authenticate.success) this.setState({ fingerPrint: true });
        }
      }
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
          {this.state.template.length > 0
            ? this.state.template.map((value, index) => {
                if (index <= this.state.currentId) {
                  return (
                    <Chip
                      key={index}
                      style={styles.chipLeft}
                      textStyle={{
                        color: "#fff",
                        fontSize: 24,
                      }}
                    >
                      <Text style={styles.text}>{value.label}</Text>
                    </Chip>
                  );
                }
              })
            : null}
        </View>
        <View style={styles.viewRight}>
          {this.state.formOutput.map((value, index) => {
            if (value) {
              return (
                <Chip
                  key={index}
                  style={styles.chipRight}
                  textStyle={{
                    fontSize: 24,
                  }}
                >
                  <Text style={styles.text}>{value.value}</Text>
                </Chip>
              );
            }
          })}
        </View>
      </View>
    );
  }
}
