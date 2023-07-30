import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  otpView: {
    flex: 1,
    padding: 15,
  },
  textStyle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
  },

  smallText: {
    width: 280,
    color: '#848484',
    fontSize: 15,
    marginTop: 10,
  },

  inputStyle: {
    height: 65,
    borderWidth: 0.5,
    borderColor: '#000000',
    borderRadius: 20,
    padding: 20,
  },

  textResendStyle: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
    marginTop: 8
  },
});

export default styles;
