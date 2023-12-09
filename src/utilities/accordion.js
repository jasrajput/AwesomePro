import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ title, content }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity activeOpacity={0.8} onPress={toggleExpand}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>{title}</Text>
                </View>
            </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 5,
        width: '100%',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        backgroundColor: '#fff',
        padding: 10,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
    },
});

export default AccordionItem;