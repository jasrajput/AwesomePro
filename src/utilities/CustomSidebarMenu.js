import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  Text,
  Linking,
  Switch,
  ActivityIndicator,
  BackHandler,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import USER_IMAGE from '../../assets/images/svg/user.svg';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import API from '../components/API';
import { notifyMessage } from '../components/helpers';

const CustomSidebarMenu = (props) => {
  // const notificationCount = 5; // Example number to display

  const [isLoading, setIsLoading] = useState(false);
  // const [isEnabled, setIsEnabled] = useState(false);
  const [isDefault, setDefault] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);


  useEffect(() => {
    const countRideData = async () => {
      try {
        const rideData = await AsyncStorage.getItem('ride_data');
        const parsedRideData = JSON.parse(rideData);
        if (Array.isArray(parsedRideData)) {
          setNotificationCount(parsedRideData.length);
        } else {
          setNotificationCount(0);
        }
      } catch (error) {
        console.error('Error counting ride_data:', error);
      }
    };

    countRideData();
  }, []);

  useEffect(() => {
    API.getUserDetails().then(res => {
      setName(res.firstname + ' ' + res.lastname);
      setEmail(res.email);
      setImage(res.profile_image);
    }).catch(er => {
      console.log(er.message)
    })

    return () => console.log("Cleanup..");

  }, [])


  // useFocusEffect(
  //   React.useCallback(() => {
  //     const onBackPress = () => {
  //       Alert.alert("Hold on!", "Are you sure you want to Exit?", [
  //         {
  //           text: "Cancel",
  //           onPress: () => null,
  //           style: "cancel"
  //         },
  //         { text: "YES", onPress: () => BackHandler.exitApp() }
  //       ]);
  //       return true;
  //     };

  //     BackHandler.addEventListener("hardwareBackPress", onBackPress);

  //     return () =>
  //       BackHandler.removeEventListener("hardwareBackPress", onBackPress);

  //   }, []));

  const toggleSwitch = async () => {

    setIsLoading(true);

    const mode = await AsyncStorage.getItem('mode')

    if (mode == 'Driver' && mode != null) {
      await AsyncStorage.setItem('mode', 'Passenger');
      setDefault('Passenger');
      setIsLoading(false);
      props.navigation.closeDrawer();

      navigation.reset({
        index: 0,
        routes: [{ name: 'PassengerHome' }],
      });

    } else {
      await AsyncStorage.setItem('mode', 'Driver');
      setDefault('Driver');
      setIsLoading(false);
      props.navigation.closeDrawer();

      navigation.reset({
        index: 0,
        routes: [{ name: 'DriverHome' }],
      });
    }
  };

  const navigation = useNavigation();
  const BASE_PATH =
    'https://raw.githubusercontent.com/AboutReact/sampleresource/master/';
  const proileImage = 'react_logo.png';


  const logout = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem('token')
    if (token) {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('mode');
        navigation.navigate('Login');
      } catch (er) {
        notifyMessage(er.message)
      }
    }
  }

  useEffect(() => {
    (async () => {
      const mode = await AsyncStorage.getItem('mode');
      console.log(mode)

      if (mode != null) {
        setDefault(mode);
      } else {
        setDefault("Passenger");
      }
    })();

  }, [])


  return (
    <SafeAreaView style={{ flex: 1 }}>
      {
        isLoading ? <ActivityIndicator style={styles.loading} size="large" color="#000" /> : ''
      }

      {
        isDefault == 'Passenger' ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                paddingTop: 70,
                paddingBottom: 10,
                backgroundColor: '#FDCD03',
                paddingLeft: 6,
              }}>

              <TouchableOpacity onPress={() => navigation.navigate('AccountSettings')}>
                {
                  image == null || image == "" ? (
                    <USER_IMAGE style={styles.sideMenuProfileIcon} />
                  ) : (
                    <Image source={{ uri: image }} style={styles.sideMenuProfileIcon} />
                  )
                }

                <View style={{ paddingHorizontal: 10, marginTop: 10 }} >
                  <Text style={{ color: '#fff' }}>{name}</Text>
                  <Text style={{ color: '#fff' }}>{email}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <DrawerContentScrollView {...props}>
              {/* <DrawerItemList {...props} /> */}
              <DrawerItem
                activeTintColor={'#000'}
                inactiveTintColor={'#000'}
                label="HOME"
                onPress={() => navigation.navigate("PassHome")}
              />
              <DrawerItem
                activeTintColor={'#000'}
                inactiveTintColor={'#000'}
                label="MY ACCOUNT"
                onPress={() => navigation.navigate("AccountSettings")}
              />

              <DrawerItem
                activeTintColor={'#000'}
                inactiveTintColor={'#000'}
                label="TRAVEL HISTORY"
                onPress={() => navigation.navigate("TravelHistory")}
              />

              <DrawerItem
                activeTintColor={'#000'}
                inactiveTintColor={'#000'}
                label="FAQ"
                onPress={() => navigation.navigate("Support", { mode: 1 })}
              />

              <DrawerItem
                activeTintColor={'#000'}
                inactiveTintColor={'#000'}
                label="LOG OUT"
                onPress={logout}
              />




              {/* <View style={{ justifyContent: 'space-around' }}> */}
              {/* <DrawerItem
                  activeTintColor={'#000'}
                  inactiveTintColor={'#000'}
                  onPress={toggleSwitch}
                  label="SWITCH TO DRIVER"
                /> */}
              {/* 
                <Switch
                  style={{ position: 'relative', bottom: 38 }}
                  trackColor={{ false: '#767577', true: '#F4F4F4' }}
                  thumbColor={isEnabled ? '#FDCD03' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                /> */}


              {/* </View> */}

            </DrawerContentScrollView>

          </View>
        ) : <View style={{ flex: 1 }}>
          <View
            style={{
              paddingTop: 70,
              paddingBottom: 10,
              backgroundColor: '#FDCD03',
              paddingLeft: 6,
            }}>

            <TouchableOpacity onPress={() => navigation.navigate('DriverSettings')}>
              {/* <USER_IMAGE style={styles.sideMenuProfileIcon} /> */}
              {
                image == null || image == "" ? (
                  <USER_IMAGE style={styles.sideMenuProfileIcon} />
                ) : (
                  <Image source={{ uri: image }} style={styles.sideMenuProfileIcon} />
                )
              }
              <View style={{ paddingHorizontal: 10, marginTop: 10 }} >
                <Text style={{ color: '#fff' }}>{name}</Text>
                <Text style={{ color: '#fff' }}>{email}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <DrawerContentScrollView {...props}>

            {/* <DrawerItemList {...props} /> */}
            <DrawerItem
              activeTintColor={'#000'}
              inactiveTintColor={'#000'}
              label={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text>HOME</Text>
                  {notificationCount > 0 && (
                    <View style={{ backgroundColor: 'red', borderRadius: 10, paddingHorizontal: 5, marginLeft: 5 }}>
                      <Text style={{ color: 'white', fontSize: 12 }}>{notificationCount}</Text>
                    </View>
                  )}
                </View>
              )}
              onPress={() => navigation.navigate("DrivHome")}
            />

            <DrawerItem
              activeTintColor={'#000'}
              inactiveTintColor={'#000'}
              label="MY ACCOUNT"
              onPress={() => navigation.navigate("DriverSettings")}
            />


            <DrawerItem
              activeTintColor={'#000'}
              inactiveTintColor={'#000'}
              label="RIDE HISTORY"
              onPress={() => navigation.navigate('DriverHistory')}
            />

            <DrawerItem
              activeTintColor={'#000'}
              inactiveTintColor={'#000'}
              label="FAQ"
              onPress={() => navigation.navigate("Support", { mode: 2 })}
            />


            <DrawerItem
              activeTintColor={'#000'}
              inactiveTintColor={'#000'}
              label="ONLINE REGISTRATION"
              onPress={() => navigation.navigate("DriverRegistration")}
            />

            <DrawerItem
              activeTintColor={'#000'}
              inactiveTintColor={'#000'}
              label="LOG OUT"
              onPress={logout}
            />




            {/* <View style={{ justifyContent: 'space-around' }}> */}
            {/* <DrawerItem
                activeTintColor={'#000'}
                inactiveTintColor={'#000'}
                label="SWITCH TO PASSENGER"
                onPress={toggleSwitch}
              /> */}

            {/* <Switch
                style={{ position: 'relative', bottom: 38 }}
                trackColor={{ false: '#767577', true: '#F4F4F4' }}
                thumbColor={isEnabled ? '#FDCD03' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              /> */}
            {/* </View> */}

          </DrawerContentScrollView>

        </View>
      }

      <TouchableOpacity style={{
        marginLeft: 5,
        marginVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#FDCD03',
        backgroundColor: '#FDCD03',
        height: 50,
        width: '90%',
      }} onPress={toggleSwitch}>
        <Text
          style={{
            fontWeight: 'bold'
          }}>
          SWITCH TO {isDefault == 'Passenger' ? "DRIVER" : "PASSENGER"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
  },
  iconStyle: {
    width: 15,
    height: 15,
    marginHorizontal: 5,
  },
  customItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: "#F5FCFF88",

  }
});

export default CustomSidebarMenu;
