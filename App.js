import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Welcome from './src/components/Welcome';
import Home from './src/components/Home';
import Login from './src/components/Login';
import OTP from './src/components/OTP';
import UserWelcome from './src/components/UserWelcome';
import UserChoice from './src/components/UserChoice';
import EnableLocation from './src/components/EnableLocation';
import Support from './src/components/Support';
import TripFinished from './src/components/TripFinished';
import { navigationRef } from './src/components/NavigationRef';


import SearchingDrivers from './src/components/SearchingDrivers';
import DriverFound from './src/components/DriverFound';
import PassengerFound from './src/components/Driver/PassengerFound';
import AccountSettings from './src/components/AccountSettings';
import DriverRegistration from './src/components/Driver/Registration';
import TravelHistory from './src/components/TravelHistory';
import TripHistory from './src/components/TripHistory';
import DriverHome from './src/components/Driver/Home';
import DriverSettings from './src/components/Driver/Settings';
import DriverProfile from './src/components/Driver/Profile';
import DriverHistory from './src/components/Driver/History';


import DriverWallet from './src/components/Driver/Wallet';
import DriverBank from './src/components/Driver/Bank';
import CustomSidebarMenu from './src/utilities/CustomSidebarMenu';

import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer, useNavigation, DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import usePushNotification from './src/hooks/usePushNotification';

const withContainer = (Component) => (props) => (
  <View style={styles.container}>
    <Component {...props} />
  </View>
);

const withTitle = (WrappedComponent) => {
  const ScreenWithContainer = withContainer(WrappedComponent);

  const ScreenWithTitle = ({ navigation, route, ...props }) => {
    React.useLayoutEffect(() => {
      navigation.setOptions({
        title: route?.params?.title || route?.name || 'Screen',
      });
    }, [navigation, route]);

    return <ScreenWithContainer {...props} />;
  };

  return ScreenWithTitle;
};

const WelcomeScreen = withTitle(Welcome);
const PassengerFoundScreen = withTitle(PassengerFound, '');
const UserWelcomeScreen = withTitle(UserWelcome, '');
const TripFinishedScreen = withTitle(TripFinished, '');
const DriverFoundScreen = withTitle(DriverFound, '');
const UserChoiceScreen = withTitle(UserChoice, '');
const OTPScreen = withContainer(OTP, '');
const LoginScreen = withContainer(Login, '');
const EnableLocationScreen = withContainer(EnableLocation, '');


const DriverProfileScreen = withTitle(DriverProfile);
const DriverHistoryScreen = withContainer(DriverHistory);
const DriverWalletScreen = withContainer(DriverWallet);
const DriverSettingsScreen = withContainer(DriverSettings);
const DriverBankScreen = withContainer(DriverBank);
const SearchingDriverScreen = withContainer(SearchingDrivers, '');

const SupportScreen = () => {
  return (
    <View style={styles.container}>
      <Support />
    </View>
  );
};

const HomeScreen = () => {
  return <Home />;
};

const DriverHomeScreen = () => {
  return <DriverHome />
};

const AccountSettingsScreen = () => {
  return <AccountSettings />;
};
const DriverRegistrationScreen = () => {
  return <DriverRegistration />;
};

const TravelHistoryScreen = () => {
  return <TravelHistory />;
};

const TripHistoryScreen = () => {
  return <TripHistory />;
};



const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerScreenPassenger = () => {
  return (
    <Drawer.Navigator drawerContent={props =>
      <CustomSidebarMenu {...props} />
    }>

      <Drawer.Screen
        name="PassHome"
        component={HomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerShown: true,
          headerTransparent: true,
          title: ""
        }}
      />

    </Drawer.Navigator>
  );
};


const DrawerScreenDriver = () => {
  return (
    <Drawer.Navigator drawerContent={props =>
      <CustomSidebarMenu {...props} />
    }
    >

      <Drawer.Screen
        name="DrivHome"
        component={DriverHomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerShown: true,
          headerTransparent: true,
          title: ""
        }}
      />

    </Drawer.Navigator>
  );
};


const App = () => {

  const {
    requestUserPermission,
    getFCMToken,
    initializeTokenRefreshListener,
    listenToBackgroundNotifications,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();


  useEffect(() => {
    const listenToNotifications = () => {
      try {
        getFCMToken();
        initializeTokenRefreshListener();
        requestUserPermission();
        onNotificationOpenedAppFromQuit();
        listenToBackgroundNotifications();
        listenToForegroundNotifications();
        onNotificationOpenedAppFromBackground();
      } catch (error) {
        console.log(error);
      }
    };

    listenToNotifications();
  }, []);

  useEffect(() => {
    SplashScreen.hide();
  });

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>



        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="UserWelcome"
          component={UserWelcomeScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="UserChoice"
          component={UserChoiceScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="EnableLocation"
          component={EnableLocationScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="SearchDrivers"
          component={SearchingDriverScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PassengerHome"
          component={DrawerScreenPassenger}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DriverHome"
          component={DrawerScreenDriver}
          // component={DriverHomeScreen}
          options={{ headerShown: false, title: 'Home' }}
        />


        <Stack.Screen
          name="DriverProfile"
          component={DriverProfileScreen}
          options={{ headerShown: true, title: 'Edit Profile' }}
        />

        <Stack.Screen
          name="DriverSettings"
          component={DriverSettingsScreen}
          options={{ headerShown: true, title: 'My Account' }}
        />


        <Stack.Screen
          name="DriverWallet"
          component={DriverWalletScreen}
          options={{ headerShown: true, title: 'Wallet' }}
        />

        <Stack.Screen
          name="DriverBank"
          component={DriverBankScreen}
          options={{ headerShown: true, title: 'Bank Details' }}
        />


        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{
            headerTitle: 'FAQ',
            headerStyle: {
              backgroundColor: '#FDCD03',
            },

          }}
        />


        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
          options={{
            headerTitle: 'Account Settings'
          }}
        />

        <Stack.Screen
          name="DriverRegistration"
          component={DriverRegistrationScreen}
          options={{
            headerTitle: 'Online Registration'
          }}
        />



        <Stack.Screen
          name="TravelHistory"
          component={TravelHistoryScreen}
          options={{
            headerTitle: 'Travel History'
          }}
        />

        <Stack.Screen
          name="TripHistory"
          component={TripHistoryScreen}
          options={{
            headerTitle: 'Trip History'
          }}
        />



        <Stack.Screen
          name="DriverHistory"
          component={DriverHistoryScreen}
          options={{ headerShown: true, title: 'History' }}
        />

        <Stack.Screen
          name="DriverFound"
          component={DriverFoundScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="PassengerFound"
          component={PassengerFoundScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="TripFinished"
          component={TripFinishedScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E2E2',
  },
});

export default App;
