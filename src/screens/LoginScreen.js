import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Button } from '../components/Button';
import Orientation from 'react-native-orientation';
import * as constants from '../utils/Constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    Orientation.lockToPortrait();
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const onLogin = () => {
    navigation.navigate("Classes");
  }

  const onRegister = () => {
    navigation.navigate("Register");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>
        Online Exam Anti-cheating
      </Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Enter email..."
        placeholderTextColor={constants.gray}
        keyboardType="email-address"
        required
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Enter password..."
        placeholderTextColor={constants.gray}
        secureTextEntry={true}
        required
      />
      <Button
        title="Log in"
        onPress={() => onLogin()}
        style={styles.btn}
        outerStyle={styles.btnOuter}
      />
      <Button
        title="Register"
        onPress={() => onRegister()}
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