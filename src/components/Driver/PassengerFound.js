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
    Platform,
    Linking,
    Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { locationPermission, getCurrentLocation, getAddressFromCoordinates, getLatLonDiffInMeters, notifyMessage, callUser, fetchRouteInfo, showNotification } from './../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Lottie from 'lottie-react-native';
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
    latitude: 30.6800,
    longitude: 76.7221,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};

import Config from "react-native-config";

const { API_KEY, PUSHER_API_KEY } = Config;

// const API_KEY = "AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU";
import CustomAlert from '../../utilities/alert';
import BottomSheetAlert from '../../utilities/modal';
import CancellationOptionsModal from '../../utilities/cancellationModel';
import CustomDirection from '../CustomDirections';
import USER_IMAGE from '../../../assets/images/svg/user.svg';

import { Pusher } from '@pusher/pusher-websocket-react-native';
import API from "../API";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

import BottomSheet, {
    BottomSheetModalProvider, BottomSheetScrollView
} from "@gorhom/bottom-sheet";

import MapViewDirections from "react-native-maps-directions";
import styles from "../../styles/Home.styles";
import pageStyles from "./styles/Passenger.styles";
import globalStyles from "../../styles/Global.styles";
import axios from 'axios';
import Modal from 'react-native-modal';


const cancellationReasons = [
    'Vehicle breakdown',
    'Reschedule Ride',
    'Unexpected personal emergency',
    'Unsafe passenger behavior',
    'Unable to locate passenger',
    'Other Reason',
    // Add other cancellation reasons as needed
];

const PassengerFound = () => {
    const navigation = useNavigation();
    const pusher = Pusher.getInstance();
    const route = useRoute();
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [isCancellationModalVisible, setCancellationModalVisible] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    let { origin, destination, passenger_id, ride_id, driver_current_location, driver_id } = route.params.params;
    origin = {
        latitude: parseFloat(origin.latitude),
        longitude: parseFloat(origin.longitude),
    };

    destination = {
        latitude: parseFloat(destination.latitude),
        longitude: parseFloat(destination.longitude),
    };
    // const origin = {
    //     latitude: 30.70445272790647,
    //     longitude: 76.7141298977784
    // }

    // const destination = {
    //     latitude: 30.350980135492904,
    //     longitude: 77.93599767667669
    // }

    // const passenger_id = 4;

    const [marker, setMarker] = useState(null);

    const [state, setState] = useState({
        has_ridden: false,
        nearby_alert: false, // If Passenger is near
        curLoc: {
            latitude: driver_current_location.latitude,
            longitude: driver_current_location.longitude,
        },
        destination: {},
        isLoading: false,
        time: 0,
        distance: 0,
        rideStatus: 'waitingForPickup',
        polylineCoordinates: [],
        isDriverReachedDestination: false,
        passenger: {},
    })

    const { polylineCoordinates, curLoc, time, distance, isLoading, coordinate, has_ridden, nearby_alert, isDriverReachedDestination, rideStatus, passenger } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));


    useEffect(() => {
        if (!pickup) {
            getAddressFromCoordinates(origin.latitude, origin.longitude)
                .then(pickupAddress => {
                    setPickup(pickupAddress);
                })
                .catch(error => {
                    console.log(error);
                });
        }

        if (!dropoff) {
            getAddressFromCoordinates(destination.latitude, destination.longitude)
                .then(dropoffAddress => {
                    setDropoff(dropoffAddress);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [pickup, dropoff, origin.latitude, origin.longitude, destination.latitude, destination.longitude]);


    useEffect(() => {
        const db = firestore();

        const communicationChannel = `ride-communication/${driver_id}-${passenger_id}`;

        const messageRef = db.collection(communicationChannel);
        const unsubscribe = messageRef.onSnapshot((querySnapshot) => {
            querySnapshot.docs.forEach((doc) => {
                const message = doc.data();
                console.log('Received message from passenger:', message);
                // Handle the received message here
            });
        });

        // Cleanup listener on unmount
        return () => {
            unsubscribe();
        };
    }, [driver_id, passenger_id]);

    const sendMessageToPassenger = () => {
        // Send a message to the passenger
        const db = firestore();
        const communicationChannel = `ride-communication/${passengerId}-${driverId}`;
        const messageRef = db.doc(communicationChannel);

        messageRef.add({
            sender: 'driver',
            message: 'Hi, I am your driver!',
            timestamp: firestore.FieldValue.serverTimestamp(),
        });
    };


    useEffect(() => {
        // const fetchPassengerDetails = async (pass_id) => {
        //     try {
        //         //Get Passenger Details
        //         const response = await API.getPassengerDetails({ "passenger_id": pass_id });
        //         return response;
        //     } catch (error) {
        //         notifyMessage("Failed to fetch driver details")
        //         // console.error('Failed to fetch driver details:', error);
        //         return null;
        //     }
        // };
        // const initializePusher = async () => {
        //     try {
        //         const token = await AsyncStorage.getItem('token');
        //         //Pusher Connection
        //         await pusher.init({
        //             apiKey: "c3bba9aaea1fe2b21d4e",
        //             cluster: "ap2",
        //             forceTLS: true,
        //             encrypted: true,
        //             onAuthorizer: async (channelName, socketId) => {
        //                 try {
        //                     const response = await axios.post(
        //                         "https://thecitycabs.live/broadcasting/auth",
        //                         {
        //                             socket_id: socketId,
        //                             channel_name: channelName
        //                         },
        //                         {
        //                             headers: {
        //                                 "Content-Type": "application/json",
        //                                 Authorization: 'Bearer ' + token,
        //                             }
        //                         }
        //                     );
        //                     return response.data;
        //                 } catch (error) {
        //                     console.log(error);
        //                     return {};
        //                 }
        //             }
        //         });

        //         //Subscribe presence ride channel(Passenger ID)
        //         await pusher.connect();

        // const userInfo = await fetchPassengerDetails(passenger_id);
        // updateState({
        //     passenger: userInfo.data
        // })


        //         await pusher.subscribe({
        //             channelName: 'presence-ride-' + passenger_id,
        //             onSubscriptionSucceeded: async (channelName, data) => {
        //                 console.log('SUBSCRIBED TO THE CHANNEL FROM DRIVER', channelName);
        //                 // await pusher.trigger({
        //                 //     channelName: channelName,
        //                 //     eventName: 'client-driver-details',
        //                 //     data: JSON.stringify(driversInfo)
        //                 // });
        //             },

        //             onSubscriptionError: async (channelName, message, e) => {
        //                 console.log(`onSubscriptionError: ${message} channelName: ${channelName} Exception: ${e}`);
        //             },

        //             onError: async (message, code, e) => {
        //                 console.log(`onError: ${message} code: ${code} exception: ${e}`);
        //             },


        //             onEvent: (eventResponse) => {
        //                 console.log(`Got channel event: ${eventResponse}`);

        //                 if (eventResponse.eventName == 'client-passenger-message') {
        //                     showNotification(eventResponse.data.type, eventResponse.data.msg)
        //                     return showAlert(eventResponse.data.msg);
        //                 }
        //             }
        //         });
        //     } catch (error) {
        //         console.log("Pusher initialization failed:", error);
        //     }
        // };

        // initializePusher();

        if (origin && curLoc) {
            updateState({ polylineCoordinates: [curLoc, origin] }); // Adjust as needed for your scenario
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 5000);
        return () => {
            // console.log("Cleanup function executing...");
            clearInterval(interval);
        };

    }, [rideStatus, has_ridden, nearby_alert, isDriverReachedDestination])

    const animate = (latitude, longitude) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {
            if (driverMarkerRef.current) {
                driverMarkerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    }

    const onCenter = () => {
        mapRef.current?.fitToCoordinates([curLoc], { edgePadding: { top: 10, right: 50, bottom: 50, left: 30 } });
        // mapRef.current.animateToRegion(
        //     {
        //         latitude: curLoc.latitude,
        //         longitude: curLoc.longitude,
        //         latitudeDelta: 0.01,
        //         longitudeDelta: 0.01,
        //     },
        //     1000
        // );
    }

    const onMapViewCenter = () => {
        let markers;
        if (rideStatus == 'tripStarted') {
            markers = [curLoc, destination];
        } else {
            markers = [curLoc, origin];
        }
        mapRef.current.fitToCoordinates(markers, {
            edgePadding: { top: -100, right: 50, bottom: 50, left: 50 }, // Adjust padding as needed
            animated: true,
        });
        // mapRef.current?.fitToCoordinates(markers, { edgePadding: { top: 490, right: 50, bottom: 50, left: 30 } });
    }

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        })
    }

    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude, accuracy } = await getCurrentLocation();
                // console.log("get live location after 5 second")
                animate(latitude, longitude);

                let driverCurrentLocation = {
                    latitude: latitude,
                    longitude: longitude,
                }

                updateState({ curLoc: { latitude, longitude } });

                // console.log("------DRIVER CURRENT LOCATION-----");
                // console.log(driverCurrentLocation)
                // console.log("------DRIVER CURRENT LOCATION ENDS HERE_--------");

                // await pusher.trigger({
                //     channelName: 'presence-ride-' + passenger_id,
                //     eventName: 'client-driver-location',
                //     data: JSON.stringify(driverCurrentLocation)
                // });



                if (!has_ridden) {
                    handlePickupLogic(latitude, longitude);
                } else if (rideStatus == 'tripStarted') {
                    handleDropoffLogic(latitude, longitude);
                } else {
                    console.log("ELSE PART")
                }

                return [latitude, longitude]
            }
        } catch (er) {
            console.log(er.message)
        }
    }

    const handlePickupLogic = async (latitude, longitude) => {
        try {
            // let response = await fetchRouteInfo({ latitude, longitude }, origin);
            // const diff_in_meter_pickup = response[0];
            // const duration = response[1];

            // console.log(diff_in_meter_pickup)
            // console.log(duration)

            if (true) {
                // if (diff_in_meter_pickup !== null && duration !== null) {
                // if ((diff_in_meter_pickup != undefined || diff_in_meter_pickup != null) && (duration != undefined || duration != null)) {
                // fetchTime(diff_in_meter_pickup, duration);


                const diff_in_meter_pickup = getLatLonDiffInMeters(latitude, longitude, origin.latitude, origin.longitude);
                console.log("Pickup in meters: ", diff_in_meter_pickup);


                updateState({ polylineCoordinates: [{ latitude, longitude }, origin] })

                // console.log("has_ridden: ", has_ridden)

                if (diff_in_meter_pickup <= 100) {
                    updateState({ has_ridden: true, rideStatus: 'pickupFinished' })
                    showAlert("Your passenger is just less than 100 km away");
                    sendLiveUpdates("Your Driver is just less than 100 km away.Please get ready", 'nearby_pickup');

                } else if (diff_in_meter_pickup >= 100 && diff_in_meter_pickup <= 150) {
                    // console.log("Near by alert: ", nearby_alert)
                    if (!nearby_alert) {
                        updateState({ nearby_alert: true })
                        showAlert("Your passenger is just around the corner");
                        sendLiveUpdates("Your Driver is just near you!", 'near_pickup');
                    }
                }
            }
        } catch (er) {
            console.error('Error calculating route picking:', er.message);
        }
    }


    const handleDropoffLogic = async (latitude, longitude) => {
        try {
            // let response = await fetchRouteInfo({ latitude, longitude }, destination);
            // let diff_in_meter_dropoff = response[0];
            // let duration = response[1];

            if (true) {
                // if (diff_in_meter_dropoff !== null && duration !== null) {
                // fetchTime(diff_in_meter_dropoff, duration);
                const diff_in_meter_dropoff = getLatLonDiffInMeters(latitude, longitude, destination.latitude, destination.longitude);
                console.log("Dropff in meters: ", diff_in_meter_dropoff)

                updateState({
                    polylineCoordinates: [{ latitude, longitude }, destination],
                })

                if (diff_in_meter_dropoff <= 20 && !isDriverReachedDestination) {
                    showAlert("Destination is less than 20 meters away");
                    sendLiveUpdates("Destination is just near you!", 'near_dropoff');
                    updateState({ isDriverReachedDestination: true });
                }
            }
        } catch (er) {
            console.error('Error calculating route dropping:', er.message);
        }
    }


    const showAlert = async (message) => {
        setIsAlertVisible(true);
        setErrorMessage(message);
    };


    const sendLiveUpdates = async (message, eventType) => {
        const driverResponse = {
            type: eventType,
            msg: message
        };

        await pusher.trigger({
            channelName: 'presence-ride-' + passenger_id,
            eventName: 'client-driver-message',
            data: JSON.stringify(driverResponse)
        });
    }


    const mapRef = useRef(null);
    const bottomSheetModalARef = useRef(null);

    const driverMarkerRef = useRef();
    const passengerMarkerOriginRef = useRef();
    const passengerMarkerDestinationRef = useRef();

    const [showDirections, setShowDirections] = useState(false);
    const snapPoints = useMemo(() => ["1%", "40%", "80%"], []);

    const traceRoute = () => {
        if (origin && destination) {
            if (!showDirections) {
                setShowDirections(true);
                mapRef.current?.fitToCoordinates(polylineCoordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, // Adjust padding as needed
                    animated: true,
                });
            }
        }
    }


    const onRegionChange = (newRegion) => {
        // mapRef.current.fitToCoordinates([obj], {
        //     edgePadding: {
        //         top: 20,
        //         right: 20,
        //         bottom: 20,
        //         left: 20,
        //     },
        //     animated: true,
        // });
        // console.log('New region:', newRegion);
    }

    const sendRideStatusUpdate = (newStatus) => {
        return API.sendRideStatusUpdateToBackend({
            'ride_id': ride_id,
            'rideStatus': newStatus,
            'driver_loc_lat': curLoc.latitude,
            'driver_loc_long': curLoc.longitude,
        }).then(res => {
            if (res.status) {
                if (newStatus != 'tripStarted') {
                    updateState({ rideStatus: newStatus });
                }
                return true;
            }

            return false;

        }).catch(er => {
            showAlert(er.message);
            return false;
        });
    };

    const handleStartPickup = () => {
        if (!has_ridden) {

            sendRideStatusUpdate("pickupStarted").then(response => {
                if (response) {
                    sendLiveUpdates("Pickup has been started by driver", "pickup_started");
                    setShowDirections(true);
                    traceRoute();
                } else {
                    return showAlert("Failed to start pickup");
                }
            })

        } else {
            return showAlert("Pick up is already started");
        }
    }

    const handleFinishPickup = () => {
        if (has_ridden) {
            sendRideStatusUpdate("pickupFinished").then(async response => {
                if (!response) {
                    return showAlert("Failed to start pickup");
                } else {
                    await sendLiveUpdates("Pickup has been finished by driver", "pickup_finished");
                }
            })

        } else {
            return showAlert("Pick up is in progress");
        }
    }

    const handleStartTrip = () => {
        sendRideStatusUpdate("tripStarted").then(async response => {
            if (response) {
                updateState({ rideStatus: 'tripStarted', polylineCoordinates: [curLoc, destination] });
                setShowDirections(true);
                traceRoute();

                await sendLiveUpdates("Trip has been started by driver", "trip_started");

            } else {
                return showAlert("Failed to start trip");
            }
        })
    }


    const handleEndTrip = () => {

        if (isDriverReachedDestination) {
            sendRideStatusUpdate("tripFinished").then(async (response) => {
                console.log(response)
                if (response) {
                    await sendLiveUpdates("Trip has been finished by driver", "trip_finished");
                    await pusher.unsubscribe({ channelName: 'presence-ride-' + passenger_id });

                    navigation.replace("TripFinished", {
                        id: ride_id,
                        is_mode: 1
                    });
                } else {
                    return showAlert("Error setting progress");
                }
            })
        } else {
            return showAlert("Destination is in progress");
        }
    }

    const cancelRide = async () => {
        API.cancelRide({ 'driver_loc_lat': curLoc.latitude, 'driver_loc_long': curLoc.longitude, 'ride_id': ride_id, 'member_method_id': 1 }).then(async res => {

            updateState({ rideStatus: 'rideCancelled' });

            await sendLiveUpdates("Sorry, your order was canceled by the driver.Please order again", "ride_cancelled");
            await pusher.unsubscribe({ channelName: 'presence-ride-' + passenger_id });
            await pusher.disconnect();

            navigation.replace("DriverHome");
        }).catch(er => {
            return showAlert("Error setting cancelled");
        })
    }

    const toggleModal = () => {
        setCancellationModalVisible(!isCancellationModalVisible);
    };

    const closeAlert = () => {
        setIsAlertVisible(false);
    };

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <BottomSheetModalProvider style={styles.container}>
                        <MapView
                            onRegionChangeComplete={onRegionChange}
                            toolbarEnabled={true}
                            rotateEnabled={true}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                ...curLoc,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGITUDE_DELTA
                            }}
                            // showsUserLocation={true}
                            userLocationPriority={'passive'}
                            // userLocationUpdateInterval={5000}
                            userLocationAnnotationTitle={'My location'}
                            fitToElements={true}
                            // followsUserLocation={true}
                            // showsMyLocationButton={true}
                            mapPadding={{ top: 100, left: 0, right: 0, bottom: 0 }}
                            onMapReady={() => {
                                updateState({
                                    isLoading: false
                                })
                            }}
                            // loadingEnabled={true}
                            // loadingIndicatorColor={'#000'}
                            zoomEnabled={true}
                            ref={mapRef}
                            style={styles.map}>
                            {showDirections && origin && destination ? (
                                // {showDirections && origin && destination && polylineCoordinates.length > 0 ? (

                                // <Polyline
                                //     coordinates={polylineCoordinates}
                                //     strokeColor="#FDCD03" // Customize the color as needed
                                //     strokeWidth={7} // Customize the width as needed
                                //     geodesic={true}
                                //     lineCap="square"
                                //     lineJoin="round"
                                //     lineDashPattern={[1]}
                                // />

                                rideStatus === 'tripStarted' ? (
                                    <CustomDirection origin={curLoc} destination={destination} mapRef={mapRef} fetchTime={fetchTime} />
                                ) : rideStatus === 'pickupStarted' || rideStatus === 'waitingForPickup' || rideStatus === 'pickupFinished' ? (
                                    <CustomDirection origin={curLoc} destination={origin} mapRef={mapRef} fetchTime={fetchTime} />
                                ) : null

                            ) : null}


                            {curLoc ? (<Marker.Animated
                                centerOffset={{ x: 0, y: 0 }}
                                title={"You're here"}
                                anchor={{ x: 0.5, y: 0.5 }}
                                coordinate={curLoc} ref={driverMarkerRef}>

                                <Image style={{
                                    width: 50, height: 50, transform: [{ rotate: '0deg' }]
                                }}
                                    resizeMode="contain"
                                    source={require("../../../assets/images/png/car.png")} />

                            </Marker.Animated>) : null}

                            {origin && rideStatus === 'pickupStarted' ? (<Marker.Animated
                                ref={passengerMarkerOriginRef}
                                coordinate={origin}
                                anchor={{ x: 0.5, y: 0.5 }}
                                title={"Your passenger is here"}>
                                <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 8 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{parseFloat(time).toFixed(2)} Min.</Text>
                                </View>

                                <Image style={{ width: 40, height: 40 }}
                                    resizeMode="contain"
                                    source={require("../../../assets/images/png/marker.png")} />

                            </Marker.Animated>) : null}

                            {destination && rideStatus === 'tripStarted' ? (<Marker.Animated
                                ref={passengerMarkerDestinationRef}
                                coordinate={destination}
                                anchor={{ x: 0.5, y: 0.5 }}
                                title={"Destination is here"}>
                                <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 8 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{parseFloat(time).toFixed(2)} Min.</Text>
                                </View>

                                <Image style={{ width: 40, height: 40 }}
                                    resizeMode="contain"
                                    source={require("../../../assets/images/png/marker.png")} /></Marker.Animated>) : null}


                        </MapView>

                        {/* {isAlertVisible && (
                            <CustomAlert
                                visible={isAlertVisible}
                                message={errorMessage}
                                onClose={closeAlert}
                            />
                        )} */}

                        <BottomSheetAlert visible={isAlertVisible} toggleModal={closeAlert} >
                            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                                {errorMessage}
                            </Text>
                        </BottomSheetAlert>


                        <CancellationOptionsModal
                            visible={isCancellationModalVisible}
                            onCancel={cancelRide}
                            options={cancellationReasons}
                            closeModal={toggleModal}
                        />


                        {/* <TouchableOpacity onPress={onCenter} style={{
                            position: "absolute", bottom: 370, right: 10, borderRadius: 30, backgroundColor: "#eee"
                        }}>
                            <Image
                                style={{ width: 50, height: 50, position: 'relative', top: 2 }}
                                source={require("../../../assets/images/png/current.png")}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onMapViewCenter} style={{
                            position: "absolute", bottom: 350, right: 65, borderRadius: 30, backgroundColor: "#eee", padding: 10
                        }}>
                            <Image
                                style={{ width: 20, height: 20, position: 'relative', top: 2 }}
                                source={require("../../../assets/images/png/navigation.png")}
                            />
                        </TouchableOpacity> */}






                        <BottomSheet name={"A"}
                            ref={bottomSheetModalARef}
                            snapPoints={snapPoints}
                            index={1} >
                            <View style={styles.sheetContainer}>
                                <View style={{
                                    justifyContent: 'center',
                                    backgroundColor: '#fff', shadowColor: '#171717',
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
                                                        passenger.profile_image == null ? (
                                                            <USER_IMAGE style={{ height: 25, borderRadius: 50, width: 30 }} />
                                                        ) : (
                                                            <Image source={{ uri: passenger.profile_image }} style={{ height: 40, borderRadius: 50, width: 40 }} />
                                                        )
                                                    ) : null
                                                }
                                            </View>

                                            <View style={{ marginHorizontal: 20 }}>
                                                {
                                                    passenger ? (
                                                        <Text style={[globalStyles.bold, { fontSize: 18, textTransform: 'uppercase' }]}>{passenger.firstname} {passenger.lastname}</Text>
                                                    ) : null
                                                }

                                                {
                                                    time ? (
                                                        <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                                            <MaterialCommunityIcons name="clock" color={'#FDCD03'} size={20} />
                                                            <Text style={{ fontSize: 16, marginLeft: 4 }}>{parseFloat(time).toFixed(2)} min.</Text>
                                                        </View>
                                                    ) : null
                                                }
                                            </View>
                                        </View>


                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            {
                                                passenger ? (
                                                    <TouchableOpacity onPress={() => callUser(passenger.mobile_no)}>
                                                        <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, padding: 10 }}>
                                                            <MaterialCommunityIcons name="phone" color={'#fff'} size={15} />
                                                        </View>
                                                    </TouchableOpacity>
                                                ) : null
                                            }
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

                                                <View style={{
                                                    flex: 1, borderWidth: 1, borderColor: '#eee', marginTop: 5, height: 40, color: '#000', padding: 10,
                                                    borderBottomWidth: 1, marginLeft: 10
                                                }}>
                                                    <Text>{pickup}</Text>
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

                                                <View style={{
                                                    flex: 1, borderWidth: 1, borderColor: '#eee', height: 40, color: '#000', padding: 10,
                                                    borderBottomWidth: 1, marginLeft: 10
                                                }}>
                                                    <Text>{dropoff}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>


                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        {rideStatus === 'waitingForPickup' ? (
                                            <TouchableOpacity style={[pageStyles.btn, pageStyles.enabled]} onPress={handleStartPickup}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Start Pickup</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                        {rideStatus === 'pickupStarted' ? (
                                            <TouchableOpacity style={[pageStyles.btn, pageStyles.enabled]} onPress={handleFinishPickup}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Finish Pickup</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                        {rideStatus === 'pickupFinished' ? (
                                            <TouchableOpacity style={[pageStyles.btn, pageStyles.enabled]} onPress={handleStartTrip}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Start Trip</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                        {rideStatus === 'tripStarted' ? (
                                            <TouchableOpacity style={[pageStyles.btn, pageStyles.enabled]} onPress={handleEndTrip}>
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>End Trip</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                        {rideStatus === 'tripFinished' ? (
                                            <TouchableOpacity style={[pageStyles.btn, pageStyles.enabled]} >
                                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Trip Finished</Text>
                                            </TouchableOpacity>
                                        ) : null}


                                        <TouchableOpacity
                                            style={[pageStyles.rejectBtn, { marginTop: 5 }]}
                                            onPress={toggleModal}
                                        >
                                            <MaterialCommunityIcons name="close" color={'#000'} size={25} />
                                        </TouchableOpacity>

                                    </View>

                                </View>
                            </View>
                        </BottomSheet>


                        <View style={pageStyles.bottomIconsContainer}>
                            <TouchableOpacity onPress={onCenter} style={pageStyles.iconButton}>
                                <Image style={pageStyles.icon} source={require("../../../assets/images/png/current.png")} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onMapViewCenter} style={[pageStyles.iconButton, pageStyles.secondIconButton]}>
                                <Image style={pageStyles.secondIcon} source={require("../../../assets/images/png/navigation.png")} />
                            </TouchableOpacity>
                        </View>







                    </BottomSheetModalProvider >

                )
            }
        </>
    );
};

export default PassengerFound;
