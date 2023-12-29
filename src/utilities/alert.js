import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomAlert = ({ visible, message, onClose }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 900, // Duration for the fade-in animation
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 900, // Duration for the fade-out animation
                    delay: 2000, // Delay before starting the fade-out animation
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onClose(); // Close the alert after the animation
            });
        }
    }, [visible, onClose, fadeAnim]);

    return (
        <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
            <View style={styles.content}>
                <MaterialCommunityIcons name={'circle'} color={'#FDCD03'} size={20} style={styles.icon} />
                <Text style={styles.errorMessage}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: '#fff',
        padding: 15,
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        zIndex: 9999,
        margin: 15,
        shadowColor: '#171717',
        shadowOffset: { width: -1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        borderBottomRightRadius: 25,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10, // Adjust the spacing between the icon and text as needed
    },
    errorMessage: {
        color: '#4B545A',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default CustomAlert;
