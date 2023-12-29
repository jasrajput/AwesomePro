import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
    Image
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import USER_IMAGE from '../../assets/images/svg/user.svg';
import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";
import API from "./API";
import Lottie from 'lottie-react-native';
import messaging from '@react-native-firebase/messaging'; // Import the messaging module
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { notifyMessage, isEmpty } from "./helpers";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const AccountSettings = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);
    const [profileImage, setProfileImage] = useState('');
    const [profileImagePath, setProfileImagePath] = useState({});
    const [type, setType] = useState('camera');

    useEffect(() => {
        API.getUserDetails().then(res => {
            console.log(res);
            setFirstName(res.firstname);
            setLastName(res.lastname);
            setEmail(res.email);
            setMobileNo(res.mobile_no);
            setProfileImage(res.profile_image);
            setIsLoading(false);
        }).catch(er => {
            console.log(er.message)
        })
    }, [])


    useEffect(() => {
        const checkPermissionAndToken = async () => {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                setIsEnabled(true); // Set the switch to true if permission is granted
                console.log('Authorization status:', authStatus);

                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    console.log('Firebase Token is:', fcmToken);
                } else {
                    console.log('Token failed getting', 'No token received');
                }
            }
        };

        checkPermissionAndToken();
    }, []);



    const toggleSwitch = async () => {
        if (!isEnabled) {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                setIsEnabled(true);
                console.log('Authorization status:', authStatus);

                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    console.log('Firebase Token is:', fcmToken);
                } else {
                    console.log('Token failed getting', 'No token received');
                }
            }
        } else {
            // Handle switching off notification, if needed
            setIsEnabled(false);
        }
    };


    const saveDetails = async () => {

        if (firstName == null || lastName == "" || email == "") {
            return notifyMessage("All fields are required");
        }

        // if (isEmpty(profileImagePath)) {
        //     return notifyMessage('Profile Image is required');
        // }

        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const additionalData = {
                'firstname': firstName,
                'lastname': lastName,
                'email': email
            };

            let response;

            if (isEmpty(profileImagePath)) {
                response = await API.updatePersonalDetails(additionalData)
            } else {
                response = await submitImage(
                    profileImagePath.uri,
                    token,
                    additionalData,
                    'profile_image',
                    'update-profile'
                );
            }


            console.log(response)
            if (response.status == true) {
                setIsLoading(false);
                notifyMessage(response.message);
            } else {
                setIsLoading(false);
                if (response.errors.email && response.errors.email.length > 0) {
                    notifyMessage(response.errors.email[0]);
                } else {
                    notifyMessage(response.message);
                }

            }
        } catch (err) {
            setIsLoading(false);
            notifyMessage(err.message);
        }
    }

    const uploadImage = () => {
        checkUpload(profileImagePath, setProfileImagePath, setType);
    }

    const submitImage = async (imageUri, token, additionalData, fieldName, endpoint) => {
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const ext = match?.[1];
            const type = match ? `image/${match[1]}` : `image`;

            console.log(filename);

            let imageRef = fieldName;
            formData.append(`${imageRef}`, {
                type: type,
                uri: imageUri,
                name: `${imageRef}.${ext}`,
            });

            // Append additional data to the FormData
            for (const key in additionalData) {
                formData.append(key, additionalData[key]);
            }

            const response = await axios.post(`https://thecitycabs.live/api/auth/${endpoint}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error(error);
            console.log(error.response.data);
            throw new Error('Image upload failed');
        }
    };


    const checkUpload = async (file, setFilePath, setIconType) => {
        if (isEmpty(file)) {
            const response = await launchImageLibrary({
                mediaType: 'photo',
            });

            if (response.didCancel) {
                return notifyMessage('User cancelled action');
            } else if (response.error) {
                return notifyMessage('ImagePicker Error: ', response.error);
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
                    setIconType('delete');
                } else {
                    return notifyMessage('Only png, jpg and webp format supported');
                }


            }
        } else {
            setFilePath({});
            setIconType('download');
        }
    }


    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
                    >
                        <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
                            {
                                Object.keys(profileImagePath).length > 0 ? <Image
                                    resizeMode={'contain'}
                                    source={{ uri: profileImagePath.uri }}
                                    style={{ width: '100%', height: 90 }} />
                                    : profileImage === null || profileImage === '' ? (
                                        <USER_IMAGE style={{
                                            alignSelf: 'center',
                                            position: 'relative',
                                            top: 20,
                                        }} />
                                    ) : (
                                        <Image source={{ uri: profileImage }} style={{ height: 90, width: 90, alignSelf: 'center', }} />
                                    )

                            }

                        </View>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ borderWidth: 1, borderRadius: 50, borderColor: '#FDCD03', backgroundColor: '#FDCD03', height: 30, width: 30, position: 'relative', bottom: 10, left: 25 }}>
                                <TouchableOpacity onPress={() => uploadImage()}>
                                    <MaterialCommunityIcons name={type} color={'#ffff'} style={{ position: 'absolute', top: 5, left: 4 }} size={18} />
                                </TouchableOpacity>
                            </View>
                        </View>


                        <View style={{
                            justifyContent: 'center',
                            backgroundColor: '#fff', marginTop: 80, shadowColor: '#171717',
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
                            <Text style={{ color: '#3E4958', fontWeight: 'bold', marginHorizontal: 20 }}>FIRST NAME</Text>
                            <TextInput style={globalStyles.input} value={firstName} onChangeText={(firstname) => setFirstName(firstname)} placeholderTextColor="#000" placeholder={'ENTER YOUR FIRST NAME'} editable={true} />

                            <Text style={{ color: '#3E4958', fontWeight: 'bold', marginHorizontal: 20, marginTop: 10 }}>LAST NAME</Text>
                            <TextInput style={globalStyles.input} value={lastName} onChangeText={(lastname) => setLastName(lastname)} placeholderTextColor="#000" placeholder={'ENTER YOUR LAST NAME'} editable={true} />

                            <Text style={{ color: '#3E4958', fontWeight: 'bold', marginHorizontal: 20, marginTop: 10 }}>EMAIL</Text>
                            <TextInput style={globalStyles.input} value={email} onChangeText={(email) => setEmail(email)} placeholderTextColor="#000" placeholder={'ENTER YOUR EMAIL'} editable={true} />

                            <Text style={{ color: '#3E4958', fontWeight: 'bold', marginHorizontal: 20, marginTop: 10 }}>MOBILE NO.</Text>
                            <TextInput style={[globalStyles.input, { backgroundColor: '#eee', }]} value={mobileNo} placeholderTextColor="#000" placeholder={'ENTER YOUR MOBILE NO'} editable={false} />
                            <Text style={{ color: '#FDCD03', fontSize: 10, marginHorizontal: 20 }}>Mobile number cannot be altered</Text>


                        </View>

                        <TouchableOpacity style={{
                            marginHorizontal: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: '#FDCD03',
                            backgroundColor: '#FDCD03',
                            height: 50,
                            width: '90%',
                        }} onPress={saveDetails}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Update</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 30, marginTop: 30 }}>
                            <View>
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Notification</Text>
                                <Text style={{ color: '#767577' }}>To receive messages</Text>
                            </View>
                            <View style={{ marginTop: 15, transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}>
                                <Switch
                                    trackColor={{ false: '#D5DDE0', true: '#FDCD03' }} // Colors for the track
                                    thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'} // Color for the thumb
                                    ios_backgroundColor="#3e3e3e" // Background color for iOS
                                    onValueChange={toggleSwitch} // Function called when the switch changes state
                                    value={isEnabled} // Current state of the switch
                                />
                            </View>

                        </View>


                        <View style={{ marginBottom: 20 }}></View>

                    </ScrollView>
                )
            }
        </>
    )
};

export default AccountSettings;
