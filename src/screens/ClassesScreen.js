import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image
} from 'react-native';
import { Button } from '../components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {
  faRightFromBracket, faUser, faAngleLeft, faAngleRight, faCircle
} from "@fortawesome/free-solid-svg-icons";
import Orientation from 'react-native-orientation';
import * as constants from '../utils/Constants';
import { ScrollView } from 'react-native-gesture-handler';
import { toDDMMYYHHSS } from '../utils/DateTime';
import { useIsFocused } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import * as Keychain from 'react-native-keychain';
import { showMessage } from "react-native-flash-message";
import { ClassApi } from '../api/ClassApi';

export default function ClassesScreen({ navigation }) {

  const [searchTerm, setSearchTerm] = useState("");
  const [focusId, setFocusId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [classesPerPage, setClassesPerPage] = useState(4);
  const [countAll, setCountAll] = useState(0);
  const [loggedOut, setLoggedOut] = useState(false);
  const [classes, setClasses] = useState([]);
  const isFocused = useIsFocused();  // to run useEffect() when go back
  const authContext = useContext(AuthContext);
  const CLASS_DATE_STATUS = {
    0: "Chưa diễn ra",
    1: "Đang thi",
    2: "Thi xong"
  };
  const CLASS_DATE_STATUS_COLOR = {
    0: constants.gray,
    1: constants.green,
    2: constants.red,
  };

  useEffect(() => {
    setFocusId(null);
    if (isFocused) {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableWithoutFeedback onPress={() => goToProfile()}>
              {
              authContext.currentUser.avatar?
              <Image
                source={{ uri: `data:image/jpeg;base64,${authContext.currentUser.avatar["$binary"].base64}` }}
                style={styles.avatar} />
              :
              <FontAwesomeIcon icon={faUser}
                style={styles.svgBtn} size={styles.svgBtnSize} />
              }
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => onLogOut()}>
              <FontAwesomeIcon icon={faRightFromBracket}
                style={styles.svgBtn} size={styles.svgBtnSize} />
            </TouchableWithoutFeedback>
          </View>
        ),
        headerLeft: () => null,
        headerTitle: `Xin chào, ${authContext.currentUser.name}!`
      });
      Orientation.lockToPortrait();
    }
    if (!loggedOut){
      getListClasses();
    }
  }, [isFocused, currentPage, searchTerm]);

  const getListClasses = async () => {
    try {
      let res = await ClassApi.getList(authContext.token, currentPage, 
        classesPerPage, searchTerm);
      if (res.data) {
        setClasses(res.data.data);
        setCountAll(res.data.count);
        // console.log(classes);
      }
    } catch (err) {
      console.log(err);
      showMessage({
        title: "Lỗi",
        message: "Lỗi server",
        type: "danger"
      });
    }
  }

  const getStatus = (class_) => {
    let start = new Date(class_.start["$date"]);
    let end = class_.end?new Date(class_.end["$date"]):null;
    let now = new Date();
    let endTime = new Date(start.getTime() + class_.start*60000);
    if (now < start){
      return 0;
    } else if (now > endTime) {
      return 2;
    } else {
      return 1;
    }
  }

  const goToProfile = () => {
    navigation.navigate("Profile");
  }

  const onLogOut = async () => {
    setLoggedOut(true);
    await navigation.navigate("Log In");
    authContext.setToken(null);
    authContext.setCurrentUser(null);
    await Keychain.resetGenericPassword();
  }

  const onNextPage = () => {
    if (currentPage*classesPerPage < countAll) {
      setCurrentPage(currentPage+1);
    }
  }

  const onPrevPage = () => {
    if (currentPage > 1){
      setCurrentPage(currentPage-1);
    }
  }

  const onJoinClass = (class_) => {
    navigation.navigate("Exam", {
      classId: class_.id,
      settings: class_.settings
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>Lớp thi của tôi ({countAll})</Text>
      <TextInput
        style={styles.search}
        onChangeText={text => {
          setSearchTerm(text);
        }}
        value={searchTerm}
        placeholder="Nhập để tìm kiếm..."
        placeholderTextColor={constants.gray}
      />
      <ScrollView style={styles.classes}>
        {classes.map((class_, i) => (
          <TouchableOpacity onPress={() => setFocusId(i)} key={i}>
            <View style={styles.classCard}>
              <View style={{
                flexDirection: "column",
                flex: 3,
              }}>
                <Text style={styles.fairlyBigText}>{class_.name}</Text>
                <Text style={styles.text}>{toDDMMYYHHSS(new Date(class_.start["$date"]))}</Text>
                <Text style={styles.text}>{class_.end?toDDMMYYHHSS(new Date(class_.end["$date"])):"Chưa có"}</Text>
                {(i === focusId) &&
                  <Text style={styles.boldText}>Giám thị:</Text>
                }
                {(i === focusId) &&
                  <Text style={styles.text}>{class_.supervisor.name} ({class_.supervisor.email})</Text>
                }
                {(i === focusId) &&
                  <Text style={styles.boldText}>Trạng thái:</Text>
                }
                {(i === focusId) &&
                  <Text style={styles.text}>{CLASS_DATE_STATUS[getStatus(class_)]}</Text>
                }
              </View>
              <View style={{
                flexDirection: "row",
                flex: 1,
                alignItems: "center"
              }}>
                <FontAwesomeIcon icon={faCircle} 
                  color={CLASS_DATE_STATUS_COLOR[getStatus(class_)]}
                  style={styles.svgBtn} size={styles.svgBtnSizeSmall} />
                <TouchableWithoutFeedback onPress={() => onJoinClass(class_)}>
                  <FontAwesomeIcon icon={faAngleRight}
                    style={styles.svgBtn} size={styles.svgBtnSize} />
                </TouchableWithoutFeedback>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.navigator}>
        <TouchableOpacity onPress={() => onPrevPage()}>
          <FontAwesomeIcon icon={faAngleLeft}
            color={currentPage > 1?constants.black:constants.gray}
            style={styles.navigatorBtn} size={styles.svgBtnSize} />
        </TouchableOpacity>
        <Text style={styles.navigatorBtn}>Trang {currentPage} trên {Math.ceil(countAll/classesPerPage)}</Text>
        <TouchableOpacity onPress={() => onNextPage()}>
          <FontAwesomeIcon icon={faAngleRight}
            color={currentPage*classesPerPage < countAll?constants.black:constants.gray}
            style={styles.navigatorBtn} size={styles.svgBtnSize} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: constants.lightGray,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  btn: {
    backgroundColor: constants.darkBlue,
    color: constants.white,
    padding: 10,
    opacity: 0.8,
    width: 100,
    borderRadius: 10,
    textAlign: "center"
  },
  btnOuter: {
    padding: 5
  },
  text: {
    color: constants.black,
  },
  boldText: {
    color: constants.black,
    fontWeight: "bold",
  },
  fairlyBigText: {
    color: constants.black,
    fontSize: 15,
    fontWeight: "bold"
  },
  bigText: {
    color: constants.black,
    margin: 10,
    fontSize: 20,
    fontWeight: "bold"
  },
  classes: {
    flexDirection: "column",
    alignSelf: "stretch",
    backgroundColor: constants.slightGray,
    padding: 10,
    flex: 1,
    margin: 10,
    borderRadius: 10
  },
  headerRight: {
    flexDirection: 'row',
    padding: 10,
  },
  svgBtn: {
    margin: 10,
  },
  svgBtnSize: 25,
  svgBtnSizeSmall: 15,
  search: {
    color: constants.black,
    backgroundColor: constants.white,
    borderColor: constants.gray,
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignSelf: "stretch"
  },
  navigator: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-between",
  },
  navigatorBtn: {
    flex: 1,
    textAlign: "center",
    alignSelf: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  classCard: {
    flexDirection: "row",
    backgroundColor: constants.blue,
    alignSelf: "stretch",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 25/2,
    margin: 10
  }
});