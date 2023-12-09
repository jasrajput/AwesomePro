import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const BottomSheetAlert = ({ visible, toggleModal, cancel, children }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={toggleModal}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={toggleModal}
                style={styles.modalContainer}
            >
                <View style={styles.modalContent}>
                    {children}
                    {/* Button to close the modal */}
                    {/* <TouchableOpacity onPress={toggleModal}>
                        <Text>Close</Text>
                    </TouchableOpacity> */}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <TouchableOpacity style={[styles.btn, styles.disabled]} onPress={toggleModal}>
                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 18 }}>No</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.enabled]} onPress={cancel}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Yes</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 5
    },

    btn: {
        marginTop: 40,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        height: 60,
        width: '40%'
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
