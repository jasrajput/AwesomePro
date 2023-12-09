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
} from '@pusher/pusher-websocket-react-native';
import { regionFrom } from './helpers';

import axios from 'axios';

import { useNavigation, useRoute } from "@react-navigation/native";
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
    const { latitude, longitude, duration, distance, fare, userId } = route.params;
    // const duration = 10;
    // const distance = 100;
    // const fare = 100;
    // const latitude = {
    //     latitude: 30.3398,
    //     longitude: 76.3869
    // };

    // const longitude = {
    //     latitude: 30.7046,
    //     longitude: 76.7179
    // };

    // const userId = 1;


    let availableDriversChannel = null;
    let user_ride_channel = null

    const pusher = Pusher.getInstance();


    // useEffect(() => {
    //     setTimeout(() => {
    //         API.searchDrivers(
    //             {
    //                 "origin_lat": latitude.latitude,
    //                 "origin_long": latitude.longitude,
    //                 "destination_lat": longitude.latitude,
    //                 "destination_long": longitude.longitude
    //             }).then(res => {
    //                 console.log(res);
    //             }).catch((err) => {
    //                 console.log(err.message);
    //             })
    //     }, 5000);
    // }, [])


    useEffect(() => {

        (async () => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
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
                        console.log(auth)
                        return auth.data;
                    }
                });


                availableDriversChannel = await pusher.subscribe({

                    channelName: 'presence-available-drivers',
                    onSubscriptionSucceeded: async (channelName, channelData) => {
                        console.log(`Subscribed to`);
                        console.log(`I can now access me: ${availableDriversChannel.me}`)
                        console.log(`And here are the channel members:`)
                        console.log(availableDriversChannel.members);

                        // const myAccount = JSON.stringify(availableDriversChannel.me.userInfo.is_verified_driver);
                        // console.log(myAccount);
                        const firstname = availableDriversChannel.me.userInfo.firstname;
                        const lastname = availableDriversChannel.me.userInfo.lastname;
                        const user_id = availableDriversChannel.me.userInfo.id;
                        const username = firstname + ' ' + lastname;

                        let data = {
                            user_id: user_id,
                            username: username,
                            pickup: latitude,
                            dropoff: longitude,
                            duration: duration,
                            distance: distance,
                            fare: fare
                        }
                        await pusher.trigger({
                            channelName: "presence-available-drivers",
                            eventName: 'client-driver-request',
                            data: JSON.stringify(data)
                        });
                    }, onMemberAdded: async (member) => {
                        console.log(`Member added: ${member}`);
                        let data = {
                            user_id: 1,
                            username: "Jas",
                            pickup: latitude,
                            dropoff: longitude,
                            duration: duration,
                            distance: distance,
                            fare: fare
                        }
                        await pusher.trigger({
                            channelName: "presence-available-drivers",
                            eventName: 'client-driver-request',
                            data: JSON.stringify(data)
                        });
                    },
                });




                console.log('User id: ', userId)
                user_ride_channel = await pusher.subscribe({
                    // channelName: 'presence-ride-Jas',
                    channelName: 'presence-ride-' + userId,
                    onEvent: async (event) => {

                        console.log(`Got channel event user ride: ${event}`);
                        if (event.eventName == 'client-driver-response') {
                            let passenger_response = 'no';
                            if (!hasRide) {
                                passenger_response = 'yes';
                            }

                            let passengerResponse = {
                                response: passenger_response
                            }
                            await pusher.trigger({
                                channelName: 'presence-ride-' + userId,
                                eventName: 'client-driver-response',
                                data: JSON.stringify(passengerResponse)
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

                            let parseJson = JSON.parse(event.data);
                            let driver = {
                                latitude: parseJson['latitude'],
                                longitude: parseJson['longitude']
                            }
                            //Driver Found
                            navigation.navigate('DriverFound', {
                                pickup: latitude,
                                dropoff: longitude,
                                driver_location: driver,
                                driver_name: parseJson['driver']['name'],
                            });
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

            }
        })();
    }, [])

    // useEffect(
    //     () => {
    //         let timer1 = setTimeout(() => navigation.navigate('DriverFound', {
    //             origin: latitude,
    //             destination: longitude
    //         }), 2000);

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
        <View style={[styles.container, { backgroundColor: 'rgba(62, 73, 88, 0.8)' }]} >
            <View style={{ justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 340, left: 175 }}>
                <Image style={{ height: 120 }}
                    resizeMode="contain"
                    source={require("../../assets/images/png/car_top.png")} />
            </View>

            <View style={globalStyles.container}>
                <Lottie source={require('../../assets/images/json/ripple.json')} autoPlay loop style={[
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
