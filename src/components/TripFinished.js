import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Platform,
    StyleSheet,
    Image
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import globalStyles from "../styles/Global.styles";
import Lottie from 'lottie-react-native';
import API from "./API";


const TripFinished = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [travelHistory, setTravelHistory] = useState({});
    const route = useRoute();

    const { id, is_mode } = route.params;

    useEffect(() => {
        API.getTripHistoryPassenger(id).then(res => {
            console.log(res)
            setIsLoading(false);
            setTravelHistory(res.data);
        }).catch(er => {
            console.log(er.message)
        })
    }, []);

    const backToHome = () => {
        if (is_mode == 1) {
            navigation.replace('DriverHome')
        } else {
            navigation.replace('PassengerHome')
        }
    }

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading} />
                ) : (
                    <View style={{ flex: 1, backgroundColor: '#eee', justifyContent: 'center' }}>
                        <View style={pageStyles.shadowContainer}>


                            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                                <Image style={{ width: 70, height: 70 }} resizeMode="contain" source={require("../../assets/images/png/ic_success.png")} />
                                <Text style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>The trip is over</Text>
                            </View>

                            <View style={{ backgroundColor: '#f4f4f4', marginTop: 30, padding: 15, borderRadius: 15, }}>
                                <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around' }}>

                                    <View style={{ flex: 1 }}>
                                        <Text>{new Date(travelHistory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginTop: 10 }}>
                                        <Image
                                            style={{ position: 'absolute', left: -3, bottom: 10 }}
                                            resizeMode="contain"
                                            source={require("../../assets/images/png/ellipse.png")} />
                                        <Image
                                            style={{ position: 'absolute', }}
                                            resizeMode="contain"
                                            source={require("../../assets/images/png/line.png")} />
                                        <Image
                                            style={{ position: 'absolute', top: 70, left: -3 }}
                                            resizeMode="contain"
                                            source={require("../../assets/images/png/triangle.png")} />
                                    </View>
                                    <View style={{ textAlign: 'right' }}>
                                        <Text>{travelHistory.origin_address}</Text>
                                    </View>


                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 50, justifyContent: 'space-around' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text>{new Date(travelHistory.updated_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                    </View>
                                    <View style={{ textAlign: 'right' }}>
                                        <Text>{travelHistory.destination_address}</Text>
                                    </View>

                                </View>



                            </View>

                            <View style={{
                                marginTop: 20, flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderRadius: 15,
                                padding: 15,
                                backgroundColor: '#F7F8F9'
                            }}>
                                <Image source={require("../../assets/images/png/card.png")} />
                                <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Rs.{travelHistory.fare}</Text>
                            </View>

                        </View>

                        <TouchableOpacity onPress={backToHome}
                            style={pageStyles.btn}
                        >
                            <Text style={globalStyles.btnTextColor}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>

                )
            }
        </>
    );
};

const pageStyles = StyleSheet.create({
    shadowContainer: {
        margin: 20,
        padding: 10,
        height: 400,
        backgroundColor: 'white',
        borderBottomWidth: 1, // Adjust border width as needed
        borderBottomColor: '#000', // Color of the zigzag lines
        borderStyle: 'dotted',
        borderTopWidth: 0, // Hide top border
        borderRightWidth: 0, // Hide right border
        borderLeftWidth: 0, // Hide left border
        overflow: 'hidden', // Hide overflow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 1,
            },
        }),
    },

    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
        height: 50,
        position: 'absolute',
        bottom: 80,
        marginHorizontal: 20,
        width: '90%'
    }
});

export default TripFinished;
