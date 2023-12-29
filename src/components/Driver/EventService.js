// EventService.js (Event emitter to notify changes)
import { NativeEventEmitter } from 'react-native';

const eventEmitter = new NativeEventEmitter();

const emitRideDataUpdate = (rideData) => {
    eventEmitter.emit('rideDataUpdate', rideData);
};

const emitAcknowledgement = (rideData) => {
    eventEmitter.emit('acknowledgement', rideData);
};

export { emitRideDataUpdate, eventEmitter, emitAcknowledgement };
