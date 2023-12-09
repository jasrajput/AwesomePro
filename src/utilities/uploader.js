import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import pageStyles from "../components/Driver/styles/Registration.styles";


const UploadCardComponent = ({ label, description, filePath, uploadImage, iconType }) => {
    return (
        <View style={pageStyles.displayView}>
            <View style={pageStyles.flexBetween}>
                <View>
                    <Text>{label}</Text>
                    <Text style={{ fontSize: 12 }}>{description}</Text>
                </View>

                <View style={{ backgroundColor: '#FDCD03', borderRadius: 50, height: 40, width: 40 }}>
                    <TouchableOpacity onPress={uploadImage}>
                        <MaterialCommunityIcons name={iconType} color={'#4B545A'} style={{ position: 'relative', top: 10, left: 10 }} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {
                Object.keys(filePath).length > 0 &&
                <Image
                    resizeMode={'contain'}
                    source={{ uri: filePath.uri }}
                    style={pageStyles.imageDimensions}
                />
            }
        </View>
    );
};

export default UploadCardComponent;
