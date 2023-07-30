import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    Image,
    TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import Lottie from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DriverHistory = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [travelCount, setTravelCount] = useState(0);

    useEffect(() => {
        setIsLoading(false);
    }, [])

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading} />
                ) : (
                    <View style={[styles.container, { backgroundColor: '#fff' }]}>
                        <View style={{ flex: 1 }}>
                            {
                                travelCount > 0 ? (
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
                                        <Text>
                                            <Text style={[globalStyles.bold, { backgroundColor: '#D9F4E5', color: '#18C161' }]}>
                                                Completed
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
                                                <Text>11:24</Text>
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
                                            <View style={{ flex: 1 }}>
                                                <Text>st. Taube, 15</Text>
                                            </View>


                                        </View>

                                        <View style={{ flexDirection: 'row', marginTop: 37, justifyContent: 'space-around' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text>01:24</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text>st. Starozagorodnaya Grove, 8</Text>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>
                                            <View>
                                                <Text style={{ fontSize: 19, color: '#FDCD03', fontWeight: 'bold' }}>$52</Text>
                                            </View>
                                            <View >
                                                <Text>02/05/2022</Text>
                                            </View>
                                        </View>


                                    </View>
                                ) : (
                                    <View style={{ flex: 1, marginTop: 15 }}>
                                        <View style={{ backgroundColor: '#fff3cd', padding: 20, margin: 10, textAlign: 'center', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 16 }}><MaterialCommunityIcons name={'information-outline'} color={'#4B545A'} size={20} /> You haven't accepted any ride so far.</Text>
                                        </View>

                                        {/* <View style={{ flex: 1, marginTop: 3, marginHorizontal: 15 }}>
                                            <TouchableOpacity
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
                                                }}
                                            >
                                                <Text style={{ color: '#000', fontWeight: 'bold' }}><MaterialCommunityIcons name={'car-arrow-right'} color={'#4B545A'} size={18} />Start Ride</Text>
                                            </TouchableOpacity>
                                        </View> */}
                                    </View>
                                )
                            }
                        </View>
                    </View>
                )
            }
        </>
    );
};

export default DriverHistory;
