import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  bgWhite: {
    backgroundColor: '#fff',
  },

  bgDark: {
    borderColor: '#000000',
  },

  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#000000',
    backgroundColor: '#000000',
    height: 50,
    width: '100%',
  },
  fixedBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#000000',
    backgroundColor: '#000000',
    height: 50,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    margin: 10,
  },

  btnTextColor: {
    color: '#fff',
    fontWeight: 'bold',
  },

  themeBackgroundColor: {
    backgroundColor: '#FDCD03',
  },

  themeColor: {
    color: '#FDCD03',
  },

  flexRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bold: {
    fontWeight: 'bold',
  },

  m20: {
    margin: 20,
  },

  p15: {
    padding: 15,
  },

  m10: {
    margin: 10,
  },

  input: {
    height: 40,
    margin: 12,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    color: '#000',
  },


  loading: {
    width: '100%',
    position: "absolute",
    zIndex: 1,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    content: "Loading",
  }
});

export default styles;
