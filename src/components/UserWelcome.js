import React, { useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import globalStyles from "../styles/Global.styles";
import styles from "../styles/Login.styles";
import API from "./API";
import Lottie from 'lottie-react-native';
import { notifyMessage } from './helpers';

const UserWelcome = () => {
    const route = useRoute();
    const { mode } = route.params;
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);



    const validateDetails = async () => {
        if (firstName.length == "") {
            notifyMessage("Enter your first name");
            return;
        }

        if (lastName.length == "") {
            notifyMessage("Enter your last name");
            return;
        }

        setIsLoading(true);

        if (mode == 'Passenger') {
            type = 0;
        } else {
            type = 1;
        }
        //Save to database
        await API.editDetails({ 'firstname': firstName, 'lastname': lastName, 'type': type }).then((response) => {

            if (response.status == true) {
                setIsLoading(false);
                notifyMessage(response.message)
                if (mode == 'Passenger') {
                    navigation.navigate('PassengerHome');
                } else {
                    navigation.navigate('DriverHome');
                }
            } else {
                setIsLoading(false);
                notifyMessage(response.message)
            }
        }).catch(err => {
            setIsLoading(false);
            notifyMessage(err.message)
        });
    };

    return (
        <>
            {isLoading ? (
                <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                />
            ) : (
                <View style={styles.container}>
                    <View style={[globalStyles.m20, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={styles.textStyle}>Welcome to The City Cabs!</Text>
                        <Text style={[styles.smallText, { textAlign: 'center' }]}>
                            Let's get acquainted
                        </Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', padding: 15 }}>
                        <TextInput
                            editable
                            placeholderTextColor="#000"
                            style={{
                                backgroundColor: '#eee',
                                justifyContent: 'center',
                                margin: 10,
                                borderRadius: 5,
                                color: '#000',
                                padding: 10
                            }}
                            value={firstName.toString()}
                            onChangeText={(firstName) => setFirstName(firstName)}
                            placeholder="First name"
                        />

                        <TextInput
                            placeholderTextColor="#000"
                            style={{
                                backgroundColor: '#eee',
                                justifyContent: 'center',
                                margin: 10,
                                borderRadius: 5,
                                color: '#000',
                                padding: 10
                            }}
                            editable
                            value={lastName.toString()}
                            onChangeText={(lastName) => setLastName(lastName)}
                            placeholder="Last name"
                        />

                        {/* <TextInput
                    placeholderTextColor="#000"
                    style={{
                        backgroundColor: '#eee',
                        justifyContent: 'center',
                        margin: 10,
                        borderRadius: 20,
                        color: '#000'
                    }}
                    editable
                    value={email.toString()}
                    onChangeText={(email) => setEmail(email)}
                    placeholder="Email"
                /> */}
                        <TouchableOpacity
                            style={[globalStyles.btn, { marginTop: 10 }]}
                            onPress={validateDetails}
                        >
                            <Text style={globalStyles.btnTextColor}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
            }

        </>

    );
};

export default UserWelcome;
