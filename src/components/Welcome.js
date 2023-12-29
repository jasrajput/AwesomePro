import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, Image } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import globalStyles from "../styles/Global.styles";
import styles from "../styles/Welcome.styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Lottie from 'lottie-react-native';
import { useNavigation } from "@react-navigation/native";
import API from "./API";


const Welcome = () => {
  const [showRealApp, setShowRealApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      // await AsyncStorage.removeItem('token');
      // await AsyncStorage.removeItem('mode');

      // return


      const token = await AsyncStorage.getItem('token');
      const mode = await AsyncStorage.getItem('mode');

      if (token) {
        console.log("MODE: ", mode)
        if (mode) {
          if (mode == 'Passenger') {
            navigation.replace('PassengerHome');
            // navigation.navigate('SearchDrivers');

          } else {
            navigation.replace('DriverHome');
          }
        } else {
          API.getUserDetails().then(res => {

            if (res.message == 'Unauthenticated.') {
              return navigation.replace("Login");
            }

            if (res.type == 1) {
              AsyncStorage.setItem('mode', 'Driver').then(res => {
                navigation.replace("DriverHome"); //Driver
              })

            } else {
              AsyncStorage.setItem('mode', 'Passenger').then(res => {
                navigation.replace("PassengerHome"); //Passenger
              })
            }
          }).catch(er => console.log(er.message));
        }
      } else {
        setIsLoading(false);
        // navigation.replace('Login');
      }
    })();


    if (!showRealApp) {
      // navigation.navigate("Login");
    }

  }, []);

  const onDone = () => {
    setShowRealApp(true);
    navigation.replace("Login");
  };

  const RenderItem = ({ item }) => {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={item.image} />
        </View>
        <View style={[styles.textContainer, globalStyles.themeBackgroundColor, { padding: 10 }]}>
          <Text style={styles.introTitleStyle}>{item.title}</Text>
          <Text style={styles.introTextStyle}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <>

      {isLoading ?
        <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
        /> : (
          <AppIntroSlider
            data={slides}
            dotStyle={{
              backgroundColor: "#C4C4C4",
              width: 42,
              position: "relative",
              right: "50%",
              height: 2,
              bottom: 130,
            }}
            activeDotStyle={{
              backgroundColor: "#000",
              width: 42,
              position: "relative",
              right: "50%",
              height: 2,
              bottom: 130,
            }}
            renderItem={RenderItem}
            onDone={onDone}
            bottomButton
          />
        )}
    </>
  );
};

const slides = [
  {
    key: "s1",
    title: "Find Your Ride",
    text: "Discover and book rides effortlessly. Whether it's a short commute or a long trip, find the perfect ride that suits your needs.",
    image: require("../../assets/images/png/1.png"),
  },
  {
    key: "s2",
    title: "Reliable Drivers",
    text: "Our platform connects you with verified and reliable drivers. Sit back, relax, and let our trusted drivers take you to your destination safely.",
    image: require("../../assets/images/png/2.png"),
  },
  {
    key: "s3",
    title: "Effortless Travel",
    text: "Enjoy seamless and stress-free travel experiences. With easy booking and convenient rides, your journey starts here.",
    image: require("../../assets/images/png/3.png"),
  },
];

export default Welcome;
