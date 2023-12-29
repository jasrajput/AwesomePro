import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Modal from "react-native-modal";
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;


const BottomSheetAlert = ({ visible, toggleModal, children }) => {
    return (
        <Modal
            animationIn={'slideInUp'}
            isVisible={visible}
            onPress={toggleModal}
            coverScreen={true}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
            onBackdropPress={toggleModal}
            swipeDirection="down"
            onSwipeComplete={toggleModal}
            onBackButtonPress={toggleModal}
            propagateSwipe={true}
            style={styles.modal}>
            <View style={styles.modalContent}>
                {children}

                <TouchableOpacity style={styles.enabled} onPress={toggleModal}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>Understood</Text>
                </TouchableOpacity>

            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end', // Positions the modal at the bottom
        // justifyContent: 'flex-start', // Positions the modal at the top
        margin: 0,
    },

    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    enabled: {
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
        shadowColor: '#171717',
        shadowOffset: { width: -1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        shadowColor: '#000',
        padding: 10,
        marginTop: 15
    },

    disabled: {
        borderColor: '#fff',
        backgroundColor: '#fff',
        shadowColor: '#171717',
        shadowOffset: { width: -1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        shadowColor: '#000',
    }


});

export default BottomSheetAlert;
