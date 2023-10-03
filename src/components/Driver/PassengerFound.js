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
    Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from "react-native-maps";
import { locationPermission, getCurrentLocation, getAddressFromCoordinates, getLatLonDiffInMeters, notifyMessage, callUser, pusherAuth } from './../helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const API_KEY = 'AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU';
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
    latitude: 30.6800,
    longitude: 76.7221,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};

import {
    Pusher,
    PusherMember,
    PusherChannel,
    PusherEvent,
} from '@pusher/pusher-websocket-react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, {
    BottomSheetHandle,
    BottomSheetView,
    BottomSheetTextInput,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import MapViewDirections from "react-native-maps-directions";
import styles from "../../styles/Home.styles";
import globalStyles from "../../styles/Global.styles";
import axios from 'axios';

const DriverFound = () => {
    const navigation = useNavigation();
    const pusher = Pusher.getInstance();
    const route = useRoute();
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');

    const { origin, destination, passenger_id } = route.params;

    const [marker, setMarker] = useState(null);

    const [state, setState] = useState({
        has_ridden: false,
        nearby_alert: false,
        curLoc: {
            latitude: 30.7046,
            longitude: 77.1025,
        },
        destination: {},
        isLoading: false,
        coordinate: new AnimatedRegion({
            latitude: 30.7046,
            longitude: 77.1025,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }),
        time: 0,
        distance: 0,

    })

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, has_ridden, nearby_alert } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    // getAddressFromCoordinates(origin.latitude, origin.longitude).then(pickup => {
    //     setPickup(pickup)
    // }).catch(er => console.log(er.message));

    // getAddressFromCoordinates(destination.latitude, destination.longitude).then(dropoff => {
    //     console.log(dropoff)
    //     setDropoff(dropoff)
    // }).catch(er => console.log(er.message));


    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 6000);
        return () => clearInterval(interval)
    }, [])


    const animate = (latitude, longitude) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    }

    const onCenter = () => {
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    }

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        })
    }

    useEffect(() => {
        (async () => {
            console.log("Invoked");
            const token = await AsyncStorage.getItem("token");
            if (token) {
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
            } else {
                navigation.navigate('Login');
            }

        })();
        getLiveLocation().then(res => {
            mapRef.current?.fitToCoordinates([res[0], res[1]], { edgePadding, animated: false });
            // mapRef.current.animateToRegion({latitude: res[0],longitude: res[1],latitudeDelta: LATITUDE_DELTA,longitudeDelta: LONGITUDE_DELTA})
        });


    }, []);


    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude, accuracy } = await getCurrentLocation();
                // console.log("get live location after 4 second")
                animate(latitude, longitude);

                updateState({
                    curLoc: { latitude, longitude },
                    coordinate: new AnimatedRegion({
                        latitude: latitude,
                        longitude: longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    })
                });

                const diff_in_meter_pickup = getLatLonDiffInMeters(latitude, longitude, origin.latitude, origin.longitude);


                console.log("IN METERS: " + diff_in_meter_pickup);

                if (diff_in_meter_pickup <= 20) {
                    if (!has_ridden) {
                        let driverResponse = {
                            type: 'near_pickup',
                            title: 'Just a heads up',
                            msg: 'Your driver is near, let your presence be known!'
                        }
                        await pusher.trigger({
                            channelName: 'presence-ride-' + passenger_id,
                            eventName: 'client-driver-message',
                            data: JSON.stringify(driverResponse)
                        });

                        updateState({ has_ridden: true });

                    }
                } else if (diff_in_meter_pickup <= 50) {

                    if (!nearby_alert) {
                        updateState({ nearby_alert: true })

                        Alert.alert(
                            "Slow down",
                            "Your passenger is just around the corner",
                            [
                                {
                                    text: 'Gotcha!'
                                },
                            ],
                            { cancelable: false }
                        );
                    }

                }

                const diff_in_meter_dropoff = getLatLonDiffInMeters(latitude, longitude, destination.latitude, destination.longitude);

                if (diff_in_meter_dropoff <= 20) {
                    let driverResponse = {
                        type: 'near_dropoff',
                        title: "Brace yourself",
                        msg: "You're very close to your destination. Please prepare your payment."
                    }
                    await pusher.trigger({
                        channelName: 'presence-ride-' + passenger_id,
                        eventName: 'client-driver-message',
                        data: JSON.stringify(driverResponse)
                    });

                    await pusher.unsubscribe({ channelName: 'presence-ride-' + passenger_id, });
                }

                try {
                    let driverCurrentLocation = {
                        latitude: latitude,
                        longitude: longitude,
                        accuracy: accuracy
                    }

                    // console.log(driverCurrentLocation);
                    // console.log(passenger_id);
                    // console.log(pusher);

                    // console.log(await pusher.trigger({ channelName: 'presence-ride-1' }));

                    await pusher.subscribe({
                        channelName: 'presence-ride-' + passenger_id,
                        onSubscriptionSucceeded: async (channelName, channelData) => {
                            console.log(`Subscribed to`, channelName);

                            await pusher.trigger({
                                channelName: 'presence-ride-' + passenger_id,
                                eventName: 'client-driver-location',
                                data: JSON.stringify(driverCurrentLocation)
                            });
                        }
                    })




                    await pusher.connect();
                } catch (rx) {
                    console.log(rx)
                }


                return [latitude, longitude]
            }
        } catch (er) {
            console.log(er.message)
        }
    }




    // const [coordinate, setCoordinate] = useState(
    //     new AnimatedRegion({
    //         latitude: origin.latitude,
    //         longitude: origin.longitude,
    //         latitudeDelta: LATITUDE_DELTA,
    //         longitudeDelta: LONGITUDE_DELTA,
    //     }),
    // );



    // const animateMarker = () => {
    //     const newCoordinate = {
    //         latitude: origin.latitude,
    //         longitude: origin.longitude,
    //         latitudeDelta: LATITUDE_DELTA,
    //         longitudeDelta: LONGITUDE_DELTA,
    //     };

    //     if (Platform.OS === 'android') {
    //         if (marker) {
    //             marker.animateMarkerToCoordinate(newCoordinate, 15000);
    //         }
    //     } else {
    //         coordinate.timing(newCoordinate).start();
    //     }
    // };


    // if ('latitude' in origin && 'longitude' in origin && 'latitude' in destination && 'longitude' in destination) {
    //     const position_origin = {
    //         latitude: origin.latitude,
    //         longitude: origin.longitude
    //     };

    //     const position_destination = {
    //         latitude: destination.latitude,
    //         longitude: destination.longitude
    //     };



    // useEffect(() => {
    //     animateMarker();
    // }, [coordinate]);


    // useEffect(() => {
    //     if (position_origin && position_destination) {
    //         moveTo(position_origin);
    //         moveTo(position_destination);
    //         traceRoute();
    //     }
    // }, [origin, destination, moveTo, traceRoute]);
    // }

    const mapRef = useRef(null);
    const markerRef = useRef()

    const moveTo = async (position) => {
        const camera = await mapRef.current?.getCamera();
        if (camera) {
            camera.center = position;
            mapRef.current?.animateCamera(camera, { duration: 1000 })
        }
    }

    const [showDirections, setShowDirections] = useState(false);
    // const [distance, setDistance] = useState(0);
    // const [duration, setDuration] = useState(0);

    // const [carsData, setCarsData] = useState([]);
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const edgePaddingValue = 10;


    const edgePadding = {
        top: edgePaddingValue,
        right: edgePaddingValue,
        bottom: edgePaddingValue,
        left: edgePaddingValue,
    };


    const traceRouteOnReady = (args) => {
        if (args) {
            setDistance(args.distance);
            if (args.distance > 60) {
                hour = args.distance / 60;
            } else {
                hour = args.distance;
            }
            setDuration(hour)
        }
    }


    const traceRoute = () => {
        if (origin && destination) {
            console.log("Show directions: ", showDirections)
            if (!showDirections) {
                setShowDirections(true);
                mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
            }
        }
    }

    const onPlaceSelected = (details, flag) => {
        moveTo(position)
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

    const startPickup = () => {
        setShowDirections(true);
        traceRoute();
    }

    return (
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
                showsUserLocation={true}
                userLocationPriority={'passive'}
                userLocationUpdateInterval={5000}
                userLocationAnnotationTitle={'My location'}
                followsUserLocation={true}
                showsMyLocationButton={true}
                mapPadding={{ top: 10, right: 10, bottom: 550, left: 20 }}
                onMapReady={() => {
                    console.log('ready')
                }}
                loadingEnabled={true}
                loadingIndicatorColor={'#000'}
                zoomEnabled={true}
                ref={mapRef}
                style={styles.map}>
                {showDirections && origin && (
                    <MapViewDirections origin={curLoc} destination={origin} apikey={API_KEY} strokeColor="#FDCD03"
                        mode={'DRIVING'}
                        precision="high"
                        strokeWidth={7}
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        onReady={result => {
                            // console.log(`Distance: ${result.distance} km`)
                            // console.log(`Duration: ${result.duration} min.`)
                            fetchTime(result.distance, result.duration)
                            mapRef.current.fitToCoordinates(result.coordinates, {
                                edgePadding
                            });
                        }}
                        onError={(errorMessage) => {
                            // console.log(errorMessage)
                            console.log('GOT AN ERROR');
                        }}
                    />
                )}


                {curLoc && <Marker.Animated
                    title={"You're here"}
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={curLoc} ref={markerRef}>
                    <Image style={{
                        width: 50, height: 50, transform: [{ rotate: '0deg' }]
                    }}
                        resizeMode="contain"
                        source={require("../../../assets/images/png/car.png")} />

                </Marker.Animated>}

                {origin && !has_ridden && <Marker.Animated
                    optimizeWaypoints={true}
                    coordinate={origin}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title={"Your passenger is here"}
                >
                    <Image style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        source={require("../../../assets/images/png/marker.png")} /></Marker.Animated>}


            </MapView>


            <View style={styles.sheetContainer}>
                <View style={{ flex: 1 }}>
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
                                <Text style={globalStyles.bold}>Jas</Text>
                                {
                                    time ? (
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons name="clock" color={'#FDCD03'} size={20} />
                                            <Text>{parseFloat(time).toFixed(2)} min.</Text>
                                        </View>
                                    ) : ""
                                }
                            </View>
                        </View>


                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => callUser('7814683716')}>
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

                    <View >

                        <TouchableOpacity style={{
                            marginTop: 10,
                            marginBottom: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#FDCD03',
                            backgroundColor: '#FDCD03',
                            height: 50,
                            width: '100%',
                        }} onPress={startPickup}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Start Pickup</Text>
                        </TouchableOpacity>
                    </View>

                </View>


            </View>
        </BottomSheetModalProvider >
    );
};

export default DriverFound;
