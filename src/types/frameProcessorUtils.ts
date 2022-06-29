import type { Frame } from "react-native-vision-camera";
import "react-native-reanimated";

export function antiCheatingModels(frame: Frame, trackPerson: boolean, 
  trackLaptop: boolean, trackKeyboard: boolean, trackMouse: boolean): [] {
  'worklet'
  return __antiCheatingModels(frame, trackPerson, trackLaptop, trackKeyboard,
    trackMouse)
}