// Custom Navigation Drawer / Sidebar with Image and Icon in Menu Options
// https://aboutreact.com/custom-navigation-drawer-sidebar-with-image-and-icon-in-menu-options/

import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    Image,
    Text,
    Linking,
    Switch,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer';
import USER_IMAGE from '../../assets/images/svg/user.svg';
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from 'react-native-gesture-handler';

const CustomSidebarMenu = props => {
    // console.log(props)
    const [isLoading, setIsLoading] = useState(false);
    // const [isEnabled, setIsEnabled] = useState(false);
    const [isDefault, setDefault] = useState('');

    const toggleSwitch = async () => {

        // setIsLoading(true);

        const mode = await AsyncStorage.getItem('mode')

        if (mode == 'Driver' && mode != null) {
            await AsyncStorage.setItem('mode', 'Passenger');
            setDefault('Passenger');
            setIsLoading(false);
            props.navigation.closeDrawer();

            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });

        } else {
            await AsyncStorage.setItem('mode', 'Driver');
            setDefault('Driver');
            setIsLoading(false);
            props.navigation.closeDrawer();

            navigation.reset({
                index: 0,
                routes: [{ name: 'DriverHome' }],
            });
        }
    };

    const navigation = useNavigation();
    const BASE_PATH =
        'https://raw.githubusercontent.com/AboutReact/sampleresource/master/';
    const proileImage = 'react_logo.png';

    const redirect = () => {
        navigation.navigate('AccountSettings');
    }
    const logout = () => {
        navigation.navigate('Login')
    }

    useEffect(() => {
        (async () => {
            const mode = await AsyncStorage.getItem('mode')
            console.log(mode)

            if (mode != null) {
                setDefault(mode);
            } else {
                setDefault("Passenger");
            }
        })();

    }, [])


    return (
        <SafeAreaView style={{ flex: 1 }}>
            {
                isLoading ? <ActivityIndicator style={styles.loading} size="large" color="#000" /> : ''
            }
            <View
                style={{
                    paddingTop: 70,
                    paddingBottom: 10,
                    backgroundColor: '#FDCD03',
                    paddingLeft: 6,
                }}>

                <TouchableOpacity onPress={redirect}>
                    <USER_IMAGE style={styles.sideMenuProfileIcon} />
                    <View style={{ paddingHorizontal: 10, marginTop: 10 }} >
                        <Text style={{ color: '#fff' }}>Maddey</Text>
                        <Text style={{ color: '#fff' }}>meddy.009@gmail.com</Text>
                    </View>
                </TouchableOpacity>
            </View>
            {
                isDefault == 'Passenger' ? (
                    <View style={{ flex: 1 }}>
                        <DrawerContentScrollView {...props}>
                            <DrawerItemList {...props} />
                            <DrawerItem
                                activeTintColor={'#000'}
                                inactiveTintColor={'#000'}
                                label="Home"
                                onPress={() => navigation.navigate("Home")}
                            />
                            <DrawerItem
                                activeTintColor={'#000'}
                                inactiveTintColor={'#000'}
                                label="TRAVEL HISTORY"
                                onPress={() => navigation.navigate("TravelHistory")}
                            />

                            <DrawerItem
                                activeTintColor={'#000'}
                                inactiveTintColor={'#000'}
                                label="SUPPORT"
                                onPress={() => navigation.navigate("Support")}
                            />

                            <View style={{ justifyContent: 'space-around' }}>
                                <DrawerItem
                                    activeTintColor={'#000'}
                                    inactiveTintColor={'#000'}
                                    onPress={toggleSwitch}
                                    label="SWITCH TO DRIVER"
                                />
                                {/* 
                <Switch
                  style={{ position: 'relative', bottom: 38 }}
                  trackColor={{ false: '#767577', true: '#F4F4F4' }}
                  thumbColor={isEnabled ? '#FDCD03' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                /> */}


                            </View>

                        </DrawerContentScrollView>

                    </View>
                ) : <View style={{ flex: 1 }}>
                    <DrawerContentScrollView {...props}>

                        <DrawerItemList {...props} />
                        <DrawerItem
                            activeTintColor={'#000'}
                            inactiveTintColor={'#000'}
                            label="DriverHome"
                            onPress={() => navigation.navigate("DriverHome")}
                        />


                        <DrawerItem
                            activeTintColor={'#000'}
                            inactiveTintColor={'#000'}
                            label="RIDE HISTORY"
                            onPress={() => navigation.navigate('DriverHistory')}
                        />

                        <DrawerItem
                            activeTintColor={'#000'}
                            inactiveTintColor={'#000'}
                            label="SUPPORT"
                            onPress={() => navigation.navigate("Support")}
                        />

                        <View style={{ justifyContent: 'space-around' }}>
                            <DrawerItem
                                activeTintColor={'#000'}
                                inactiveTintColor={'#000'}
                                label="SWITCH TO PASSENGER"
                                onPress={toggleSwitch}
                            />

                            {/* <Switch
                style={{ position: 'relative', bottom: 38 }}
                trackColor={{ false: '#767577', true: '#F4F4F4' }}
                thumbColor={isEnabled ? '#FDCD03' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              /> */}


                        </View>

                    </DrawerContentScrollView>

                </View>
            }

            <TouchableOpacity onPress={logout}>
                <Text
                    style={{
                        paddingBottom: 20,
                        marginLeft: 15,
                        fontSize: 16,
                        color: '#FDCD03',
                    }}>
                    Log Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    sideMenuProfileIcon: {
        resizeMode: 'center',
        width: 100,
        height: 100,
        borderRadius: 100 / 2,
    },
    iconStyle: {
        width: 15,
        height: 15,
        marginHorizontal: 5,
    },
    customItem: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },

    loading: {
        width: '100%',
        position: "absolute",
        zIndex: 1,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5FCFF88",

    }
});

export default CustomSidebarMenu;
