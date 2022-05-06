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

export default function EditProfileScreen({navigation}) {
  const [email, setEmail] = useState("diana1@example.com");
  const [name, setName] = useState("Diana Kyle");
  const [phone, setPhone] = useState("0976574346");

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const onSave = () => {
    console.log("save profile");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Email:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Enter email..."
        placeholderTextColor={constants.gray}
        keyboardType="email-address"
        required
      />
      <Text style={styles.text}>Full name:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Enter your full name..."
        placeholderTextColor={constants.gray}
        required
      />
      <Text style={styles.text}>Phone number:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPhone}
        value={phone}
        placeholder="Enter phone number..."
        placeholderTextColor={constants.gray}
        keyboardType="numeric"
        required
      />
      <Button
        title="Save"
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