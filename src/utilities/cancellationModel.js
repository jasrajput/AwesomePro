import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CancellationOptionsModal = ({ visible, onCancel, options, closeModal }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const isConfirmDisabled = selectedOption === null;

    const renderOptions = () => {
        const columns = 2;
        const totalOptions = options.length;
        const rows = Math.ceil(totalOptions / columns);

        const rowsArray = [];
        for (let i = 0; i < rows; i++) {
            const rowOptions = options.slice(i * columns, (i + 1) * columns);
            rowsArray.push(
                <View key={i} style={styles.optionsRow}>
                    {rowOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.optionButton,
                                selectedOption === option ? styles.selectedOption : null,
                            ]}
                            onPress={() => handleOptionSelect(option)}
                        >
                            <View style={styles.optionContainer}>
                                <Text>{option}</Text>
                                {selectedOption === option && (
                                    <MaterialCommunityIcons
                                        name="radiobox-marked"
                                        size={18}
                                        color="#000"
                                        style={styles.icon}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
        return rowsArray;
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={closeModal}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.reasonText}>Reason for cancellation</Text>
                    {renderOptions()}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={closeModal}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmButton, isConfirmDisabled && styles.disabledButton]}
                            onPress={() => {
                                if (!isConfirmDisabled) {
                                    onCancel(selectedOption);
                                    setSelectedOption(null);
                                    closeModal();
                                }
                            }}
                            disabled={isConfirmDisabled}
                        >
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};



const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        width: windowWidth,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    optionButton: {
        paddingVertical: 15,
        paddingHorizontal: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        width: windowWidth / 2 - 30, // Divide by number of columns and account for margins
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedOption: {
        backgroundColor: '#FDCD03',
    },
    cancelButton: {
        marginRight: 10,
        marginTop: 5,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        height: 50,
        width: '50%',
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        shadowColor: '#171717',
        shadowOffset: { width: -1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        shadowColor: '#000',
    },
    cancelText: {
        color: 'red',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
        textTransform: 'uppercase'
    },
    confirmButton: {
        marginTop: 5,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        height: 50,
        width: '50%',
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
        shadowColor: '#171717',
        shadowOffset: { width: -1, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        shadowColor: '#000',
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
        textTransform: 'uppercase'
    },

    reasonText: {
        fontSize: 17,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20
    },

    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    icon: {
        marginLeft: 5, // Adjust spacing between text and icon
    },

    disabledButton: {
        backgroundColor: '#ccc',
        borderColor: '#ccc',
        backgroundColor: '#ccc',
    },


});

export default CancellationOptionsModal;
