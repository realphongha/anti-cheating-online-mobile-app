# anti-cheating-online-mobile-app
React Native mobile application for anti cheating online system with deep learning computer vision models running directly on devices.  
Our anti-cheating system for online exams developed with microservice architecture includes this mobile application, [a React.JS web application for supervisors](https://github.com/realphongha/anti-cheating-online-web-app) and a backend server written in Flask that can be found [here](https://github.com/realphongha/anti-cheating-online-server).

# How to install
Clone this repo: ```https://github.com/realphongha/anti-cheating-online-mobile-app.git```   
Go to the root directory: ```cd anti-cheating-online-mobile-app```     
Run ```npm install```   
Run ```react-native start```    
Go to android/app/build.gradle and change to "enableHermes: true"  
Run ```react-native run-android```  
Go to android/app/build.gradle and change back to "enableHermes: false"  
Go to node_modules/react-native-vision-camera/android/build/third-party-ndk and rename "boost_1_63_0" to "boost" (to avoid a bug)  
Run ```react-native run-android``` again  
