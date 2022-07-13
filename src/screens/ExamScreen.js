import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { msecToHHMMSS } from '../utils/DateTime';
import AuthContext from '../context/AuthContext';
import { ClassApi } from '../api/ClassApi';
import { io } from "socket.io-client";
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { showMessage } from "react-native-flash-message";

const HeaderRight = (props) => {
  const [remainingTimeStart, setRemainingTimeStart] = useState(null);
  const [remainingTimeEnd, setRemainingTimeEnd] = useState(null);

  useEffect(() => {
    if (!props.start || !props.last || !props.timeStatus) return;
    if (props.timeStatus === "not_started") {
      let intervalUpdateTimeStart = setInterval(() => {
        let diff = props.start - new Date();
        if (diff < 0) {
          props.setTimeStatus("in_progress");
          clearInterval(intervalUpdateTimeStart);
          return;
        }
        setRemainingTimeStart(msecToHHMMSS(diff));
      },
        250
      );
      return () => {
        clearInterval(intervalUpdateTimeStart);
      }
    } else if (props.timeStatus === "in_progress") {
      let intervalUpdateTimeEnd = setInterval(() => {
        let diff = new Date(props.start.getTime() + props.last * 60000) - new Date();
        if (diff < 0) {
          props.setTimeStatus("ended");
          clearInterval(intervalUpdateTimeEnd);
          return;
        }
        setRemainingTimeEnd(msecToHHMMSS(diff));
      },
        250
      );
      return () => {
        clearInterval(intervalUpdateTimeEnd);
      }
    }
  }, [props.timeStatus, props.start, props.last]);

  return (
    <Text style={styles.textHeaderRight}>
      {
        props.timeStatus === "in_progress" ?
          `Thời gian còn lại: ${remainingTimeEnd}` :
          (
            props.timeStatus === "not_started" ?
              `Lớp thi bắt đầu trong: ${remainingTimeStart}` :
              (
                props.timeStatus == "ended" ?
                  "Lớp thi đã kết thúc" :
                  "Đang chờ thông tin từ giám thị..."
              )
          )
      }
    </Text>
  )
}

export default function ExamScreen({ navigation, route }) {
  const [perm, setPerm] = useState(null);
  const [camPosition, setCamPosition] = useState("back");
  const [classId, setClassId] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [start, setStart] = useState(null);
  const [last, setLast] = useState(null);
  const [timeStatus, setTimeStatus] = useState(null);
  var image = useRef(null);
  var lastCheatingNote = useRef(null);
  var lastCheatingTime = useRef(null);
  var cheatingType = useRef(null);
  var cheatingNote = useRef(null);
  var continuosCount = useRef(0);
  const [socketio, setSocketio] = useState(null);
  var supervisorSid = useRef(null);
  const devices = useCameraDevices();
  const cameraRef = useRef(null);
  const trackPerson = useSharedValue(route.params.settings.track_person);
  const trackLaptop = useSharedValue(route.params.settings.track_laptop);
  const trackKeyboard = useSharedValue(route.params.settings.track_keyboard);
  const trackMouse = useSharedValue(route.params.settings.track_mouse);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight timeStatus={timeStatus}
        setTimeStatus={setTimeStatus}
        start={start}
        last={last} />,
      headerTransparent: true,
      headerBackground: () => <View style={{
        backgroundColor: constants.white,
        opacity: 0.2,
        flex: 1
      }} />
    });
  }, [timeStatus, start, last]);

  useEffect(() => {
    Orientation.lockToLandscapeLeft();
    setClassId(route.params.classId);
    getData(route.params.classId);
    initCam();
  }, []);

  useEffect(() => {
    if (timeStatus !== "in_progress") return;
    const socket = io(constants.backend, {
      extraHeaders: {
        "x-access-token": authContext.token
      }
    });
    console.log(socket);
    setSocketio(socket);
  }, [timeStatus]);

  useEffect(() => {
    if (timeStatus !== "in_progress") return;
    if (!socketio) return;
    socketio.on("connect", () => {
      console.log("connected");
    });
    socketio.on("broadcast_supervisor_sid", (data) => {
      // console.log(data);
      supervisorSid.current = data.supervisor_sid;
    });
    socketio.on("handle_end_request", (data) => {
      console.log(data, supervisorSid.current);
      if (data.sid === supervisorSid.current && data.type === "reply") {
        if (data.accept) {
          showMessage({
            title: "Chấp nhận",
            message: "Giám thị đã đồng ý yêu cầu kết thúc! Đang thoát khỏi phòng thi...",
            type: "info"
          });
          navigation.goBack();
        } else {
          showMessage({
            title: "Từ chối",
            message: "Giám thị đã từ chối yêu cầu kết thúc!",
            type: "danger"
          });
        }
      }
    });
    socketio.on("handle_end_exam", (data) => {
      console.log("ended", data.ended);
      setTimeStatus("ended");
    })
    socketio.connect();
    socketio.emit("join", {
      class_id: (classId ? classId : route.params.classId)
    });
    let sendImageId = setInterval(() => sendImage(), 
      constants.INTERVAL_SEND_REGULAR_IMAGE);
    let sendCheatingImageId = setInterval(() => sendCheatingImage(), 
      constants.INTERVAL_SEND_CHEATING_IMAGE);
    return () => {
      socketio.removeAllListeners();
      socketio.disconnect();
      clearInterval(sendImageId);
      clearInterval(sendCheatingImageId);
    }
  }, [socketio, timeStatus]);

  useEffect(() => {
    if (timeStatus === "ended" && socketio) {
      socketio.removeAllListeners();
      socketio.disconnect();
    }
  }, [timeStatus])

  const getData = async (classId) => {
    try {
      let res = await ClassApi.getOne(authContext.token, classId);
      if (res.data) {
        setCurrentClass(res.data);
        let start_ = new Date(res.data.start.$date);
        setStart(start_);
        let end = res.data.end ? new Date(res.data.end.$date) : null;
        let last_ = res.data.last;
        setLast(last_);
        let now = new Date();
        let endTime = new Date(start_.getTime() + last_*60000);
        if (now < start_) {
          setTimeStatus("not_started");
        } else if (now > endTime) {
          setTimeStatus("ended");
        } else {
          setTimeStatus("in_progress");
        }
      } else {
        showMessage({
          title: "Lỗi",
          message: "Không thể lấy thông tin lớp!",
          type: "danger"
        });
        navigation.goBack();
      }
    } catch (err) {
      console.log(err);
      if (err.response && (err.response.status === 404)) {
        showMessage({
          title: "Lỗi",
          message: err.response.data.message,
          type: "danger"
        });
        console.log(err.response.data.message);
      } else {
        showMessage({
          title: "Lỗi",
          message: "Lỗi server",
          type: "danger"
        });
        console.log("Internal error");
      }
      navigation.goBack();
    }
  }

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
    if (socketio) {
      socketio.emit("handle_end_request", {
        class_id: classId,
        type: "request"
      })
    } else {
      showMessage({
        title: "Lỗi",
        message: "Chưa kết nối được với server thi",
        type: "danger"
      });
    }
  }

  const sendImage = () => {
    if (!image.current) {
      console.log("no image");
      return;
    }
    socketio.emit("handle_image", {
      class_id: classId,
      image: image.current,
      supervisor_sid: supervisorSid.current
    });
  }

  const sendCheatingImage = () => {
    if (!image.current && !cheatingType.current && !cheatingNote.current) {
      return;
    }
    if (continuosCount.current !== constants.SUPERVISING_PATIENCE[cheatingType.current]) {
      return;
    }
    if (cheatingNote.current != lastCheatingNote.current &&
      (lastCheatingTime.current ? new Date() - lastCheatingTime.current > constants.MIN_SEND_CHEATING_IMG_TIMEOUT : true)) {
      lastCheatingNote.current = cheatingNote.current;
      lastCheatingTime.current = new Date();
      socketio.emit("handle_cheating_image", {
        class_id: classId,
        image: image.current ? image.current : null,
        supervisor_sid: supervisorSid.current,
        type: cheatingType.current,
        note: cheatingNote.current
      });
    }
  }

  const setImage = (newImage) => {
    image.current = newImage;
  }

  const setCheating = (newCheatingType, newCheatingNote) => {
    if (cheatingType.current === newCheatingType &&
      cheatingNote.current === newCheatingNote) {
      continuosCount.current += 1;
    } else {
      cheatingType.current = newCheatingType;
      cheatingNote.current = newCheatingNote;
      continuosCount.current = 1;
    }
  }

  const frameProcess = useFrameProcessor(async (frame) => {
    'worklet';
    let result = antiCheatingModels(frame, 
      trackPerson.value, trackLaptop.value,
      trackKeyboard.value, trackMouse.value);
    // console.log(result[0]);
    // console.log(result[2]);
    if (result[1]) {
      runOnJS(setImage)(result[1]);
    }
    console.log("Result", result[0], result[2]);
    if (result[0] === constants.CHEATING_PERSONS) {
      let note = (result[2] > 1) ? "Xuất hiện nhiều người" : "Không phát hiện người"
      console.log("Note", note);
      runOnJS(setCheating)(constants.CHEATING_PERSONS, note);
    } else if (result[0] === constants.CHEATING_LAPTOP) {
      let note = "Chạm vào laptop";
      console.log("Note", note);
      runOnJS(setCheating)(constants.CHEATING_LAPTOP, note);
    } else if (result[0] === constants.CHEATING_KEYBOARD) {
      let note = "Chạm vào bàn phím";
      console.log("Note", note);
      runOnJS(setCheating)(constants.CHEATING_KEYBOARD, note);
    } else if (result[0] === constants.CHEATING_MOUSE) {
      let note = "Chạm vào chuột máy tính";
      console.log("Note", note);
      runOnJS(setCheating)(constants.CHEATING_MOUSE, note);
    } else if (result[0] === constants.CHEATING_WRONG_POSE) {
      let action = result[2];
      let note = constants.ACTION_MAPPING[action];
      console.log("Note", note);
      runOnJS(setCheating)(constants.CHEATING_WRONG_POSE, note);
    } else if (result[0] === constants.NO_CHEATING) {
      console.log("Note", "Không gian lận!");
    } else {
      console.log("Note", "Exception happened!");
    }
  }, [])

  return (
    <View style={styles.container}>
      <KeepAwake />
      {perm && devices[camPosition] && currentClass && classId && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={devices[camPosition]}
          isActive={true}
          photo={false}
          frameProcessor={frameProcess}
          frameProcessorFps={2}
          fps={20}
        // preset="low"
        />
      )}
      {perm && devices[camPosition] && (
        <Button style={styles.btn} onPress={() => onFlip()} title="Lật Camera" />
      )}
      <Button
        style={styles.btn}
        onPress={() => initCam()}
        title="Khởi động Camera"
      />
      <Button
        style={styles.requestEndBtn}
        outerStyle={styles.requestEndBtnOuter}
        onPress={() => requestEnd()}
        title="Yêu cầu dừng thi"
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
