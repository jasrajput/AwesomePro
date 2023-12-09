import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    enabled: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
        height: 50,
        width: '100%',
        position: 'relative',
        bottom: 0,
    },

    displayView: {
        backgroundColor: '#fff', marginTop: 5, shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        padding: 14,
        margin: 20,
        borderColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
    },

    imageDimensions: {
        width: '100%', height: 250
    },

    flexBetween: {
        flexDirection: 'row', justifyContent: 'space-between'
    },


    input: {
        backgroundColor: '#eee',
        padding: 10,
        marginTop: 5,
        borderRadius: 14,
        color: '#000'
    },

    textLabel: {
        color: '#3E4958',
        fontWeight: 'bold'
    },

    marginHV: {
        marginHorizontal: 20,
        marginVertical: 10
    },

    text: {
        fontWeight: 'bold'
    }
});

export default styles;
