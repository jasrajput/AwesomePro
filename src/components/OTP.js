import React, { useRef, useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import OTPTextInput from "react-native-otp-textinput";
import { useNavigation, useRoute } from "@react-navigation/native";
import globalStyles from "../styles/Global.styles";
import styles from "../styles/Otp.styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Lottie from 'lottie-react-native';
import { notifyMessage } from './helpers';
import API from "./API";

const OTP = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [counter, setCounter] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);

  // const [phoneNumber, setPhoneNumber] = useState('7814683716');
  const { phoneNumber } = route.params;

  useEffect(() => {
    counter > 0 &&
      setTimeout(() => {
        if (counter == 1) {
          setIsShow(true)
        }
        setCounter(counter - 1);

      }, 1000);
  }, [counter]);


  const [otp, setOtp] = useState(null);

  const updateCounter = () => {
    setCounter(60);
  }

  const updateOTP = (otp) => {
    setOtp(otp);
    console.log(otp);
    if (otp.length == 6) {
      console.log("Entered")
      checkOTP(otp);
    }

  }

  const checkOTP = async (otp) => {

    console.log(checkOTP);
    if (isNaN(otp)) {
      return notifyMessage("Only numbers allowed");
    }

    const otpLength = otp.toString().length;

    if (otpLength < 6) {
      return notifyMessage('Please fill all the required fields');
    }

    //Check otp is same or not
    setIsLoading(true);
    const response = await API.verifyOTP({ 'mobile_no': phoneNumber, 'otp': otp })
    if (response.status == true && response.message == 'Otp verified') {
      const newResponse = await API.userLogin({ 'mobile_no': phoneNumber });
      if (newResponse.status == true) {
        await AsyncStorage.setItem("token", newResponse.token);

        //check if user old or new
        if (newResponse.isNewUser == 1) {
          navigation.navigate("UserChoice");
        } else {
          if (newResponse.userType == 1) {
            console.log('Userssss')
            navigation.navigate("DriverHome"); //Driver
          } else {
            console.log('Driverrr')
            navigation.navigate("PassengerHome"); //Passenger
          }
        }
      } else {
        setIsLoading(false);
        notifyMessage(newResponse.message);
      }
    } else {
      setIsLoading(false);
      notifyMessage(response.message);
    }
  }



  // const clearText = () => {
  //   otpInput.current.clear();
  // };

  // const setText = () => {
  //   otpInput.current.setValue("1234");
  // };
  return (
    <>
      {
        isLoading ? (
          <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
          />
        ) : (
          <View style={styles.container} >
            <View style={globalStyles.m20}>
              <Text style={styles.textStyle}>Verification</Text>
              <Text style={styles.smallText}>
                Enter the 6-digit verification code sent to +91-{phoneNumber}
              </Text>
            </View>
            <View style={styles.otpView}>
              <OTPTextInput
                inputCount={6}
                // autoFocus={true}
                textInputStyle={{
                  borderWidth: 2,
                  borderBottomWidth: 2,
                  borderRadius: 6,
                  height: 49,
                  backgroundColor: "#F9F9F9",
                }}
                tintColor={"#184153"}
                handleTextChange={(text) => updateOTP(text)}
              />
              <Text style={styles.textResendStyle}>
                Resend Code in <Text style={{ color: "#000" }}>{counter}</Text>{" "}
                seconds.
                {" "}
                {isShow && (
                  <Text onPress={updateCounter} style={{ textDecorationLine: 'underline', fontStyle: 'italic', fontWeight: 'bold', color: '#FDCD03' }}>Resend now</Text>
                )}

              </Text>
              <TouchableOpacity
                onPress={checkOTP}
                style={globalStyles.fixedBtn}
              >
                <Text style={globalStyles.btnTextColor}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>

        )
      }
    </>
  );
};

export default OTP;
