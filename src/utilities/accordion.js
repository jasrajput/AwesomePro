import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ title, content, expanded, onPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{title}</Text>
                    <MaterialCommunityIcons
                        name={expanded ? 'chevron-right' : 'chevron-down'}
                        size={20}
                        color="#000"
                    />

                </View>
            </TouchableOpacity>
            <View style={styles.emptyLine}></View>
            {expanded && (
                <View style={styles.content}>
                    <Text>{content}</Text>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: '#fff',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    emptyLine: {
        marginTop: 5,
        marginBottom: 5,
        marginHorizontal: 10,
        borderWidth: 0.8,
        borderColor: "#D5DDE0",
    },
    headerText: {
        fontSize: 16,
        color: "#4B545A",
        fontWeight: 500
    },
    content: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
});

export default AccordionItem;
