import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },

  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  titleStyle: {
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  introTextStyle: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  introTitleStyle: {
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 30,
  },
});

export default styles;
