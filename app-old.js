import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Welcome from './src/components/Welcome';
import Home from './src/components/Home';
import HomeDemo from './src/components/HomeDemo';
import Login from './src/components/Login';
import OTP from './src/components/OTP';
import EnableLocation from './src/components/EnableLocation';
import Support from './src/components/Support';
import SearchingDrivers from './src/components/SearchingDrivers';
import AccountSettings from './src/components/AccountSettings';
import TravelHistory from './src/components/TravelHistory';
import DriverHome from './src/components/Driver/Home';
import DriverSettings from './src/components/Driver/Settings';
import DriverProfile from './src/components/Driver/Profile';
import DriverHistory from './src/components/Driver/History';


import DriverWallet from './src/components/Driver/Wallet';
import DriverBank from './src/components/Driver/Bank';
import CustomSidebarMenu from './src/utilities/CustomSidebarMenu';

import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

const WelcomeScreen = () => {
    return (
        <View style={styles.container}>
            <Welcome />
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
};
const SearchingDriverScreen = () => {
    return <SearchingDrivers />;
};
const AccountSettingsScreen = () => {
    return <AccountSettings />;
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

const DrawerScreen = (props) => {
    console.log(props.route.name)
    const defaultMode = 'Passenger';
    // const defaultMode = props.route.name == 'Home' ? 'Passenger' : 'Driver';
    return (
        <Drawer.Navigator drawerContent={props =>
            <CustomSidebarMenu {...props} />
        }>
            {/* {
        defaultMode == 'Passenger' ? (
          <Drawer.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              headerTitleAlign: 'center',
              headerShown: true,
              headerTransparent: true,
              title: "Home"
            }}
          />
        ) : (
          <Drawer.Screen
            name="DriverHome"
            component={DriverHomeScreen}
            options={{ headerShown: true, title: 'Home' }}
          />
        )
      } */}

            <Drawer.Screen
                name="UserHome"
                component={HomeScreen}
                options={{
                    headerTitleAlign: 'center',
                    headerShown: true,
                    headerTransparent: true,
                    title: "Passenger Home"
                }}
            />

            <Drawer.Screen
                name="DriverHome"
                component={DriverHomeScreen}
                options={{ headerShown: true, title: 'Driver Home' }}
            />

            <Drawer.Screen
                name="DriverSettings"
                component={DriverSettingsScreen}
                options={{ headerShown: true, title: 'My Account' }}
            />



        </Drawer.Navigator>
    );
};


const Root = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen
                name="Home"
                component={DrawerScreen}
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
            <Stack.Navigator screenOptions={{
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
                <Stack.Screen
                    name="Root"
                    component={Root}
                    options={{ headerShown: false }}
                />

                {/* <Stack.Screen
          name="DriverSettings"
          component={DriverSettingsScreen}
          options={{ headerShown: true, title: "My Account" }}
        /> */}
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
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                {/* <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />

      

      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ headerShown: false }}
      />


      <Stack.Screen
        name="EnableLocation"
        component={EnableLocationScreen}
        options={{ headerShown: false }}
      /> */}


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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2E2E2',
    },
});

export default App;
