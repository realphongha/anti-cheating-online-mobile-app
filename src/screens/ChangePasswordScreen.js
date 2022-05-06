import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Button } from '../components/Button';
import Orientation from 'react-native-orientation';
import * as constants from '../utils/Constants';

export default function ChangePasswordScreen({navigation}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const onChangePassword = () => {
    console.log("change password");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Old password:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setOldPassword}
        value={oldPassword}
        placeholder="Enter old password..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Text style={styles.text}>New password:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setNewPassword}
        value={newPassword}
        placeholder="Enter new password..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Text style={styles.text}>Confirm password:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        placeholder="Enter new password again..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Button
        title="Save"
        onPress={() => onChangePassword()}
        style={styles.btn}
        outerStyle={styles.btnOuter}
      />
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
    padding: 20
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
    padding: 5,
    paddingTop: 10
  },
  text: {
    color: constants.black,
    paddingLeft: 5,
    paddingTop: 10
  },
  input: {
    color: constants.black,
    borderColor: constants.gray,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    width: 200,
    margin: 5
  },
});