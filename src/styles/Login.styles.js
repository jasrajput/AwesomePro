import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  phoneContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderRadius: 20,
  },

  textStyle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    backgroundColor: '#F9F9F9',
    marginTop: 30,
  },

  smallText: {
    width: 280,
    color: '#848484',
    fontSize: 15,
    marginTop: 10,
  },

  flag: {
    marginTop: 15,
    marginLeft: 10,
    height: 25,
    width: 25,
    resizeMode: 'stretch',
    alignItems: 'center',
  },

  inputStyle: {
    height: 58,
    flex: 1,
    color: '#000',
  },

  label: {
    color: '#848484',
    fontSize: 12,
    position: 'relative',
    left: 20,
    top: 8,
    zIndex: 1,
  },

  labelWithin: {
    backgroundColor: '#fff',
    zIndex: 1,
  },
});

export default styles;
