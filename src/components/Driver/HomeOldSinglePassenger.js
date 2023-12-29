import React, { useEffect, useState, useRef } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    BackHandler
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { eventEmitter } from './EventService';


import {
    regionFrom,
    getLatLonDiffInMeters,
    notifyMessage,
    isEmpty,
    getAddressFromCoordinates,
    locationPermission,
    getCurrentLocation,
    requestUserPermission,
    getFCM,
    formatTime
} from '../helpers';
import Lottie from 'lottie-react-native';
import SwitchSelector from "react-native-switch-selector";
import USER_IMAGE from '../../../assets/images/svg/user.svg';

import {
    Pusher,
} from '@pusher/pusher-websocket-react-native';
import API from "../API";

const DriverHome = () => {
    const route = useRoute();
    const notificationData = route.params?.params.notificationData;
    // console.log("DATA: ", notificationData)
    // console.log(notificationData['username'])
    // console.log(notificationData.username)
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [profileImage, setProfileImage] = useState('');

    const [isVerified, setisVerified] = useState(false);
    const [rating, setRating] = useState(0);
    const [earnings, setEarnings] = useState(0);
    const [totalTrips, setTotalTrips] = useState(0);
    const [driverLastLocation, setDriverLastLocation] = useState(null);

    const [passenger, setPassenger] = useState(null);
    const [region, setRegion] = useState({});
    const [accuracy, setAccuracy] = useState(null);
    const [has_passenger, sethas_passenger] = useState(false);

    const [driverMode, setDriverMode] = useState(1);

    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [curLoc, setCurLoc] = useState({
        latitude: 30.3398,
        longitude: 76.3869
    });

    const switchRef = useRef(null);

    var available_drivers_channel = null;

    const navigation = useNavigation();
    const pusher = Pusher.getInstance();


    useEffect(() => {
        if (has_passenger) {
            getAddressFromCoordinates(passenger.pickup.latitude, passenger.pickup.longitude).then(pickupLocation => {
                setPickup(pickupLocation)
            }).catch(er => console.log(er));

            getAddressFromCoordinates(passenger.dropoff.latitude, passenger.dropoff.longitude).then(dropoffLocation => {
                setDropoff(dropoffLocation)
            }).catch(er => console.log(er.message));
        }
    }, [has_passenger])


    const handleLocationUpdate = () => {

        if (isVerified) {
            getLiveLocation().then((locationData) => {
                const { latitude, longitude } = locationData;
                API.sendDriverLocationToBackend({ 'latitude': latitude, 'longitude': longitude }).then(res => {
                    console.log(res);
                }).catch(err => {
                    console.log("Issue updating location");
                })
            });
        }
    }

    const renderStars = (rating) => {
        const starIcons = [];
        const filledStars = Math.floor(rating);
        const hasHalfStar = rating - filledStars >= 0.5;

        for (let i = 0; i < filledStars; i++) {
            starIcons.push(<MaterialCommunityIcons key={`star-${i}`} name="star" size={20} color="#FDCD03" />);
        }

        if (hasHalfStar) {
            starIcons.push(<MaterialCommunityIcons key="half-star" name="star-half-full" size={20} color="#FFD700" />);
        }

        while (starIcons.length < 5) {
            starIcons.push(<MaterialCommunityIcons key={`star-empty-${starIcons.length}`} name="star-outline" size={20} color="#FFD700" />);
        }

        return starIcons;
    };

    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude, accuracy } = await getCurrentLocation();
                // console.log("get live location after 4 second")
                let regionSave = {
                    latitude,
                    longitude,
                    accuracy
                };

                setCurLoc({ latitude, longitude })
                setRegion(regionSave)
                setAccuracy(accuracy)

                return { latitude, longitude }
            }
        } catch (er) {
            notifyMessage("Permission not granted");
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.getDriverDetails();
                console.log(res);
                if (res.message == 'Unauthenticated.') {
                    return navigation.navigate("Login");
                }

                setRating(res.average_rating);
                setTotalTrips(res.total_trips);
                setEarnings(res.total_earning);

                if (res.is_verified_driver == 1) {
                    setisVerified(true)
                }

                setDriverLastLocation(res.last_updated_location)

                const token = await getFCM();

                if (token !== res.fcm_token) {
                    API.updateFCMToken({ 'fcm_token': token }).then(res => {
                        // console.log(res);
                    }).catch(err => {
                        console.log("Issue updating token");
                    })
                }

                setName(res.firstname);
                setProfileImage(res.profile_image);
                setDriverMode(res.is_driver_online);
                // switchRef.current?.toggleItem(res.is_driver_online);

                setIsLoading(false);


            } catch (error) {
                // console.error('Error fetching user details:', error.message);
                return notifyMessage('Network abnormality')
            }
        };

        requestUserPermission();
        fetchData();
    }, [])


    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 5000);
        return () => {
            clearInterval(interval);
        };

    }, [])


    useEffect(() => {
        // handleLocationUpdate();
    }, [driverLastLocation]);

    // useEffect(() => {

    //     if (route.params?.params) {
    //         // console.log(notificationData)
    //         setPassenger({
    //             ride_id: notificationData['ride_id'],
    //             user_id: notificationData['passenger_id'],
    //             username: notificationData['username'],
    //             duration: notificationData['duration'],
    //             distance: notificationData['distance'],
    //             profile_image: notificationData['profile_image'],
    //             fare: notificationData['fare'],
    //             pickup: {
    //                 latitude: notificationData['origin.latitude'],
    //                 longitude: notificationData['origin.longitude'],
    //             },

    //             dropoff: {
    //                 latitude: notificationData['destination.latitude'],
    //                 longitude: notificationData['destination.longitude'],
    //             }
    //         });


    //         sethas_passenger(true);

    //     }
    // }, [route.params?.params]);

    useEffect(() => {
        const fetchNotification = async () => {
            AsyncStorage.getAllKeys().then(keys => {
                console.log('AsyncStorage keys:', keys);
            });


            const rideData = await AsyncStorage.getItem('ride_data');
            if (rideData !== null && rideData !== undefined) {
                console.log("Notification data: ", rideData);
                const notificationData = JSON.parse(rideData);
                const notificationDataArray = JSON.parse(rideData);

                notificationDataArray.forEach(notificationData => {
                    console.log('Ride ID:', notificationData.ride_id);
                    console.log('Passenger ID:', notificationData.passenger_id);
                });


                setPassenger({
                    ride_id: notificationData['ride_id'],
                    user_id: notificationData['passenger_id'],
                    username: notificationData['username'],
                    duration: notificationData['duration'],
                    distance: notificationData['distance'],
                    profile_image: notificationData['profile_image'],
                    fare: notificationData['fare'],
                    pickup: {
                        latitude: notificationData['origin.latitude'],
                        longitude: notificationData['origin.longitude'],
                    },

                    dropoff: {
                        latitude: notificationData['destination.latitude'],
                        longitude: notificationData['destination.longitude'],
                    }
                });


                sethas_passenger(true);
            }
        }

        fetchNotification();
        const subscription = eventEmitter.addListener('rideDataUpdate', () => {
            fetchNotification();
        });

        return () => {
            subscription.remove();
        };

    }, [])


    // useEffect(() => {
    //     setTimeout(async () => {
    //         const channel = await pusher.getChannel("presence-available-drivers");
    //         if (channel != undefined) {
    //             console.log(channel);
    //         }

    //     }, 4000);
    // }, []);





    // useEffect(() => {
    //     (async () => {

    //         try {
    //             const res = await API.getUserDetails();

    //             setDriverLastLocation(res.last_updated_location)

    //             if (res.is_verified_driver == 1) {
    //                 setisVerified(true);
    //             } else {
    //                 setisVerified(false);
    //             }

    //             setIsLoading(false);

    //             const token = await AsyncStorage.getItem("token");
    //             if (token) {
    //                 if (res.is_verified_driver == 1) {
    //                     console.log("Entered");
    //                     await pusher.init({
    //                         apiKey: "c3bba9aaea1fe2b21d4e",
    //                         cluster: "ap2",
    //                         forceTLS: true,
    //                         encrypted: true,
    //                         // activityTimeout: 20000,
    //                         onAuthorizer: async (channelName, socketId) => {
    //                             console.log(channelName);
    //                             const auth = await axios.post("https://gscoin.live/broadcasting/auth", {
    //                                 socket_id: socketId,
    //                                 channel_name: channelName
    //                             }, {
    //                                 headers: {
    //                                     "Content-Type": "application/json",
    //                                     Authorization: 'Bearer ' + token,
    //                                 }
    //                             }).catch((error) => {
    //                                 return console.error(error);
    //                             });
    //                             if (!auth) return {};
    //                             return auth.data;
    //                         }

    //                     });

    //                     available_drivers_channel = await pusher.subscribe({
    //                         channelName: 'presence-available-drivers',
    //                         onEvent: (event) => {
    //                             console.log(`Got channel event: ${event}`);

    //                             if (event.eventName == 'client-driver-request') {
    //                                 if (!has_passenger) {
    //                                     console.log(event.data);
    //                                     let eventRes = JSON.parse(event.data);
    //                                     setPassenger({
    //                                         user_id: eventRes['user_id'],
    //                                         username: eventRes['username'],
    //                                         pickup: eventRes['pickup'],
    //                                         dropoff: eventRes['dropoff'],
    //                                         duration: eventRes['duration'],
    //                                         distance: eventRes['distance'],
    //                                         fare: eventRes['fare'],
    //                                     });

    //                                     sethas_passenger(true);
    //                                 }
    //                             }
    //                         },
    //                     });

    //                     await pusher.connect();
    //                     console.log(pusher);

    //                 }
    //             } else {
    //                 navigation.navigate("Login");
    //             }
    //         } catch (er) {
    //             notifyMessage("Network Issue")
    //         }

    //     })();
    // }, [])

    const rejectRide = async () => {
        sethas_passenger(false);
        setPassenger(null);

        AsyncStorage.removeItem('ride_data')
            .then(() => {
                console.log('Ride data removed successfully');
            })
            .catch(error => {
                console.error('Error removing ride data:', error);
            });

        AsyncStorage.getAllKeys().then(keys => {
            console.log('Rejected AsyncStorage keys:', keys);
        });
    }


    const acceptRide = async () => {
        const diff_in_meter = getLatLonDiffInMeters(curLoc.latitude, curLoc.longitude, passenger.pickup.latitude, passenger.pickup.longitude);

        if (diff_in_meter >= 80000) {
            // 80 KM
            return notifyMessage("Seems like you're very far away from the destination.");
        } else {
            // console.log("RIDE ID: " + passenger.ride_id);
            API.acceptRideRequest({ 'ride_id': passenger.ride_id, 'driver_lat': curLoc.latitude, 'driver_long': curLoc.longitude }).then(res => {
                // console.log(res);
                if (res.status == true) {
                    notifyMessage(res.message);

                    navigation.replace("PassengerFound", {
                        params: {
                            origin: passenger.pickup,
                            destination: passenger.dropoff,
                            passenger_id: passenger.user_id,
                            ride_id: passenger.ride_id,
                            driver_current_location: curLoc
                        }
                    })
                } else {
                    console.log(res);

                    notifyMessage(res.message)
                }

            }).catch(er => notifyMessage("Network Issue"));
            // console.log(passenger.user_id)
            // var first_time = false;
            // let ride_channel = null;
            // console.log("Accepted");
            // let dataResponse = {
            //     response: 'yes'
            // };
            // ride_channel = await pusher.subscribe({
            //     channelName: 'presence-ride-' + passenger.user_id,
            //     onSubscriptionSucceeded: async (channelName, data) => {
            //         await pusher.trigger({
            //             // channelName: 'presence-ride-.' + event.data.username,
            //             channelName: 'presence-ride-' + passenger.user_id,
            //             eventName: 'client-driver-response',
            //             data: JSON.stringify(dataResponse)
            //         });
            //     },

            //     onEvent: async (eventResponse) => {
            //         if (eventResponse.eventName == 'client-driver-response') {
            //             let response = JSON.parse(eventResponse.data);
            //             if (response['response'] == 'yes') {

            //                 try {
            //                     const driverGeocodedPlace = await getAddressFromCoordinates(curLoc.latitude, curLoc.longitude);

            //                     console.log("Driver Current Location");
            //                     console.log(driverGeocodedPlace);

            //                     const driverData = {
            //                         driver: {
            //                             name: 'John Smith'
            //                         },
            //                         name: driverGeocodedPlace,
            //                         latitude: curLoc.latitude,
            //                         longitude: curLoc.longitude,
            //                         accuracy: accuracy
            //                     }
            //                     try {
            //                         await pusher.trigger({
            //                             channelName: 'presence-ride-' + passenger.user_id,
            //                             eventName: 'client-found-driver',
            //                             data: JSON.stringify(driverData)
            //                         });


            //                         navigation.navigate('PassengerFound', {
            //                             origin: passenger.pickup,
            //                             destination: passenger.dropoff,
            //                             passenger_id: passenger.user_id
            //                         });

            //                     } catch (ers) {
            //                         console.log(ers.message)
            //                     }
            //                 } catch (er) {
            //                     console.log(er.message);
            //                 }
            //             } else {
            //                 notifyMessage("Another driver already accepted the request");
            //             }
            //         }
            //     }
            // })
        }
    }

    const showConfirm = () => {
        return Alert.alert(
            "Information",
            "To start earning with The City Cabs, you need to update your KYC",
            [
                // The "Yes" button
                {
                    text: "Proceed",
                    onPress: () => {
                        if (!isVerified) {
                            switchRef.current?.toggleItem(0); // Set offline
                            navigation.navigate("DriverRegistration");
                        }
                    },
                },
                {
                    text: "Close",
                    onPress: () => {
                        switchRef.current?.toggleItem(0);
                    }
                },
            ]
        );
    };


    const options = [
        { label: "Offline", value: "1", testID: "switch-one-thirty", accessibilityLabel: "switch-one-thirty", activeColor: '#bb2124' },
        { label: "Online", value: "2", testID: "switch-one", accessibilityLabel: "switch-one", activeColor: '#4BB543' },
    ];


    const onChangeMode = (value) => {

        if (value == 2) {
            if (!isVerified) {
                //         // console.log(switchRef)
                //         // setOnline(2);
                showConfirm();
                //         // notifyMessage("To start earning, you need to verify your account");
                //     } else {
                //         // setOnline(1);
            }
        }

        // setOnline(value)
        // setDriverMode(value)



        if (isVerified) {
            let v = 0;
            if (value == 2) {
                v = 1;
            }
            API.setDriverAvailability({ 'value': v }).then(res => {
                console.log(res);
            }).catch(er => {
                console.log(er.message)
            });
        }
    }




    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) :
                    <View style={[styles.container, { backgroundColor: '#F8F8FF' }]}>
                        <View >
                            <View style={{ margin: 20, marginTop: 40 }}>

                                {/* Driver Details */}

                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <SwitchSelector
                                        ref={switchRef}
                                        options={options}
                                        initial={driverMode}
                                        borderColor={'#000'}
                                        backgroundColor={'#eee'}
                                        borderWidth={2}
                                        style={{ width: '70%' }}
                                        borderRadius={25}
                                        disableValueChangeOnPress={false}
                                        onPress={value => onChangeMode(value)}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 25 }}>
                                    {
                                        profileImage == null || profileImage == '' ? (
                                            <USER_IMAGE style={{ height: 20 }} />
                                        ) : (
                                            <Image source={{ uri: profileImage }} style={{ height: 50, width: 50, borderRadius: 50 }} />
                                        )
                                    }
                                    <View >
                                        <Text style={{ fontSize: 18 }}>Hello, <Text style={{ fontWeight: 'bold' }}>{name}</Text></Text>
                                        {/* <Text style={globalStyles.bold}> */}
                                        <View style={{ flexDirection: 'row' }}>
                                            {renderStars(rating).map((star, index) => (
                                                <View key={index}>{star}</View>
                                            ))}
                                        </View>
                                        {/* </Text> */}
                                    </View>
                                </View>


                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <View style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        borderColor: '#fff',
                                        borderRadius: 15,
                                        elevation: 4,
                                        shadowColor: '#000',
                                        width: '45%'
                                    }}>
                                        <Text style={[globalStyles.bold, { fontSize: 17 }]}>{earnings}</Text>
                                        <Text style={[{ fontSize: 14, color: '#717171', marginTop: 8 }]}>Overall Earnings</Text>
                                    </View>
                                    <View>
                                        <Text>&nbsp;</Text>
                                        <Text>&nbsp;</Text>
                                    </View>

                                    <View style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        borderColor: '#fff',
                                        borderRadius: 15,
                                        elevation: 4,
                                        shadowColor: '#000',
                                        width: '45%'
                                    }}>
                                        <Text style={[globalStyles.bold, { fontSize: 17 }]}>
                                            {totalTrips}
                                        </Text>
                                        <Text style={[{ fontSize: 14, color: '#717171', marginTop: 8 }]}>Total Trips</Text>
                                    </View>
                                </View>
                                {/* End Driver Details */}

                                {/* Requests Panel */}
                                <View style={{ marginTop: 30 }}>
                                    <Text style={[globalStyles.bold, { fontSize: 17 }]}>New Requests</Text>
                                    {
                                        has_passenger == true ? (
                                            <View style={{
                                                justifyContent: 'center',
                                                backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                                                shadowOffset: { width: -2, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 3,
                                                padding: 10,
                                                margin: 9,
                                                borderColor: '#fff',
                                                borderRadius: 15,
                                                elevation: 4,
                                                shadowColor: '#CFCFCF',
                                            }}>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <View>
                                                            {
                                                                passenger ? (
                                                                    passenger.profile_image == null || passenger.profile_image == '' ? (
                                                                        <USER_IMAGE style={{ height: 25, borderRadius: 50, width: 30 }} />
                                                                    ) : (
                                                                        <Image source={{ uri: passenger.profile_image }} style={{ height: 40, borderRadius: 50, width: 40 }} />
                                                                    )
                                                                ) : null
                                                            }

                                                        </View>

                                                        <View style={{ marginHorizontal: 10 }}>
                                                            <Text style={globalStyles.bold}>{passenger.username}</Text>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <MaterialCommunityIcons name="clock" color={'#FDCD03'} size={20} />
                                                                <Text>{(formatTime(passenger.duration))} </Text>
                                                            </View>
                                                        </View>
                                                    </View>


                                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text style={[globalStyles.bold, { fontSize: 15 }]}>Rs.{passenger.fare}</Text>
                                                        <Text style={{ fontSize: 12, color: '#717171' }}>{passenger.distance} KM</Text>
                                                    </View>
                                                </View>


                                                <View
                                                    style={{
                                                        marginTop: 24,
                                                        marginBottom: 10,
                                                        borderWidth: 0.8,
                                                        borderColor: "#D5DDE0",
                                                    }}
                                                ></View>


                                                <View style={{ flexDirection: 'row' }}>

                                                    <View>
                                                        <Image
                                                            style={{ top: 9 }}
                                                            resizeMode="contain"
                                                            source={require("../../../assets/images/png/rectangle.png")} />

                                                        <Image
                                                            resizeMode="contain"
                                                            style={{ bottom: 5, left: 10 }}
                                                            source={require("../../../assets/images/png/oval-white.png")} />

                                                        <Image
                                                            resizeMode="contain"
                                                            style={{ left: 10, top: 2 }}
                                                            source={require("../../../assets/images/png/line2.png")} />

                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

                                                            {/* <View style={{ marginHorizontal: 10, marginTop: 25 }}>
                                                                        <Text>2:53</Text>
                                                                    </View> */}

                                                            <View style={{ flex: 1 }}>
                                                                <TextInput style={{
                                                                    borderWidth: 1, height: 40,
                                                                    marginTop: 12,
                                                                    padding: 10,
                                                                    borderBottomWidth: 1,
                                                                    borderColor: '#eee',
                                                                    color: '#000',
                                                                }} value={pickup} />
                                                            </View>
                                                        </View>
                                                    </View>

                                                </View>

                                                <View style={{ flexDirection: 'row' }}>

                                                    <View>


                                                        <Image
                                                            resizeMode="contain"
                                                            source={require("../../../assets/images/png/rectangle2.png")} />

                                                        <Image
                                                            resizeMode="contain"
                                                            style={{ bottom: 30, left: 10 }}
                                                            source={require("../../../assets/images/png/oval-black.png")} />

                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>

                                                            {/* <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                                                                        <Text>4:53</Text>
                                                                    </View> */}

                                                            <View style={{ flex: 1 }}>
                                                                <TextInput style={{
                                                                    borderWidth: 1, height: 40,

                                                                    padding: 10,
                                                                    borderBottomWidth: 1,
                                                                    borderColor: '#eee',
                                                                    color: '#000',
                                                                }} value={dropoff} />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                                    <TouchableOpacity style={{
                                                        marginTop: 10,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderWidth: 1,
                                                        borderRadius: 10,
                                                        borderColor: '#FF0C0C',
                                                        backgroundColor: 'transparent',
                                                        height: 50,
                                                        width: '45%',
                                                    }} onPress={rejectRide}>
                                                        <Text style={{ color: '#FF0C0C', fontWeight: 'bold', fontSize: 18 }}>Decline</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity style={{
                                                        marginTop: 10,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        borderWidth: 1,
                                                        borderRadius: 10,
                                                        borderColor: '#FDCD03',
                                                        backgroundColor: '#FDCD03',
                                                        height: 50,
                                                        width: '45%',
                                                    }} onPress={acceptRide}>
                                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Accept</Text>
                                                    </TouchableOpacity>
                                                </View>

                                            </View>
                                        ) : (
                                            <View>
                                                <ActivityIndicator style={[styles.loading, { marginTop: 40 }]} size="large" color="#000" />
                                                <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 10 }}>Looking for passengers..!</Text>
                                            </View>
                                        )
                                    }
                                </View>
                                {/* End Requests Panel */}
                            </View>
                        </View>
                        {/* <View style={{ flexGrow: 1 }}>
                            <TouchableOpacity style={styles.bottomSheetContainer}>
                                <View style={styles.bottomSheetContent}>
                                    <Text style={styles.orderDetailsText}>Order Details: 94880</Text>
                                    <TouchableOpacity style={styles.viewCartButton}>
                                        <Text style={styles.buttonText}>View Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </View> */}
                    </View>
            }
        </>

    );
};

export default DriverHome;
