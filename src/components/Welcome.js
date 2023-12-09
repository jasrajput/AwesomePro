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
  const [showRealApp, setShowRealApp] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const mode = await AsyncStorage.getItem('mode');
      if (token) {
        console.log("MODE: ", mode)
        if (mode) {
          if (mode == 'Passenger') {
            navigation.navigate('PassengerHome');
            // navigation.navigate('SearchDrivers');

          } else {
            navigation.navigate('DriverHome');
          }
        } else {
          API.getUserDetails().then(res => {
            if (res.type == 1) {
              AsyncStorage.setItem('mode', 'Driver').then(res => {
                navigation.navigate("DriverHome"); //Driver
              })

            } else {
              AsyncStorage.setItem('mode', 'Passenger').then(res => {
                navigation.navigate("PassengerHome"); //Passenger
              })
            }
          }).catch(er => console.log(er.message));
        }
      } else {
        navigation.navigate('Login');
      }
    })();


    if (!showRealApp) {
      navigation.navigate("Login");
    }

  }, []);

  const onDone = () => {
    setShowRealApp(true);
    navigation.navigate("Login");
  };

  const RenderItem = ({ item }) => {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={item.image} />
        </View>
        <View style={[styles.textContainer, globalStyles.themeBackgroundColor]}>
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
    title: "Booking a ride",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac sed est mattis sagittis.",
    image: require("../../assets/images/png/1.png"),
  },
  {
    key: "s2",
    title: "Made Easy",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac sed est mattis sagittis.",
    image: require("../../assets/images/png/2.png"),
  },
  {
    key: "s3",
    title: "In Three Step",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac sed est mattis sagittis.",
    image: require("../../assets/images/png/3.png"),
  },
];

export default Welcome;
