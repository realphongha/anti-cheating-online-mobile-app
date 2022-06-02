import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image
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
import AuthContext from '../context/AuthContext';
import { showMessage } from "react-native-flash-message";
import { UserApi } from '../api/UserApi';

export default function ProfileScreen({ navigation }) {
  const [avatar, setAvatar] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [changeAvatarBtn, setChangeAvatarBtn] = useState(false);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    Orientation.lockToPortrait();
    if (authContext.currentUser.avatar) {
      setAvatar(authContext.currentUser.avatar["$binary"].base64);
    }
  }, []);

  const onChangePassword = () => {
    navigation.navigate("Change Password");
  }

  const onEditProfile = () => {
    navigation.navigate("Edit Profile");
  }

  const onChangeAvatar = () => {
    setChangeAvatarBtn(!changeAvatarBtn);
  }

  const onSaveAvatar = async () => {
    try {
      let res = await UserApi.changeAvatar(authContext.token,
        newAvatar);
      if (res.data){
        authContext.setCurrentUser(res.data);
        showMessage({
          title: "Thành công",
          message: "Đổi ảnh đại diện thành công!",
          type: "info"
        });
        setNewAvatar(null);
        setChangeAvatarBtn(false);
        setAvatar(res.data.avatar["$binary"].base64);
      } else {
        showMessage({
          title: "Lỗi",
          message: "Đổi ảnh đại diện không thành công. Vui lòng thử lại!",
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

  const takePhoto = async () => {
    const result = await launchCamera({
      maxHeight: 640,
      maxWidth: 640,
      mediaType: "photo",
    });
    try {
      if (result.assets[0]) {
        setNewAvatar(result.assets[0]);
        console.log(newAvatar);
      }
    } catch (err) {
      console.log(err);
      showMessage({
        title: "Lỗi",
        message: "Không thể chọn ảnh!",
        type: "danger"
      });
    }
  }

  const takePhotoFromLib = async () => {
    const result = await launchImageLibrary({
      maxHeight: 640,
      maxWidth: 640,
      mediaType: "photo",
    });
    try {
      if (result.assets[0]) {
        setNewAvatar(result.assets[0]);
        console.log(newAvatar);
      }
    } catch (err) {
      console.log(err);
      showMessage({
        title: "Lỗi",
        message: "Không thể chọn ảnh!",
        type: "danger"
      });
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <TouchableWithoutFeedback onPress={() => onChangeAvatar()}>
          {
            newAvatar ?
              <Image
                source={{ uri: newAvatar.uri }}
                style={styles.avatar} />
              :
              (avatar ?
                <Image
                  source={{ uri: `data:image/jpeg;base64,${avatar}` }}
                  style={styles.avatar} />
                :
                <FontAwesomeIcon icon={faUser}
                  size={styles.avatarDefaultSize} />
              )
          }
        </TouchableWithoutFeedback>
      </View>
      {changeAvatarBtn &&
        <Text style={styles.text}>
          Đổi ảnh đại diện:
        </Text>
      }
      {changeAvatarBtn &&
        <View style={{ flexDirection: "row" }}>
          <Button
            title="Chụp ảnh"
            onPress={() => takePhoto()}
            style={styles.btnSmall}
            outerStyle={styles.btnOuter}
          />
          <Button
            title="Từ thư viện"
            onPress={() => takePhotoFromLib()}
            style={styles.btnSmall}
            outerStyle={styles.btnOuter}
          />
          {
          newAvatar&&
          <Button
            title="Lưu"
            onPress={() => onSaveAvatar()}
            style={styles.btnSmall}
            outerStyle={styles.btnOuter}
          />
          }
          <Button
            title=" X "
            onPress={() => {
              setChangeAvatarBtn(false);
              setNewAvatar(null);
            }}
            style={styles.btnSmallRed}
            outerStyle={styles.btnOuter}
          />
        </View>
      }
      <Text style={styles.bigText}>
        {authContext.currentUser.name}
      </Text>
      <Text style={styles.text}>
        {authContext.currentUser.email}
      </Text>
      <Text style={styles.text}>
        {authContext.currentUser.phone}
      </Text>

      <Button
        title="Đổi mật khẩu"
        onPress={() => onChangePassword()}
        style={styles.btn}
        outerStyle={styles.btnOuter}
      />
      <Button
        title="Sửa thông tin"
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
  avatar: {
    height: 150,
    width: 150,
    borderRadius: 150/2
  }
});