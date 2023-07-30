import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
    },

    map: {
        flex: 1,
        height: "90%",
    },

    sheetContainer: {
        flex: 0.5,
        backgroundColor: '#fff'
    },

    contentContainer: {
        flex: 1,
        alignItems: "center",
    },

    inputStyle: {
        marginLeft: 20,
        height: 40,
        marginTop: 10,
        fontSize: 16,
        color: "#000",
    },

    inputContainer: {
        flex: 1,
        width: "100%",
        height: 100,
        position: 'relative',
    },

    outerContainer: {
        borderWidth: 0.5,
        borderRadius: 20,
        borderColor: "#fff",
        elevation: 2,
        backgroundColor: "#fff",
        margin: 15,
        padding: 5,
    },

    listContainer: {
        borderWidth: 1,
        borderRadius: 10,
        elevation: 2,
        backgroundColor: "#fff",
        margin: 15,
        padding: 10,
        height: 80,
        borderColor: "#fff",
    },

    logout: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#000000",
        backgroundColor: "#000000",
        height: 50,
        width: "90%",
    },

    acceptBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
        height: 50,
        width: '75%',
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

    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },


});

export default styles;
