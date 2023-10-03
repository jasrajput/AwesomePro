import {
    ToastAndroid,
    Platform,
    AlertIOS,
    PermissionsAndroid,
    Linking
} from 'react-native';

import Geolocation from "react-native-geolocation-service";
import AsyncStorage from '@react-native-async-storage/async-storage';


export function regionFrom(lat, lon, accuracy) {
    const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
    const circumference = (40075 / 360) * 1000;

    const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
    const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters);

    return {
        latitude: lat,
        longitude: lon,
        latitudeDelta: Math.max(0, latDelta),
        longitudeDelta: Math.max(0, lonDelta)
    };
}

export function getLatLonDiffInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

export function getAddressFromCoordinates(latitude, longitude) {
    return new Promise((resolve, reject) => {
        fetch(
            'https://maps.googleapis.com/maps/api/geocode/json?address=' +
            latitude +
            ',' +
            longitude +
            '&key=' +
            "AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU",
        )
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.status === 'OK') {
                    resolve(responseJson?.results?.[0]?.formatted_address);
                } else {
                    reject('not found');
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

export function notifyMessage(msg) {
    if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        AlertIOS.alert(msg);
    }
};

export const convertMinsToTime = (mins) => {
    let hours = Math.floor(mins / 60);
    let minutes = mins % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}hr ${Math.ceil(minutes)} min`;
}

export const calculateFare = (baseFare, timeRate, time, distanceRate, distance, surge) => {
    const distanceInKm = distance * 0.001;
    const timeInMin = time * 0.016667;
    const pricePerKm = timeRate * timeInMin;
    const pricePerMinute = distanceRate * distanceInKm;
    const totalFare = (baseFare + pricePerKm + pricePerMinute) * surge;
    return Math.round(totalFare);
}

export const isEmpty = (file) => {
    if (Object.keys(file).length == 0) {
        return true;
    }

    return false;
}


export const locationPermission = () => new Promise(async (resolve, reject) => {
    if (Platform.OS === 'ios') {
        try {
            const permissionStatus = await Geolocation.requestAuthorization('whenInUse');
            if (permissionStatus == 'granted') {
                return resolve('granted');
            }
            reject("Permission not granted");
        } catch (er) {
            return reject(err)
        }
    }

    return PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve('granted');
        }

        return reject('Location permission denied');
    }).catch(error => {
        console.log("Ask permission error", error);
        reject(error)
    })
})

export const getCurrentLocation = () => new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
        (position) => {
            const coords = {
                latitude: position['coords']['latitude'],
                longitude: position['coords']['longitude'],
                accuracy: position['coords']['accuracy'],
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
            }
            resolve(coords);
        },
        (error) => {
            reject(error.message)
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
        }
    );
})


export const callUser = (phone) => {
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
        phoneNumber = `telprompt:${phone}`;
    }
    else {
        phoneNumber = `tel:${phone}`;
    }

    Linking.canOpenURL(phoneNumber)
        .then(supported => {
            if (!supported) {
                notifyMessage('Phone number is not available');
            } else {
                return Linking.openURL(phoneNumber);
            }
        })
        .catch(err => {
            notifyMessage("Error making phone call");
        });
}


export const pusherAuth = async (pusher) => {
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
        return 0;
    }
}