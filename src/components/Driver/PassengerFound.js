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
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { locationPermission, getCurrentLocation, getAddressFromCoordinates, getLatLonDiffInMeters, notifyMessage, callUser, fetchRouteInfo } from './../helpers';
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

import BottomSheetAlert from '../../utilities/modal';
import { Pusher } from '@pusher/pusher-websocket-react-native';
import API from "../API";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import MapViewDirections from "react-native-maps-directions";
import styles from "../../styles/Home.styles";
import pageStyles from "./styles/Passenger.styles";
import globalStyles from "../../styles/Global.styles";
import axios from 'axios';

const PassengerFound = () => {
    const navigation = useNavigation();
    const pusher = Pusher.getInstance();
    const route = useRoute();
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);


    let { origin, destination, passenger_id } = route.params.params;
    origin = {
        latitude: parseFloat(origin.latitude),
        longitude: parseFloat(origin.longitude)
    };

    destination = {
        latitude: parseFloat(destination.latitude),
        longitude: parseFloat(destination.longitude)
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
            latitude: 30.34011089559766,
            longitude: 76.38639012779406,
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

    const { polylineCoordinates, curLoc, time, distance, destinationCords, isLoading, coordinate, has_ridden, nearby_alert, isDriverReachedDestination, rideStatus, passenger } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));


    useEffect(() => {
        if (!pickup) {
            console.log(origin);
            getAddressFromCoordinates(origin.latitude, origin.longitude)
                .then(pickupAddress => {
                    setPickup(pickupAddress);
                })
                .catch(error => {
                    console.log(error);
                });
        }

        if (!dropoff) {
            console.log(destination);
            getAddressFromCoordinates(destination.latitude, destination.longitude)
                .then(dropoffAddress => {
                    setDropoff(dropoffAddress);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [pickup, dropoff, origin.latitude, origin.longitude, destination.latitude, destination.longitude]);


    const fetchUserDetails = async () => {
        try {
            const response = await API.getUserDetails();
            return response;
        } catch (error) {
            notifyMessage("Failed to fetch driver details")
            // console.error('Failed to fetch driver details:', error);
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
                        console.log(error);
                        return {};
                    }
                }
            });

            //Subscribe presence ride channel(Passenger ID)
            await pusher.connect();

            const userInfo = await fetchUserDetails();
            updateState({
                passenger: userInfo
            })
            await pusher.subscribe({
                channelName: 'presence-ride-' + passenger_id,
                // onSubscriptionSucceeded: async (channelName, data) => {
                //     await pusher.trigger({
                //         channelName: channelName,
                //         eventName: 'client-driver-details',
                //         data: JSON.stringify(driversInfo)
                //     });
                // },

                onEvent: (eventResponse) => {
                    console.log(`Got channel event: ${eventResponse}`);

                    // if (eventResponse.eventName == 'client-driver-response') {

                    // }
                }
            });
        } catch (error) {
            console.log("Pusher initialization failed:", error);
        }
    };



    useEffect(() => {
        initializePusher();

        if (origin && curLoc) {
            updateState({ polylineCoordinates: [curLoc, origin] }); // Adjust as needed for your scenario
        }
    }, []);


    // console.log("POLYLINE COORDINATES: ", polylineCoordinates);

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 15000);
        return () => {
            console.log("Cleanup function executing...");
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
        mapRef.current?.fitToCoordinates([curLoc], { edgePadding: { top: 390, right: 50, bottom: 50, left: 30 } });
        // mapRef.current.animateToRegion({latitude: curLoc.latitude,longitude: curLoc.longitude,latitudeDelta: LATITUDE_DELTA,longitudeDelta: LONGITUDE_DELTA})
    }

    const onMapViewCenter = () => {
        let markers;
        if (rideStatus == 'tripStarted') {
            markers = [curLoc, destination];
        } else {
            markers = [curLoc, origin];
        }
        mapRef.current.fitToCoordinates(markers, {
            edgePadding: { top: 290, right: 50, bottom: 50, left: 50 }, // Adjust padding as needed
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
                console.log("get live location after 5 second")
                animate(latitude, longitude);

                updateState({ curLoc: { latitude, longitude } });

                let driverCurrentLocation = {
                    latitude: latitude,
                    longitude: longitude,
                }


                // console.log(pusher)

                await pusher.trigger({
                    channelName: 'presence-ride-' + passenger_id,
                    eventName: 'client-driver-location',
                    data: JSON.stringify(driverCurrentLocation)
                });



                if (!has_ridden) {
                    handlePickupLogic(latitude, longitude);
                } else if (rideStatus == 'tripStarted') {
                    handleDropoffLogic(latitude, longitude);
                } else {
                    console.log("Here")
                }

                return [latitude, longitude]
            }
        } catch (er) {
            console.log(er.message)
        }
    }

    const handlePickupLogic = async (latitude, longitude) => {
        let response = await fetchRouteInfo({ latitude, longitude }, origin);
        const diff_in_meter_pickup = response[0];
        const duration = response[1];

        console.log(diff_in_meter_pickup)
        console.log(duration)

        if ((diff_in_meter_pickup != undefined || diff_in_meter_pickup != null) && (duration != undefined || duration != null)) {
            fetchTime(diff_in_meter_pickup, duration);
            // const diff_in_meter_pickup = getLatLonDiffInMeters(latitude, longitude, origin.latitude, origin.longitude);
            console.log("Pickup in meters: ", diff_in_meter_pickup);


            updateState({ polylineCoordinates: [{ latitude, longitude }, origin] })

            console.log("has_ridden: ", has_ridden)

            if (diff_in_meter_pickup <= 20) {
                updateState({ has_ridden: true })
                showAlert("Your passenger is just around the corner", 'near_pickup');

            } else if (diff_in_meter_pickup <= 50) {
                console.log("Near by alert: ", nearby_alert)
                if (!nearby_alert) {
                    updateState({ nearby_alert: true })
                    showAlert("Your passenger is just around the corner", 'near_pickup');
                }
            }
        }
    }


    const handleDropoffLogic = async (latitude, longitude) => {
        // let { diff_in_meter_dropoff, duration } = await fetchRouteInfo({ latitude, longitude }, destination);
        let response = await fetchRouteInfo({ latitude, longitude }, destination);
        let diff_in_meter_dropoff = response[0];
        let duration = response[1];
        fetchTime(diff_in_meter_dropoff, duration);
        // const diff_in_meter_dropoff = getLatLonDiffInMeters(latitude, longitude, destination.latitude, destination.longitude);
        console.log("Dropff in meters: ", diff_in_meter_dropoff)

        updateState({
            polylineCoordinates: [{ latitude, longitude }, destination],
        })

        if (diff_in_meter_dropoff <= 20 && !isDriverReachedDestination) {
            showAlert("Destination is less than 20 meters away", 'near_pickup');
            updateState({ isDriverReachedDestination: true });
        }
    }


    const showAlert = async (message, eventType) => {
        Alert.alert(
            "Slow down",
            message,
            [{ text: 'Gotcha!' }],
            { cancelable: false }
        );

        const driverResponse = {
            type: eventType,
            title: 'Just a heads up',
            msg: message
        };

        await pusher.trigger({
            channelName: 'presence-ride-' + passenger_id,
            eventName: 'client-driver-message',
            data: JSON.stringify(driverResponse)
        });
    };

    const mapRef = useRef(null);
    const driverMarkerRef = useRef();
    const passengerMarkerOriginRef = useRef();
    const passengerMarkerDestinationRef = useRef();

    const [showDirections, setShowDirections] = useState(false);
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const traceRoute = () => {
        console.log("COORDINATES", polylineCoordinates)
        if (origin && destination) {
            console.log("Show directions: ", showDirections)
            if (!showDirections) {
                setShowDirections(true);
                mapRef.current?.fitToCoordinates(polylineCoordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, // Adjust padding as needed
                    animated: true,
                });
            }
        }
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

    const handleStartPickup = () => {
        if (!has_ridden) {
            updateState({ rideStatus: 'pickupInProgress' });
            setShowDirections(true);
            traceRoute();
        } else {
            notifyMessage("Pick up is already started")
        }
    }

    const handleFinishPickup = () => {
        if (has_ridden) {
            updateState({ rideStatus: "pickupFinished" });
        } else {
            notifyMessage("Pick up is in progress")
        }
    }

    const handleStartTrip = () => {
        updateState({ rideStatus: 'tripStarted', polylineCoordinates: [curLoc, destination] });
        setShowDirections(true);
        traceRoute();
    }

    const handleEndTrip = async () => {
        if (isDriverReachedDestination) {
            await pusher.unsubscribe({ channelName: 'presence-ride-' + passenger_id, });
            updateState({ rideStatus: 'tripFinished' });
            navigation.navigate("DriverHome");
        } else {
            notifyMessage("Destination is in progress")
        }
    }

    const cancelRide = async () => {
        updateState({ rideStatus: 'rideCancelled' });
        notifyMessage("Ride cancelled");

        let message = {
            title: "Sorry, your order was canceled by the driver.Please order again"
        }

        await pusher.trigger({
            channelName: 'presence-ride-' + passenger_id,
            eventName: 'client-driver-message',
            data: JSON.stringify(message)
        });

        await pusher.unsubscribe({ channelName: 'presence-ride-' + passenger_id, });

        navigation.navigate("DriverHome");
    }


    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
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
                            userLocationPriority={'passive'}
                            // userLocationUpdateInterval={5000}
                            userLocationAnnotationTitle={'My location'}
                            // followsUserLocation={true}
                            // showsMyLocationButton={true}
                            mapPadding={{ top: 10, right: 10, bottom: 550, left: 20 }}
                            onMapReady={() => {
                                console.log('ready');
                                updateState({
                                    isLoading: false
                                })
                            }}
                            // loadingEnabled={true}
                            // loadingIndicatorColor={'#000'}
                            zoomEnabled={true}
                            ref={mapRef}
                            style={styles.map}>
                            {showDirections && origin && destination && polylineCoordinates.length > 0 ? (

                                <Polyline
                                    coordinates={polylineCoordinates}
                                    strokeColor="#FDCD03" // Customize the color as needed
                                    strokeWidth={7} // Customize the width as needed
                                    geodesic={true}
                                    lineCap="square"
                                    lineJoin="round"
                                    lineDashPattern={[1]}
                                />

                                // <MapViewDirections origin={curLoc} destination={origin} apikey={API_KEY} strokeColor="#FDCD03"
                                //     mode={'DRIVING'}
                                //     precision="high"
                                //     strokeWidth={7}
                                //     onStart={(params) => {
                                //         console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                                //     }}
                                //     resetOnChange={false}
                                //     onReady={result => {
                                //         console.log(`Distance: ${result.distance} km`)
                                //         console.log(`Duration: ${result.duration} min.`)
                                //         fetchTime(result.distance, result.duration)
                                //         mapRef.current.fitToCoordinates(result.coordinates, {
                                //             edgePadding: {
                                //                 right: (width / 20),
                                //                 bottom: (height / 20),
                                //                 left: (width / 20),
                                //                 top: (height / 20),
                                //             }
                                //         });
                                //     }}
                                //     onError={(errorMessage) => {
                                //         // console.log(errorMessage)
                                //         console.log('GOT AN ERROR');
                                //     }}
                                // />

                            ) : null}


                            {curLoc ? (<Marker.Animated
                                title={"You're here"}
                                anchor={{ x: 0.5, y: 0.5 }}
                                coordinate={curLoc} ref={driverMarkerRef}>

                                <Image style={{
                                    width: 50, height: 50, transform: [{ rotate: '0deg' }]
                                }}
                                    resizeMode="contain"
                                    source={require("../../../assets/images/png/car.png")} />

                            </Marker.Animated>) : null}

                            {origin && rideStatus === 'pickupInProgress' ? (<Marker.Animated
                                ref={passengerMarkerOriginRef}
                                coordinate={origin}
                                anchor={{ x: 0.5, y: 0.5 }}
                                title={"Your passenger is here"}>
                                <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 8 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{parseFloat(time).toFixed(2)} Min.</Text>
                                </View>

                                <Image style={{ width: 40, height: 40 }}
                                    resizeMode="contain"
                                    source={require("../../../assets/images/png/marker.png")} /></Marker.Animated>) : null}

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


                        <BottomSheetAlert visible={isModalVisible} toggleModal={toggleModal} cancel={cancelRide}>
                            <Text style={{ fontSize: 18, padding: 20, fontWeight: 'bold' }}>
                                Are you sure you want to cancel the order?
                            </Text>
                        </BottomSheetAlert>

                        <View style={styles.sheetContainer}>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={onMapViewCenter} style={{
                                    position: "absolute", bottom: 10, left: 10, borderRadius: 30, backgroundColor: "#eee"
                                }}>
                                    <Image
                                        style={{ width: 50, height: 50, position: 'relative', top: 2 }}
                                        source={require("../../../assets/images/png/current.png")}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onCenter} style={{
                                    position: "absolute", bottom: 10, right: 10, borderRadius: 30, backgroundColor: "#eee"
                                }}>
                                    <Image
                                        style={{ width: 50, height: 50, position: 'relative', top: 2 }}
                                        source={require("../../../assets/images/png/current.png")}
                                    />
                                </TouchableOpacity>
                            </View>
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
                                            <Image style={{ height: 40, width: 40 }} source={require('../../../assets/images/driver/driver.png')} />
                                        </View>

                                        <View style={{ marginHorizontal: 10 }}>
                                            <Text style={globalStyles.bold}>{passenger.firstname}</Text>
                                            {
                                                time ? (
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <MaterialCommunityIcons name="clock" color={'#FDCD03'} size={20} />
                                                        <Text>{parseFloat(time).toFixed(2)} min.</Text>
                                                    </View>
                                                ) : null
                                            }
                                        </View>
                                    </View>


                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => callUser(passenger.mobile_no)}>
                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, padding: 10 }}>
                                                <MaterialCommunityIcons name="phone" color={'#fff'} size={15} />
                                            </View>
                                        </TouchableOpacity>
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
                                    {rideStatus === 'pickupInProgress' ? (
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
                    </BottomSheetModalProvider >

                )
            }
        </>
    );
};

export default PassengerFound;
