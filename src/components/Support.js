import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    ScrollView
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import { useRoute } from "@react-navigation/native";
import HOME_IMAGE from "../../assets/images/svg/5.svg";

import globalStyles from "../styles/Global.styles";
import styles from "../styles/EnableLocation.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AccordionItem from '../utilities/accordion';
import Lottie from 'lottie-react-native';

const Support = () => {
    const route = useRoute();
    const { mode } = route.params;
    const [expandedItem, setExpandedItem] = useState(null);
    const [isLoading, setLoading] = useState(true);

    const toggleExpand = (itemIndex) => {
        setExpandedItem(expandedItem === itemIndex ? null : itemIndex);
    };

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, [])

    return (
        <>
            {
                isLoading ? (
                    <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading}
                    />
                ) : (
                    <View style={styles.container}>
                        <ScrollView style={{ marginVertical: 25 }}>

                            {/* Passenger */}

                            {
                                mode == 1 ? (
                                    <View>
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15 }}>Account & Registration</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How can I update my profile information after registration ?"
                                                        content="To modify your profile details, navigate to the app's profile settings. Here, you can edit your name, email, contact number, or any other personal information."
                                                        expanded={expandedItem === 0}
                                                        onPress={() => toggleExpand(0)}
                                                    />
                                                </View>


                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="Is there an option to manage notifications or account settings ?"
                                                        content="Yes, in the app's settings or account preferences, you can manage notification preferences, customize app settings, and control other account-related features."
                                                        expanded={expandedItem === 1}
                                                        onPress={() => toggleExpand(1)}
                                                    />
                                                </View>

                                            </View>

                                        </View>

                                        {/* Booking & Ride */}
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15, marginTop: 15 }}>Booking & Ride Requests</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How do I request a ride ?"
                                                        content='Open the app, enter your pickup location and destination, select your preferred ride option, and tap on "Request Ride."'
                                                        expanded={expandedItem === 2}
                                                        onPress={() => toggleExpand(2)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How can I pay for my ride ?"
                                                        content="We support various payment methods, including credit/debit cards, mobile wallets, and cash. You can set your preferred payment method in the app's settings."
                                                        expanded={expandedItem === 3}
                                                        onPress={() => toggleExpand(3)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How do I track my ride's arrival ?"
                                                        content="After requesting a ride, you'll receive real-time updates on your driver's location and estimated time of arrival on the app's map."
                                                        expanded={expandedItem === 4}
                                                        onPress={() => toggleExpand(4)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="What should I do if I need to cancel my ride ?"
                                                        content="You can cancel a ride anytime before the driver arrives. Select the cross icon to cancel the ride"
                                                        expanded={expandedItem === 5}
                                                        onPress={() => toggleExpand(5)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="What should I do if I left something in the vehicle ?"
                                                        content="You can contact your driver directly from the app to inquire about your lost item. Alternatively, you can report the issue to our support team."
                                                        expanded={expandedItem === 6}
                                                        onPress={() => toggleExpand(6)}
                                                    />
                                                </View>
                                            </View>

                                        </View>

                                        {/* Payment & Pricing */}
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15 }}>Payment & Pricing</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="What payment methods are accepted for rides ?"
                                                        content="We accept payments via credit/debit cards, digital wallets etc. You can select your preferred payment method before confirming the ride"
                                                        expanded={expandedItem === 7}
                                                        onPress={() => toggleExpand(7)}
                                                    />
                                                </View>


                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How is the fare calculated for a ride ?"
                                                        content="Ride fares are determined based on factors like distance, time, and demand. You'll see an estimate before confirming the ride, and the final fare will be displayed at the end of your trip"
                                                        expanded={expandedItem === 8}
                                                        onPress={() => toggleExpand(8)}
                                                    />
                                                </View>
                                            </View>



                                        </View>


                                        {/* Safety & Assistance */}
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15 }}>Safety & Assistance</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How are drivers screened for safety ?"
                                                        content="Drivers undergo a thorough screening process that includes background checks, vehicle inspections, and verification of necessary documents."
                                                        expanded={expandedItem === 9}
                                                        onPress={() => toggleExpand(9)}
                                                    />
                                                </View>


                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How is the fare calculated for a ride ?"
                                                        content="Ride fares are determined based on factors like distance, time, and demand. You'll see an estimate before confirming the ride, and the final fare will be displayed at the end of your trip"
                                                        expanded={expandedItem === 10}
                                                        onPress={() => toggleExpand(10)}
                                                    />
                                                </View>
                                            </View>


                                        </View>

                                    </View>


                                ) : (



                                    <View>
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15 }}>Account Setup & Verification</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How do I become a driver on the platform ?"
                                                        content="Start by registering as a driver, submit required documents (personal information, driver's license, vehicle registration etc), and complete a verification process"
                                                        expanded={expandedItem === 0}
                                                        onPress={() => toggleExpand(0)}
                                                    />
                                                </View>


                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="What are the vehicle requirements to become a driver ?"
                                                        content="Your vehicle must meet certain standards, including proper registration, insurance, and compliance with safety regulations."
                                                        expanded={expandedItem === 1}
                                                        onPress={() => toggleExpand(1)}
                                                    />
                                                </View>
                                            </View>

                                        </View>

                                        {/* Booking & Ride */}
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15, marginTop: 15 }}>Accepting & Completing Rides</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How do I accept ride requests as a driver ?"
                                                        content="Turn on the driver availability toggle in the app. When a ride request comes in, you'll receive a notification. Accept the request to proceed"
                                                        expanded={expandedItem === 2}
                                                        onPress={() => toggleExpand(2)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="Can I navigate to the passenger's location using the app ?"
                                                        content="Yes, the app includes navigation features that guide you to the passenger's pickup location using app inbuilt navigation system."
                                                        expanded={expandedItem === 3}
                                                        onPress={() => toggleExpand(3)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="What communication methods are available with passengers ?"
                                                        content="Contact passengers via call to confirm pickup details or communicate en route."
                                                        expanded={expandedItem === 4}
                                                        onPress={() => toggleExpand(4)}
                                                    />
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How can I encourage feedback from passengers after completing a trip ?"
                                                        content="Encourage passengers to rate the ride and provide feedback within the app for service improvement and better user experiences."
                                                        expanded={expandedItem === 5}
                                                        onPress={() => toggleExpand(5)}
                                                    />
                                                </View>
                                            </View>
                                        </View>

                                        {/*  Earnings & Payments */}
                                        <View>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', paddingHorizontal: 10, marginHorizontal: 15 }}>Earnings & Payments</Text>
                                            <View style={{
                                                justifyContent: 'center',
                                                padding: 10,
                                                margin: 5,
                                            }}>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="How are earnings calculated and paid to drivers?"
                                                        content="Earnings are calculated based on the distance traveled, time spent on trips, and any additional factors (like surge pricing). Payments are usually processed weekly or according to a set schedule"
                                                        expanded={expandedItem === 7}
                                                        onPress={() => toggleExpand(7)}
                                                    />
                                                </View>


                                                <View style={{ flexDirection: 'row' }}>
                                                    <AccordionItem
                                                        title="Can I track my earnings and ride history in the app ?"
                                                        content="Yes, the app provides a detailed earnings dashboard and a ride history section that allows you to track your earnings and past rides"
                                                        expanded={expandedItem === 8}
                                                        onPress={() => toggleExpand(8)}
                                                    />
                                                </View>
                                            </View>



                                        </View>


                                        {/* Safety & Assistance */}

                                    </View>
                                )
                            }
                        </ScrollView>
                    </View >


                )
            }
        </>
    );
};

export default Support;
