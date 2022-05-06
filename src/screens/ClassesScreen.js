import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity
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

export default function ClassesScreen({ navigation }) {

  const [searchTerm, setSearchTerm] = useState("");
  const [focusId, setFocusId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isFocused = useIsFocused();  // to run useEffect() when go back

  useEffect(() => {
    if (isFocused) {
      navigation.setOptions({
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableWithoutFeedback onPress={() => goToProfile()}>
              <FontAwesomeIcon icon={faUser}
                style={styles.svgBtn} size={styles.svgBtnSize} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => onLogOut()}>
              <FontAwesomeIcon icon={faRightFromBracket}
                style={styles.svgBtn} size={styles.svgBtnSize} />
            </TouchableWithoutFeedback>
          </View>
        ),
        headerLeft: () => null,
        headerTitle: "Welcome, Diana!"
      });
      Orientation.lockToPortrait();
    }
  }, [isFocused]);

  const goToProfile = () => {
    navigation.navigate("Profile");
  }

  const onLogOut = () => {
    navigation.navigate("Log In");
  }

  const onNextPage = () => {
    console.log("next page");
  }

  const onPrevPage = () => {
    console.log("prev page");
  }

  const onJoinClass = () => {
    navigation.navigate("Exam");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bigText}>My Classes (5)</Text>
      <TextInput
        style={styles.search}
        onChangeText={setSearchTerm}
        value={searchTerm}
        placeholder="Type here to search..."
        placeholderTextColor={constants.gray}
      />
      <ScrollView style={styles.classes}>
        {[...Array(10)].map((x, i) => (
          <TouchableOpacity onPress={() => setFocusId(i)} key={i}>
            <View style={styles.classCard}>
              <View style={{
                flexDirection: "column",
                flex: 3,
              }}>
                <Text style={styles.fairlyBigText}>Class A</Text>
                <Text style={styles.text}>{toDDMMYYHHSS(new Date())}</Text>
                <Text style={styles.text}>{toDDMMYYHHSS(new Date())}</Text>
                {(i === focusId) &&
                  <Text style={styles.boldText}>Supervisor:</Text>
                }
                {(i === focusId) &&
                  <Text style={styles.text}>John Smith</Text>
                }
                {(i === focusId) &&
                  <Text style={styles.boldText}>Status:</Text>
                }
                {(i === focusId) &&
                  <Text style={styles.text}>Not started</Text>
                }
              </View>
              <View style={{
                flexDirection: "row",
                flex: 1,
                alignItems: "center"
              }}>
                <FontAwesomeIcon icon={faCircle} color={constants.green}
                  style={styles.svgBtn} size={styles.svgBtnSizeSmall} />
                <TouchableWithoutFeedback onPress={() => onJoinClass()}>
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
            style={styles.navigatorBtn} size={styles.svgBtnSize} />
        </TouchableOpacity>
        <Text style={styles.navigatorBtn}>Page {currentPage}</Text>
        <TouchableOpacity onPress={() => onNextPage()}>
          <FontAwesomeIcon icon={faAngleRight}
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
  }
});