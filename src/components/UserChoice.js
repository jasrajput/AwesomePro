import React from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from "../styles/Global.styles";
import styles from "../styles/Login.styles";

const UserChoice = () => {
    const navigation = useNavigation();

    const selectMode = async (modePassed) => {
        await AsyncStorage.setItem('mode', modePassed);
        navigation.replace('UserWelcome', {
            'mode': modePassed
        });
    };

    return (
        <View style={styles.container}>
            <View style={[globalStyles.m20, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.textStyle}>Are you a passenger or driver ?</Text>
                <Text style={[styles.smallText, { textAlign: 'center' }]}>
                    You can change the mode later
                </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', padding: 15 }}>

                <Image style={{ width: '100%', height: 450 }}
                    resizeMode="contain"
                    source={require("../../assets/images/png/mode.jpg")}
                />

                <TouchableOpacity
                    style={[globalStyles.btn, { marginTop: 10 }]}
                    onPress={() => selectMode('Passenger')}
                >
                    <Text style={[globalStyles.btnTextColor, { fontSize: 17 }]}>Passenger</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[globalStyles.btn, { marginTop: 10, backgroundColor: '#eee' }]}
                    onPress={() => selectMode('Driver')}
                >
                    <Text style={{ fontSize: 17 }}>Driver</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default UserChoice;
