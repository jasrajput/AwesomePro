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
    Platform
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from "react-native-maps";
import { locationPermission, getCurrentLocation, pusherAuth, notifyMessage } from './helpers';

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const API_KEY = 'AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU';
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Pusher,
} from '@pusher/pusher-websocket-react-native';



import Lottie from 'lottie-react-native';
import globalStyles from "../styles/Global.styles";

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import MapViewDirections from "react-native-maps-directions";
import styles from "../styles/Home.styles";

const DriverFound = () => {
    const route = useRoute();
    const notificationData = route.params?.params.notificationData;

    const mapRef = useRef(null);
    // const markerRef = useRef()
    const pusher = Pusher.getInstance();

    // const [marker, setMarker] = useState(null);

    const [state, setState] = useState({
        curLoc: {
            latitude: 30.7046,
            longitude: 77.1025,
        },
        time: 0,
        distance: 0,
        isLoading: false,
        driver_name: "",
        driver_location: {},
        // pickup: {},
        // dropoff: {},
        driver: {}
    })

    // const { curLoc, time, distance, pickup, dropoff, driver_location, driver_name, isLoading, driver } = state;
    const { curLoc, time, distance, isLoading, driver } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    const pickup = {
        latitude: 30.70445272790647,
        longitude: 76.7141298977784
    }

    const dropoff = {
        latitude: 30.350980135492904,
        longitude: 77.93599767667669
    }

    const driver_location = {
        latitude: 30.34011089559766,
        longitude: 76.38639012779406,
    }

    const driver_name = "Jas";


    // useEffect(() => {
    //     if (route.params?.params) {
    //         updateState({
    //             pickup: {
    //                 latitude: parseFloat(notificationData['pickup.latitude']),
    //                 longitude: parseFloat(notificationData['pickup.longitude']),
    //             },
    //             dropoff: {
    //                 latitude: parseFloat(notificationData['dropoff.latitude']),
    //                 longitude: parseFloat(notificationData['dropoff.longitude']),
    //             },

    //             driver_location: {
    //                 latitude: parseFloat(notificationData['driver_location.latitude']),
    //                 longitude: parseFloat(notificationData['driver_location.longitude']),
    //             },

    //             driver_name: notificationData['driver_name'],
    //             isLoading: false,
    //         })
    //     }
    // }, [route.params?.params]);


    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         getLiveLocation()
    //         traceRoute();
    //     }, 6000);
    //     return () => clearInterval(interval)
    // }, [])

    // const animate = (latitude, longitude) => {
    //     const newCoordinate = { latitude, longitude };
    //     if (Platform.OS == 'android') {
    //         if (markerRef.current) {
    //             markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
    //         }
    //     } else {
    //         coordinate.timing(newCoordinate).start();
    //     }
    // }

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        })
    }

    //Center the viewpoint on passenger current location
    const goToLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude, accuracy } = await getCurrentLocation();
                console.log(latitude);
                console.log("center the viewpoint")
                let region = {
                    latitude,
                    longitude,
                    accuracy,
                };

                mapRef.current?.fitToCoordinates([region], { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } });
            }
        } catch (er) {
            console.log(er)
            notifyMessage(er.message)
            // notifyMessage("Try again later")
        }
    }

    useEffect(() => {
        AsyncStorage.getItem("token").then(async (token) => {
            if (token) {
                await pusher.init({
                    apiKey: "c3bba9aaea1fe2b21d4e",
                    cluster: "ap2",
                    forceTLS: true,
                    encrypted: true,
                    onAuthorizer: async (channelName, socketId) => {
                        console.log(socketId)
                        const auth = await axios.post("https://thecitycabs.live/broadcasting/auth", {
                            socket_id: socketId,
                            channel_name: channelName
                        }, {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: 'Bearer ' + token,
                            }
                        }).catch((error) => {
                            // return console.error(error);
                        });
                        if (!auth) return {};
                        return auth.data;
                    }
                })

                await pusher.connect();

                await pusher.subscribe({
                    channelName: 'presence-ride-4',
                    onEvent: async (event) => {
                        console.log(event);
                    },
                    onSubscriptionSucceeded: async (channelName, channelData) => {
                        console.log(`Subscribed to`, channelName);

                        await pusher.trigger({
                            channelName: 'presence-ride-4',
                            eventName: 'client-passenger-message',
                            data: "Hola passenger, you are out of league"
                        });
                    }
                })
            }
        }).catch(er => console.log("No token"))
    }, [])

    // useEffect(() => {
    // getLiveLocation();
    // const getLiveLocation = async () => {
    //     try {
    //         const locPermission = await locationPermission();
    //         if (locPermission) {
    //             const { latitude, longitude } = await getCurrentLocation();
    //             // console.log("get live location after 4 second")
    //             // animate(latitude, longitude);

    //             updateState({
    //                 curLoc: { latitude, longitude },
    //                 // coordinate: new ({
    //                 //     latitude: latitude,
    //                 //     longitude: longitude,
    //                 //     latitudeDelta: LATITUDE_DELTA,
    //                 //     longitudeDelta: LONGITUDE_DELTA
    //                 // })
    //             })
    //         }
    //     } catch (er) {
    //         console.log(er.message)
    //     }
    // }



    const [showDirections, setShowDirections] = useState(false);
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const traceRoute = () => {
        console.log("Ride to driver started");
        if (curLoc && driver_location) {
            setShowDirections(true);
            console.log(curLoc);
            console.log(driver_location);
            // mapRef.current?.animateToRegion([curLoc, driver_location],);
            mapRef.current?.fitToCoordinates([curLoc, driver_location],);
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
                            showsUserLocation={true}
                            userLocationPriority={'passive'}
                            userLocationUpdateInterval={5000}
                            userLocationAnnotationTitle={'My location'}
                            followsUserLocation={true}
                            showsMyLocationButton={true}
                            mapPadding={{ top: 20, right: 20, bottom: 550, left: 20 }}
                            onMapReady={() => {
                                // updateState({
                                //     isLoading: false
                                // })
                            }}
                            // loadingEnabled={true}
                            // loadingIndicatorColor={'#000'}
                            zoomEnabled={true}
                            style={styles.map}>

                            {pickup && <Marker.Animated coordinate={pickup}>

                                <View style={{ backgroundColor: 'white', padding: 8, borderRadius: 8 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{parseFloat(time).toFixed(2)} Min.</Text>
                                </View>


                                <Image style={{ width: 50, height: 50, zIndex: 999 }}
                                    resizeMode="contain"
                                    source={require("../../assets/images/png/user.png")} />

                            </Marker.Animated>}

                            {driver_location && <Marker.Animated flat={true} title={'Driver'} coordinate={driver_location} description={'Driver Location'} draggable>
                                <Image style={{ width: 40, height: 40 }}
                                    resizeMode="contain"
                                    source={require("../../assets/images/png/car.png")} /></Marker.Animated>}

                            {showDirections && pickup && driver_location && (
                                <MapViewDirections origin={driver_location} destination={pickup} apikey={API_KEY} strokeColor="#FDCD03"
                                    strokeWidth={7}
                                    onStart={(params) => {
                                        console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                                    }}
                                    onReady={result => {
                                        console.log(`Distance: ${result.distance} km`)
                                        console.log(`Duration: ${result.duration} min.`)
                                        setShowDirections(true);
                                        fetchTime(result.distance, result.duration),
                                            mapRef.current.fitToCoordinates(result.coordinates);
                                    }}
                                    onError={(errorMessage) => {
                                        console.log(errorMessage)
                                    }}
                                />
                            )}
                        </MapView>

                        <TouchableOpacity onPress={goToLocation} style={{
                            position: "absolute", bottom: 300, right: 15, borderRadius: 30, backgroundColor: "#d2d2d2"
                        }}>
                            <Image
                                style={{ width: 50, height: 50 }}
                                source={require("../../assets/images/png/current.png")}
                            />
                        </TouchableOpacity>


                        <View style={styles.sheetContainer}>
                            <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: 10 }}>


                                <View>
                                    <Image
                                        style={{ height: 80, borderRadius: 50 }}
                                        source={require("../../assets/images/png/driver.png")}
                                    />
                                    <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{driver_name}</Text>
                                </View>



                                <View style={{ justifyContent: 'center', alignItems: 'center', position: 'relative', top: 18 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ backgroundColor: '#eee', borderRadius: 50, padding: 10, marginHorizontal: 10 }}>
                                            <MaterialCommunityIcons name="phone" color={'#000'} size={15} />
                                        </View>
                                    </View>

                                    <Text style={{ marginTop: 10, backgroundColor: '#eee', borderRadius: 50, padding: 3, color: '#000', fontWeight: 'bold' }}>
                                        UP78 CA 5847
                                    </Text>
                                    <Text>
                                        BMW
                                    </Text>
                                </View>

                                {/* <View>
                                    {distance !== 0 && time !== 0 && (<View style={{ alignItems: 'center', marginVertical: 16 }}>
                                        <Text>Time left: {time.toFixed(0)} Min. </Text>
                                        <Text>Distance left: {distance.toFixed(0)} km</Text>
                                    </View>)}
                                </View> */}
                            </View>


                            <View style={{ margin: 10, flexDirection: 'row', marginTop: 40 }}>
                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={traceRoute}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Ride to Driver</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.rejectBtn}
                                >
                                    <MaterialCommunityIcons name="close" color={'#000'} size={30} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BottomSheetModalProvider>
            }
        </>
    );
};

export default DriverFound;
