# anti-cheating-online-mobile-app
Mobile application for anti cheating online system

# How to install
Run ```react-native start```  
Go to android/app/build.gradle and change to "enableHermes: true"  
Run ```react-native run-android```  
Go to android/app/build.gradle and change back to "enableHermes: false"  
Go to node_modules/react-native-vision-camera/android/build/third-party-ndk and rename "boost_1_63_0" to "boost" (to avoid a bug)  
Run ```react-native run-android``` again  