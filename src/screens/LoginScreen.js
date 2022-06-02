import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Button } from '../components/Button';
import Orientation from 'react-native-orientation';
import * as constants from '../utils/Constants';
import AuthContext from '../context/AuthContext';
import { UserApi } from '../api/UserApi';
import { showMessage } from "react-native-flash-message";
import * as Keychain from 'react-native-keychain';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    checkSavedAccount();
    Orientation.lockToPortrait();
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const checkSavedAccount = async () => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      await onLogin(credentials.username, credentials.password);
    }
    setIsLoading(false);
  }

  const onLogin = async (email, password) => {
    try {
      let res = await UserApi.login(email, password);
      // console.log(res);
      let data = res.data;
      let role = data.user.role;
      if (role === constants.USER_ROLE_STUDENT) {
        authContext.setToken(data.token);
        authContext.setCurrentUser(data.user);
        await Keychain.setGenericPassword(email, password);
        navigation.navigate("Classes");
      } else {
        showMessage({
          title: "Lỗi",
          message: "Vui lòng đăng nhập bằng tài khoản học sinh!",
          type: "danger"
        });
      }
    } catch (err) {
      console.log(err);
      if (err.response && (err.response.status === 400 || err.response.status === 401)) {
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

  const onRegister = () => {
    navigation.navigate("Register");
  }

  return (
    !isLoading?
    <View style={styles.container}>
      <Text style={styles.logoText}>
        Online Exam Anti-cheating
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Nhập email..."
        placeholderTextColor={constants.gray}
        keyboardType="email-address"
        required
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Nhập mật khẩu..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Button
        title="Đăng nhập"
        onPress={() => onLogin(email, password)}
        style={styles.btn}
        outerStyle={styles.btnOuter}
      />
      <Button
        title="Đăng ký"
        onPress={() => onRegister()}
        style={styles.btn}
        outerStyle={styles.btnOuter}
      />
    </View>
    :
    <View style={styles.container}></View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: constants.lightGray,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
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
    color: constants.black
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
  logoText: {
    color: constants.darkBlue,
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20
  },
});