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
import { useNavigation, useRoute } from "@react-navigation/native";
import HOME_IMAGE from "../../assets/images/svg/5.svg";

import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";
import { notifyMessage, getCurrentLocation, locationPermission } from './helpers';

const EnableLocation = () => {
  const [location, setLocation] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { mode } = route.params;


  const getLocationPermission = async () => {
    try {
      let granted = await locationPermission();
      while (!granted) {
        granted = await locationPermission();
      }

      if (granted) {
        if (mode == 'Passenger') {
          navigation.replace('PassengerHome');
        } else {
          navigation.replace('DriverHome');
        }

      }
    } catch (er) {
      console.error(er.message)
      setIsAlertVisible(true);
      return setErrorMessage('Error getting location');
      // notifyMessage("Error getting location")
    }
  }

  return (
    <View style={styles.container}>
      <View style={globalStyles.container}>
        <HOME_IMAGE style={styles.locationSVG} height={200} width={300} />
      </View>
      <View style={styles.fullTextView}>
        <View style={styles.textView}>
          <Text style={styles.introTitleStyle}>Location</Text>
          <Text style={styles.introTextStyle}>
            Welcome! To provide you with the best experience, please enable location services on your device. This allows us to offer personalized and accurate services tailored to your location.
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
