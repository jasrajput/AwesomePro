import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const DropDownPicker = ({ label, data, value, onValueChange, disabled }) => {
    console.log('Data:', data);

    if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('Data is empty or invalid.');
        return (
            <View>
                <Text>Data is empty or invalid.</Text>
            </View>
        );
    }

    return (
        <View>
            <Text>{label}</Text>
            <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onValueChange(itemValue)}
                enabled={!disabled}
            >
                {data.map((item) => (
                    <Picker.Item
                        key={item.id || item.value} // Adjust based on your data structure
                        label={item.name || item.label} // Adjust based on your data structure
                        value={item.id || item.value} // Adjust based on your data structure
                    />
                ))}
            </Picker>
        </View>
    );
};

export default DropDownPicker;
