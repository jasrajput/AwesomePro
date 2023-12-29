import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";


import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";

import Lottie from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import USER_IMAGE from '../../assets/images/svg/user.svg';


import API from "./API";

const TripHistory = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [travelHistory, setTravelHistory] = useState({});
    const route = useRoute();

    const id = route.params;

    useEffect(() => {
        API.getTripHistoryPassenger(id.id).then(res => {
            console.log(res)
            // if (res.data) {
            setIsLoading(false);
            setTravelHistory(res.data);
            // }
        }).catch(er => {
            console.log(er.message)
        })
    }, [])



    console.log(id);
    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading} />
                ) : (
                    travelHistory ? (
                        <ScrollView style={[styles.container, { backgroundColor: '#fff' }]}>
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
                                    <Image
                                        resizeMode="contain"
                                        source={require("../../assets/images/png/map-view.png")} />

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={globalStyles.bold}>{new Date(travelHistory.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })}</Text>
                                        <Text style={[globalStyles.bold, travelHistory.status == 'completed' ? { color: '#18C161', textTransform: 'uppercase' } : { color: '#FDCD03', textTransform: 'uppercase' }]} >{travelHistory.status}</Text>
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

                                {
                                    travelHistory.driver && travelHistory.driver.firstname !== null ? (
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontWeight: 'bold', margin: 20, fontSize: 20 }}>Driver</Text>

                                            <View style={{
                                                flexDirection: 'row', marginTop: 5, margin: 10, backgroundColor: '#fff', shadowColor: '#171717',
                                                shadowOffset: { width: -2, height: 4 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 3,
                                                padding: 20,
                                                borderColor: '#fff',
                                                borderRadius: 20,
                                                elevation: 4,
                                                shadowColor: '#000',
                                            }}>
                                                {
                                                    travelHistory.driver ? (
                                                        travelHistory.driver.profile_image == null ? (
                                                            <USER_IMAGE style={styles.sideMenuProfileIcon} />
                                                        ) : (
                                                            <Image source={{ uri: travelHistory.driver.profile_image }} style={{ height: 70, width: 70, borderRadius: 50 }} />
                                                        )
                                                    ) : null
                                                }

                                                {

                                                    <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                                                        <Text style={[globalStyles.bold, { fontSize: 17 }]}>
                                                            {
                                                                travelHistory.driver ? (
                                                                    (travelHistory.driver.firstname ?? '') + " " + (travelHistory.driver.lastname ?? '')
                                                                ) : null
                                                            }
                                                        </Text>
                                                        <Text style={globalStyles.bold}>
                                                            {
                                                                travelHistory.car ? (
                                                                    travelHistory.car[0]['name']
                                                                ) : null
                                                            }
                                                        </Text>
                                                    </View>
                                                }


                                            </View>
                                        </View>
                                    ) : null
                                }

                                <Text style={{ fontWeight: 'bold', margin: 20, fontSize: 20 }}>Payment</Text>

                                <View style={{ marginHorizontal: 10, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Image source={require("../../assets/images/png/card.png")} />
                                    <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Rs.{travelHistory.fare}</Text>
                                </View>



                            </View>
                        </ScrollView>
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

export default TripHistory;
