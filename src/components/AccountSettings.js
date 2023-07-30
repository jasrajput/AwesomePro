import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import USER_IMAGE from '../../assets/images/svg/user.svg';
import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";
import API from "./API";
import Lottie from 'lottie-react-native';

const AccountSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');


    useEffect(() => {
        setIsLoading(true);
        API.getUserDetails().then(res => {
            console.log(res);
            setFirstName(res.firstname);
            setLastName(res.lastname);
            setEmail(res.email);
            setIsLoading(false);
        })
    }, [])

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
                    >
                        <USER_IMAGE style={{
                            alignSelf: 'center',
                            position: 'relative',
                            top: 90,
                        }} />

                        <View style={{
                            justifyContent: 'center',
                            backgroundColor: '#fff', marginTop: 140, shadowColor: '#171717',
                            shadowOffset: { width: -2, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                            padding: 10,
                            margin: 20,
                            borderColor: '#fff',
                            borderRadius: 20,
                            elevation: 4,
                            shadowColor: '#000',
                        }}>
                            <TextInput style={globalStyles.input} value={firstName} editable={false} />
                            <TextInput style={globalStyles.input} value={lastName} editable={false} />
                            <TextInput style={globalStyles.input} value={email} editable={false} />
                        </View>



                    </ScrollView>
                )
            }
        </>
    )
};

export default AccountSettings;
