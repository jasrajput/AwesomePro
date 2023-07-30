import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from "react-native-geolocation-service";
import { regionFrom, getLatLonDiffInMeters, notifyMessage, isEmpty, getAddressFromCoordinates, locationPermission, getCurrentLocation } from '../helpers';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Lottie from 'lottie-react-native';
import SwitchSelector from "react-native-switch-selector";

import {
    Pusher,
    PusherMember,
    PusherChannel,
    PusherEvent,
} from '@pusher/pusher-websocket-react-native';
import API from "../API";

const DriverHome = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [licenseFilePath, setLicenseFilePath] = useState({});
    const [aadharFilePath, setAadharFilePath] = useState({});
    const [clearanceFilePath, setClearanceFilePath] = useState({});

    const [licenseIconType, setLicenseIconType] = useState('download');
    const [aadharType, setAadharType] = useState('download');
    const [clearanceType, setClearanceType] = useState('download');

    const [isVerified, setisVerified] = useState(false);
    const [location, setLocation] = useState(false);

    const [passenger, setPassenger] = useState(null);
    const [region, setRegion] = useState({});
    const [accuracy, setAccuracy] = useState(null);
    const [has_passenger, sethas_passenger] = useState(false);

    const [online, setOnline] = useState(0);


    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [curLoc, setCurLoc] = useState({
        latitude: 30.7046,
        longitude: 77.1025
    });

    // useEffect(() => {
    //     API.getUserDetails().then(res => {
    //         if (res.is_verified_driver == 1) {
    //             setisVerified(true);
    //         } else {
    //             setisVerified(false);
    //         }

    //         setIsLoading(false);
    //     }).catch(er => console.log(er.message))
    // }, [isVerified, isLoading]);

    // useEffect(() => {
    //     setIsLoading(false);
    //     setisVerified(true);
    // }, [isLoading]);

    var available_drivers_channel = null;

    const navigation = useNavigation();
    const pusher = Pusher.getInstance();

    // let pickup_address = '';
    // let dropoff_address = '';

    // let passenger = {
    //     pickup: {
    //         latitude: 29.9456906,
    //         longitude: 78.16424780000001
    //     }
    // }

    // getAddressFromCoordinates(passenger.pickup.latitude, passenger.pickup.longitude).then(res => {
    //     console.log(res);
    // }).catch(er => console.log(er.message));


    if (has_passenger) {
        getAddressFromCoordinates(passenger.pickup.latitude, passenger.pickup.longitude).then(pickup => {
            setPickup(pickup)
        }).catch(er => console.log(er.message));

        getAddressFromCoordinates(passenger.dropoff.latitude, passenger.dropoff.longitude).then(dropoff => {
            setDropoff(dropoff)
        }).catch(er => console.log(er.message));
    }

    const uploadImageToServer = async () => {
        try {

            let imageArray = [];

            if (isEmpty(aadharFilePath) || isEmpty(clearanceFilePath) || isEmpty(licenseFilePath)) {
                return notifyMessage('All images are required');
            };

            const uri = aadharFilePath.uri?.replace("file://", "");
            const filename = aadharFilePath.uri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const ext = match?.[1];
            const type = match ? `image/${match[1]}` : `image`;

            const uriLicense = licenseFilePath.uri?.replace("file://", "");
            const licenseFileName = licenseFilePath.uri.split("/").pop();
            const match2 = /\.(\w+)$/.exec(licenseFileName);
            const ext2 = match2?.[1];
            const type2 = match2 ? `image/${match2[1]}` : `image`;

            const uriClearance = clearanceFilePath.uri?.replace("file://", "");
            const clearanceFileName = clearanceFilePath.uri.split("/").pop();
            const match3 = /\.(\w+)$/.exec(clearanceFileName);
            const ext3 = match3?.[1];
            const type3 = match3 ? `image/${match3[1]}` : `image`;

            const formData = new FormData();

            formData.append("license", {
                type: type2,
                uri: licenseFilePath.uri,
                name: `license.${ext2}`,
            });

            formData.append("aadhar", {
                type: type,
                uri: aadharFilePath.uri,
                name: `aadhar.${ext}`,
            });

            formData.append("clearance", {
                type: type3,
                uri: clearanceFilePath.uri,
                name: `clearance.${ext3}`,
            });

            setIsLoading(true);
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await axios.post('https://gscoin.live/api/auth/driver-upload', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                console.log(response.message);


                if (response.status) {
                    setIsLoading(false);
                    return notifyMessage(response.message);
                } else {
                    setIsLoading(false);
                    return notifyMessage(response.message);
                }
            } catch (er) {
                setIsLoading(false);
                notifyMessage("Try again later");
            }
        } catch (err) {
            setIsLoading(false);
            notifyMessage(err.message);
        }
    }

    const checkUpload = async (file, setFilePath, setIconType) => {
        if (isEmpty(file)) {
            const response = await launchImageLibrary({
                mediaType: 'photo',
            });

            if (response.didCancel) {
                return notifyMessage('User cancelled action');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const fileType = response.assets[0].type;
                const fileSize = response.assets[0].fileSize;
                const sizeInMB = fileSize / 1000000;

                if (parseFloat(sizeInMB) > 2) {
                    return notifyMessage('File size must be within 2 MB');
                }

                if (fileType == 'image/jpeg' || fileType == 'image/png' || fileType == 'image/jpg' || fileType == 'image/webp') {
                    let source = {
                        uri: response.assets[0].uri
                    };
                    setFilePath(source);
                    setIconType('delete');
                } else {
                    return notifyMessage('Only png, jpg and webp format supported');
                }


            }
        } else {
            setFilePath({});
            setIconType('download');
        }
    }

    const uploadImage = async (type) => {

        if (type == 1) {
            checkUpload(licenseFilePath, setLicenseFilePath, setLicenseIconType);
        } else if (type == 2) {
            checkUpload(aadharFilePath, setAadharFilePath, setAadharType);
        } else if (type == 3) {
            checkUpload(clearanceFilePath, setClearanceFilePath, setClearanceType);
        }
    }

    const getLiveLocation = async () => {
        try {
            const locPermission = await locationPermission();
            if (locPermission) {
                const { latitude, longitude, accuracy } = await getCurrentLocation();
                console.log("get live location after 4 second")
                let regionSave = {
                    latitude,
                    longitude,
                    accuracy
                };

                setCurLoc({ latitude, longitude })
                setRegion(regionSave)
                setAccuracy(accuracy)

            }
        } catch (er) {
            console.log(er.message)
        }
    }

    useEffect(() => {
        getLiveLocation();
    }, []);



    useEffect(() => {
        (async () => {

            setIsLoading(false);
            // setisVerified(true);

            const token = await AsyncStorage.getItem("token");
            if (token) {
                console.log(isVerified);
                if (isVerified) {
                    console.log("Entered");
                    await pusher.init({
                        apiKey: "c3bba9aaea1fe2b21d4e",
                        cluster: "ap2",
                        forceTLS: true,
                        encrypted: true,
                        onAuthorizer: async (channelName, socketId) => {
                            console.log(channelName);
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

                    available_drivers_channel = await pusher.subscribe({
                        channelName: 'presence-available-drivers',
                        onEvent: (event) => {
                            console.log(`Got channel event: ${event}`);

                            if (event.eventName == 'client-driver-request') {
                                if (!has_passenger) {
                                    console.log(event.data);
                                    let eventRes = JSON.parse(event.data);
                                    setPassenger({
                                        user_id: eventRes['user_id'],
                                        username: eventRes['username'],
                                        pickup: eventRes['pickup'],
                                        dropoff: eventRes['dropoff'],
                                        duration: eventRes['duration'],
                                        distance: eventRes['distance'],
                                        fare: eventRes['fare'],
                                    });

                                    sethas_passenger(true);
                                }
                            }
                        },
                    });

                    await pusher.connect();
                    console.log(pusher)
                }
            } else {
                navigation.navigate("Login");
            }
        })();
    }, [])


    const acceptRide = async () => {
        console.log(passenger.user_id)
        var first_time = false;
        let ride_channel = null;
        console.log("Accepted");
        let dataResponse = {
            response: 'yes'
        };
        ride_channel = await pusher.subscribe({
            channelName: 'presence-ride-' + passenger.user_id,
            onSubscriptionSucceeded: async (channelName, data) => {
                await pusher.trigger({
                    // channelName: 'presence-ride-.' + event.data.username,
                    channelName: 'presence-ride-Jas',
                    eventName: 'client-driver-response',
                    data: JSON.stringify(dataResponse)
                });
            },

            onEvent: async (eventResponse) => {
                if (eventResponse.eventName == 'client-driver-response') {
                    let response = JSON.parse(eventResponse.data);
                    if (response['response'] == 'yes') {

                        try {
                            const driverGeocodedPlace = await getAddressFromCoordinates(curLoc.latitude, curLoc.longitude);

                            const driverData = {
                                driver: {
                                    name: 'John Smith'
                                },
                                name: driverGeocodedPlace,
                                latitude: curLoc.latitude,
                                longitude: curLoc.longitude,
                                accuracy: accuracy
                            }
                            try {
                                await pusher.trigger({
                                    channelName: 'presence-ride-Jas',
                                    eventName: 'client-found-driver',
                                    data: JSON.stringify(driverData)
                                });

                                first_time = true;
                                navigation.navigate('PassengerFound', {
                                    origin: passenger.pickup,
                                    destination: passenger.dropoff
                                });

                            } catch (ers) {
                                console.log(ers.message)
                            }
                        } catch (er) {
                            console.log(er.message);
                        }
                    } else {
                        notifyMessage("Another driver already accepted the request");
                    }
                }
            }
        })

        console.log(pusher)

        if (first_time) {
            navigation.navigate('PassengerFound', {
                origin: passenger.pickup,
                destination: passenger.dropoff
            });
        }
    }


    const options = [
        { label: "Online", value: "1", testID: "switch-one", accessibilityLabel: "switch-one", activeColor: '#4BB543' },
        { label: "Offline", value: "2", testID: "switch-one-thirty", accessibilityLabel: "switch-one-thirty", activeColor: '#bb2124' },
    ];


    const onChangeMode = (value) => {
        console.log(value);
        console.log("ONLINE: " + online)
        if (value == 1) {
            if (!isVerified) {
                notifyMessage("To start earning, you need to verify your account");
                setOnline(0);
            } else {
                setOnline(1);
            }
        }
    }


    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) :
                    <ScrollView ScrollView style={[styles.container, { backgroundColor: '#F8F8FF' }]}>
                        {
                            isVerified == false ? (
                                <View>

                                    <Text style={styles.introTitleStyle}>My Document</Text>
                                    <View style={{
                                        backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        margin: 20,
                                        borderColor: '#FFFFFF',
                                        borderRadius: 16,
                                        elevation: 4,
                                        shadowColor: '#000',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                            <View>
                                                <Text>Driving License</Text>
                                                <Text style={{ fontSize: 12 }}>A Driving license is an official document</Text>
                                            </View>

                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40, }}>
                                                <TouchableOpacity onPress={() => uploadImage(1)}>
                                                    <MaterialCommunityIcons name={licenseIconType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {
                                            Object.keys(licenseFilePath).length > 0 && <Image
                                                resizeMode={'contain'}
                                                source={{ uri: licenseFilePath.uri }}
                                                style={{ width: '100%', height: 250 }} />
                                        }

                                    </View>


                                    <View style={{
                                        backgroundColor: '#fff', marginTop: 5, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        margin: 20,
                                        borderColor: '#FFFFFF',
                                        borderRadius: 16,
                                        elevation: 4,
                                        shadowColor: '#000',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text>Aadhar Card</Text>
                                                <Text style={{ fontSize: 12 }}>Aadhar Card</Text>
                                            </View>

                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40, }}>
                                                <TouchableOpacity onPress={() => uploadImage(2)}>
                                                    <MaterialCommunityIcons name={aadharType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {
                                            Object.keys(aadharFilePath).length > 0 && <Image
                                                resizeMode={'contain'}
                                                source={{ uri: aadharFilePath.uri }}
                                                style={{ width: '100%', height: 250 }} />
                                        }
                                    </View>



                                    <View style={{
                                        backgroundColor: '#fff', marginTop: 5, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        margin: 20,
                                        borderColor: '#FFFFFF',
                                        borderRadius: 16,
                                        elevation: 4,
                                        shadowColor: '#000',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text>Police Clearence Certificate</Text>
                                                <Text style={{ fontSize: 12 }}>Police Clearence Certificate</Text>
                                            </View>

                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40, }}>
                                                <TouchableOpacity onPress={() => uploadImage(3)}>
                                                    <MaterialCommunityIcons name={clearanceType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {
                                            Object.keys(clearanceFilePath).length > 0 && <Image
                                                resizeMode={'contain'}
                                                source={{ uri: clearanceFilePath.uri }}
                                                style={{ width: '100%', height: 250 }} />
                                        }
                                    </View>

                                    <View style={{ margin: 10 }}>
                                        <TouchableOpacity
                                            style={[globalStyles.btn]}
                                            onPress={uploadImageToServer}
                                        >
                                            <Text style={globalStyles.btnTextColor}>Upload</Text>
                                        </TouchableOpacity>

                                        {/* <TouchableOpacity onPress={() => setisVerified(true)}>
                                            <Text style={{ textAlign: 'center', fontSize: 18 }}>Skip</Text>
                                        </TouchableOpacity> */}
                                    </View>
                                </View>
                            ) : (
                                <View>

                                    <View style={{ margin: 20 }}>

                                        {/* Driver Details */}

                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <SwitchSelector
                                                value={online}
                                                disableValueChangeOnPress={false}
                                                options={options}
                                                initial={1}
                                                borderColor={'#000'}
                                                backgroundColor={'#eee'}
                                                borderWidth={2}
                                                style={{ width: '70%' }}
                                                borderRadius={25}
                                                onPress={value => onChangeMode(value)}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 25 }}>
                                            <Image source={require('../../../assets/images/driver/driver.png')} style={{ height: 50, width: 50 }} />
                                            <View style={{ marginHorizontal: 10 }}>
                                                <Text>Hello Frank</Text>
                                                <Text style={globalStyles.bold}>India</Text>
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
                                                <Text style={[globalStyles.bold, { fontSize: 20, }]}>0.00</Text>
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
                                                <Text style={[globalStyles.bold, { fontSize: 20 }]}>
                                                    {has_passenger ? 1 : 0}
                                                </Text>
                                                <Text style={[{ fontSize: 14, color: '#717171', marginTop: 8 }]}>Today Bookings</Text>
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
                                                                    <Image style={{ height: 40, width: 40 }} source={require('../../../assets/images/driver/driver.png')} />
                                                                </View>

                                                                <View style={{ marginHorizontal: 10 }}>
                                                                    <Text style={globalStyles.bold}>{passenger.username}</Text>
                                                                    <View style={{ flexDirection: 'row' }}>
                                                                        <MaterialCommunityIcons name="clock" color={'#FDCD03'} size={20} />
                                                                        <Text>{parseFloat(passenger.duration).toFixed(2)} min.</Text>
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
                                                            }}>
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
                            )
                        }
                    </ScrollView>
            }
        </>

    );
};

export default DriverHome;
