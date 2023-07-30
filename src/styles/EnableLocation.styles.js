import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  smallText: {
    width: 243,
    color: '#848484',
    fontSize: 17,
    marginTop: 10,
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
    position: 'absolute',
    bottom: 80,
  },

  introTextStyle: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  introTitleStyle: {
    fontSize: 25,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 30,
  },

  locationSVG: {
    alignSelf: 'center',
    position: 'relative',
    top: 60,
  },

  textView: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FDCD03',
  },

  fullTextView: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
});

export default styles;
