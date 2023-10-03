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
    AlertIOS,
    Platform
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion } from "react-native-maps";
import { locationPermission, getCurrentLocation, pusherAuth } from './helpers';

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


import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import MapViewDirections from "react-native-maps-directions";
import styles from "../styles/Home.styles";

const DriverFound = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const pusher = Pusher.getInstance();
    console.log(pusher)

    const { pickup, dropoff, driver_location, driver_name } = route.params;
    const [marker, setMarker] = useState(null);

    const [state, setState] = useState({
        curLoc: {
            latitude: 30.7046,
            longitude: 77.1025,
        },
        time: 0,
        distance: 0,
    })

    const { curLoc, time, distance } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));


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

    useEffect(() => {
        // getLiveLocation();

        (async () => {
            try {
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
                            return auth.data;
                        }
                    });

                    await pusher.connect();


                    await pusher.subscribe({
                        channelName: 'presence-ride-1',
                        onEvent: async (event) => {
                            console.log(event);
                        },
                        onSubscriptionSucceeded: async (channelName, channelData) => {
                            console.log(`Subscribed to`, channelName);

                            await pusher.trigger({
                                channelName: 'presence-ride-1',
                                eventName: 'client-passenger-message',
                                data: "Hola passenger, you are out of league"
                            });
                        }

                    });


                    console.log('Pusher Connected');

                    // const channel = await pusher.getChannel('presence-ride-1');





                }

            } catch (ex) {
                console.log(ex.message);
            }
        })();
    }, []);

    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude } = await getCurrentLocation();
                // console.log("get live location after 4 second")
                // animate(latitude, longitude);

                updateState({
                    curLoc: { latitude, longitude },
                    // coordinate: new ({
                    //     latitude: latitude,
                    //     longitude: longitude,
                    //     latitudeDelta: LATITUDE_DELTA,
                    //     longitudeDelta: LONGITUDE_DELTA
                    // })
                })
            }
        } catch (er) {
            console.log(er.message)
        }
    }

    const mapRef = useRef(null);
    const markerRef = useRef()

    const [showDirections, setShowDirections] = useState(false);
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const traceRoute = () => {
        if (curLoc && driver_location) {
            setShowDirections(true);
            mapRef.current?.animateToRegion([curLoc, driver_location],);
            // mapRef.current?.fitToCoordinates([curLoc, driver_location],);
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
                mapPadding={{ top: 20, right: 20, bottom: 550, left: 20 }}
                onMapReady={() => {
                    console.log('ready')
                }}
                loadingEnabled={true}
                loadingIndicatorColor={'#000'}
                zoomEnabled={true}
                ref={mapRef}
                style={styles.map}>

                {pickup && <Marker.Animated
                    coordinate={pickup} >

                    <Image style={{
                        width: 50, height: 50
                    }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/marker.png")} />

                </Marker.Animated>}

                {driver_location && <Marker.Animated flat={true} title={'Driver'} coordinate={driver_location} description={'Driver Location'} draggable>
                    <Image style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/car.png")} /></Marker.Animated>}

                {showDirections && pickup && driver_location && (
                    <MapViewDirections origin={pickup} destination={driver_location} apikey={API_KEY} strokeColor="#FDCD03"
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


            <View style={styles.sheetContainer}>
                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: 10 }}>
                    {distance !== 0 && time !== 0 && (<View style={{ alignItems: 'center', marginVertical: 16 }}>
                        <Text>Time left: {time.toFixed(0)} </Text>
                        <Text>Distance left: {distance.toFixed(0)}</Text>
                    </View>)}

                    <View>
                        <Image
                            style={{ height: 80, borderRadius: 50 }}
                            source={require("../../assets/images/png/driver.png")}
                        />
                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{driver_name}</Text>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', position: 'relative', top: 18 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ backgroundColor: '#eee', borderRadius: 50, padding: 10 }}>
                                <MaterialCommunityIcons name="chat" color={'#000'} size={15} />
                            </View>
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

                </View>

                <View style={{ margin: 10, flexDirection: 'row', marginTop: 40 }}>
                    <TouchableOpacity
                        style={styles.acceptBtn}
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
    );
};

export default DriverFound;
