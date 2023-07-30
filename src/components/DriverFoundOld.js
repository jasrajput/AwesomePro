import React, {
    useRef,
    useState,
    useEffect
} from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    Dimensions
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const API_KEY = 'AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU';
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import MapViewDirections from "react-native-maps-directions";
import styles from "../styles/Home.styles";


const INITIAL_POSITION = {
    latitude: 30.6800,
    longitude: 76.7221,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};



const DriverFound = () => {

    const navigation = useNavigation();
    const route = useRoute();
    console.log("DRIVER FOUND ROUTE: ");
    console.log(route);

    const { origin, destination } = route.params;


    if ('latitude' in origin && 'longitude' in origin && 'latitude' in destination && 'longitude' in destination) {
        console.log("Entered");
        const position_origin = {
            latitude: origin.latitude,
            longitude: origin.longitude
        };

        const position_destination = {
            latitude: destination.latitude,
            longitude: destination.longitude
        };
        useEffect(() => {
            if (position_origin && position_destination) {
                moveTo(position_origin);
                moveTo(position_destination);
                traceRoute();
            }
        }, [origin, destination, moveTo, traceRoute]);
    }
    const mapRef = useRef(null);

    const moveTo = async (position) => {
        const camera = await mapRef.current?.getCamera();
        if (camera) {
            camera.center = position;
            mapRef.current?.animateCamera(camera, { duration: 1000 })
        }
    }

    const [showDirections, setShowDirections] = useState(false);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);

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
            setDuration(args.duration)
        }
    }


    const traceRoute = () => {
        console.log("ORIGIN AND DESTINATION");
        console.log(origin)
        console.log(destination)
        if (origin && destination) {
            setShowDirections(true);
            mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                toolbarEnabled={true}
                rotateEnabled={true}
                provider={PROVIDER_GOOGLE}
                initialRegion={INITIAL_POSITION}
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
                // zoomControlEnabled={true}
                ref={mapRef}
                style={styles.map}>

                {origin && <Marker
                    draggable
                    coordinate={origin} >

                    <Image style={{ width: 50, height: 50 }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/car.png")} />

                </Marker>}

                {destination && <Marker coordinate={destination} draggable>
                    <Image style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/marker.png")} /></Marker>}

                {showDirections && origin && destination && (
                    <MapViewDirections origin={origin} destination={destination} apikey={API_KEY} strokeColor="#FDCD03"
                        strokeWidth={7} onReady={traceRouteOnReady}
                    />
                )}
            </MapView>


            <View style={styles.sheetContainer}>
                <View style={{ flexDirection: "row", justifyContent: 'space-between', margin: 10 }}>
                    <View>
                        <Image
                            style={{ height: 80, borderRadius: 50 }}
                            source={require("../../assets/images/png/driver.png")}
                        />
                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Anoop Soni</Text>
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

                <View style={{ margin: 10, flexDirection: 'row', marginTop: 60 }}>
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
        </View>
    );
};

export default DriverFound;
