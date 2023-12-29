import React from 'react';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { navigationRef, navigate } from '../components/NavigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitRideDataUpdate, emitAcknowledgement } from '../components/Driver/EventService';




const usePushNotification = () => {
    const requestUserPermission = async () => {
        if (Platform.OS === 'ios') {
            //Request iOS permission
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('Authorization status:', authStatus);
            }
        } else if (Platform.OS === 'android') {
            //Request Android permission (For API level 33+, for 32 or below is not required)
            const res = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
        }
    }

    const getFCMToken = async () => {
        try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
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


    // Function to handle token refresh event
    const handleTokenRefresh = async (newToken) => {
        try {
            const currentToken = await getFCMToken();

            if (currentToken !== newToken) {
                console.log("New Token")
                // await sendTokenToBackend(newToken);
            } else {
                console.log('FCM token is the same. No update needed.');
            }
        } catch (error) {
            console.error('Error handling token refresh:', error);
        }
    };

    const initializeTokenRefreshListener = async () => {
        return messaging().onTokenRefresh(async newToken => {
            await handleTokenRefresh(newToken);
        });
    }


    const listenToForegroundNotifications = async () => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log(
                'A new message arrived! (FOREGROUND)',
                JSON.stringify(remoteMessage),
            );

            const notificationData = remoteMessage?.data;

            if (notificationData) {
                // console.log('Notification Data hooks page:', notificationData);

                addNewRideData(notificationData);
                // navigate(notificationData.page_redirect, {
                //     screen: notificationData.page_redirect,
                //     params: { notificationData }
                // });
            } else {
                console.log('Notification Data is missing or undefined');
                // Handle the case when 'notificationData' is not available
            }
        });
        return unsubscribe;
    }

    const listenToBackgroundNotifications = async () => {
        const unsubscribe = messaging().setBackgroundMessageHandler(
            async remoteMessage => {
                console.log(
                    'A new message arrived! (BACKGROUND)',
                    JSON.stringify(remoteMessage),
                );

                const notificationData = remoteMessage?.data;

                if (notificationData) {
                    // Access notification data if available
                    console.log('Notification Data:', notificationData);
                    addNewRideData(notificationData);
                    // try {
                    //     const newRideData = JSON.stringify(notificationData);
                    //     await AsyncStorage.setItem('ride_data', newRideData);
                    //     emitRideDataUpdate(newRideData);
                    //     console.log("Data saved");
                    // } catch (error) {
                    //     console.log("Data doesn't saved");
                    // }

                    // navigate(notificationData.page_redirect, {
                    //     // navigationRef.current?.navigate(notificationData.page_redirect, {
                    //     screen: notificationData.page_redirect,
                    //     params: { notificationData }
                    // });
                } else {
                    console.log('Notification Data is missing or undefined');
                    // Handle the case when 'notificationData' is not available
                }

            },
        );
        return unsubscribe;
    }

    const onNotificationOpenedAppFromBackground = async () => {
        const unsubscribe = messaging().onNotificationOpenedApp(async remoteMessage => {
            console.log('App opened from BACKGROUND by tapping notification:', JSON.stringify(remoteMessage));

            // Check if remoteMessage and its data exist before accessing
            const notificationData = remoteMessage?.data;

            if (notificationData) {
                console.log('Notification Data:', notificationData);


                // navigate(notificationData.page_redirect, {
                //     screen: notificationData.page_redirect,
                //     params: { notificationData }
                // });

            } else {
                console.log('Notification Data is missing or undefined');
                // Handle the case when 'notificationData' is not available
            }
        });

        return unsubscribe;
    };

    const onNotificationOpenedAppFromQuit = async () => {
        const remoteMessage = await messaging().getInitialNotification();

        if (remoteMessage) {
            console.log('App opened from QUIT by tapping notification:', JSON.stringify(remoteMessage));

            const notificationData = remoteMessage?.data;

            if (notificationData) {
                console.log('Notification Data:', notificationData);

                // navigate(notificationData.page_redirect, {
                //     screen: notificationData.page_redirect,
                //     params: { notificationData }
                // });
            } else {
                console.log('Notification Data is missing or undefined');
                // Handle the case when 'notificationData' is not available
            }
        }
    };


    const addNewRideData = async (notificationData) => {
        console.log("ADD FUNCTION: ", notificationData);
        try {
            console.log("RECIPIENT :", notificationData.recipient);
            if (notificationData.recipient === 'driver') {
                const newRideData = JSON.stringify(notificationData);

                // Retrieve existing ride data from AsyncStorage
                const existingRideData = await AsyncStorage.getItem('ride_data');
                let rides = [];

                if (existingRideData !== null) {
                    // Parse the existing ride data if it exists
                    rides = JSON.parse(existingRideData);
                }

                // Add the new ride data to the array
                rides.push(notificationData);

                // Save the updated ride data array back to AsyncStorage
                await AsyncStorage.setItem('ride_data', JSON.stringify(rides));

                // Emit an update event
                emitRideDataUpdate(newRideData);

                console.log('New ride data added successfully:', notificationData);
            } else if (notificationData.recipient == 'passenger') {
                emitAcknowledgement(notificationData);

                console.log('Ride acknowledgement by passenger');
            }

        } catch (error) {
            console.log('Error adding new ride data:', error);
        }
    };


    return {
        requestUserPermission,
        getFCMToken,
        initializeTokenRefreshListener,
        listenToForegroundNotifications,
        listenToBackgroundNotifications,
        onNotificationOpenedAppFromBackground,
        onNotificationOpenedAppFromQuit,
    };
};

export default usePushNotification;