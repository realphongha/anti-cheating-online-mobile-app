import React, {useState, useEffect, useContext} from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Button } from '../components/Button';
import Orientation from 'react-native-orientation';
import * as constants from '../utils/Constants';
import { UserApi } from '../api/UserApi';
import { showMessage } from "react-native-flash-message";
import AuthContext from '../context/AuthContext';

export default function ChangePasswordScreen({navigation}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const authContext = useContext(AuthContext);

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const onChangePassword = async () => {
    try {
      let res = await UserApi.editCurrentUser(
        authContext.token, null, 
        oldPassword, newPassword, confirmPassword, 
        null, null, null
      );
      showMessage({
        title: "Thành công",
        message: "Đổi mật khẩu thành công!",
        type: "info"
      });
      navigation.navigate("Profile");
    } catch (err) {
      console.log(err);
      if (err.response && (err.response.status === 400)) {
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
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mật khẩu cũ:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setOldPassword}
        value={oldPassword}
        placeholder="Nhập mật khẩu cũ..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Text style={styles.text}>Mật khẩu mới:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setNewPassword}
        value={newPassword}
        placeholder="Nhập mật khẩu mới..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Text style={styles.text}>Xác nhận mật khẩu:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        placeholder="Nhập lại mật khẩu mới..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Button
        title="Lưu"
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