import React from 'react';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { PermissionsAndroid, Platform } from 'react-native';
import { navigationRef, navigate } from '../components/NavigationRef';

const showNotification = (remoteMessage) => {
    PushNotification.createChannel(
        {
            channelId: 'llss', // (required)
            channelName: 'My channel', // (required)
            channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
            soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
            importance: 4, // (optional) default: 4. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
        },
    );

    PushNotification.localNotification({
        channelId: 'llss', // (required)
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
        bigPictureUrl: remoteMessage.notification.android.imageUrl,
        smallIcon: remoteMessage.notification.android.imageUrl,
    });
}

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
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            console.log('Your Firebase Token is:', fcmToken);
        } else {
            console.log('Failed', 'No token received');
        }

        return fcmToken;
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
                console.log('Notification Data:', notificationData);

                navigationRef.current?.navigate(notificationData.page_redirect, {
                    screen: notificationData.page_redirect,
                    params: { notificationData }
                });
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

                showNotification();

                const notificationData = remoteMessage?.data;

                if (notificationData) {
                    // Access notification data if available
                    console.log('Notification Data:', notificationData);

                    navigationRef.current?.navigate(notificationData.page_redirect, {
                        screen: notificationData.page_redirect,
                        params: { notificationData }
                    });
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

                navigationRef.current?.navigate(notificationData.page_redirect, {
                    screen: notificationData.page_redirect,
                    params: { notificationData }
                });

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

                navigationRef.current?.navigate(notificationData.page_redirect, {
                    screen: notificationData.page_redirect,
                    params: { notificationData }
                });
            } else {
                console.log('Notification Data is missing or undefined');
                // Handle the case when 'notificationData' is not available
            }
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