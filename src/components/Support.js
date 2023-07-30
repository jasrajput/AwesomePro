import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    PermissionsAndroid,
    ToastAndroid,
    Platform,
    AlertIOS,
    TextInput
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import { useNavigation } from "@react-navigation/native";
import HOME_IMAGE from "../../assets/images/svg/5.svg";

import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const Support = () => {
    const [location, setLocation] = useState(false);
    const navigation = useNavigation();

    const notifyMessage = (msg) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        } else {
            AlertIOS.alert(msg);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.fullTextView}>
                <View style={{ flex: 0.7, backgroundColor: '#FDCD03', zIndex: 111 }}>
                    <View style={{
                        justifyContent: 'center',
                        backgroundColor: '#fff', shadowColor: '#171717',
                        shadowOffset: { width: -2, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        padding: 10,
                        margin: 20,
                        borderColor: '#fff',
                        borderRadius: 14,
                        elevation: 4,
                        shadowColor: '#000',
                        position: 'relative',
                        top: 200,
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#4B545A' }}>FAQ</Text>
                            <MaterialCommunityIcons name="chevron-right" color={'#4B545A'} size={20} />
                        </View>

                        <View
                            style={{
                                marginTop: 20,
                                marginBottom: 10,
                                borderWidth: 0.8,
                                borderColor: "#D5DDE0",
                            }}
                        ></View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#4B545A' }}>Previous Hits</Text>
                            <MaterialCommunityIcons name="chevron-right" color={'#4B545A'} size={20} />
                        </View>

                        <View
                            style={{
                                marginTop: 20,
                                marginBottom: 10,
                                borderWidth: 0.8,
                                borderColor: "#D5DDE0",
                            }}
                        ></View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#4B545A' }}>Contacts</Text>
                            <MaterialCommunityIcons name="chevron-right" color={'#4B545A'} size={20} />
                        </View>

                        <View
                            style={{
                                marginTop: 10,
                            }}
                        ></View>
                    </View>
                </View>

                <View style={{ flex: 1, backgroundColor: '#fff', }}>

                </View>


            </View>
        </View>
    );
};

export default Support;
