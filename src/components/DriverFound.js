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
import { locationPermission, getCurrentLocation } from './helpers';

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


import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import MapViewDirections from "react-native-maps-directions";
import styles from "../styles/Home.styles";

const DriverFound = () => {
    const navigation = useNavigation();
    const route = useRoute();
    console.log("DRIVER FOUND ROUTE: ");

    const { origin, destination, driver_name } = route.params;
    const [marker, setMarker] = useState(null);

    const [state, setState] = useState({
        curLoc: {
            latitude: 30.7046,
            longitude: 77.1025
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
        heading: 0

    })

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, heading } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));


    useEffect(() => {
        const interval = setInterval(() => {
            // getLiveLocation()
            // traceRoute();
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
        getLiveLocation();
    }, []);


    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude } = await getCurrentLocation();
                console.log("get live location after 4 second", heading)
                animate(latitude, longitude);

                updateState({
                    heading: heading,
                    curLoc: { latitude, longitude },
                    coordinate: new AnimatedRegion({
                        latitude: latitude,
                        longitude: longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    })
                })
            }
        } catch (er) {
            console.log(er.message)
        }
    }

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

    const [carsData, setCarsData] = useState([]);
    const snapPoints = useMemo(() => ["25%", "50%"], []);

    const edgePaddingValue = 70;

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
        console.log("ORIGIN AND DESTINATION");
        console.log(origin)
        console.log(destination)
        if (origin && destination) {
            if (!showDirections) {
                console.log('sd');
                setShowDirections(true);
            }
            mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
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

                {origin && <Marker.Animated
                    ref={markerRef}
                    draggable
                    anchor={{ x: 0.5, y: 0.5 }}
                    coordinate={curLoc} >

                    <Image style={{
                        width: 50, height: 50, transform: [{ rotate: `${heading}deg` }]
                    }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/car.png")} />

                </Marker.Animated>}

                {destination && <Marker.Animated coordinate={destination} draggable>
                    <Image style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/marker.png")} /></Marker.Animated>}

                {showDirections && origin && destination && (
                    <MapViewDirections origin={curLoc} destination={destination} apikey={API_KEY} strokeColor="#FDCD03"
                        strokeWidth={7} optimizeWaypoints={true}
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        onReady={result => {
                            console.log(`Distance: ${result.distance} km`)
                            console.log(`Duration: ${result.duration} min.`)
                            setShowDirections(true);
                            fetchTime(result.distance, result.duration),
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        // right: 30,
                                        // bottom: 300,
                                        // left: 30,
                                        // top: 100,
                                    },
                                });
                        }}
                        onError={(errorMessage) => {
                            console.log(errorMessage)
                            // console.log('GOT AN ERROR');
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
