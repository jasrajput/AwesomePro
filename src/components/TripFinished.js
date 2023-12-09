import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    PermissionsAndroid,
    ToastAndroid,
    Platform,
    AlertIOS,
    StyleSheet
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import { useNavigation } from "@react-navigation/native";
import HOME_IMAGE from "../../assets/images/svg/5.svg";

import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";

const TripFinished = () => {
    const [location, setLocation] = useState(false);
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.fullTextView}>
                <View style={{ marginHorizontal: 10, backgroundColor: '#fff' }, [pageStyles.shadowContainer]}>
                    <Text>Trip is over</Text>

                </View>

                <View style={{ margin: 20 }}>
                    <TouchableOpacity
                        style={styles.btn}
                    >
                        <Text style={globalStyles.btnTextColor}>Ready</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const pageStyles = StyleSheet.create({
    shadowContainer: {
        width: 200,
        height: 200,
        backgroundColor: 'white',
        borderRadius: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
});

export default TripFinished;
