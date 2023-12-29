import {
    ToastAndroid,
    Platform,
    AlertIOS,
    PermissionsAndroid,
    Linking
} from 'react-native';

import Geolocation from "react-native-geolocation-service";
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';


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
                    // resolve(responseJson?.results?.[4]?.formatted_address);
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
    let minutes = Math.round(mins % 60);

    if (hours === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        let formattedMinutes = Math.floor(minutes); // Round and convert to integer
        return `${hours} hour${hours !== 1 ? 's' : ''} ${formattedMinutes} minute${formattedMinutes !== 1 ? 's' : ''}`;
    }
};

export const calculateFare = (baseFare, timeRate, time, distanceRate, distance, surge) => {
    // const distanceInKm = distance * 0.001;
    // const timeInMin = time * 0.016667;
    // const pricePerKm = timeRate * timeInMin;
    // const pricePerMinute = distanceRate * distanceInKm;
    // const totalFare = (baseFare + pricePerKm + pricePerMinute) * surge;
    // return Math.round(totalFare);


    const pricePerKm = distanceRate * distance;
    const pricePerMinute = timeRate * time;
    const totalFare = (baseFare + pricePerKm + pricePerMinute) * surge;
    return Math.round(totalFare);



    // const distanceInKm = distance * 0.001; // Convert distance to kilometers
    // const timeInHours = time / 3600; // Convert time to hours

    // // Calculate fare components
    // const fareFromDistance = distanceInKm * distanceRate; // Fare from distance
    // const fareFromTime = timeInHours * timeRate; // Fare from time

    // // Calculate total fare without surge
    // const totalFareWithoutSurge = baseFare + fareFromDistance + fareFromTime;

    // // Apply surge multiplier to the total fare
    // const totalFare = totalFareWithoutSurge * surge;

    // return Math.round(totalFare); // Round the total fare to the nearest integer

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
            } else {
                setTimeout(() => {
                    locationPermission();
                }, 1000); // Wait for 1 second before rechecking
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
        } else {
            setTimeout(() => {
                locationPermission();
            }, 1000); // Wait for 1 second before rechecking
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
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005
            };
            resolve(coords);
        },
        (error) => {
            let errorMessage = 'An error occurred while fetching the location.';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'User denied the request for Geolocation.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'The request to get user location timed out.';
                    break;
                case error.UNKNOWN_ERROR:
                    errorMessage = 'An unknown error occurred.';
                    break;
                default:
                    errorMessage = 'An error occurred while fetching the location.';
                    break;
            }
            reject(errorMessage);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
        }
    );
});


export const fetchRouteInfo = async (origin, destination) => {
    try {
        const API_KEY = 'AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU';
        const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${API_KEY}&mode=driving`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'OK') {
            const route = data.routes[0];
            const durationInSeconds = route.legs[0].duration.value; // Duration in seconds
            const distanceInMeters = route.legs[0].distance.value; // Distance in meters

            // Convert duration from seconds to minutes
            const durationInMinutes = durationInSeconds / 60;

            // console.log(`Estimated travel time: ${durationInMinutes} minutes`);
            // console.log(`Distance: ${distanceInMeters} meters`);

            return [distanceInMeters, durationInMinutes];

        } else {
            // console.error('Directions request failed:', data.status);
            return [null, null];
        }
    } catch (error) {
        // console.error('Error fetching route information:', error);
        return [null, null];
    }
};

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
                const auth = await axios.post("https://thecitycabs.live/broadcasting/auth", {
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


export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
}

// export const getFCM = async () => {
//     const fcmToken = await messaging().getToken();
//     if (fcmToken) {
//         console.log('Firebase Token is:', fcmToken);
//     } else {
//         console.log('Token failed getting', 'No token received');
//     }

//     return fcmToken;
// };

export const getFCM = async () => {
    try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            // console.log('Firebase Token is:', fcmToken);
            return fcmToken;
        } else {
            console.log('Failed', 'No token received');
            return null;
        }
    } catch (error) {
        console.log('Error getting FCM token:', error);
        return null;
    }
};

export function formatTime(durationInMinutes) {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.floor(durationInMinutes % 60);

    const hoursStr = hours > 0 ? `${hours}h ` : '';
    const minutesStr = minutes > 0 ? `${minutes}m` : '';

    return hoursStr + minutesStr;
}


export const showNotification = (type, remoteMessage) => {
    PushNotification.createChannel(
        {
            channelId: type,
            channelName: type,
            channelDescription: 'A channel to categorise your notifications',
            soundName: 'default',
            importance: 4,
            vibrate: true,
        },
    );

    PushNotification.localNotification({
        channelId: type,
        message: remoteMessage,
        title: "Driver Message",
        // bigPictureUrl: remoteMessage.notification.android.imageUrl,
        // smallIcon: remoteMessage.notification.android.imageUrl,
    });
}