import React, { useEffect } from "react";
import {
    Text,
    View,
} from "react-native";

import {
    Pusher,
} from '@pusher/pusher-websocket-react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from "../styles/EnableLocation.styles";


const TestTwo = () => {

    console.log("Test Two: ");
    const latitude = {
        latitude: '322'
    };
    const longitude = {
        longitude: '123'
    };

    let availableDriversChannel = null;
    let username = 'Jas';

    const pusher = Pusher.getInstance();

    useEffect(() => {

        (async () => {
            const token = await AsyncStorage.getItem("token");
            await pusher.init({
                apiKey: "c3bba9aaea1fe2b21d4e",
                cluster: "ap2",
                forceTLS: true,
                encrypted: true,
                onAuthorizer: async (channelName, socketId) => {
                    console.log(socketId)
                    const auth = await axios.post("https://gscoin.live/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channelName
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: 'Bearer ' + token,
                        }
                    }).catch((error) => {
                        return console.error(error);
                    });
                    if (!auth) return {};
                    return auth.data;
                }
            });

            await pusher.connect();

            await pusher.subscribe({
                channelName: 'presence-available-drivers',
                onEvent: (event) => {
                    console.log(`Got channel event: ${event}`);
                },
            });


        })();
    }, [])

    return (
        <View style={[styles.container, { backgroundColor: 'rgba(62, 73, 88, 0.8)' }]}>
            <Text style={{ fontSize: 17, color: '#fff', textAlign: 'center', position: 'relative', bottom: 40 }}>Taxi Search...</Text>

        </View>
    );
};

export default TestTwo;
