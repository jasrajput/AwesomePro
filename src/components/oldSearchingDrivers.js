// onAuthorizer: async (channelName, socketId) => {
//     console.log(channelName)
// fetch(`https://gscoin.live/broadcasting/auth`, {
//     headers: {
//         "Content-Type": "application/json",
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${authHeader}`,
//     },
//     method: "POST",
//     body: JSON.stringify({
//         'socket_id': socketId,
//         'channel_name': channelName
//     })
// })
//     .then(res => res.json()) 
//     .then(text => console.log(text))
//     .catch(err => console.log(err));
// console.log(channelName)
//     const value = await API.getHmacData({ 'socket_id': socketId, 'channel_name': channelName });
//     return {
//         auth: 'c3bba9aaea1fe2b21d4e:' + value.data,
//     }
// },




// onAuthorizer: async (channelName, socketId) => {
//     const auth = await axios.post("https://gscoin.live/broadcasting/auth", {
//         socket_id: socketId,
//         channel_name: channelName
//     }, {
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: 'Bearer ' + '47|3aNHGBgSwb2Z8DD1sRJte59uoPlClkb7mzZlQjat',
//         }
//     }).catch((error) => {
//         return console.error(error);
//     });
//     if (!auth) return {};
//     console.log(auth);
//     return auth.data;
// }




import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    PermissionsAndroid,
    ToastAndroid,
    Platform,
    AlertIOS,
    Image,
    Alert
} from "react-native";

import {
    Pusher,
    PusherMember,
    PusherChannel,
    PusherEvent,
} from '@pusher/pusher-websocket-react-native';
import { regionFrom, getLatLonDiffInMeters } from './helpers';


import axios from 'axios';

import { useNavigation, useRoute } from "@react-navigation/native";
import HOME_IMAGE from "../../assets/images/svg/5.svg";
import Lottie from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";

import API from "./API";

const SearchingDrivers = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [hasRide, setHasRide] = useState(false);
    const [driver, setDriver] = useState(null);
    const [is_searching, set_is_searching] = useState(false);
    const [has_ridden, set_has_ridden] = useState(false);


    console.log("Searching Drivers Route: ");
    // const { latitude, longitude } = route.params;
    const latitude = {
        latitude: '322'
    };
    const longitude = {
        longitude: '123'
    };

    let availableDriversChannel = null;
    let user_ride_channel = null
    let username = 'Jas';

    const pusher = Pusher.getInstance();


    // useEffect(() => {
    //     setTimeout(() => {
    //         API.searchDrivers({ "origin": latitude.latitude, "destination": longitude.longitude }).then(res => {
    //             console.log(res);
    //         }).catch((err) => {
    //             console.log(err.message);
    //         })
    //     }, 5000);
    // }, [])


    useEffect(() => {

        (async () => {
            const token = await AsyncStorage.getItem("token");
            await pusher.init({
                apiKey: "c3bba9aaea1fe2b21d4e",
                cluster: "ap2",
                forceTLS: true,
                encrypted: true,
                onAuthorizer: async (channelName, socketId) => {
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

            availableDriversChannel = await pusher.subscribe({
                channelName: 'presence-available-drivers',
                onSubscriptionSucceeded: () => {
                    let data = {
                        username: username,
                        pickup: latitude,
                        dropoff: longitude
                    }
                    await pusher.trigger({
                        channelName: "presence-available-drivers",
                        eventName: 'client-driver-request',
                        data: JSON.stringify(data)
                    });

                }
            });



            user_ride_channel = await pusher.subscribe({
                channelName: 'presence-ride-' + username,
                onEvent: async (event) => {
                    console.log(`Got channel event user ride: ${event}`);
                    if (event.eventName == 'client-driver-response') {
                        let passenger_response = 'no';
                        if (!has_ride) {
                            passenger_response = 'yes';
                        }

                        await pusher.trigger({
                            channelName: 'presence-ride-' + username,
                            eventName: 'client-driver-response',
                            data: {
                                response: passenger_response
                            }
                        });
                    }


                    if (event.eventName == 'client-found-driver') {
                        let region = regionFrom(
                            event.data.latitude,
                            event.data.longitude,
                            event.data.accuracy
                        );

                        setHasRide(true);
                        set_is_searching(false);
                        setLocation(region);
                        setDriver({
                            'latitude': event.data.latitude,
                            'longitude': event.data.longitude,
                            'accuracy': event.data.accuracy,
                        });


                        Alert.alert(
                            "Orayt!",
                            "We found you a driver. \nName: " + event.data.driver.name + "\nCurrent location: " + event.data.location.name,
                            [
                                {
                                    text: 'Sweet!'
                                },
                            ],
                            { cancelable: false }
                        );
                    }


                    if (event.eventName == 'client-driver-location') {
                        let region = regionFrom(
                            event.data.latitude,
                            event.data.longitude,
                            event.data.accuracy
                        );

                        setLocation(region);
                        setDriver({
                            'latitude': event.data.latitude,
                            'longitude': event.data.longitude,
                        });
                    }


                    if (event.eventName == 'client-driver-message') {
                        if (event.data.type == 'near_pickup') {
                            set_has_ridden(true);
                        }

                        Alert.alert(
                            event.data.title,
                            event.data.msg,
                            [
                                {
                                    text: 'Aye sir!'
                                },
                            ],
                            { cancelable: false }
                        );
                    }
                },
            });



            // let locationData = await user_ride_channel.trigger({
            //     eventName: 'client-found-driver',
            // });

            // setHasRide(true);
            // set_is_searching(false);
            // setLocation(locationData);
            // setDriver(locationData);

            // Alert.alert("Hurray", "We found you a driver", [
            //     {
            //         text: 'Sweet!'
            //     },
            // ],
            //     { cancelable: false });

            // let driverLocation = await user_ride_channel.trigger({
            //     eventName: 'client-driver-location',
            // });

            // setDriver(driverLocation)

            await pusher.connect();

        })();
    }, [])

    // useEffect(
    //     () => {
    //         let timer1 = setTimeout(() => navigation.navigate('DriverFound', {
    //             origin: latitude,
    //             destination: longitude
    //         }), 4000);

    //         // this will clear Timeout
    //         // when component unmount like in willComponentUnmount
    //         // and show will not change to true
    //         return () => {
    //             clearTimeout(timer1);
    //         };
    //     },
    //     // useEffect will run only one time with empty []
    //     // if you pass a value to array,
    //     // like this - [data]
    //     // than clearTimeout will run every time
    //     // this value changes (useEffect re-run)
    //     []
    // );
    return (
        <View style={[styles.container, { backgroundColor: 'rgba(62, 73, 88, 0.8)' }]}>
            <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 340, left: 175 }}>
                <Image style={{ height: 120 }}
                    resizeMode="contain"
                    source={require("../../assets/images/png/car_top.png")} />
            </View>

            <View style={globalStyles.container}>
                <Lottie source={require('../../assets/images/ripple.json')} autoPlay loop style={[
                    {
                        transform: [{ scale: 2.1 }],
                    },
                ]}
                />
            </View>

            <Text style={{ fontSize: 17, color: '#fff', textAlign: 'center', position: 'relative', bottom: 40 }}>Taxi Search...</Text>

        </View>
    );
};

export default SearchingDrivers;
