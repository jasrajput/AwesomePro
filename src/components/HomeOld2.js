import React, {
    useRef,
    useCallback,
    useMemo,
    useEffect,
    useState,
} from "react";
import {
    Pressable,
    Alert,
    ActivityIndicator,
    Text,
    View,
    TouchableOpacity,
    BackHandler,
    FlatList,
    Image,
    Dimensions,
    Modal,
} from "react-native";

import API from "./API";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "../styles/Home.styles";
import CustomAlert from '../utilities/alert';
import Lottie from 'lottie-react-native';
import globalStyles from "../styles/Global.styles";


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

import { notifyMessage, convertMinsToTime, calculateFare, getCurrentLocation, locationPermission, getFCM } from './helpers';

import BottomSheet, {
    BottomSheetModalProvider, BottomSheetScrollView
} from "@gorhom/bottom-sheet";
import { TextInput } from "react-native-gesture-handler";
import CROSS_ICON from "../../assets/images/svg/cross.svg";
import { apiKey } from './config';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from "react-native-geolocation-service";

navigator.geolocation = require('react-native-geolocation-service');

import Card from "./Card";
import MapViewDirections from "react-native-maps-directions";

const BottomSheetShow = ({ bottomSheetModalRef, snapPoints, placeRef, onPlaceSelected, bottomRef, locationBack }) => {
    const isCurrentLocation = bottomRef == 'B' ? true : false;
    const method = bottomRef == 'B' ? 'origin' : 'destination';
    const label = bottomRef == 'B' ? 'Current location' : '';
    return (
        <BottomSheet name={bottomRef}
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            detach={true}
            index={-1}>
            <View style={{ flex: 1 }}>
                <GooglePlacesAutocomplete
                    currentLocation={isCurrentLocation}
                    renderLeftButton={() =>
                        <TouchableOpacity>
                            <MaterialCommunityIcons style={{ marginTop: 15, fontSize: 18, position: 'relative', left: 10 }} name={'arrow-left'} color={'#4B545A'} size={20} />
                        </TouchableOpacity>}
                    nearbyPlacesAPI='GooglePlacesSearch'
                    ref={placeRef}
                    // GooglePlacesSearchQuery={{
                    //   rankby: 'distance',
                    //   radius: '2000'
                    // }}

                    currentLocationLabel={label}
                    debounce={200}
                    listViewDisplayed={true}
                    enablePoweredByContainer={false}
                    placeholder={method}
                    query={{
                        key: API_KEY,
                        components: 'country:in',
                        language: 'en',
                        types: 'address',
                        rankby: 'distance',
                        // strictbounds: false,
                        location: locationBack,
                        radius: '200', // 2000 meters radius (adjust as needed)
                    }}
                    returnKeyType={'search'}
                    textInputProps={{
                        fontSize: 16,
                        color: '#000',
                        placeholderTextColor: '#000',
                        errorStyle: { color: 'red' },
                    }}
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        onPlaceSelected(details, method);
                    }}
                    onFail={error => console.log(error)}
                    onNotFound={() => console.log('no results')}
                    listEmptyComponent={() => (
                        <View style={{ flex: 1 }}>
                            <Text>No results were found</Text>
                        </View>
                    )}
                />
            </View>
        </BottomSheet>
    )
}

const Home = () => {
    const navigation = useNavigation();
    const placeRef = useRef();
    const destinationRef = useRef();
    const [categories, setCategories] = useState([]);
    const [userId, setUserId] = useState('');
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentLocation, setCurrentLocation] = useState('');
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isBottomSheetOpen2, setIsBottomSheetOpen2] = useState(false);


    // useFocusEffect(
    //   React.useCallback(() => {
    //     const onBackPress = () => {
    //       Alert.alert("Hold on!", "Are you sure you want to Exit?", [
    //         {
    //           text: "Cancel",
    //           onPress: () => null,
    //           style: "cancel"
    //         },
    //         { text: "YES", onPress: () => BackHandler.exitApp() }
    //       ]);
    //       return true;
    //     };

    //     BackHandler.addEventListener("hardwareBackPress", onBackPress);

    //     return () =>
    //       BackHandler.removeEventListener("hardwareBackPress", onBackPress);

    //   }, []));



    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.getUserDetails();
                if (res.message == 'Unauthenticated.') {
                    return navigation.navigate("Login");
                }
                if (res) {
                    setUserId(res.id);
                } else {
                    return navigation.navigate('Login');
                }

                const token = await getFCM();
                if (token != res.fcm_token) {
                    API.updateFCMToken({ 'fcm_token': token }).then(res => {
                        console.log(res);
                    }).catch(err => {
                        console.log("Issue updating token");
                    })
                }

                // setLoading(false);
            } catch (error) {
                // console.error('Error fetching user details:', error.message);
                setIsAlertVisible(true);
                return setErrorMessage('Network abnormality');
                // return notifyMessage('')
            }
        };

        fetchData();
    }, [])




    const getCarsByCategory = async (category_id) => {
        try {
            const cars = await API.getCarByCategory(category_id);
            return cars;
        } catch (er) {
            // console.error(er.message);
            setIsAlertVisible(true);
            return setErrorMessage('Network abnormality');
            // return notifyMessage("Network Error");
        }
    };

    const mapRef = useRef(null);
    const bottomSheetModalARef = useRef(null);
    const bottomSheetModalBRef = useRef(null);
    const bottomSheetModalCRef = useRef(null);
    const bottomSheetModalDRef = useRef(null);
    const bottomSheetModalERef = useRef(null);

    const openModal = useCallback((param) => {
        if (param == 1) {
            if (bottomSheetModalBRef.current) {
                setIsBottomSheetOpen(true);
                bottomSheetModalBRef.current.expand();
                placeRef.current.focus();

                // navigation.setOptions({ headerShown: false })
            }
        } else {
            if (bottomSheetModalCRef.current) {
                setIsBottomSheetOpen2(true);
                bottomSheetModalCRef.current.expand();
                destinationRef.current.focus();

                // navigation.setOptions({ headerShown: false })
            }
        }

    }, []);


    useEffect(() => {
        const backAction = () => {
            if (isBottomSheetOpen2) {
                console.log("IS OPEN")
                closeBottomSheet2();
                return true; // Prevent default behavior (closing the bottom sheet)
            } else if (isBottomSheetOpen) {
                closeBottomSheet();
                return true; // Prevent default behavior (closing the bottom sheet)
            }
            return false; // Allow default behavior (closing the app)
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove(); // Clean up event listener on unmount

    }, [isBottomSheetOpen2, isBottomSheetOpen]);

    const closeBottomSheet = () => {
        setIsBottomSheetOpen(false)
        bottomSheetModalBRef.current.close();
        console.log("CLICKED");
    };

    const closeBottomSheet2 = () => {
        setIsBottomSheetOpen2(false)
        bottomSheetModalCRef.current.close();
        console.log("CLICKED");
    };


    const moveTo = async (position) => {
        const camera = await mapRef.current?.getCamera();
        if (camera) {
            camera.center = position;
            mapRef.current?.animateCamera(camera, { duration: 1000 })
        }
    }

    const [isLoading, setLoading] = useState(false);
    const [origin, setOrigin] = useState('');
    const [originVal, setOriginVal] = useState('');
    const [destinationVal, setDestinationVal] = useState('');
    const [destination, setDestination] = useState('');
    const [showDirections, setShowDirections] = useState(false);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [fare, setFare] = useState(0);

    const [carsData, setCarsData] = useState([]);
    const [selectedId, setSelectedID] = useState(0);
    const [categoryData, setCategoryData] = useState([]);
    const snapPoints = useMemo(() => ["1%", "40%", '70%', "95%"], []);
    const maxSnapPoints = useMemo(() => ["35%"], []);
    const maxSnapPointsCar = useMemo(() => ["1%", "45%", '70%', "95%"], []);


    // const maxSnapPointsCar = useMemo(() => ["50%"], []);

    const edgePaddingValue = 70;

    const edgePadding = {
        top: edgePaddingValue,
        right: edgePaddingValue,
        bottom: edgePaddingValue,
        left: edgePaddingValue,
    };


    const handleSelection = (id) => {
        console.log("Selected Car: " + id)
        var selectedIdInner = selectedId;
        if (selectedIdInner == id) {
            setSelectedID(null);
        } else {
            setSelectedID(id);
        }

        console.log("Selected Car State: " + selectedId)
    };

    const traceRouteOnReady = (args) => {
        if (args) {
            setDistance(args.distance);
            setDuration(args.duration)
        }
    }

    const traceRoute = () => {
        console.log(origin)
        console.log(destination)
        if (origin && destination) {
            setShowDirections(true);
            mapRef.current?.fitToCoordinates([origin, destination], { edgePadding: { top: 490, right: 50, bottom: 20, left: 30 } });
        }
    }

    const onPlaceSelected = (details, flag) => {

        console.log(details);

        navigation.setOptions({ headerShown: true })

        const position = {
            latitude: details?.geometry.location.lat || 0,
            longitude: details?.geometry.location.lng || 0,
        };

        if (flag == 'origin') {
            setOriginVal(placeRef.current.getAddressText());
            setOrigin(position);
        } else {
            setDestination(position)
            setDestinationVal(destinationRef.current.getAddressText());
        }

        bottomSheetModalBRef.current.collapse();
        bottomSheetModalCRef.current.collapse();
        navigation.setOptions({ headerShown: true })

        moveTo(position);

    }

    const goToLocation = async () => {
        getLiveLocation();
    }

    useEffect(() => {
        getLiveLocation();
    }, []);

    const closeAlert = () => {
        setIsAlertVisible(false);
    };

    const getLiveLocation = async () => {
        try {
            let granted = await locationPermission();
            while (!granted) {
                granted = await locationPermission();
            }

            if (granted) {
                const { latitude, longitude } = await getCurrentLocation();
                let region = {
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5
                }
                // mapRef.current?.animateToRegion(region);

                const coordinates = [
                    {
                        latitude: region.latitude - region.latitudeDelta / 2,
                        longitude: region.longitude - region.longitudeDelta / 2
                    },
                    {
                        latitude: region.latitude + region.latitudeDelta / 2,
                        longitude: region.longitude + region.longitudeDelta / 2
                    }
                ];

                setCurrentLocation({ latitude, longitude });
                mapRef.current?.fitToCoordinates(coordinates, { edgePadding: { top: 490, right: 50, bottom: 20, left: 30 } });

                // const response = await fetch(
                //   `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=150&key=AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU`
                // );
                // const data = await response.json();

                // Handle the data obtained from the Places API
                // if (data.results && data.results.length > 0) {
                //   const placeDetails = data.results
                //   console.log(placeDetails);

                // onPlaceSelected(placeDetails, "origin")
                // }


            }
        } catch (er) {
            console.error(er.message)
            setIsAlertVisible(true);
            return setErrorMessage('Error getting location');
            // notifyMessage("Error getting location")
        }
    }

    const showMap = useCallback(() => {

        if (origin && destination) {
            if (parseFloat(origin.latitude) == parseFloat(destination.latitude)) {
                setIsAlertVisible(true);
                return setErrorMessage('Origin and destination cannot be same');
                // return notifyMessage('Origin and destination cannot be same');
            }

            traceRoute();
            bottomSheetModalDRef.current.snapToIndex(1);

            navigation.setOptions({ title: 'Taxi Selection' })
            setLoading(true);

            API.getCategories().then(response => {
                if (response.status == true) {
                    setCategories(response.data);
                    setLoading(false);
                }
            }).catch(er => {
                setLoading(false);
                setIsAlertVisible(true);
                return setErrorMessage('Network Issue');
                // return notifyMessage("Network Issue");
            });
        } else {
            setIsAlertVisible(true);
            return setErrorMessage('Please select origin and destination first')
            // return notifyMessage("Please select origin and destination first");
        }
    }, [traceRoute]);

    const handleDismissEPress = useCallback(() => {
        console.log(bottomSheetModalERef)
        bottomSheetModalERef.current.close();
    }, []);

    const bookRide = useCallback(() => {
        if (selectedId == null || selectedId == undefined || selectedId == 0) {
            setIsAlertVisible(true);
            return setErrorMessage('Please select car first')
        }

        console.log(selectedId);

        navigation.navigate("SearchDrivers", {
            carId: selectedId,
            origin: origin,
            destination: destination,
            duration: duration,
            distance: distance,
            fare: fare,
            userId: userId
        });
    }, [origin, destination, distance, duration, fare, selectedId]);

    const handleDismissCPress = useCallback(() => {
        if (bottomSheetModalCRef.current) {
            bottomSheetModalCRef.current.close();
        }
    }, []);

    const renderHeaderHandle = useCallback(
        (title) => (props) => {
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <Text>{title}</Text>
            </View>;
        },
        []
    );

    const getData = async (id) => {
        if (id == null || id == undefined || id == 0) {
            setIsAlertVisible(true);
            return setErrorMessage('Please select category first');
        }

        setLoading(true);
        const carsList = await getCarsByCategory(id);
        console.log("Cars list: ", carsList.data);
        setLoading(false);
        if (carsList.data.length == 0) {
            notifyMessage('No vehicles discovered. Consider attempting different categories.')
        } else {
            setCarsData(carsList.data);
            setCategoryData(carsList.category);

            navigation.setOptions({ title: 'Select Cars' })

            const dummyData = {
                baseFare: 500,
                timeRate: 0.90,
                distanceRate: 2,
                surge: 3
            };

            const estimated_fare = calculateFare(dummyData.baseFare, dummyData.timeRate, duration, dummyData.distanceRate, distance, dummyData.surge);
            setFare(estimated_fare);

            bottomSheetModalERef.current.snapToIndex(1);
        }


        // bottomSheetModalERef.current.expand();
        // bottomSheetModalCRef.current.close();

    };

    const Item = ({ id, title, image }) => (
        <View style={[
            styles.listContainer,
            { borderColor: selectedId == id ? "#FDCD03" : "#fff" },
        ]}>
            <TouchableOpacity onPress={() => handleSelection(id)}>
                <Image source={{ uri: image }} style={{ height: 60, width: 140 }} />
                <Text style={{ textAlign: "center", fontWeight: 'bold', marginTop: 8 }}>{title}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }) => (
        <Item id={item.id} image={item.image} title={item.name} />
    );

    return (
        <BottomSheetModalProvider style={styles.container}>
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
                ref={mapRef}
                style={styles.map}>

                {origin && <Marker
                    draggable
                    coordinate={origin}
                >
                    <Image style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/marker.png")} />

                </Marker>}

                {destination && <Marker coordinate={destination} draggable>
                    <Image style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        source={require("../../assets/images/png/car.png")} /></Marker>}

                {showDirections && origin && destination && (
                    <MapViewDirections origin={origin} destination={destination} apikey={API_KEY} strokeColor="#FDCD03"
                        strokeWidth={7} onReady={traceRouteOnReady}
                    />
                )}


            </MapView>

            {isAlertVisible && (
                <CustomAlert
                    visible={isAlertVisible}
                    message={errorMessage}
                    onClose={closeAlert}
                />
            )}




            <TouchableOpacity onPress={goToLocation} style={{
                position: "absolute", bottom: 250, right: 15, borderRadius: 30, backgroundColor: "#d2d2d2"
            }}>
                <Image
                    style={{ width: 50, height: 50 }}
                    source={require("../../assets/images/png/current.png")}
                />
            </TouchableOpacity>

            <View style={{ flex: 0.4 }}>
                {/* <View name='A' ref={bottomSheetModalARef} snapPoints={maxSnapPoints} index={0}> */}
                <View style={styles.sheetContainer}>


                    <View style={styles.outerContainer}>


                        <View style={{ flexDirection: "row" }}>
                            <Image
                                style={{ position: "relative", top: 15 }}
                                source={require("../../assets/images/png/route.png")}
                            />
                            <View style={styles.inputContainer}>
                                <Pressable onPress={() => openModal(1)}>
                                    <View pointerEvents="none" >
                                        <TextInput style={{ color: '#000' }} placeholderTextColor="#000" placeholder="Origin" value={originVal} />
                                    </View>
                                </Pressable>

                                <Pressable onPress={() => openModal(2)}>
                                    <View pointerEvents="none">
                                        <TextInput style={{ color: '#000' }} placeholderTextColor="#000" placeholder="Destination" value={destinationVal} />
                                    </View>
                                </Pressable>
                            </View>
                        </View>

                        {/* <TouchableOpacity onPress={showMap}>
                  <Text style={{ color: "#FCCC03", marginTop: 10 }}>
                    Show on a map
                  </Text>
                </TouchableOpacity> */}
                    </View>
                    <View style={{ flexDirection: "row", marginHorizontal: 12 }}>
                        <TouchableOpacity style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#FDCD03',
                            backgroundColor: '#FDCD03',
                            height: 50,
                            width: '100%',
                        }} onPress={showMap}>
                            <Text style={{ color: "#000", fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                Select Cars
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <BottomSheetShow bottomRef={"B"} bottomSheetModalRef={bottomSheetModalBRef} snapPoints={snapPoints} placeRef={placeRef} onPlaceSelected={onPlaceSelected} locationBack={currentLocation} />
            <BottomSheetShow bottomRef={"C"} bottomSheetModalRef={bottomSheetModalCRef} snapPoints={snapPoints} placeRef={destinationRef} onPlaceSelected={onPlaceSelected} locationBack={currentLocation} />


            <BottomSheet name={"D"}
                ref={bottomSheetModalDRef}
                snapPoints={snapPoints}
                index={-1} >
                <View style={{ flex: 1 }}>
                    {
                        isLoading ? (
                            <ActivityIndicator style={styles.loading} size="large" color="#000" />
                        ) : (
                            <Card categories={categories} travelTime={convertMinsToTime(duration)} distance={distance + ' Km'} onPress={(selectedIds) => getData(selectedIds)} />
                        )
                    }
                </View>
            </BottomSheet>


            <BottomSheet name={"E"}
                ref={bottomSheetModalERef}
                snapPoints={maxSnapPointsCar}
                index={-1}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "#FDCD03",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View>
                            <Text style={{ fontSize: 20, marginTop: 30, marginLeft: 20, fontWeight: 'bold' }}>
                                {String(categoryData.name).toUpperCase()}
                            </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                            <Image
                                style={{ height: 80, width: '60%' }}
                                source={{ uri: categoryData.image }}
                            />
                        </View>
                        <TouchableOpacity onPress={handleDismissEPress}>
                            <CROSS_ICON />
                        </TouchableOpacity>
                    </View>

                    <View
                        style={{
                            backgroundColor: "#fff",
                            flex: 1,
                            borderRadius: 15,
                            padding: 10,
                        }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: "bold", marginTop: 15 }}>
                            Cars
                        </Text>
                        <View >
                            <FlatList
                                horizontal
                                data={carsData}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                            />
                        </View>

                        <View
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                margin: 10,
                                justifyContent: "space-between",
                                // marginTop: 15,
                            }}
                        >
                            <View>
                                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                                    Rs. {fare}
                                </Text>
                            </View>

                            <View style={{ flex: 0.6 }}>
                                <TouchableOpacity
                                    style={styles.logout}
                                    onPress={bookRide}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: 14,
                                        }}
                                    >
                                        Book Ride
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </BottomSheet>
        </BottomSheetModalProvider>

    );
};


export default Home;
