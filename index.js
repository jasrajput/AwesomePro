import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitRideDataUpdate, emitAcknowledgement } from './src/components/Driver/EventService';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Killed state notification.', remoteMessage);
    const notificationData = remoteMessage?.data;

    try {
        if (notificationData.recipient == 'driver') {
            const newRideData = JSON.stringify(notificationData);
            await AsyncStorage.setItem('ride_data', newRideData);
            emitRideDataUpdate(newRideData);
            console.log("Data saved");
        } else {
            emitAcknowledgement(notificationData);
            console.log("Acknowledged by passenger")
        }

    } catch (error) {
        console.log("Data doesn't saved");
    }
});


AppRegistry.registerComponent(appName, () => App);