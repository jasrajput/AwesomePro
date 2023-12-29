import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    Linking,
    TextInput,
    Modal
} from "react-native";
import globalStyles from "../../styles/Global.styles";
import styles from "../../styles/EnableLocation.styles";
import pageStyles from "./styles/Registration.styles";
import HomeStyles from "../../styles/Home.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Lottie from 'lottie-react-native';
import API from "../API";
import { notifyMessage, isEmpty } from '../helpers';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { Picker } from '@react-native-picker/picker';

import UploadCardComponent from '../../utilities/uploader';


const Registration = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [drivingLicenseNo, setDrivingLicenseNo] = useState('');
    const [aadhardCardNumber, setAadhardCardNumber] = useState('');
    const [lastName, setLastName] = useState('');
    const [licenseFilePath, setLicenseFilePath] = useState({});
    const [aadharFilePath, setAadharFilePath] = useState({});
    const [aadharFilePathBack, setAadharFilePathBack] = useState({});
    const [clearanceFilePath, setClearanceFilePath] = useState({});
    const [driverImageFilePath, setDriverImageFilePath] = useState({});
    const [IdConfirmationFilePath, setIdConfirmationFilePath] = useState({});
    const [showGuidance, setShowGuidance] = useState(false);


    const [vehiclePhotoPath, setVehiclePhotoPath] = useState({});
    const [rcPhotoPath, setRcPhotoPath] = useState({});


    const [selectedYear, setSelectedYear] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [numberPlate, setNumberPlate] = useState('');

    const [licenseIconType, setLicenseIconType] = useState('download');
    const [IdConfirmationType, setIdConfirmationType] = useState('download');
    const [aadharType, setAadharType] = useState('download');
    const [aadharTypeBack, setAadharTypeBack] = useState('download');
    const [clearanceType, setClearanceType] = useState('download');

    const [vehicleIconType, setVehicleIconType] = useState('download');
    const [rcIconType, setRcIconType] = useState('download');

    const [driverType, setDriverType] = useState('camera');

    const [isVerified, setisVerified] = useState(false);
    const [isKYCSubmitted, setIsKYCSubmitted] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dobValue, setDOBValue] = useState('');

    const [showAlert, setShowAlert] = useState(false);

    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };


    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        const formattedDate = currentDate.toISOString().split('T')[0]; // Format the date as needed
        setDOBValue(formattedDate);
        console.log('Selected date:', currentDate);
    };


    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const toggleGuidance = () => {
        setShowGuidance(!showGuidance);
        setShowAlert(!showAlert);
    };

    useEffect(() => {
        console.log("Updated State");
        console.log(errors);
    }, [errors])

    useEffect(() => {
        API.getUserDetails().then(res => {

            if (res.message == 'Unauthenticated.') {
                navigation.navigate("Login")
                return;
            }

            if (res.is_kyc_submitted == 1) {
                setIsKYCSubmitted(true);
            } else {
                setIsKYCSubmitted(false);
            }

            setCurrentStep(res.activeStep)

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
                const response = await axios.post('https://thecitycabs.live/api/auth/driver-upload', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        // "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.data.status) {
                    setIsLoading(false);
                    setIsKYCSubmitted(true);
                    return notifyMessage(response.data.message);
                } else {
                    setIsLoading(false);
                    return notifyMessage(response.data.message);
                }
            } catch (er) {
                console.log(er);
                // console.log(er.response.data);
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
            // checkUpload(clearanceFilePath, setClearanceFilePath, setClearanceType);
        } else if (type == 4) {
            checkUpload(driverImageFilePath, setDriverImageFilePath, setDriverType);
        } else if (type == 5) {
            checkUpload(IdConfirmationFilePath, setIdConfirmationFilePath, setIdConfirmationType);
        } else if (type == 6) {
            checkUpload(aadharFilePathBack, setAadharFilePathBack, setAadharTypeBack);
        } else if (type == 9) {
            checkUpload(vehiclePhotoPath, setVehiclePhotoPath, setVehicleIconType);
        } else if (type == 10) {
            checkUpload(rcPhotoPath, setRcPhotoPath, setRcIconType);
        }
    }

    const contactSupport = () => {
        Linking.openURL('mailto:help@thecitycabs.live')
    }


    const submitImage = async (imageUris, token, additionalData, fieldName, endpoint) => {
        try {
            const formData = new FormData();
            imageUris.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const ext = match?.[1];
                const type = match ? `image/${match[1]}` : `image`;

                let imageRef = fieldName[index];
                formData.append(`${imageRef}`, {
                    type: type,
                    uri: imageUri,
                    name: `${imageRef}.${ext}`,
                });
            });


            console.log(formData);

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
            // console.error(error);
            // console.log(error.response.data);
            throw new Error('Image upload failed');
        }
    };




    const submitBasicDetails = async () => {
        // setErrors(true);
        if (!firstName || !lastName || !dobValue) {
            return notifyMessage('All fields are required');
        }

        const dobDate = new Date(dobValue);
        const today = new Date();
        const ageDiff = today.getFullYear() - dobDate.getFullYear();
        const isBeforeBirthday = today.getMonth() < dobDate.getMonth() ||
            (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate());

        const age = isBeforeBirthday ? ageDiff - 1 : ageDiff;

        // Check if the user is at least 18 years old
        if (age < 18) {
            return notifyMessage('Driver must be at least 18 years old.');
        }

        if (isEmpty(driverImageFilePath)) {
            return notifyMessage('Driver Image is required');
        }


        //CALL API
        setIsLoading(true);

        const token = await AsyncStorage.getItem('token');
        const additionalData = {
            firstname: firstName,
            lastname: lastName,
            date_of_birth: dobValue,
        };


        const imageUris = [driverImageFilePath.uri];
        const fieldName = ['driver_image'];

        const response = await submitImage(
            imageUris,
            token,
            additionalData,
            fieldName,
            'first-step-upload'
        );


        console.log("------- RESPONSE ------");
        console.log(response);
        console.log("------- END RESPONSE ------");


        if (response.status) {
            notifyMessage(response.message);
            setErrors(false);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            return notifyMessage(response.message);
        }


    }

    const submitDrivingDetails = async () => {
        setErrors(true);
        if (!drivingLicenseNo || isEmpty(licenseFilePath) || isEmpty(IdConfirmationFilePath)) {
            return notifyMessage('All fields are required');
        }

        const licenseNumberRegex = /^[A-Za-z]{2}\d{2}[A-Za-z0-9]{11}$/;
        if (!licenseNumberRegex.test(drivingLicenseNo)) {
            return notifyMessage('Please enter a valid Indian standard driving license no.');
        }

        //CALL API
        setIsLoading(true);

        const token = await AsyncStorage.getItem('token');
        const additionalData = {
            license_number: drivingLicenseNo,
        };

        const imageUris = [licenseFilePath.uri, IdConfirmationFilePath.uri];
        const fieldName = ['license_image', 'idConfirmation'];

        const response = await submitImage(
            imageUris,
            token,
            additionalData,
            fieldName,
            'second-step-upload'
        );

        console.log("------- RESPONSE ------");
        console.log(response);
        console.log("------- END RESPONSE ------");

        console.log("------- START ------");

        if (response.status) {
            setErrors(false);
            setIsLoading(false);
            notifyMessage(response.message);
        } else {
            console.log("IN THHHERE");
            setIsLoading(false);
            return notifyMessage(response.message);
        }



    }


    const submitAadharDetails = async () => {
        setErrors(true);
        if (!aadhardCardNumber || isEmpty(aadharFilePath) || isEmpty(aadharFilePathBack)) {
            return notifyMessage('All fields are required');
        }

        const aadharNumberRegex = /^\d{12}$/;
        if (!aadharNumberRegex.test(aadhardCardNumber)) {
            return notifyMessage('Please enter a valid 12 digit Indian standard aadhar card no.');
        }


        //CALL API
        setIsLoading(true);

        const token = await AsyncStorage.getItem('token');
        const additionalData = {
            aadhar_number: aadhardCardNumber,
        };

        const imageUris = [aadharFilePath.uri, aadharFilePathBack.uri];
        const fieldName = ['aadhar_front', 'aadhar_back'];

        const response = await submitImage(
            imageUris,
            token,
            additionalData,
            fieldName,
            'third-step-upload'
        );

        if (response.status) {
            setErrors(false);
            setIsLoading(false);
            notifyMessage(response.message);
        } else {
            setIsLoading(false);
            return notifyMessage(response.message);
        }
    }

    const submitVehiclesInfo = async () => {
        setErrors(true);
        if (!selectedModel || !selectedYear || !selectedBrand || !numberPlate || isEmpty(rcPhotoPath) || isEmpty(vehiclePhotoPath)) {
            return notifyMessage('All fields are required');
        }


        // Validation for year
        const currentYear = new Date().getFullYear();
        if (!selectedYear || isNaN(selectedYear) || selectedYear < 1950 || selectedYear > currentYear || selectedYear.toString().length !== 4) {
            return notifyMessage('Please enter a valid 4-digit year in model number');
        }

        // Validation for Indian standard number plate format (assuming a simple format here)
        // const numberPlateRegex = /^[A-Z]{2}\s?\d{2}\s?[A-Z]{2}\s?\d{4}$/;
        const numberPlateRegex = /^[A-Za-z]{2}\s?\d{2}\s?[A-Za-z]{2}\s?\d{4}$/;
        if (!numberPlateRegex.test(numberPlate)) {
            return notifyMessage('Please enter a valid Indian standard number plate');
        }



        //CALL API
        setIsLoading(true);

        const token = await AsyncStorage.getItem('token');
        const additionalData = {
            model: selectedModel,
            brand: selectedBrand,
            car_year: selectedYear,
            number_plate: numberPlate,
        };

        const imageUris = [vehiclePhotoPath.uri, rcPhotoPath.uri];
        const fieldName = ['vehicle_photo', 'rc_photo'];

        const response = await submitImage(
            imageUris,
            token,
            additionalData,
            fieldName,
            'final-step-upload'
        );


        console.log("------- RESPONSE ------");
        console.log(response);
        console.log("------- END RESPONSE ------");
        if (response.status) {
            setErrors(false);
            setIsLoading(false);
            notifyMessage(response.message);
        } else {
            setIsLoading(false);
            return notifyMessage(response.message);
        }

        setIsKYCSubmitted(true);
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


                                <View style={{ flex: 1 }}>
                                    <ProgressSteps activeStepIconBorderColor={'#FDCD03'} completedProgressBarColor={'#FDCD03'} activeStepIconColor={'#FDCD03'} completedStepIconColor={'#FDCD03'} activeLabelColor={"#000"} activeStep={currentStep}>
                                        <ProgressStep label="Personal information" onNext={submitBasicDetails} nextBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnStyle={{ backgroundColor: '#FDCD03', borderRadius: 15, paddingHorizontal: 30 }} errors={errors}>
                                            <Text style={styles.introTitleStyle}>Personal Information</Text>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
                                                    {
                                                        Object.keys(driverImageFilePath).length > 0 ? <Image
                                                            resizeMode={'contain'}
                                                            source={{ uri: driverImageFilePath.uri }}
                                                            style={{ width: '100%', height: 90 }} />
                                                            : <Image source={require('../../../assets/images/driver/driver-placeholder.png')} style={{ resizeMode: 'center', height: 90, width: '100%' }} />
                                                    }

                                                </View>

                                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                    <View style={{ borderWidth: 1, borderRadius: 50, borderColor: '#FDCD03', backgroundColor: '#FDCD03', height: 30, width: 30, position: 'relative', bottom: 45, left: 25 }}>
                                                        <TouchableOpacity onPress={() => uploadImage(4)}>
                                                            <MaterialCommunityIcons name={driverType} color={'#ffff'} style={{ position: 'absolute', top: 5, left: 4 }} size={18} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                <View style={pageStyles.marginHV}>
                                                    <Text style={pageStyles.textLabel}>First name</Text>
                                                    <TextInput style={pageStyles.input} value={firstName} onChangeText={(name) => setFirstName(name)} />
                                                </View>

                                                <View style={pageStyles.marginHV}>
                                                    <Text style={pageStyles.textLabel}>Last name</Text>
                                                    <TextInput style={pageStyles.input} value={lastName} onChangeText={(name) => setLastName(name)} />
                                                </View>

                                                <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
                                                    <Text style={pageStyles.textLabel}>Date of Birth</Text>
                                                    <TextInput style={pageStyles.input} onTouchStart={showDatepicker} value={dobValue} />
                                                    {showDatePicker && (
                                                        <DateTimePicker
                                                            testID="dateTimePicker"
                                                            value={date}
                                                            mode={'date'}
                                                            is24Hour={true}
                                                            display="default"
                                                            onChange={onChange}
                                                        />
                                                    )}

                                                </View>

                                            </View>
                                        </ProgressStep>
                                        <ProgressStep label="Driving license" previousBtnDisabled={true} onNext={submitDrivingDetails} previousBtnText={"Back"} previousBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnStyle={{ backgroundColor: '#FDCD03', borderRadius: 15, paddingHorizontal: 30 }} errors={errors}>
                                            <View style={{ flex: 1 }}>
                                                <View>
                                                    <Text style={styles.introTitleStyle}>Driving License</Text>
                                                    <View style={{ marginHorizontal: 20, marginTop: 30, marginBottom: 10 }}>
                                                        <Text style={pageStyles.textLabel}>Driving license number</Text>
                                                        <TextInput style={pageStyles.input} value={drivingLicenseNo} onChangeText={(driverLicense) => setDrivingLicenseNo(driverLicense)} />
                                                    </View>

                                                    {/* Driver ̵icense */}
                                                    <UploadCardComponent
                                                        label={"Driving license (Front)"}
                                                        description={"Kindly make sure face is visible and clear"}
                                                        iconType={licenseIconType}
                                                        filePath={licenseFilePath}
                                                        uploadImage={() => uploadImage(1)}
                                                    />

                                                    {/* ID confirmation */}
                                                    <UploadCardComponent
                                                        label={"ID Confirmation"}
                                                        description={"Your face and driving license should be visible \n in the image"}
                                                        iconType={IdConfirmationType}
                                                        filePath={IdConfirmationFilePath}
                                                        uploadImage={() => uploadImage(5)}
                                                    />

                                                    {/* <View style={{ margin: 10 }}>
                                                        <TouchableOpacity
                                                            style={[globalStyles.btn]}
                                                            onPress={uploadImageToServer}
                                                        >
                                                            <Text style={globalStyles.btnTextColor}>Upload</Text>
                                                        </TouchableOpacity>
                                                    </View> */}
                                                </View>
                                            </View>
                                        </ProgressStep>
                                        <ProgressStep label="Aadhar card" previousBtnDisabled={true} onNext={submitAadharDetails} previousBtnText={"Back"} previousBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnStyle={{ backgroundColor: '#FDCD03', borderRadius: 15, paddingHorizontal: 30 }} errors={errors}>
                                            <View style={{ flex: 1 }}>
                                                <View>
                                                    <Text style={styles.introTitleStyle}>Aadhar card</Text>
                                                    <View style={pageStyles.marginHV}>
                                                        <Text style={pageStyles.textLabel}>Aadhar card number</Text>
                                                        <TextInput style={pageStyles.input} value={aadhardCardNumber} onChangeText={(aadhar) => setAadhardCardNumber(aadhar)} />
                                                    </View>


                                                    {/* aadhar Front */}
                                                    <UploadCardComponent
                                                        label={"Aadhar card (front)"}
                                                        description={"Please make sure front of the aadhar is visible"}
                                                        iconType={aadharType}
                                                        filePath={aadharFilePath}
                                                        uploadImage={() => uploadImage(2)}
                                                    />

                                                    {/* aadhar Back */}
                                                    <UploadCardComponent
                                                        label={"Aadhar card (back)"}
                                                        description={"Please make sure back of the aadhar is visible"}
                                                        iconType={aadharTypeBack}
                                                        filePath={aadharFilePathBack}
                                                        uploadImage={() => uploadImage(6)}
                                                    />



                                                    {/* <View style={{ margin: 10 }}>
                                                        <TouchableOpacity
                                                            style={[globalStyles.btn]}
                                                            onPress={uploadImageToServer}
                                                        >
                                                            <Text style={globalStyles.btnTextColor}>Upload</Text>
                                                        </TouchableOpacity>
                                                    </View> */}
                                                </View>
                                            </View>
                                        </ProgressStep>
                                        <ProgressStep label="Vehicle Info" previousBtnDisabled={true} onSubmit={submitVehiclesInfo} previousBtnText={"Back"} previousBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnTextStyle={{ fontWeight: 'bold', color: '#000' }} nextBtnStyle={{ backgroundColor: '#FDCD03', borderRadius: 15, paddingHorizontal: 30 }} errors={errors}>
                                            <View style={{ flex: 1 }}>
                                                <View style={pageStyles.marginHV}>
                                                    <Text>Choose Model Year</Text>
                                                    <TextInput style={pageStyles.input} value={selectedYear} onChangeText={(year) => setSelectedYear(year)} />

                                                </View>


                                                <View style={pageStyles.marginHV}>
                                                    <Text>Choose Car Make</Text>
                                                    <TextInput style={pageStyles.input} value={selectedBrand} onChangeText={(brand) => setSelectedBrand(brand)} />
                                                </View>


                                                <View style={pageStyles.marginHV}>
                                                    <Text>Choose Car Model</Text>
                                                    <TextInput style={pageStyles.input} value={selectedModel} onChangeText={(model) => setSelectedModel(model)} />
                                                </View>


                                                <View style={pageStyles.marginHV}>
                                                    <Text>Number Plate</Text>
                                                    <TextInput style={pageStyles.input} value={numberPlate} onChangeText={(plate) => setNumberPlate(plate)} />
                                                </View>


                                                {/* Photo of the vehicle */}
                                                <View style={{ marginTop: 5 }}>
                                                    <UploadCardComponent
                                                        label={"Photo of the vehicle"}
                                                        description={"Please make sure car number is visible"}
                                                        iconType={vehicleIconType}
                                                        filePath={vehiclePhotoPath}
                                                        uploadImage={() => uploadImage(9)}
                                                    />
                                                </View>


                                                {/* RC of the vehicle */}
                                                <UploadCardComponent
                                                    label={"Registration Certificate (RC)"}
                                                    description={"Please make sure RC number is visible"}
                                                    iconType={rcIconType}
                                                    filePath={rcPhotoPath}
                                                    uploadImage={() => uploadImage(10)}
                                                />
                                            </View>
                                        </ProgressStep>
                                    </ProgressSteps>





                                    <View>
                                        <TouchableOpacity onPress={toggleGuidance} style={{
                                            backgroundColor: '#f5dd76', padding: 10, flex: 1, position: 'relative',
                                            bottom: 0,
                                            width: '100%',

                                        }}>
                                            <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 12 }}>Show KYC Guidelines</Text>
                                        </TouchableOpacity>
                                    </View>



                                    <Modal
                                        animationType="slide"
                                        transparent={true}
                                        visible={showAlert}
                                        onRequestClose={toggleAlert}
                                    >
                                        <View style={[HomeStyles.centeredView, { padding: 15, backgroundColor: '#fff' }]}>
                                            <View style={HomeStyles.modalView}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 15 }}>KYC Guidelines:</Text>
                                                <Text style={pageStyles.text}>Some General guidance on KYC:</Text>
                                                <Text style={pageStyles.text}>1.File Size Limit: Ensure files are 2 MB or less.</Text>
                                                <Text style={pageStyles.text}>2.Document Clarity: Upload clear and readable documents.</Text>
                                                <Text style={pageStyles.text}>3.Supported Formats: Use PDF, JPEG, or specified formats.</Text>
                                                <Text style={pageStyles.text}>4.Valid Documents: Check for visible expiration dates.</Text>
                                                <Text style={pageStyles.text}>5.Complete Information: Fill in all required fields accurately.</Text>

                                                <TouchableOpacity style={{ marginTop: 20, backgroundColor: '#FDCD03', color: '#000', padding: 10 }} onPress={toggleAlert}>
                                                    <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Close</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </Modal>


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
                                                style={pageStyles.enabled}>
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
                                            <TouchableOpacity onPress={contactSupport} style={pageStyles.enabled} >
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
