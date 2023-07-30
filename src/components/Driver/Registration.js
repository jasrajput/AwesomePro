import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Linking
} from "react-native";
import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import Lottie from 'lottie-react-native';
import API from "../API";
import { notifyMessage, isEmpty } from '../helpers';

const Registration = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [licenseFilePath, setLicenseFilePath] = useState({});
    const [aadharFilePath, setAadharFilePath] = useState({});
    const [clearanceFilePath, setClearanceFilePath] = useState({});

    const [licenseIconType, setLicenseIconType] = useState('download');
    const [aadharType, setAadharType] = useState('download');
    const [clearanceType, setClearanceType] = useState('download');

    const [isVerified, setisVerified] = useState(false);
    const [isKYCSubmitted, setIsKYCSubmitted] = useState(false);



    useEffect(() => {
        API.getUserDetails().then(res => {
            if (res.is_kyc_submitted == 1) {
                setIsKYCSubmitted(true);
            } else {
                setIsKYCSubmitted(false);
            }

            if (res.is_verified_driver == 1) {
                setisVerified(true);
            } else {
                setisVerified(false);
            }

            setIsLoading(false);
        }).catch(er => console.log(er.message))
    }, [isVerified, isLoading]);


    const uploadImageToServer = async () => {
        try {
            if (isEmpty(aadharFilePath) || isEmpty(clearanceFilePath) || isEmpty(licenseFilePath)) {
                return notifyMessage('All images are required');
            };

            const uri = aadharFilePath.uri?.replace("file://", "");
            const filename = aadharFilePath.uri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const ext = match?.[1];
            const type = match ? `image/${match[1]}` : `image`;

            const uriLicense = licenseFilePath.uri?.replace("file://", "");
            const licenseFileName = licenseFilePath.uri.split("/").pop();
            const match2 = /\.(\w+)$/.exec(licenseFileName);
            const ext2 = match2?.[1];
            const type2 = match2 ? `image/${match2[1]}` : `image`;

            const uriClearance = clearanceFilePath.uri?.replace("file://", "");
            const clearanceFileName = clearanceFilePath.uri.split("/").pop();
            const match3 = /\.(\w+)$/.exec(clearanceFileName);
            const ext3 = match3?.[1];
            const type3 = match3 ? `image/${match3[1]}` : `image`;

            const formData = new FormData();

            formData.append("license", {
                type: type2,
                uri: licenseFilePath.uri,
                name: `license.${ext2}`,
            });

            formData.append("aadhar", {
                type: type,
                uri: aadharFilePath.uri,
                name: `aadhar.${ext}`,
            });

            formData.append("clearance", {
                type: type3,
                uri: clearanceFilePath.uri,
                name: `clearance.${ext3}`,
            });

            setIsLoading(true);
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await axios.post('https://gscoin.live/api/auth/driver-upload', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                console.log(response.message);


                if (response.status) {
                    setIsLoading(false);
                    return notifyMessage(response.message);
                } else {
                    setIsLoading(false);
                    return notifyMessage(response.message);
                }
            } catch (er) {
                setIsLoading(false);
                notifyMessage("Try again later");
            }
        } catch (err) {
            setIsLoading(false);
            notifyMessage(err.message);
        }
    }

    const checkUpload = async (file, setFilePath, setIconType) => {
        if (isEmpty(file)) {
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

    const uploadImage = async (type) => {

        if (type == 1) {
            checkUpload(licenseFilePath, setLicenseFilePath, setLicenseIconType);
        } else if (type == 2) {
            checkUpload(aadharFilePath, setAadharFilePath, setAadharType);
        } else if (type == 3) {
            checkUpload(clearanceFilePath, setClearanceFilePath, setClearanceType);
        }
    }

    const contactSupport = () => {
        Linking.openURL('mailto:help@thecitycabs.com')
    }

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) :
                    <ScrollView ScrollView style={[styles.container, { backgroundColor: '#F8F8FF' }]}>
                        {
                            isKYCSubmitted == false ? (
                                <View>

                                    <Text style={styles.introTitleStyle}>My Document</Text>
                                    <View style={{
                                        backgroundColor: '#fff', marginTop: 20, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        margin: 20,
                                        borderColor: '#FFFFFF',
                                        borderRadius: 16,
                                        elevation: 4,
                                        shadowColor: '#000',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                            <View>
                                                <Text>Driving License</Text>
                                                <Text style={{ fontSize: 12 }}>A Driving license is an official document</Text>
                                            </View>

                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40, }}>
                                                <TouchableOpacity onPress={() => uploadImage(1)}>
                                                    <MaterialCommunityIcons name={licenseIconType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {
                                            Object.keys(licenseFilePath).length > 0 && <Image
                                                resizeMode={'contain'}
                                                source={{ uri: licenseFilePath.uri }}
                                                style={{ width: '100%', height: 250 }} />
                                        }

                                    </View>


                                    <View style={{
                                        backgroundColor: '#fff', marginTop: 5, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        margin: 20,
                                        borderColor: '#FFFFFF',
                                        borderRadius: 16,
                                        elevation: 4,
                                        shadowColor: '#000',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text>Aadhar Card</Text>
                                                <Text style={{ fontSize: 12 }}>Aadhar Card</Text>
                                            </View>

                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40, }}>
                                                <TouchableOpacity onPress={() => uploadImage(2)}>
                                                    <MaterialCommunityIcons name={aadharType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {
                                            Object.keys(aadharFilePath).length > 0 && <Image
                                                resizeMode={'contain'}
                                                source={{ uri: aadharFilePath.uri }}
                                                style={{ width: '100%', height: 250 }} />
                                        }
                                    </View>



                                    <View style={{
                                        backgroundColor: '#fff', marginTop: 5, shadowColor: '#171717',
                                        shadowOffset: { width: -2, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        padding: 14,
                                        margin: 20,
                                        borderColor: '#FFFFFF',
                                        borderRadius: 16,
                                        elevation: 4,
                                        shadowColor: '#000',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text>Police Clearance Certificate</Text>
                                                <Text style={{ fontSize: 12 }}>Police Clearance Certificate</Text>
                                            </View>

                                            <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40, }}>
                                                <TouchableOpacity onPress={() => uploadImage(3)}>
                                                    <MaterialCommunityIcons name={clearanceType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {
                                            Object.keys(clearanceFilePath).length > 0 && <Image
                                                resizeMode={'contain'}
                                                source={{ uri: clearanceFilePath.uri }}
                                                style={{ width: '100%', height: 250 }} />
                                        }
                                    </View>

                                    <View style={{ margin: 10 }}>
                                        <TouchableOpacity
                                            style={[globalStyles.btn]}
                                            onPress={uploadImageToServer}
                                        >
                                            <Text style={globalStyles.btnTextColor}>Upload</Text>
                                        </TouchableOpacity>

                                        {/* <TouchableOpacity onPress={() => setisVerified(true)}>
                                            <Text style={{ textAlign: 'center', fontSize: 18 }}>Skip</Text>
                                        </TouchableOpacity> */}
                                    </View>
                                </View>
                            ) : (
                                isVerified == true ? (
                                    <View style={{ flex: 1 }}>
                                        <View style={{ backgroundColor: '#d4edda', padding: 20, margin: 10, textAlign: 'center', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 16 }}><MaterialCommunityIcons name={'check'} color={'#4B545A'} size={20} /> Congratulations, Your KYC has been approved successfully by <Text style={{ fontWeight: 'bold' }}>The City Cabs Team</Text>.You can start accepting ride now.</Text>
                                        </View>

                                        <View style={{ flex: 1, marginTop: 1, marginHorizontal: 15 }}>
                                            <TouchableOpacity
                                                onPress={contactSupport}
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
                                                <Text style={{ color: '#000', fontWeight: 'bold' }}><MaterialCommunityIcons name={'human-greeting-variant'} color={'#4B545A'} size={18} /> Contact Us</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                ) : (
                                    <View style={{ flex: 1 }}>
                                        <View style={{ backgroundColor: '#fff3cd', padding: 20, margin: 10, textAlign: 'center', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 16 }}><MaterialCommunityIcons name={'account-clock-outline'} color={'#4B545A'} size={20} /> Your <Text style={{ fontWeight: 'bold' }}>KYC</Text> is <Text style={{ fontWeight: 'bold' }}>under process</Text>.Our team will evaluate your KYC soon.Real-time status will be updated here.Stay tuned!</Text>
                                        </View>

                                        <View style={{ flex: 1, marginTop: 3, marginHorizontal: 15 }}>
                                            <TouchableOpacity
                                                onPress={contactSupport}
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
                                                <Text style={{ color: '#000', fontWeight: 'bold' }}><MaterialCommunityIcons name={'human-greeting-variant'} color={'#4B545A'} size={18} /> Contact Us</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            )
                        }
                    </ScrollView>
            }
        </>

    );
};

export default Registration;
