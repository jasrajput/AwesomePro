import React, { useEffect, useState, useRef, useMemo } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    PermissionsAndroid,
    ToastAndroid,
    Platform,
    AlertIOS,
    Image,
    TextInput
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import API from "../API";
import Lottie from 'lottie-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import BottomSheet from "@gorhom/bottom-sheet";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { isEmpty, notifyMessage } from "../helpers";

const DriverProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [filePath, setFilePath] = useState('');
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ["25%"], []);

    // useEffect(() => {
    //     setIsLoading(true);
    //     API.getUserDetails().then(res => {
    //         console.log(res);
    //         setFirstName(res.firstname);
    //         setLastName(res.lastname);
    //         setEmail(res.email);

    //         setIsLoading(false);
    //     })

    // }, [firstName, lastName, email])

    // const requestCameraPermission = async () => {
    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.CAMERA,
    //             {
    //                 title: "App Camera Permission",
    //                 message: "App needs access to your camera ",
    //                 buttonNeutral: "Ask Me Later",
    //                 buttonNegative: "Cancel",
    //                 buttonPositive: "OK"
    //             }
    //         );
    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //             console.log("Camera permission given");
    //             openCamera();
    //         } else {
    //             console.log("Camera permission denied");
    //         }
    //     } catch (err) {
    //         console.warn(err);
    //     }
    // };


    // const openSheet = () => {
    //     if (bottomSheetRef.current) {
    //         bottomSheetRef.current.expand();
    //     }
    // }

    // const openCamera = async () => {
    //     const response = await launchCamera({
    //         mediaType: 'photo',
    //     });

    //     if (response.didCancel) {
    //         return notifyMessage('User cancelled action');
    //     } else if (response.error) {
    //         console.log('ImagePicker Error: ', response.error);
    //     } else {
    //         console.log(response);
    //     }
    // }


    const openGallery = async () => {
        const response = await launchImageLibrary({
            mediaType: 'photo',
        });

        if (response.didCancel) {
            return notifyMessage('User cancelled action');
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        } else {
            const fileType = response.assets[0].type;
            const fileSize = response.assets[0].fileSize;
            const sizeInMB = fileSize / 1000000;

            if (parseFloat(sizeInMB) > 2) {
                return notifyMessage('File size must be within 2 MB');
            }

            if (fileType == 'image/jpeg' || fileType == 'image/png' || fileType == 'image/jpg' || fileType == 'image/webp') {
                let source = {
                    uri: response.assets[0].uri
                };
                setFilePath(source);
            } else {
                return notifyMessage('Only png, jpg and webp format supported');
            }
        }
    }


    const uploadImage = async () => {
        setIsLoading(true);

        const filename = filePath.uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const ext = match?.[1];
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();

        console.log(filePath)


        formData.append("profile_image", {
            type: type,
            uri: filePath.uri,
            name: `profile_image.${ext}`,
        });

        console.log(formData)


        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.post('https://gscoin.live/api/auth/profile-pic-upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.status) {
                setIsLoading(false);
                return notifyMessage(response.message);
            } else {
                setIsLoading(false);
                return notifyMessage(response.message);
            }
        } catch (er) {
            setIsLoading(false);
            console.log(er.response.data)
            notifyMessage(er.message);
        }

    }

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <View style={styles.container}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                            {
                                Object.keys(filePath).length == 0 && <Image source={require('../../../assets/images/driver/driver.png')} style={{ height: 140, width: 140, borderRadius: 50 }} />
                            }

                            {
                                Object.keys(filePath).length > 0 && <Image source={{ uri: filePath.uri }} style={{ height: 140, width: 140, borderRadius: 50 }} />
                            }
                            <View style={{ borderWidth: 1, borderRadius: 50, borderColor: '#FDCD03', backgroundColor: '#FDCD03', height: 30, width: 30, position: 'relative', bottom: 130, left: 55 }}>
                                <TouchableOpacity onPress={openGallery}>
                                    <MaterialCommunityIcons name="camera" color={'#ffff'} style={{ position: 'relative', top: 5, left: 4 }} size={18} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ marginHorizontal: 10, width: '60%' }}>
                                <TouchableOpacity
                                    onPress={uploadImage}
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        borderColor: '#FDCD03',
                                        backgroundColor: '#FDCD03',
                                        height: 40,
                                        width: '100%',
                                    }}
                                >
                                    <Text style={globalStyles.btnTextColor}> <MaterialCommunityIcons name="upload" color={'#ffff'} size={18} /> Upload</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{
                            justifyContent: 'center',
                            backgroundColor: '#fff', marginTop: 30, shadowColor: '#171717',
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

                            <TextInput style={globalStyles.input} value={firstName} editable={false} />
                            <TextInput style={globalStyles.input} value={lastName} editable={false} />
                            <TextInput style={globalStyles.input} value={email} editable={false} />
                        </View>


                        {/* <View style={{ marginHorizontal: 10, flex: 1 }}>
                            <TouchableOpacity
                                style={styles.btn}
                            >
                                <Text style={globalStyles.btnTextColor}>Update Profile</Text>
                            </TouchableOpacity>
                        </View> */}
                        {/* 
                        <BottomSheet name={"A"}
                            ref={bottomSheetRef}
                            snapPoints={snapPoints}
                            index={-1}>
                            <View style={{ flex: 1 }}>
                                <TouchableOpacity onPress={openCamera}>
                                    <MaterialCommunityIcons name="camera" color={'#ffff'} size={20} />
                                    <Text>Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={openGallery}>
                                    <MaterialCommunityIcons name="image" color={'#ffff'} size={20} />
                                    <Text>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </BottomSheet> */}

                    </View>
                )
            }
        </>
    );
};

export default DriverProfile;
