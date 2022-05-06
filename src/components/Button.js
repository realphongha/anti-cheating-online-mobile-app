import React from 'react';
import {
  Text
} from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";

export function Button(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress || (() => {console.log("Pressed button!")})}
      style={props.outerStyle || {}}>
      <Text
        style={props.style || {}}
      >
        {props.title || "Button"}
      </Text>
    </TouchableOpacity>
  )
}