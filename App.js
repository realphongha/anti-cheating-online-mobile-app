import React from 'react';
import * as constants from './src/utils/Constants';
import {StyleSheet, Text, View, Button} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import ClassesScreen from './src/screens/ClassesScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ExamScreen from './src/screens/ExamScreen';
import AuthContext from './src/context/AuthContext';
import FlashMessage from "react-native-flash-message";

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState(null);
  const authContext = {
    token: token,
    setToken: setToken,
    currentUser: currentUser,
    setCurrentUser: setCurrentUser
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Log In">
          <Stack.Screen name="Change Password" 
            component={ChangePasswordScreen}
            options={{ title: 'Đổi mật khẩu' }} />
          <Stack.Screen name="Classes" 
            component={ClassesScreen} />
          <Stack.Screen name="Edit Profile" 
            component={EditProfileScreen}
            options={{ title: 'Sửa thông tin cá nhân' }} />
          <Stack.Screen name="Log In" 
            component={LoginScreen} />
          <Stack.Screen name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Thông tin cá nhân' }} />
          <Stack.Screen name="Register" 
            component={RegisterScreen}
            options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="Exam" 
            component={ExamScreen}
            options={{ title: 'Lớp thi' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <FlashMessage position="top" />
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: constants.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
