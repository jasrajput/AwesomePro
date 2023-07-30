import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Welcome from './src/components/Welcome';
import Home from './src/components/Home';
import HomeOld from './src/components/HomeOld';
import HomeDemo from './src/components/HomeDemo';
import Login from './src/components/Login';
import OTP from './src/components/OTP';
import UserWelcome from './src/components/UserWelcome';
import UserChoice from './src/components/UserChoice';
import EnableLocation from './src/components/EnableLocation';
import Support from './src/components/Support';


import Test from './src/components/Test';
import TestTwo from './src/components/TestTwo';

import SearchingDrivers from './src/components/SearchingDrivers';
import DriverFound from './src/components/DriverFound';
import PassengerFound from './src/components/Driver/PassengerFound';
import AccountSettings from './src/components/AccountSettings';
import DriverRegistration from './src/components/Driver/Registration';
import TravelHistory from './src/components/TravelHistory';
import DriverHome from './src/components/Driver/Home';
import DriverSettings from './src/components/Driver/Settings';
import DriverProfile from './src/components/Driver/Profile';
import DriverHistory from './src/components/Driver/History';


import DriverWallet from './src/components/Driver/Wallet';
import DriverBank from './src/components/Driver/Bank';
import CustomSidebarMenu from './src/utilities/CustomSidebarMenu';

import SplashScreen from 'react-native-splash-screen';
import { useNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Test />
    </View>
  );
};


const TestTwoScreen = () => {
  return (
    <View style={styles.container}>
      <TestTwo />
    </View>
  );
};



const WelcomeScreen = () => {
  return (
    <View View style={styles.container}>
      <Welcome />
    </View>
  );
};

const UserWelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <UserWelcome />
    </View>
  );
};

const UserChoiceScreen = () => {
  return (
    <View style={styles.container}>
      <UserChoice />
    </View>
  );
};
const DriverHomeScreen = () => {
  return (
    <View style={styles.container}>
      <DriverHome />
    </View>
  );
};
const DriverFoundScreen = () => {
  return (
    <View style={styles.container}>
      <DriverFound />
    </View>
  );
};

const PassengerFoundScreen = () => {
  return (
    <View style={styles.container}>
      <PassengerFound />
    </View>
  );
};




const DriverSettingsScreen = () => {
  return (
    <View style={styles.container}>
      <DriverSettings />
    </View>
  );
};

const DriverProfileScreen = () => {
  return (
    <View style={styles.container}>
      <DriverProfile />
    </View>
  );
};

const DriverHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <DriverHistory />
    </View>
  );
};

const DriverWalletScreen = () => {
  return (
    <View style={styles.container}>
      <DriverWallet />
    </View>
  );
};



const DriverBankScreen = () => {
  return (
    <View style={styles.container}>
      <DriverBank />
    </View>
  );
};




const SupportScreen = () => {
  return (
    <View style={styles.container}>
      <Support />
    </View>
  );
};


const HomeScreen = () => {
  return <Home />;
  // return <HomeOld />;
};
const SearchingDriverScreen = () => {
  return <SearchingDrivers />;
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
// 

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Login />
    </View>
  );
};

const OTPScreen = () => {
  return (
    <View style={styles.container}>
      <OTP />
    </View>
  );
};

const EnableLocationScreen = () => {
  return (
    <View style={styles.container}>
      <EnableLocation />
    </View>
  );
};

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerScreenPassenger = () => {
  return (
    <Drawer.Navigator drawerContent={props =>
      <CustomSidebarMenu {...props} />
    }>

      <Drawer.Screen
        name="UserHome"
        component={HomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerShown: true,
          headerTransparent: true,
          title: ""
        }}
      />

      <Drawer.Screen
        name="DriverFound"
        component={DriverFoundScreen}
        options={{ headerShown: false, title: '' }}
      />

      <Drawer.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ headerShown: true, title: 'HOME' }}
      />
    </Drawer.Navigator>
  );
};


const DrawerScreenDriver = () => {
  return (
    <Drawer.Navigator drawerContent={props =>
      <CustomSidebarMenu {...props} />
    }>
      <Drawer.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ headerShown: true, title: 'HOME' }}
      />
      <Drawer.Screen
        name="UserHome"
        component={HomeScreen}
        options={{
          headerTitleAlign: 'center',
          headerShown: true,
          headerTransparent: true,
          title: "HOME"
        }}
      />

      <Drawer.Screen
        name="DriverFound"
        component={DriverFoundScreen}
        options={{ headerShown: false, title: '' }}
      />
    </Drawer.Navigator>
  );
};


const RootPassenger = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={DrawerScreenPassenger}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const RootDriver = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Home"
        component={DrawerScreenDriver}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName="Welcome"
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


        {/* <Stack.Screen
          name="Test"
          component={TestScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="TestTwo"
          component={TestTwoScreen}
          options={{ headerShown: false }}
        /> */}


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
          name="Root"
          component={RootPassenger}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RootDriver"
          component={RootDriver}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="DriverSettings"
          component={DriverSettingsScreen}
          options={{ headerShown: true, title: "My Account" }}
        />
        <Stack.Screen
          name="DriverProfile"
          component={DriverProfileScreen}
          options={{ headerShown: true, title: 'Edit Profile' }}
        />
        <Stack.Screen
          name="DriverHistory"
          component={DriverHistoryScreen}
          options={{ headerShown: true, title: 'History' }}
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
            headerTitle: 'Support',
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
          name="SearchDrivers"
          component={SearchingDriverScreen}
          options={{ headerShown: false }}
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
