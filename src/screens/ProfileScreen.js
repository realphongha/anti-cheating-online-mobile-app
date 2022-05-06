import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Button } from '../components/Button';
import Orientation from 'react-native-orientation';
import * as constants from '../utils/Constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {
  faUser
} from "@fortawesome/free-solid-svg-icons";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default function ProfileScreen({ navigation }) {
  const [avatar, setAvatar] = useState(null);
  const [changeAvatarBtn, setChangeAvatarBtn] = useState(false);

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  const onChangePassword = () => {
    navigation.navigate("Change Password");
  }

  const onEditProfile = () => {
    navigation.navigate("Edit Profile");
  }

  const onChangeAvatar = () => {
    setChangeAvatarBtn(true);
  }

  const takePhoto = async () => {
    const result = await launchCamera({
      maxHeight: 640,
      maxWidth: 640,
      mediaType: "photo",
    });
    console.log(result);
  }

  const takePhotoFromLib = async () => {
    const result = await launchImageLibrary({
      maxHeight: 640,
      maxWidth: 640,
      mediaType: "photo",
    });
    console.log(result);
  }

  return (
    <View style={styles.container}>
      <View>
        <TouchableWithoutFeedback onPress={() => onChangeAvatar()}>
          {avatar ?
            <FontAwesomeIcon icon={faUser}
              size={styles.avatarDefaultSize} />
            :
            <FontAwesomeIcon icon={faUser}
              size={styles.avatarDefaultSize} />
          }
        </TouchableWithoutFeedback>
      </View>
      {changeAvatarBtn &&
      <Text style={styles.text}>
        Change your avatar:
      </Text>
      }
      {changeAvatarBtn &&
        <View style={{flexDirection: "row"}}>
          <Button
            title="Take a photo"
            onPress={() => takePhoto()}
            style={styles.btnSmall}
            outerStyle={styles.btnOuter}
          />
          <Button
            title="From libary"
            onPress={() => takePhotoFromLib()}
            style={styles.btnSmall}
            outerStyle={styles.btnOuter}
          />
          <Button
            title=" X "
            onPress={() => setChangeAvatarBtn(false)}
            style={styles.btnSmallRed}
            outerStyle={styles.btnOuter}
          />
        </View>
      }
      <Text style={styles.bigText}>
        Diana Kyle
      </Text>
      <Text style={styles.text}>
        diana1@example.com
      </Text>
      <Text style={styles.text}>
        0976574346
      </Text>

      <Button
        title="Change password"
        onPress={() => onChangePassword()}
        style={styles.btn}
        outerStyle={styles.btnOuter}
      />
      <Button
        title="Edit profile"
        onPress={() => onEditProfile()}
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
    width: 150,
    borderRadius: 10,
    textAlign: "center"
  },
  btnSmall: {
    backgroundColor: constants.darkBlue,
    color: constants.white,
    padding: 5,
    opacity: 0.8,
    borderRadius: 10,
    textAlign: "center"
  },
  btnSmallRed: {
    backgroundColor: constants.red,
    color: constants.black,
    padding: 5,
    opacity: 0.8,
    borderRadius: 10,
    textAlign: "center"
  },
  btnOuter: {
    padding: 5,
  },
  text: {
    color: constants.black,
    fontSize: 20,
    margin: 10
  },
  bigText: {
    color: constants.black,
    fontSize: 30,
    margin: 20
  },
  avatarDefaultSize: 150,
});