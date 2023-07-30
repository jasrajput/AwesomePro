import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    ToastAndroid,
    Image,
    Alert
} from "react-native";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import API from "../API";
import Lottie from 'lottie-react-native';

const deleteBank = () => {
    Alert.alert(
        '',
        'Are you sure you want to delete?',
        [
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            {
                text: 'OK', onPress: () => {
                    console.log('OK Pressed');
                    ToastAndroid.show('Deleted Successfully', ToastAndroid.SHORT)
                }
            },
        ],
        { cancelable: false }
    )
}

const DriverSettings = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bankName, setBankName] = useState('');
    const [accNo, setAccNo] = useState('');
    const [officialName, setOfficialName] = useState('');
    const [image, setImage] = useState('');
    const [wallet, setWallet] = useState('');


    useEffect(() => {
        setIsLoading(true);
        API.getUserDetails().then(res => {
            setName(res.firstname + ' ' + res.lastname);
            setEmail(res.email);
            setPhone(res.mobile_no);
            setBankName(res.bank_name);
            setAccNo(res.account_no);
            setOfficialName(res.official_name);
            setWallet(res.fund_wallet);
            setImage(res.profile_image);
            setIsLoading(false);
        })

    }, [name, email, phone, accNo, bankName, officialName, wallet, image])


    const logout = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token')
        if (token) {
            try {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('mode');
                navigation.navigate('Login');
            } catch (er) {
                notifyMessage(er.message)
            }
        }
    }

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <View style={[styles.container, { backgroundColor: '#F8F8FF' }]}>
                        <View style={{
                            justifyContent: 'center',
                            backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                            shadowOffset: { width: -2, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                            padding: 10,
                            margin: 9,
                            borderColor: '#fff',
                            borderRadius: 15,
                            elevation: 4,
                            shadowColor: '#000',
                        }}>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View>
                                        <Image source={require('../../../assets/images/driver/driver.png')} />
                                    </View>

                                    <View style={{ marginHorizontal: 10, marginTop: 5 }}>
                                        <Text>{name}</Text>
                                        <Text>{email}</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons name="phone" color={'#FDCD03'} size={20} />
                                            <Text>+91 {phone}</Text>
                                        </View>
                                    </View>
                                </View>


                                <View style={{ borderWidth: 1, borderRadius: 50, borderColor: '#FDCD03', height: 30, width: 30, }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('DriverProfile')}>
                                        <MaterialCommunityIcons name="pencil" color={'#FDCD03'} style={{ position: 'relative', top: 8, left: 7 }} size={15} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>



                        <View style={{
                            justifyContent: 'center',
                            backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                            shadowOffset: { width: -2, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                            padding: 14,
                            margin: 9,
                            borderColor: '#fff',
                            borderRadius: 15,
                            elevation: 4,
                            shadowColor: '#000',
                        }}>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={[globalStyles.bold, { fontSize: 16 }]}>BANK ACCOUNT & CARDS</Text>
                                </View>
                                <View style={{ borderWidth: 1, borderRadius: 50, borderColor: '#FDCD03', height: 30, width: 30, }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('DriverBank')}>
                                        <MaterialCommunityIcons name="pencil" color={'#FDCD03'} style={{ position: 'relative', top: 5, left: 8 }} size={15} />
                                    </TouchableOpacity>
                                </View>

                            </View>

                            {bankName !== '' ? (
                                <View style={{ flexDirection: 'row', marginTop: 14 }}>
                                    <View style={{ backgroundColor: '#F4F5F6', padding: 20, borderRadius: 10 }}>
                                        <MaterialCommunityIcons name="bank" color={'#FDCD03'} size={30} />
                                    </View>


                                    <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                                        <Text style={[globalStyles.bold, { fontSize: 16 }]}>{bankName}</Text>
                                        <Text style={{ fontSize: 14, color: '#747474' }}>ACCOUNT NUMBER - {accNo}</Text>
                                        <Text style={{ fontSize: 14, color: '#747474' }}>{officialName}</Text>
                                        {/* <TouchableOpacity onPress={deleteBank}>
                                        <Text style={{ color: '#FF1A00' }}>Delete</Text>
                                    </TouchableOpacity> */}
                                    </View>
                                </View>
                            ) : (
                                <View style={{
                                    justifyContent: 'center',
                                    backgroundColor: '#fff', shadowColor: '#171717',
                                    shadowOffset: { width: -2, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    padding: 10,
                                    marginTop: 20,
                                    borderColor: '#fff',
                                    borderRadius: 14,
                                    elevation: 4,
                                    shadowColor: '#000',
                                    position: 'relative',
                                }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('DriverBank')}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <MaterialCommunityIcons name="bank" color={'#4B545A'} size={25} />
                                                <Text style={{ color: '#4B545A', marginHorizontal: 10, fontSize: 16 }}>Add Bank Account</Text>
                                            </View>
                                            <MaterialCommunityIcons name="chevron-right" color={'#4B545A'} size={20} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )
                            }


                        </View>

                        <View style={{ margin: 20 }}>
                            <Text style={globalStyles.bold}>QUICK LINKS</Text>

                            <View style={{
                                justifyContent: 'center',
                                backgroundColor: '#fff', shadowColor: '#171717',
                                shadowOffset: { width: -2, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                                padding: 10,
                                marginTop: 20,
                                borderColor: '#fff',
                                borderRadius: 14,
                                elevation: 4,
                                shadowColor: '#000',
                                position: 'relative',
                            }}>
                                <TouchableOpacity onPress={() => navigation.navigate('DriverHistory')}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons name="history" color={'#4B545A'} size={25} />
                                            <Text style={{ color: '#4B545A', marginHorizontal: 10, fontSize: 16 }}>History</Text>
                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" color={'#4B545A'} size={20} />
                                    </View>
                                </TouchableOpacity>
                            </View>


                            <View style={{
                                justifyContent: 'center',
                                backgroundColor: '#fff', shadowColor: '#171717',
                                shadowOffset: { width: -2, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                                padding: 10,
                                marginTop: 20,
                                borderColor: '#fff',
                                borderRadius: 14,
                                elevation: 4,
                                shadowColor: '#000',
                                position: 'relative',
                            }}>
                                <TouchableOpacity onPress={() => navigation.navigate('DriverWallet', {
                                    'wallet': wallet
                                })}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <MaterialCommunityIcons name="wallet" color={'#4B545A'} size={25} />
                                            <Text style={{ color: '#4B545A', marginHorizontal: 10, fontSize: 16 }}>Wallet</Text>
                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" color={'#4B545A'} size={20} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>




                        <View style={{ marginHorizontal: 10, flex: 1 }}>
                            <TouchableOpacity onPress={logout}
                                style={[styles.btn, { bottom: 30 }]}
                            >
                                <Text style={globalStyles.btnTextColor}>Logout</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                )
            }
        </>
    );
};

export default DriverSettings;
