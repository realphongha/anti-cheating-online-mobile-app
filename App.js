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

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Log In">
        <Stack.Screen name="Change Password" component={ChangePasswordScreen} />
        <Stack.Screen name="Classes" component={ClassesScreen} />
        <Stack.Screen name="Edit Profile" component={EditProfileScreen} />
        <Stack.Screen name="Log In" component={LoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Exam" component={ExamScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
