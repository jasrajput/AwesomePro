import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import USER_IMAGE from '../../../assets/images/svg/user.svg';

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import API from "../API";
import Lottie from 'lottie-react-native';
import { notifyMessage } from "../helpers";

const DriverBank = () => {
    const navigation = useNavigation();

    const [state, setState] = useState({
        isLoading: false,
        bank: '',
        name: '',
        accNo: '',
        ifscCode: '',
        branch: ''
    });

    useEffect(() => {
        updateState({
            isLoading: true
        })
        API.getUserDetails().then(res => {
            updateState({
                name: res.official_name,
                bank: res.bank_name,
                accNo: res.account_no,
                ifscCode: res.ifsc_code,
                branch: res.branch,
                isLoading: false
            })
        })
    }, [])


    const { isLoading, name, bank, accNo, ifscCode, branch } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    const saveChanges = async () => {
        console.log(name);

        if ((name == null || name == "") || (accNo == null || accNo == null || accNo == "") || (ifscCode == null || ifscCode == "") || (branch == null || branch == "") || (bank == null || bank == "")) {
            return notifyMessage("All fields are required");
        }

        updateState({ isLoading: true })
        try {
            const response = await API.updateBankDetails(
                {
                    'official_name': name,
                    'bank_name': bank,
                    'account_no': accNo,
                    'ifsc_code': ifscCode,
                    'branch': branch
                }
            );

            if (response.status == true) {
                updateState({ isLoading: false })
                notifyMessage(response.message);
                navigation.goBack();
            } else {
                updateState({ isLoading: false })
                notifyMessage(response.message)
            }
        } catch (err) {
            updateState({ isLoading: false })
            notifyMessage(err.message);
        }
    }

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: '#fff', padding: 10 }]}>

                        <View style={{
                            margin: 10,
                        }}>

                            <Text style={{ color: '#3E4958', fontWeight: 'bold' }}>OFFICIAL NAME</Text>
                            <TextInput style={{
                                backgroundColor: '#F7F8F9', padding: 10,
                                marginTop: 5, borderRadius: 14, color: '#000'
                            }} value={name} onChangeText={(name) => updateState({
                                name: name
                            })} />
                        </View>


                        <View style={{
                            margin: 10,
                        }}>

                            <Text style={{ color: '#3E4958', fontWeight: 'bold' }}>BANK NAME</Text>
                            <TextInput style={{
                                backgroundColor: '#F7F8F9', padding: 10,
                                marginTop: 5, borderRadius: 14, color: '#000'
                            }} value={bank} onChangeText={(bank) => updateState({
                                bank
                            })} />
                        </View>

                        <View style={{
                            margin: 10,
                        }}>

                            <Text style={{ color: '#3E4958', fontWeight: 'bold' }}>ACCOUNT NO.</Text>
                            <TextInput style={{
                                backgroundColor: '#F7F8F9', padding: 10,
                                marginTop: 5, borderRadius: 14, color: '#000'
                            }} value={accNo} onChangeText={(accNo) => updateState({
                                accNo
                            })} />
                        </View>




                        <View style={{
                            margin: 10,
                        }}>

                            <Text style={{ color: '#3E4958', fontWeight: 'bold' }}>IFSC CODE</Text>
                            <TextInput style={{
                                backgroundColor: '#F7F8F9', padding: 10,
                                marginTop: 5, borderRadius: 14, color: '#000'
                            }} value={ifscCode} onChangeText={(ifscCode) => updateState({
                                ifscCode
                            })} />
                        </View>

                        <View style={{
                            margin: 10,
                        }}>

                            <Text style={{ color: '#3E4958', fontWeight: 'bold' }}>BRANCH NAME</Text>
                            <TextInput style={{
                                backgroundColor: '#F7F8F9', padding: 10,
                                marginTop: 5, borderRadius: 14, color: '#000'
                            }} value={branch} onChangeText={(branch) => updateState({
                                branch
                            })} />
                        </View>

                        <View style={{ marginHorizontal: 10, flex: 1 }}>
                            <TouchableOpacity
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    borderColor: '#000000',
                                    backgroundColor: '#000000',
                                    height: 50,
                                    width: '100%',
                                }}

                                onPress={saveChanges}
                            >
                                <Text style={globalStyles.btnTextColor}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 30 }} />


                    </ScrollView>
                )
            }
        </>
    );
};

export default DriverBank;
