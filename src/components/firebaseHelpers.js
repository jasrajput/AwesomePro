import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

const initializeFirebase = () => {
    // Initialize Firebase
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);

        PushNotification.createChannel(
            {
                channelId: 'll', // (required)
                channelName: 'My channel', // (required)
                channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
                soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
                importance: 4, // (optional) default: 4. Int value of the Android notification importance
                vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
            },
        );

        PushNotification.localNotification({
            channelId: 'll', // (required)
            message: remoteMessage.notification.body,
            title: remoteMessage.notification.title,
            bigPictureUrl: remoteMessage.notification.android.imageUrl,
            smallIcon: remoteMessage.notification.android.imageUrl,
        });
    });
};


const handleForegroundMessages = () => {

    messaging().onMessage(async remoteMessage => {
        console.log('Foreground message received', remoteMessage);

        PushNotification.createChannel(
            {
                channelId: 'fsm', // (required)
                channelName: 'My channel', // (required)
                channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
                soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
                importance: 4, // (optional) default: 4. Int value of the Android notification importance
                vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
            },
        );

        PushNotification.localNotification({
            channelId: 'fsm', // (required)
            message: remoteMessage.notification.body,
            title: remoteMessage.notification.title,
            bigPictureUrl: remoteMessage.notification.android.imageUrl,
            smallIcon: remoteMessage.notification.android.imageUrl,
        });

        // Handle foreground messages here
    });
};

const handleOnOpenNotification = () => {
    PushNotification.popInitialNotification((notification) => {
        console.log('Initial Notification', notification);
    });
    messaging().onNotificationOpenedApp(async remoteMessage => {
        console.log('Notification opened when the app was in the background or closed:', remoteMessage);
    });
};

export { initializeFirebase, handleForegroundMessages, handleOnOpenNotification };