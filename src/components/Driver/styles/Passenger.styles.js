import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    enabled: {
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
    },

    disabled: {
        borderColor: 'lightgray',
        backgroundColor: 'lightgray',
    },

    btn: {
        marginTop: 10,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        height: 50,
        width: '80%'
    },

    rejectBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#fff',
        backgroundColor: '#fff',
        height: 50,
        width: '20%',
        backgroundColor: '#fff', shadowColor: '#171717',
        shadowOffset: { width: -1, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        shadowColor: '#000',
        marginHorizontal: 10
    },
});

export default styles;
