import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, title, message, onClose }) => {
    useEffect(() => {
        let timeoutId;

        if (visible) {
            timeoutId = setTimeout(() => {
                onClose();
            }, 3000); // Adjust the duration (in milliseconds) as needed
        }

        return () => clearTimeout(timeoutId);
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

const AlertExample = () => {
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const openAlert = () => {
        setIsAlertVisible(true);
    };

    const closeAlert = () => {
        setIsAlertVisible(false);
    };

    useEffect(() => {
        // Simulating opening the alert after some time (e.g., 3 seconds)
        const timeout = setTimeout(() => {
            openAlert();
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={styles.container}>
            {/* No button to open alert */}

            <CustomAlert
                visible={isAlertVisible}
                title="Alert Title"
                message="This is an alert message"
                onClose={closeAlert}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default AlertExample;
