import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet
} from 'react-native';
import { Button } from '../components/Button';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import KeepAwake from 'react-native-keep-awake';
import * as constants from '../utils/Constants';
import { antiCheatingModels } from '../types/frameProcessorUtils';
import Orientation from 'react-native-orientation';
import { toHHMMSS } from '../utils/DateTime';

const HeaderRight = (props) => {
  var [currentTime, setCurrentTime] = useState(toHHMMSS(new Date()));

  useEffect(() => {
    let intervalId = setInterval(() =>
      setCurrentTime(toHHMMSS(new Date())),
      250
    );
    return () => {
      clearInterval(intervalId);
    }
  }, []);

  return (
    <Text style={styles.textHeaderRight}>
      Thời gian còn lại: {currentTime}
    </Text>
  )
}

export default function ExamScreen({ navigation }) {
  const [perm, setPerm] = useState(null);
  const [camPosition, setCamPosition] = useState("back");
  const devices = useCameraDevices();
  const cameraRef = useRef(null);
  const actionStr = {
    0: "Hand reach out",
    1: "Look down",
    2: "Look outside",
    3: "Sitting"
  }

  useEffect(() => {
    Orientation.lockToLandscapeLeft();
    navigation.setOptions({
      headerRight: () => <HeaderRight />,
      headerTransparent: true,
      headerBackground: () => <View style={{
        backgroundColor: constants.white,
        opacity: 0.2,
        flex: 1
      }} />
    });
    initCam();
  }, []);

  const initCam = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
    setPerm(newCameraPermission === "authorized");
    console.log("Device:", devices[camPosition]);
    if (devices[camPosition]) {
      console.log("Cam ID:", devices[camPosition].id);
    }
    console.log("Permission:", perm);
  };

  const onFlip = () => {
    setCamPosition(camPosition === "front" ? "back" : "front");
  };

  const requestEnd = () => {
    console.log("Request end");
  }

  const frameProcess = useFrameProcessor(async (frame) => {
    'worklet';
    let result = antiCheatingModels(frame);
    if (result.length == 6) {
      console.log("Action:");
      console.log(actionStr[result[4]], result[5][result[4]]);
    }
  }, [])

  return (
    <View style={styles.container}>
      <KeepAwake />
      {/* <OrientationLocker orientation={LANDSCAPE} /> */}
      {perm && devices[camPosition] && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={devices[camPosition]}
          isActive={true}
          photo={true}
          frameProcessor={frameProcess}
          frameProcessorFps={2}
        // preset="low"
        />
      )}
      {perm && devices[camPosition] && (
        <Button style={styles.btn} onPress={() => onFlip()} title="Flip" />
      )}
      <Button
        style={styles.btn}
        onPress={() => initCam()}
        title="Init Camera"
      />
      <Button
        style={styles.requestEndBtn}
        outerStyle={styles.requestEndBtnOuter}
        onPress={() => requestEnd()}
        title="Request End"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: constants.lightGray,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  camera: StyleSheet.absoluteFill,
  btn: {
    backgroundColor: constants.blue,
    color: constants.black,
    padding: 10,
    opacity: 0.8,
    width: 150,
    borderRadius: 10,
    textAlign: "center"
  },
  requestEndBtn: {
    backgroundColor: constants.red,
    color: constants.white,
    padding: 10,
    opacity: 0.8,
    width: 150,
    borderRadius: 10,
    textAlign: "center"
  },
  requestEndBtnOuter: {
    alignSelf: "flex-start"
  },
  text: {
    color: constants.black,
  },
  textHeaderRight: {
    paddingEnd: 10
  }
});
