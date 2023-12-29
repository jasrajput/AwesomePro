import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import Lottie from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import API from "../API";

const DriverHistory = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [travelHistory, setTravelHistory] = useState([]);


    useEffect(() => {
        API.getTravelHistoryDriver().then(res => {
            if (res.status) {
                setTravelHistory(res.data);
                setIsLoading(false);
            }
        }).catch(er => {
            console.log(er.message)
        })
    }, [])


    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading} />
                ) : (
                    <View style={[styles.container, { backgroundColor: '#fff' }]}>
                        <ScrollView style={{ flex: 1 }}>
                            {
                                travelHistory && travelHistory.length > 0 ? (
                                    travelHistory.map((history, index) => (
                                        <View key={index} style={{
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
                                            <Text>
                                                <Text style={[globalStyles.bold, history.status == 'completed' ? { backgroundColor: '#D9F4E5', color: '#18C161' } : { backgroundColor: '#eee', color: '#FDCD03' }]}>
                                                    {history.status}
                                                </Text>
                                            </Text>
                                            <View
                                                style={{
                                                    borderWidth: 0.8,
                                                    marginTop: 10,
                                                    borderColor: "#D5DDE0",
                                                }}
                                            ></View>


                                            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text>{new Date(history.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                                </View>
                                                <View style={{ flex: 1, marginTop: 10 }}>
                                                    <Image
                                                        style={{ position: 'absolute', left: -3, bottom: 10 }}
                                                        resizeMode="contain"
                                                        source={require("../../../assets/images/png/ellipse.png")} />
                                                    <Image
                                                        style={{ position: 'absolute', }}
                                                        resizeMode="contain"
                                                        source={require("../../../assets/images/png/line.png")} />
                                                    <Image
                                                        style={{ position: 'absolute', top: 70, left: -3 }}
                                                        resizeMode="contain"
                                                        source={require("../../../assets/images/png/triangle.png")} />
                                                </View>
                                                <View style={{ textAlign: 'right' }}>
                                                    <Text>{history.origin_address}</Text>
                                                </View>


                                            </View>

                                            <View style={{ flexDirection: 'row', marginTop: 37, justifyContent: 'space-around' }}>
                                                <View style={{ flex: 1 }}>
                                                    <Text>{new Date(history.updated_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                                </View>
                                                <View style={{ textAlign: 'right' }}>
                                                    <Text>{history.destination_address}</Text>
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>
                                                <View>
                                                    <Text style={{ fontSize: 19, color: '#FDCD03', fontWeight: 'bold' }}>Rs.{history.fare}</Text>
                                                </View>
                                                <View >
                                                    <Text>{new Date(history.created_at).toLocaleDateString('en-GB')}</Text>
                                                </View>
                                            </View>


                                        </View>
                                    ))

                                ) : (
                                    <View style={{ flex: 1, marginTop: 15 }}>
                                        <View style={{ backgroundColor: '#fff3cd', padding: 20, margin: 10, textAlign: 'center', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 16 }}><MaterialCommunityIcons name={'information-outline'} color={'#4B545A'} size={20} /> You haven't accepted any ride so far.</Text>
                                        </View>
                                    </View>
                                )
                            }
                        </ScrollView>
                    </View>
                )
            }
        </>
    );
};

export default DriverHistory;
