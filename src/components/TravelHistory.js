import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    FlatList
} from "react-native";

import { useNavigation } from "@react-navigation/native";


import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";

import Lottie from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import API from "./API";

const TravelHistory = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [travelHistory, setTravelHistory] = useState([]);

    useEffect(() => {
        API.getTravelHistoryPassenger().then(res => {
            // console.log(res.data)
            // if (res.data) {
            setIsLoading(false);
            setTravelHistory(res.data);
            // }
        }).catch(er => {
            console.log(er.message)
        })
    }, [])


    const renderHistoryItem = ({ item }) => {
        return (
            <View style={[styles.container, { backgroundColor: '#fff' }]} >
                <View style={{ flex: 1 }}>

                    <View style={{
                        backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                        shadowOffset: { width: -2, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        padding: 10,
                        margin: 20,
                        borderColor: '#fff',
                        borderRadius: 20,
                        elevation: 4,
                        shadowColor: '#000',
                    }}>
                        <TouchableOpacity onPress={() => navigation.navigate('TripHistory', {
                            id: item.id
                        })}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={globalStyles.bold}>{new Date(item.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })}</Text>
                                <Text style={[globalStyles.bold, item.status == 'completed' ? { color: '#18C161', textTransform: 'uppercase' } : { color: '#FDCD03', textTransform: 'uppercase' }]} >{item.status}</Text>
                            </View>
                            <View
                                style={{
                                    borderWidth: 0.8,
                                    marginTop: 10,
                                    borderColor: "#D5DDE0",
                                }}
                            ></View>


                            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around' }}>
                                <View style={{ flex: 1 }}>
                                    <Text>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
                                    <Text>{item.origin_address}</Text>
                                </View>


                            </View>


                            <View style={{ flexDirection: 'row', marginTop: 50, justifyContent: 'space-around' }}>
                                <View style={{ flex: 1 }}>
                                    <Text>{new Date(item.updated_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </View>
                                <View style={{ textAlign: 'right' }}>
                                    <Text>{item.destination_address}</Text>
                                </View>

                            </View>

                        </TouchableOpacity>

                    </View>

                </View>
            </View>

        )
    }


    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading} />
                ) : (
                    travelHistory.length > 0 ? (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={travelHistory}
                                renderItem={renderHistoryItem}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    ) : (
                        <View style={{ flex: 1, marginTop: 15 }}>
                            <View style={{ backgroundColor: '#fff3cd', padding: 20, margin: 10, textAlign: 'center', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16 }}><MaterialCommunityIcons name={'information-outline'} color={'#4B545A'} size={20} /> You haven't started any ride so far.</Text>
                            </View>

                            <View style={{ flex: 1, marginTop: 3, marginHorizontal: 15 }}>
                                <TouchableOpacity
                                    onPress={() => { navigation.navigate("PassHome") }}
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: '#FDCD03',
                                        backgroundColor: '#FDCD03',
                                        height: 50,
                                        width: '100%',
                                        position: 'relative',
                                        bottom: 0,
                                    }}>
                                    <Text style={{ color: '#000', fontWeight: 'bold' }}><MaterialCommunityIcons name={'car-arrow-right'} color={'#4B545A'} size={18} />Start Ride</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                )
            }
        </>
    );
};

export default TravelHistory;
