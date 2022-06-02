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

export default function EditProfileScreen({navigation}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const authContext = useContext(AuthContext);

  useEffect(() => {
    setEmail(authContext.currentUser.email);
    setName(authContext.currentUser.name);
    setPhone(authContext.currentUser.phone);
    Orientation.lockToPortrait();
  }, []);

  const onSave = async () => {
    try {
      let res = await UserApi.editCurrentUser(
        authContext.token, email, null, null, null, 
        name, phone, null
      );
      if (res.data){
        authContext.setCurrentUser(res.data);
        showMessage({
          title: "Thành công",
          message: "Sửa thông tin thành công!",
          type: "info"
        });
        navigation.navigate("Profile");
      } else {
        showMessage({
          title: "Lỗi",
          message: "Sửa thông tin không thành công. Vui lòng thử lại!",
          type: "danger"
        });
      }
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
      <Text style={styles.text}>Email:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Nhập email..."
        placeholderTextColor={constants.gray}
        keyboardType="email-address"
        required
      />
      <Text style={styles.text}>Họ tên:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Nhập họ tên..."
        placeholderTextColor={constants.gray}
        required
      />
      <Text style={styles.text}>Số điện thoại:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPhone}
        value={phone}
        placeholder="Nhập số điện thoại..."
        placeholderTextColor={constants.gray}
        keyboardType="numeric"
        required
      />
      <Button
        title="Lưu"
        onPress={() => onSave()}
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