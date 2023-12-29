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

    markerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'blue', // Adjust the color of the outer circle
        opacity: 0.3, // Adjust the opacity of the outer circle
    },
    innerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'blue', // Adjust the color of the inner circle
    },


    bottomIconsContainer: {
        position: 'absolute',
        bottom: 340,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        // zIndex: 2, // Ensure icons are above other content
    },
    iconButton: {
        borderRadius: 30,
        backgroundColor: "#eee",
        marginRight: 10,
    },
    icon: {
        width: 50,
        height: 50,
    },
    secondIconButton: {
        padding: 10,
    },
    secondIcon: {
        width: 30,
        height: 30,
    },
});

export default styles;
