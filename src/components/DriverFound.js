import React, {
    useRef,
    useCallback,
    useMemo,
    useEffect,
    useState,
} from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions,
    ToastAndroid,
    Platform,
    Modal,
    TextInput,
    Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, Polyline } from "react-native-maps";
import { locationPermission, getCurrentLocation, pusherAuth, notifyMessage, callUser, fetchRouteInfo, getLatLonDiffInMeters, showNotification } from './helpers';
import { AirbnbRating } from 'react-native-ratings';
import API from "./API";


const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Pusher,
} from '@pusher/pusher-websocket-react-native';

import Lottie from 'lottie-react-native';
import globalStyles from "../styles/Global.styles";

import BottomSheetAlert from '../utilities/modal';
import CustomAlert from '../utilities/alert';
import CancellationOptionsModal from '../utilities/cancellationModel';
import USER_IMAGE from '../../assets/images/svg/user.svg';
import CustomDirection from './CustomDirections';



import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";


import MapViewDirections from "react-native-maps-directions";
import styles from "../styles/Home.styles";
import pageStyles from "../styles/driverFound.styles";
import Config from "react-native-config";

const { API_KEY, PUSHER_API_KEY } = Config;

// const API_KEY = "AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU";

const DriverFound = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const notificationData = route.params?.params.notificationData;

    const mapRef = useRef(null);
    const driverMarkerRef = useRef();
    const passengerMarkerOriginRef = useRef();
    const passengerMarkerDestinationRef = useRef();

    const pusher = Pusher.getInstance();
    const [showDirections, setShowDirections] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [state, setState] = useState({
        curLoc: {
            latitude: 30.7046,
            longitude: 77.1025,
        },
        time: 0,
        distance: 0,
        nearby_alert: false, // If driver is near
        isLoading: false,
        driver_name: "",
        origin: {
            latitude: 30.7046,
            longitude: 77.1025,
        },
        destination: {
            latitude: 30.7046,
            longitude: 77.1025,
        },
        driver: {},
        modalVisible: false,
        driver_location: {
            latitude: 0,
            longitude: 0,
        },
        rating: 0,
        description: '',
        isTripOver: false,
        rideStatus: 'waitingForDriver',
        polylineCoordinates: [],
        isDriverReachedDestination: false,
        userId: '',
        has_ridden: false,
        isAlertVisible: false,
        errorMessage: '',
        ride_id: 0,
    })

    const cancellationReasons = [
        'Change Destination',
        'Reschedule Ride',
        'Driver Delayed',
        'Traffic Issue',
        'Emergency',
        'Other Reason',
    ];

    const { curLoc, time, distance,
        origin, destination,
        driver_name, driver,
        isLoading, modalVisible,
        rating, description, driver_location,
        isTripOver, polylineCoordinates,
        ride_id, userId, rideStatus, isDriverReachedDestination,
        nearby_alert, has_ridden,
        isAlertVisible, errorMessage } = state;
    // const { curLoc, time, distance, isLoading, driver, modalVisible, rating, description, isTripOver } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    // const origin = {
    //     latitude: 30.70445272790647,
    //     longitude: 76.7141298977784
    // }

    // const destination = {
    //     latitude: 30.350980135492904,
    //     longitude: 77.93599767667669
    // }

    // const driver_location = {
    //     latitude: 30.34011089559766,
    //     longitude: 76.38639012779406,
    // }


    useEffect(() => {
        if (route.params?.params) {
            updateState({
                origin: {
                    latitude: parseFloat(notificationData['pickup.latitude']),
                    longitude: parseFloat(notificationData['pickup.longitude']),
                },
                destination: {
                    latitude: parseFloat(notificationData['dropoff.latitude']),
                    longitude: parseFloat(notificationData['dropoff.longitude']),
                },
                driver_location: {
                    latitude: parseFloat(notificationData['driver_location.latitude']),
                    longitude: parseFloat(notificationData['driver_location.longitude']),
                },
                // driver_name: notificationData['driver_name'],
                isLoading: false,
                driver: JSON.parse(notificationData['drivers_data']),
                ride_id: parseInt(notificationData['ride_id']),
            });
        }
    }, [route.params?.params]);

    const openModal = () => {
        updateState({ modalVisible: true });
    };

    const closeModal = () => {
        updateState({ modalVisible: false });
    };

    const handleRating = (newRating) => {
        updateState({
            rating: newRating
        });
        // You can perform actions based on the new rating here
    };

    const handleDescriptionChange = (text) => {
        updateState({
            description: text
        })
    }

    const handleSubmit = () => {
        API.makeRating({ 'driver_id': driver.id, 'rating': rating, 'comment': description }).then(res => {
            if (res) {
                updateState({
                    rating: 0,
                    description: ''
                });

                navigation.replace("TripFinished", {
                    id: ride_id,
                    is_mode: 2
                });
            }
        }).catch(er => {
            console.log(er.message)
        })

    };

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        })
    }

    const startRide = () => {
        // console.log("ORIGIN IN START RIDE: ", origin)
        // console.log("DESTINATION IN START RIDE: ", destination)
        // console.log("DRIVER IN START RIDE: ", driver_location)
        if (origin.latitude !== 0 && driver_location.latitude !== 0) {
            console.log("ENTERED IN START RIDE");
            setShowDirections(true);

            mapRef.current.animateToRegion(polylineCoordinates, 1000); // Adjust duration as needed

            // mapRef.current?.fitToCoordinates(polylineCoordinates, {
            //     edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, // Adjust padding as needed
            //     animated: true,
            // });
        }
    }


    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await API.getUserDetails();
                return response;
            } catch (error) {
                notifyMessage("Failed to fetch user details")
                return null;
            }
        };


        const initializePusher = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                //Pusher Connection
                await pusher.init({
                    apiKey: "c3bba9aaea1fe2b21d4e",
                    cluster: "ap2",
                    forceTLS: true,
                    encrypted: true,
                    onAuthorizer: async (channelName, socketId) => {
                        try {
                            const response = await axios.post(
                                "https://thecitycabs.live/broadcasting/auth",
                                {
                                    socket_id: socketId,
                                    channel_name: channelName
                                },
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: 'Bearer ' + token,
                                    }
                                }
                            );
                            return response.data;
                        } catch (error) {
                            console.error(error);
                            return {};
                        }
                    }
                });


                await pusher.connect();


                //Subscribe presence ride channel(Passenger ID)
                const userInfo = await fetchUserDetails();
                updateState({
                    userId: userInfo.id
                })

                console.log("UPDATED STATE: ", userId, ' and user info is ', userInfo.id);

                await pusher.subscribe({
                    channelName: 'presence-ride-' + userInfo.id,

                    onEvent: (eventResponse) => {
                        console.log(`Got channel event: ${eventResponse}`);
                        //Update Driver Location
                        if (eventResponse.eventName == 'client-driver-location') {

                            const parsedData = JSON.parse(eventResponse.data);
                            updateState({
                                driver_location: {
                                    latitude: parsedData.latitude,
                                    longitude: parsedData.longitude,
                                }
                            });
                            animate(parsedData.latitude, parsedData.longitude, "driver");
                        }

                        if (eventResponse.eventName == 'client-driver-message') {
                            const dataMessage = JSON.parse(eventResponse.data);

                            if (dataMessage.type == 'trip_started') {
                                updateState({ rideStatus: 'tripStarted' })
                            } else if (dataMessage.type == 'trip_finished') {
                                updateState({ rideStatus: 'tripFinished', isTripOver: true })
                            }

                            showAlert(dataMessage.msg);
                            showNotification(dataMessage.type, dataMessage.msg);
                        }
                    },


                    onSubscriptionSucceeded: async (channelName, data) => {
                        console.log('SUBSCRIBED TO THE CHANNEL FROM PASSENGER', channelName);
                        // await pusher.trigger({
                        //     channelName: channelName,
                        //     eventName: 'client-driver-details',
                        //     data: JSON.stringify(driversInfo)
                        // });
                    },

                    onSubscriptionError: async (channelName, message, e) => {
                        console.log(`Passenger onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
                    },

                    onError: async (message, code, e) => {
                        console.log(`Passenger onError: ${message} code: ${code} exception: ${e}`);
                    },


                    onConnectionStateChange: async (currentState, prevState) => {
                        console.log('Connection state changed:', currentState);

                        // if (currentState == 'DISCONNECTED') {
                        //     await pusher.connect();
                        // }


                    }
                });



            } catch (error) {
                console.error("Pusher initialization failed:", error);
            }
        };


        initializePusher();
    }, []);



    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 5000);
        return () => {
            // console.log("Cleanup function executing...");
            clearInterval(interval);
        };

    }, [rideStatus, nearby_alert, isDriverReachedDestination, has_ridden, driver_location])

    useEffect(() => {
        // console.log("Updated driver location in effect: ", driver_location); // This will reflect the updated state value
        if (origin.latitude !== 0 && driver_location.latitude !== 0 && destination.latitude !== 0) {
            if (rideStatus === 'waitingForDriver' || rideStatus === 'pickupStarted') {
                if (rideStatus !== "pickupStarted") {
                    updateState({ rideStatus: 'pickupStarted' });
                }
                updateState({ polylineCoordinates: [driver_location, origin] });
            } else if (rideStatus == 'tripStarted') {
                updateState({ polylineCoordinates: [driver_location, destination] });
            }
        }
        startRide()
    }, [driver_location]);


    const animate = (latitude, longitude, mode) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {

            if (mode == 'passenger') {
                if (passengerMarkerOriginRef.current) {
                    passengerMarkerOriginRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
                }
            } else {
                if (driverMarkerRef.current) {
                    driverMarkerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
                }
            }




        } else {
            coordinate.timing(newCoordinate).start();
        }
    }

    const onCenter = () => {
        mapRef.current?.fitToCoordinates([driver_location], { edgePadding: { top: 390, right: 50, bottom: 50, left: 30 } });
        // mapRef.current.animateToRegion({latitude: curLoc.latitude,longitude: curLoc.longitude,latitudeDelta: LATITUDE_DELTA,longitudeDelta: LONGITUDE_DELTA})
    }

    const onMapViewCenter = () => {
        let markers;
        if (rideStatus == 'tripStarted') {
            markers = [driver_location, destination];
        } else {
            markers = [driver_location, origin];
        }
        mapRef.current.fitToCoordinates(markers, {
            edgePadding: { top: 290, right: 50, bottom: 50, left: 50 }, // Adjust padding as needed
            animated: true,
        });
        // mapRef.current?.fitToCoordinates(markers, { edgePadding: { top: 490, right: 50, bottom: 50, left: 30 } });
    }

    const cancelRide = async () => {
        API.cancelRide({ 'passenger_loc_lat': curLoc.latitude, 'passenger_lat_long': curLoc.longitude, 'ride_id': ride_id, 'member_method_id': 0 }).then(async res => {
            updateState({ rideStatus: 'rideCancelled' });

            await sendLiveUpdates("Sorry, your trip was canceled by the passenger.", "ride_cancelled")
            await pusher.unsubscribe({ channelName: 'presence-ride-' + userId, });

            notifyMessage("Ride cancelled");
            navigation.replace("PassengerHome");
        }).catch(er => {
            console.error(er.message)
        })




    }

    const onRegionChange = () => {
        mapRef?.current?.animateToRegion({
            center: {
                latitude: curLoc.latitude,
                longitude: curLoc.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            }
        });
    }


    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission && showDirections) {
                const { latitude, longitude, accuracy } = await getCurrentLocation();
                // console.log("get live location after 5 second")
                animate(latitude, longitude, "passenger");

                updateState({ curLoc: { latitude, longitude } });

                // console.log("-----------------------------------------");
                // console.log("ENTERED INTO THIS PHASE");
                // console.log("-----------------------------------------");

                if (driver_location.latitude !== 0 && origin.latitude !== 0) {
                    if (!has_ridden) {
                        handlePickupLogic(driver_location.latitude, driver_location.longitude);
                    } else if (rideStatus == 'tripStarted') {
                        handleDropoffLogic(driver_location.latitude, driver_location.longitude);
                    } else {
                        console.log("ELSE PART")
                    }
                }

                return [latitude, longitude]
            }
        } catch (er) {
            console.error(er.message)
        }
    }


    const handlePickupLogic = async (latitude, longitude) => {
        try {
            // console.log("has_ridden: ", has_ridden)

            // let response = await fetchRouteInfo({ latitude, longitude }, origin);
            // const diff_in_meter_pickup = response[0];
            // const duration = response[1];

            // if (diff_in_meter_pickup !== null && duration !== null) {
            //     fetchTime(diff_in_meter_pickup, duration);

            if (true) {

                const diff_in_meter_pickup = getLatLonDiffInMeters(latitude, longitude, origin.latitude, origin.longitude);
                console.log("Pickup in meters: ", diff_in_meter_pickup);

                updateState({
                    polylineCoordinates: [{ latitude, longitude }, origin],
                });

                // console.log("PICKUP TIME LEFT: ", diff_in_meter_pickup)

                // updateState({
                //     userId: userInfo.id
                // })


                if (diff_in_meter_pickup <= 100) {
                    updateState({ has_ridden: true })
                    showAlert("Your Driver is just around the corner");

                } else if (diff_in_meter_pickup >= 100 && diff_in_meter_pickup <= 150) {
                    // console.log("Near by alert: ", nearby_alert)
                    if (!nearby_alert) {
                        updateState({ nearby_alert: true })
                        showAlert("Your Driver is just around the corner");
                    }
                }
            }
        } catch (er) {
            console.error('Error calculating route:', er.message);
        }
    }


    const handleDropoffLogic = async (latitude, longitude) => {
        try {
            // let response = await fetchRouteInfo({ latitude, longitude }, destination);
            // const diff_in_meter_dropoff = response[0];
            // const duration = response[1];

            // if (diff_in_meter_dropoff !== null && duration !== null) {
            // fetchTime(diff_in_meter_dropoff, duration);

            if (true) {

                const diff_in_meter_dropoff = getLatLonDiffInMeters(latitude, longitude, destination.latitude, destination.longitude);
                console.log("Dropff in meters: ", diff_in_meter_dropoff)

                updateState({
                    polylineCoordinates: [{ latitude, longitude }, destination],
                });

                if (diff_in_meter_dropoff <= 20 && !isDriverReachedDestination) {
                    showAlert("Destination is less than 20 meters away");
                    updateState({ isDriverReachedDestination: true });
                }
            }
        } catch (er) {
            console.error('Error calculating route:', er.message);
        }
    }


    const showAlert = async (message) => {
        updateState({
            isAlertVisible: true,
            errorMessage: message
        });
    };

    const sendLiveUpdates = async (message, eventType) => {
        const passengerResponse = {
            type: eventType,
            title: 'Cancelled',
            msg: message
        };

        await pusher.trigger({
            channelName: 'presence-ride-' + userId,
            eventName: 'client-passenger-message',
            data: JSON.stringify(passengerResponse)
        });
    }

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const closeAlert = () => {
        updateState({
            isAlertVisible: false,
        });

    };


    // console.log("origin location: ", origin)
    // console.log("Destination location: ", destination)
    // console.log("Driver location: ", driver_location)


    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) :
                    <BottomSheetModalProvider style={styles.container}>
                        <MapView
                            ref={mapRef}
                            onRegionComplete={onRegionChange}
                            toolbarEnabled={true}
                            rotateEnabled={true}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                ...curLoc,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            }}
                            // showsUserLocation={true}
                            // userLocationPriority={'passive'}
                            // userLocationUpdateInterval={5000}
                            // userLocationAnnotationTitle={'My location'}
                            // followsUserLocation={true}
                            // showsMyLocationButton={true}
                            mapPadding={{ top: 100, left: 0, right: 0, bottom: 0 }}
                            onMapReady={() => {
                                // updateState({
                                //     isLoading: false
                                // })
                            }}
                            // loadingEnabled={true}
                            // loadingIndicatorColor={'#000'}
                            zoomEnabled={true}
                            style={styles.map}>


                            {origin.latitude !== 0 && rideStatus == 'pickupStarted' ?
                                <Marker.Animated
                                    coordinate={origin}
                                    ref={passengerMarkerOriginRef}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    title={"You are here"}>
                                    <Image style={{ width: 50, height: 50, zIndex: 999 }}
                                        resizeMode="contain"
                                        source={require("../../assets/images/png/passenger-marker.png")} />

                                </Marker.Animated> : null}


                            {driver_location.latitude !== 0 ?
                                <Marker.Animated
                                    flat={true}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    title={"Driver is here"}
                                    coordinate={driver_location}
                                    description={'Driver Location'}
                                    draggable
                                    ref={driverMarkerRef}>

                                    <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 8 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{parseFloat(time).toFixed(2)} Min.</Text>
                                    </View>


                                    <Image style={{ width: 40, height: 40 }} resizeMode="contain" source={require("../../assets/images/png/car.png")} />
                                </Marker.Animated> : null}


                            {destination.latitude !== 0 && rideStatus == 'tripStarted' ?
                                <Marker.Animated
                                    coordinate={destination}
                                    ref={passengerMarkerDestinationRef}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    title={"Destination is here"}>

                                    <Image style={{ width: 20, height: 20, zIndex: 999 }}
                                        resizeMode="contain"
                                        source={require("../../assets/images/png/destination.png")} />

                                </Marker.Animated> : null}



                            {/* {showDirections && origin && destination && driver_location ? ( */}
                            {showDirections && origin.latitude !== 0 && destination.latitude !== 0 ? (
                                // {showDirections && origin.latitude !== 0 && destination.latitude !== 0 && polylineCoordinates.length > 0 ? (
                                // <Polyline
                                //     coordinates={polylineCoordinates}
                                //     strokeColor="#FDCD03"
                                //     strokeWidth={7}
                                //     geodesic={true}
                                //     lineCap="square"
                                //     lineJoin="round"
                                //     lineDashPattern={[1]}
                                // />
                                rideStatus === 'tripStarted' ? (
                                    <CustomDirection origin={driver_location} destination={destination} mapRef={mapRef} fetchTime={fetchTime} />
                                ) : rideStatus === 'pickupStarted' || rideStatus === 'waitingForDriver' || rideStatus === 'pickupFinished' ? (
                                    <CustomDirection origin={driver_location} destination={origin} mapRef={mapRef} fetchTime={fetchTime} />
                                ) : null



                            ) : null}
                        </MapView>


                        {/* {isAlertVisible && (
                            <CustomAlert
                                visible={isAlertVisible}
                                message={errorMessage}
                                onClose={closeAlert}
                            />
                        )} */}


                        <BottomSheetAlert visible={isAlertVisible} toggleModal={closeAlert} >
                            <Text style={{ fontSize: 18, padding: 20, fontWeight: 'bold', textAlign: 'center' }}>
                                {errorMessage}
                            </Text>
                        </BottomSheetAlert>



                        <CancellationOptionsModal
                            visible={isModalVisible}
                            onCancel={cancelRide}
                            options={cancellationReasons}
                            closeModal={toggleModal}
                        />


                        <TouchableOpacity onPress={onMapViewCenter} style={{
                            position: "absolute", bottom: 10, left: 10, borderRadius: 30, backgroundColor: "#eee"
                        }}>
                            <Image
                                style={{ width: 50, height: 50, position: 'relative', top: 2 }}
                                source={require("../../assets/images/png/current.png")}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onCenter} style={{
                            position: "absolute", bottom: 40, right: 1, borderRadius: 30, backgroundColor: "#eee"
                        }}>
                            <Image
                                style={{ width: 50, height: 50, position: 'relative', top: 2 }}
                                source={require("../../assets/images/png/current.png")}
                            />
                        </TouchableOpacity>

                        {/* <TouchableOpacity onPress={goToLocation} style={{
                            position: "absolute", bottom: 300, right: 15, borderRadius: 30, backgroundColor: "#d2d2d2"
                        }}>
                            <Image
                                style={{ width: 50, height: 50 }}
                                source={require("../../assets/images/png/current.png")}
                            />
                        </TouchableOpacity> */}


                        <View style={[styles.sheetContainer, !isTripOver ? { flex: 0.3 } : { flex: 1.3 }]}>
                            {/* Trip */}
                            {
                                !isTripOver && (
                                    <View>
                                        <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: 10 }}>
                                            <View style={{ position: 'relative', bottom: 50, right: 3, width: 100, height: 100, borderColor: '#fff', borderWidth: 5, borderRadius: 50, backgroundColor: '#fff' }}>
                                                <TouchableOpacity>
                                                    {driver && (
                                                        driver.profile_image === null || driver.profile_image === '' ? (
                                                            <USER_IMAGE style={styles.sideMenuProfileIcon} />
                                                        ) : (
                                                            <Image source={{ uri: driver.profile_image }} style={{ height: 80, borderRadius: 50 }} />
                                                        )
                                                    )}
                                                    <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{driver && driver.firstname + ' ' + driver.lastname}</Text>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <MaterialCommunityIcons name="star" color={'#FFB800'} size={20} />
                                                        {driver && (
                                                            <Text>{driver.average_rating}</Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            </View>

                                            {/* <Modal
                                                visible={modalVisible}
                                                animationType="slide"
                                                transparent={true}
                                                onRequestClose={closeModal}
                                            >
                                                <View style={pageStyles.modalContainer}>
                                                    <View style={pageStyles.modalContent}>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <TouchableOpacity onPress={closeModal}>
                                                                <View style={{ backgroundColor: '#eee', borderRadius: 50, padding: 10 }}>
                                                                    <MaterialCommunityIcons name="arrow-left" color={'#000'} size={15} />
                                                                </View>
                                                            </TouchableOpacity>

                                                            <Text style={{ marginHorizontal: 15, fontSize: 21, fontWeight: 'bold', textAlign: 'center' }}>Driver Information</Text>
                                                        </View>


                                                        <View style={{ flexDirection: 'row', marginTop: 50 }}>
                                                            <Image source={require('../.../../../assets/images/driver/driver.png')} style={{ height: 50, width: 50 }} />
                                                            <View style={{ marginHorizontal: 13 }}>
                                                                <Text>{driver_name}</Text>
                                                                <Text style={globalStyles.bold}>
                                                                    {driver && (
                                                                        <Text>{driver.brand}</Text>
                                                                    )}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <View style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 20, padding: 20, margin: 20 }}>
                                                            <Text>User with</Text>
                                                            {driver && (
                                                                <Text>{driver.date_of_joining}</Text>
                                                            )}
                                                            <View style={{ borderBottomWidth: 0.9, borderBottomColor: '#eee', marginTop: 7 }} />

                                                            <View style={{ marginTop: 10 }}>
                                                                <Text>Vehicle Class</Text>
                                                                {driver && (
                                                                    <Text>{driver.model}</Text>
                                                                )}
                                                            </View>

                                                            <View style={{ borderBottomWidth: 0.9, borderBottomColor: '#eee', marginTop: 7 }} />

                                                            <View style={{ marginTop: 10 }}>
                                                                <Text>Car number</Text>
                                                                {driver && (
                                                                    <Text>{driver.number_plate}</Text>
                                                                )}
                                                            </View>

                                                        </View>
                                                    </View>
                                                </View>
                                            </Modal>
 */}

                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {/* <View style={{ backgroundColor: '#eee', borderRadius: 50, padding: 10, marginHorizontal: 10 }}>
                                                        <MaterialCommunityIcons name="phone" color={'#000'} size={15} />
                                                    </View> */}
                                                    <TouchableOpacity onPress={() => callUser(driver.mobile_no)}>
                                                        <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, padding: 10 }}>
                                                            <MaterialCommunityIcons name="phone" color={'#fff'} size={15} />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>

                                                {
                                                    driver && (
                                                        <Text style={{ marginTop: 10, backgroundColor: '#eee', borderRadius: 50, padding: 3, color: '#000', fontWeight: 'bold' }}>
                                                            {driver.number_plate}
                                                        </Text>
                                                    )
                                                }
                                                <Text>
                                                    {
                                                        driver && (
                                                            <Text style={{ marginTop: 10, backgroundColor: '#eee', borderRadius: 50, padding: 3, color: '#000', fontWeight: 'bold' }}>
                                                                {driver.brand} {driver.model}
                                                            </Text>
                                                        )
                                                    }
                                                </Text>
                                            </View>

                                            {/* <View>
                                        {distance !== 0 && time !== 0 && (<View style={{ alignItems: 'center', marginVertical: 16 }}>
                                            <Text>Time left: {time.toFixed(0)} Min. </Text>
                                            <Text>Distance left: {distance.toFixed(0)} km</Text>
                                        </View>)}
                                    </View> */}
                                        </View>


                                        <View style={{ margin: 10, flexDirection: 'row', marginTop: 4 }}>
                                            <TouchableOpacity
                                                style={styles.acceptBtn}
                                                onPress={startRide}
                                            >
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Ride to Driver</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.rejectBtn}
                                                onPress={toggleModal}
                                            >
                                                <MaterialCommunityIcons name="close" color={'#000'} size={30} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>


                                )
                            }
                            {/* End Trip */}

                            {/* Rating */}
                            {
                                isTripOver && (
                                    <View>
                                        <View style={{ position: 'relative', bottom: 50, right: 3, width: 100, height: 100, borderColor: '#fff', borderWidth: 5, borderRadius: 50, backgroundColor: '#fff' }}>
                                            <TouchableOpacity>
                                                {driver && (
                                                    driver.profile_image === null || driver.profile_image === '' ? (
                                                        <USER_IMAGE style={styles.sideMenuProfileIcon} />
                                                    ) : (
                                                        <Image source={{ uri: driver.profile_image }} style={{ height: 80, borderRadius: 50 }} />
                                                    )
                                                )}
                                                <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{driver && driver.firstname + ' ' + driver.lastname}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={{ fontSize: 17, fontWeight: '600', textAlign: 'center', }}>Leave Feedback</Text>

                                        <AirbnbRating
                                            count={5} // Number of stars to display
                                            reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']} // Labels for each star
                                            defaultRating={0} // Initial rating
                                            size={20} // Size of the stars
                                            reviewSize={20}
                                            onFinishRating={handleRating} // Callback when user finishes rating
                                        />

                                        <TextInput
                                            style={[pageStyles.input, { color: '#000' }]}
                                            placeholder="Message"
                                            value={description}
                                            onChangeText={handleDescriptionChange}
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                        />

                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <TouchableOpacity
                                                style={styles.acceptBtn}
                                                onPress={handleSubmit}
                                            >
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Rate the trip</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            }

                            {/* End Rating */}

                        </View>

                    </BottomSheetModalProvider>
            }
        </>
    );
};

export default DriverFound;
