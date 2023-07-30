import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import { notifyMessage } from "../helpers";


const DriverWallet = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { wallet } = route.params;


    const withdraw = () => {
        notifyMessage("Request submitted successfully");
        navigation.goBack();
    }

    return (
        <View style={[styles.container, { backgroundColor: '#F8F8FF' }]}>
            <View style={{
                justifyContent: 'center',
                backgroundColor: '#fff', marginTop: 20, shadowColor: '#fff',
                shadowOffset: { width: -2, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                padding: 15,
                margin: 20,
                borderColor: '#fff',
                borderRadius: 10,
                elevation: 4,
                shadowColor: '#000',
            }}>

                <Text style={{ fontSize: 16, color: '#868686' }}>Available Balance</Text>
                <Text style={{ fontSize: 19, color: '#000', fontWeight: 'bold', marginTop: 4 }}>Rs.{parseFloat(wallet).toFixed(2)}</Text>
            </View>


            {/* <View style={{ margin: 20 }}>
                <Text style={{ fontSize: 17, color: '#000', fontWeight: 'bold', marginTop: 4 }}>Money deposited by Admin</Text>
                <Text style={{ fontSize: 16, color: '#F52D56' }}>Rs.25,000</Text>
                <Text style={{ fontSize: 13, color: '#868686' }}>5th Sep 02:50 PM</Text>
            </View> */}


            <View style={{ marginHorizontal: 10, flex: 1 }}>
                <TouchableOpacity
                    onPress={withdraw}
                    style={styles.btn}
                >
                    <Text style={globalStyles.btnTextColor}>Withdraw</Text>
                </TouchableOpacity>
            </View>



        </View>
    );
};

export default DriverWallet;
