import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  ToastAndroid,
  Platform,
  AlertIOS,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import { useNavigation } from "@react-navigation/native";
import HOME_IMAGE from "../../assets/images/svg/5.svg";

import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";

const EnableLocation = () => {
  const [location, setLocation] = useState(false);
  const navigation = useNavigation();

  const notifyMessage = (msg) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  };

  const getLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      console.log("granted", granted);

      if (granted === "granted") {
        Geolocation.getCurrentPosition(
          (position) => {
            console.log(position);
            setLocation(position);
          },
          (error) => {
            console.log(error.code, error.message);
            setLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      } else {
        notifyMessage("Permission has been declined");
        return false;
      }

      console.log(location);

      navigation.navigate("Root");
    } catch (er) {
      console.log(er.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={globalStyles.container}>
        <HOME_IMAGE style={styles.locationSVG} height={200} width={300} />
      </View>
      <View style={styles.fullTextView}>
        <View style={styles.textView}>
          <Text style={styles.introTitleStyle}>Location</Text>
          <Text style={styles.introTextStyle}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac sed est
            mattis sagittis.
          </Text>
        </View>

        <View style={{ marginHorizontal: 10 }}>
          <TouchableOpacity
            style={styles.btn}
            onPress={getLocationPermission}
          >
            <Text style={globalStyles.btnTextColor}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EnableLocation;
