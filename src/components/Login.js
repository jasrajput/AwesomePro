import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ToastAndroid,
  Platform,
  AlertIOS,
  ActivityIndicator,
  BackHandler,
  Alert
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import globalStyles from "../styles/Global.styles";
import styles from "../styles/Login.styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "./API";
import Lottie from 'lottie-react-native';
import { notifyMessage } from './helpers';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [mobileNumber, setMobileNumber] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert("Hold on!", "Are you sure you want to Exit?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel"
          },
          { text: "YES", onPress: () => BackHandler.exitApp() }
        ]);
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);

    }, []));

  const validateNumber = async () => {


    if (mobileNumber.length == "") {
      notifyMessage("Phone number field cannot be empty");
      return;
    }

    if (mobileNumber.length != 10) {
      notifyMessage("Phone number must be of 10 digit");
      return;
    }

    setIsLoading(true)


    try {
      const response = await API.sendOtp({ 'mobile_no': mobileNumber });

      if (response.status == true && response.message == 'Otp sent') {
        navigation.navigate("OTP", {
          'phoneNumber': mobileNumber
        });
      } else {
        setIsLoading(false)
        notifyMessage(response.message)
      }
    } catch (err) {
      setIsLoading(false)
      notifyMessage(err.message);
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }

    // try {
    //   const response = await API.userLogin({ 'mobile_no': mobileNumber });

    //   if (response.status == false && response.message == 'User not registered') {
    //     console.log("NEW user registered")
    //     const res = await API.userRegister({ 'mobile_no': mobileNumber });

    //     console.log(res);
    //     if (res.status == true && res.message == 'Member Created Successfully') {
    //       AsyncStorage.setItem("token", res.token)
    //         .then(token => {
    //           setIsLoading(false)
    //           notifyMessage(res.message)
    //           navigation.navigate("OTP", {
    //             'phoneNumber': mobileNumber,
    //             'is_new': 1
    //           });
    //         }).catch(err_ => {
    //           setIsLoading(false)
    //           notifyMessage(err_.message)
    //         });
    //     } else {
    //       setIsLoading(false)
    //       notifyMessage(res.message)
    //     }
    //   } else if (response.status == true) {
    //     console.log("Old user registered")
    //     AsyncStorage.setItem("token", response.token)
    //       .then(token => {
    //         setIsLoading(false)
    //         notifyMessage(response.message)
    //         console.log("token saved");

    //         // navigation.navigate("EnableLocation");
    //         navigation.navigate("OTP", {
    //           'phoneNumber': mobileNumber,
    //           'is_new': 0
    //         });
    //       }).catch(err_ => {
    //         setIsLoading(false)
    //         notifyMessage(err_.message)
    //       });
    //   } else {
    //     setIsLoading(false)
    //     notifyMessage(response.message)
    //   }
    // } catch (err) {
    //   setIsLoading(false)
    //   notifyMessage(err.message);
    // }
  };



  return (
    <>
      {isLoading ? (
        <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
        />
      ) : (
        <View style={styles.container}>
          <View style={globalStyles.m20}>
            <Text style={styles.textStyle}>Login to your account</Text>
            <Text style={styles.smallText}>
              Enter your mobile phone number, we will send you OTP to verify later.
            </Text>
          </View>
          <View style={globalStyles.p15}>
            <Text style={styles.label}>
              <Text style={styles.labelWithin}>Phone Number</Text>
            </Text>
            <View style={styles.phoneContainer}>
              <Image
                source={require("../../images/samples/indian-flag.png")}
                style={styles.flag}
              />
              <TextInput
                style={styles.inputStyle}
                editable
                value={mobileNumber}
                onChangeText={(mobileNumber) => setMobileNumber(mobileNumber)}
                keyboardType="numeric"
                maxLength={10}
                placeholder="+91"
              />
            </View>
            <TouchableOpacity
              style={[globalStyles.btn, { marginTop: 10 }]}
              onPress={validateNumber}
            >
              <Text style={globalStyles.btnTextColor}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>

  );
};

export default Login;
