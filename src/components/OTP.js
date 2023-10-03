import React, { useRef, useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import OTPTextInput from "react-native-otp-textinput";
import { useNavigation, useRoute } from "@react-navigation/native";
import globalStyles from "../styles/Global.styles";
import styles from "../styles/Otp.styles";
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
  const { phoneNumber, is_new } = route.params;

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

  const checkOTP = (otp) => {

    console.log(checkOTP);
    if (isNaN(otp)) {
      return notifyMessage("Only numbers allowed");
    }

    const otpLength = otp.toString().length;

    if (otpLength < 6) {
      return notifyMessage('Please fill all the required fields');
    }

    //Check otp is same or not

    //check is user old or new
    if (is_new == 1) {
      navigation.navigate("UserChoice");
    } else {
      setIsLoading(true);
      API.getUserDetails().then(res => {
        if (res.type == 1) {
          console.log('Userssss')
          navigation.navigate("RootDriver"); //Driver
        } else {
          console.log('Driverrr')
          navigation.navigate("Root"); //Passenger
        }
        setIsLoading(false);
      }).catch(er => console.log(er.message));
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
