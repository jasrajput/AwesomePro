import React from 'react';
import Config from "react-native-config";
import MapViewDirections from "react-native-maps-directions";
const { API_KEY } = Config;


const CustomDirection = ({ origin, destination, fetchTime, mapRef }) => {
    return (
        <MapViewDirections origin={origin} destination={destination} apikey={API_KEY} strokeColor="#FDCD03"
            mode={'DRIVING'}
            precision="high"
            strokeWidth={7}
            onStart={(params) => {
                console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
            }}
            resetOnChange={false}
            onReady={result => {
                console.log(`Distance: ${result.distance} km`)
                console.log(`Duration: ${result.duration} min.`)
                console.log("COORDDD.", result.coordinates);
                fetchTime(result.distance, result.duration)
                mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                        top: 20,
                        right: 20,
                        bottom: 120,
                        left: 20,
                    },
                    animated: true,
                });
            }}
            onError={(errorMessage) => {
                console.log('GOT AN ERROR');
            }}
        />
    )
}

export default CustomDirection;