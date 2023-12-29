import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from "react";
import {
  Pressable,
  Alert,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  TextInput
} from "react-native";

import API from "./API";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "../styles/Home.styles";
import CustomAlert from '../utilities/alert';
import Lottie from 'lottie-react-native';
import globalStyles from "../styles/Global.styles";
import Modal from "react-native-modal";
import WebView from 'react-native-webview';

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const API_KEY = 'AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU';
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 30.6800,
  longitude: 76.7221,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1

  // latitudeDelta: LATITUDE_DELTA,
  // longitudeDelta: LONGITUDE_DELTA,
};

import { notifyMessage, convertMinsToTime, calculateFare, getCurrentLocation, locationPermission, getFCM } from './helpers';


import BottomSheet, {
  BottomSheetModalProvider, BottomSheetScrollView, BottomSheetBackdrop
} from "@gorhom/bottom-sheet";
// import { TextInput } from "react-native-gesture-handler";
import CROSS_ICON from "../../assets/images/svg/cross.svg";
// import { apiKey } from './config';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from "react-native-geolocation-service";

navigator.geolocation = require('react-native-geolocation-service');

import Card from "./Card";
import MapViewDirections from "react-native-maps-directions";

// const BottomSheetShow = ({ bottomSheetModalRef, snapPoints, placeRef, onPlaceSelected, bottomRef, clearText }) => {
const LocationModal = ({ visible, placeRef, onPlaceSelected, method, clearText, toggleModal }) => {
  // const isCurrentLocation = bottomRef == 'B' ? true : false;
  // const label = bottomRef == 'B' ? 'Current location' : '';
  return (
    // <BottomSheet name={bottomRef}
    //   ref={bottomSheetModalRef}
    //   snapPoints={snapPoints}
    //   detached={true}
    //   index={-1}
    // >
    // </BottomSheet>

    <Modal
      animationIn={'slideInUp'}
      isVisible={visible}
      onPress={toggleModal}
      coverScreen={true}
      onBackdropPress={toggleModal}
      swipeDirection="down"
      onSwipeComplete={toggleModal}
      onBackButtonPress={toggleModal}
      propagateSwipe={true}
      style={styles.modal}>
      <View style={{ flex: 1, marginTop: 15 }}>
        <TouchableOpacity onPress={toggleModal} style={{ margin: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons style={{ marginTop: 15, fontSize: 18, position: 'relative', right: 10, bottom: 7 }} name={'arrow-left'} color={'#4B545A'} size={25} />
            <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Select {method}</Text>
          </View>
        </TouchableOpacity>

        <GooglePlacesAutocomplete
          renderLeftButton={() =>
            <TouchableOpacity>
              <MaterialCommunityIcons style={{ marginTop: 15, fontSize: 18, position: 'relative', left: 10 }} name={'arrow-left'} color={'#4B545A'} size={20} />
            </TouchableOpacity>}

          renderRightButton={() =>
            placeRef.current?.getAddressText() !== '' ? (
              <TouchableOpacity onPress={clearText}>
                <MaterialCommunityIcons style={{ marginTop: 15, fontSize: 18, position: 'relative', right: 5, top: 1 }} name={'close-thick'} color={'#4B545A'} size={20} />
              </TouchableOpacity>
            ) : null}
          nearbyPlacesAPI='GooglePlacesSearch'
          ref={placeRef}
          debounce={200}
          listViewDisplayed={true}
          enablePoweredByContainer={false}
          placeholder={`Enter your ${method} location`}
          keyboardShouldPersistTaps='always'
          query={{
            key: API_KEY,
            components: 'country:in',
            language: 'en',
            types: 'address',
          }}
          returnKeyType={'search'}
          textInputProps={{
            fontSize: 16,
            color: '#000',
            placeholderTextColor: '#000',
            errorStyle: { color: 'red' },
          }}
          fetchDetails={true}
          onPress={(data, details = null) => {
            onPlaceSelected(details, method);
          }}
          // predefinedPlaces={[
          //   { description: 'Eiffel Tower, Paris', placeId: 'ChIJIbXu8VUO5kcRsAj8D9-kgbU' },
          //   { description: 'Central Park, New York', placeId: 'ChIJa147K9txwokRLmYc5K0YPC8' },
          // ]}
          onFail={error => notifyMessage(error)}
          onNotFound={() => notifyMessage('no results')}
          renderRow={(rowData) => {
            if (rowData.isPredefinedPlace) {
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Display icon or indicator for predefined places */}
                  <Text>📍</Text>
                  <View style={{ marginHorizontal: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{rowData.description}</Text>
                    {/* Display any additional information if needed */}
                  </View>
                </View>
              );
            } else {
              const { main_text, secondary_text } = rowData.structured_formatting;

              return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="clock" style={{ backgroundColor: '#A9A9A9', padding: 5, borderRadius: 50 }} color={'#fff'} size={18} />
                  <View style={{ marginHorizontal: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{main_text}</Text>
                    <Text style={{ fontSize: 14 }}>{secondary_text}</Text>
                  </View>
                </View>

              );
            }
          }}

          keepResultsAfterBlur={true}
          listEmptyComponent={() => (
            <View style={{ flex: 1 }}>
              <Text style={{ marginHorizontal: 25 }}>No results were found</Text>
            </View>
          )}
        />
      </View>


    </Modal>

  )
}

const Home = () => {
  const navigation = useNavigation();
  const placeRef = useRef();
  const destinationRef = useRef();
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [originModalVisible, setOriginModalVisible] = useState(false);
  const [destinationModalVisible, setDestinationModalVisible] = useState(false);


  const [errorMessage, setErrorMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [isBottomSheetOpen3, setIsBottomSheetOpen3] = useState(false);
  const [isBottomSheetOpen4, setIsBottomSheetOpen4] = useState(false);


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



  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.getUserDetails();
        if (res.message == 'Unauthenticated.') {
          return navigation.navigate("Login");
        }
        if (res) {
          setUserId(res.id);
        } else {
          return navigation.navigate('Login');
        }

        const token = await getFCM();
        if (token != res.fcm_token) {
          API.updateFCMToken({ 'fcm_token': token }).then(res => {
            // console.log(res);
          }).catch(err => {
            console.log("Issue updating token");
          })
        }

      } catch (error) {
        // console.error('Error fetching user details:', error.message);
        setIsAlertVisible(true);
        return setErrorMessage('Network abnormality');
        // return notifyMessage('')
      }
    };

    fetchData();
  }, [])




  const getCarsByCategory = async (category_id) => {
    try {
      const cars = await API.getCarByCategory(category_id);
      return cars;
    } catch (er) {
      // console.error(er.message);
      setIsAlertVisible(true);
      return setErrorMessage('Network abnormality');
      // return notifyMessage("Network Error");
    }
  };

  const mapRef = useRef(null);
  const bottomSheetModalARef = useRef(null);
  const bottomSheetModalBRef = useRef(null);
  const bottomSheetModalCRef = useRef(null);
  const bottomSheetModalDRef = useRef(null);
  const bottomSheetModalERef = useRef(null);


  useEffect(() => {
    const backAction = () => {
      if (isBottomSheetOpen4) {
        closeBottomSheet4();
        return true; // Prevent default behavior (closing the bottom sheet)
      } else if (isBottomSheetOpen3) {
        closeBottomSheet3();
        return true; // Prevent default behavior (closing the bottom sheet)
      }
      return false; // Allow default behavior (closing the app)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Clean up event listener on unmount

  }, [isBottomSheetOpen4, isBottomSheetOpen3]);


  const closeBottomSheet3 = () => {
    setIsBottomSheetOpen3(false)
    setTimeout(() => {
      bottomSheetModalDRef.current?.close();
    }, 100);
  };

  const closeBottomSheet4 = () => {
    setIsBottomSheetOpen4(false)
    bottomSheetModalERef.current.close();
  };

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setPageLoading(false);
    }, 3000); // Simulating a 3-second loading time, adjust as needed

    return () => clearTimeout(loadingTimer); // Clear timeout if component unmounts
  }, []);


  const toggleOriginModal = () => {
    setOriginModalVisible(!originModalVisible);
    if (destinationModalVisible) {
      setDestinationModalVisible(false);
    }

    setTimeout(() => {
      placeRef.current?.focus();
    }, 1000);
  };

  const toggleDestinationModal = () => {
    setDestinationModalVisible(!destinationModalVisible);
    if (originModalVisible) {
      setOriginModalVisible(false);
    }
    setTimeout(() => {
      destinationRef.current?.focus();
    }, 1000);
  };


  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      let positionS = {
        ...position,
        latitudeDelta: 0.0121,
        longitudeDelta: 0.3201
      }
      camera.center = positionS;
      mapRef.current?.animateCamera(camera, { duration: 3000 })
    }
  }

  const [isLoading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [originVal, setOriginVal] = useState('');
  const [destinationVal, setDestinationVal] = useState('');
  const [destination, setDestination] = useState('');

  const [originShort, setOriginShort] = useState('');
  const [destinationShort, setDestinationShort] = useState('');

  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fare, setFare] = useState(0);

  const [carsData, setCarsData] = useState([]);
  const [selectedId, setSelectedID] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const snapPoints = useMemo(() => ["1%", "40%", '70%', "90%"], []);
  const maxSnapPoints = useMemo(() => ["1%", "38%"], []);
  const maxSnapPointsCar = useMemo(() => ["1%", "40%"], []);

  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };


  const handleSelection = (id) => {
    // console.log("Selected Car: " + id)
    var selectedIdInner = selectedId;
    if (selectedIdInner == id) {
      setSelectedID(null);
    } else {
      setSelectedID(id);
    }

    // console.log("Selected Car State: " + selectedId)
  };

  const clearText = () => {
    placeRef.current?.setAddressText('');
    setOriginVal('');
    setOriginShort('');
  }

  const clearDestinationText = () => {
    destinationRef.current?.setAddressText('');
    setDestinationVal('');
    setDestinationShort('');
  }

  const traceRouteOnReady = (args) => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration)
    }
  }

  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }
  }


  const onPlaceSelected = (details, flag) => {

    navigation.setOptions({ headerShown: true })

    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0
    };

    const shortAddress = details?.address_components[0].short_name;
    if (flag == 'pickup') {
      setOrigin(position);
      setOriginVal(placeRef.current.getAddressText());
      setOriginShort(shortAddress);

      toggleOriginModal();
    } else if (flag == 'live') {
      const address = details.formatted_address;
      placeRef.current?.setAddressText(details.formatted_address);

      setOriginVal(address);
      setOrigin(position);
      setOriginShort(shortAddress);
    } else if (flag == 'liveDestination') {
      const address = details.formatted_address;
      destinationRef.current?.setAddressText(details.formatted_address);

      setDestinationVal(address);
      setDestination(position);
      setDestinationShort(shortAddress);
    } else {
      setDestination(position)
      setDestinationVal(destinationRef.current.getAddressText());
      setDestinationShort(shortAddress);
      toggleDestinationModal();

    }

    navigation.setOptions({ headerShown: true })

    moveTo(position);

  }

  const goToLocation = async () => {
    getLiveLocation();
  }

  useEffect(() => {
    if (isBottomSheetOpen3) {
      setTimeout(() => {
        bottomSheetModalDRef.current?.snapToIndex(1);
      }, 100);
    }
  }, [isBottomSheetOpen3]);


  useEffect(() => {
    getLiveLocation();
  }, []);

  const closeAlert = () => {
    setIsAlertVisible(false);
  };

  const getLiveLocation = async () => {
    try {
      let granted = await locationPermission();
      while (!granted) {
        granted = await locationPermission();
      }

      if (granted) {
        const { latitude, longitude } = await getCurrentLocation();

        let region = {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5
        }

        // mapRef.current?.animateToRegion(region);

        const coordinates = [
          {
            latitude: region.latitude - region.latitudeDelta / 2,
            longitude: region.longitude - region.longitudeDelta / 2
          },
          {
            latitude: region.latitude + region.latitudeDelta / 2,
            longitude: region.longitude + region.longitudeDelta / 2
          }
        ];

        setCurrentLocation({ latitude, longitude });
        mapRef.current?.fitToCoordinates(coordinates, { edgePadding: { top: 490, right: 50, bottom: 20, left: 30 } });

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU`
            // `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=150&key=AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU`
          );

          const data = await response.json();
          // Handle the data obtained from the Places API
          if (data.results && data.results.length > 0) {
            const firstAddress = data.results[0];

            // const placeDetails = data
            // const address = placeDetails.results[0].formatted_address;
            // placeRef.current?.setAddressText(placeDetails.results[0].formatted_address);
            // setOriginVal(address);
            // setOrigin(region);


            onPlaceSelected(firstAddress, 'live');
          }

        } catch (er) {
          console.error(er.message)
        }

      }
    } catch (er) {
      console.error(er.message)
      setIsAlertVisible(true);
      return setErrorMessage('Error getting location');
      // notifyMessage("Error getting location")
    }
  }

  // const showMap = useCallback(() => {
  const showMap = () => {

    if (origin && destination) {
      if (parseFloat(origin.latitude) == parseFloat(destination.latitude)) {
        setIsAlertVisible(true);
        return setErrorMessage('Pickup and dropoff cannot be same');
      }

      traceRoute();
      setIsBottomSheetOpen3(true);
      bottomSheetModalDRef.current?.snapToIndex(1);

      navigation.setOptions({
        title: 'Taxi Selection',
        headerTitleStyle: {
          fontWeight: 'bold',
          textTransform: 'uppercase'
        },
      })
      setLoading(true);

      API.getCategories().then(response => {
        if (response.status == true) {
          setCategories(response.data);
          setLoading(false);

        }
      }).catch(er => {
        setLoading(false);
        setIsAlertVisible(true);
        return setErrorMessage('Network Issue');
        // return notifyMessage("Network Issue");
      });
    } else {
      setIsAlertVisible(true);
      return setErrorMessage('Please select both Pickup and Drop-off first')
    }
  };
  // }, [traceRoute]);

  const handleDismissEPress = useCallback(() => {
    bottomSheetModalERef.current.close();
  }, []);

  const bookRide = useCallback(() => {
    if (selectedId == null || selectedId == undefined || selectedId == 0) {
      setIsAlertVisible(true);
      return setErrorMessage('Please select car first')
    }

    navigation.navigate("SearchDrivers", {
      carId: selectedId,
      origin: origin,
      destination: destination,
      duration: duration,
      distance: distance,
      fare: fare,
      userId: userId,
      origin_address: originShort,
      destination_address: destinationShort
    });
  }, [origin, destination, distance, duration, fare, selectedId, originShort, destinationShort, originVal]);

  const handleDismissCPress = useCallback(() => {
    // if (bottomSheetModalCRef.current) {
    //   bottomSheetModalCRef.current.close();
    // }
  }, []);

  const renderHeaderHandle = useCallback(
    (title) => (props) => {
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Text>{title}</Text>
      </View>;
    },
    []
  );

  const getData = async (id) => {
    if (id == null || id == undefined || id == 0) {
      setIsAlertVisible(true);
      return setErrorMessage('Please select category first');
    }

    setLoading(true);
    const carsList = await getCarsByCategory(id);
    setLoading(false);
    if (carsList.data.length == 0) {
      notifyMessage('No vehicles discovered. Consider attempting different categories.')
    } else {
      setCarsData(carsList.data);
      setCategoryData(carsList.category);

      navigation.setOptions({ title: 'Select Cars' })

      const dummyData = {
        baseFare: 300,
        timeRate: 0.6,
        distanceRate: 3,
        surge: 1.8
      };

      const estimated_fare = calculateFare(dummyData.baseFare, dummyData.timeRate, duration, dummyData.distanceRate, distance, dummyData.surge);
      setFare(estimated_fare);

      setIsBottomSheetOpen4(true)
      bottomSheetModalERef.current.snapToIndex(1);
    }
  };

  const Item = ({ id, title, image }) => (
    <View style={[
      styles.listContainer,
      { borderColor: selectedId == id ? "#FDCD03" : "#fff", borderWidth: 2 },
    ]}>
      <TouchableOpacity onPress={() => handleSelection(id)}>
        {
          image == null || image == '' ? (
            ''
          ) : (
            <Image source={{ uri: image }} style={{ height: 60, width: 140 }} />
          )
        }

        <Text style={{ textAlign: "center", fontWeight: 'bold', marginTop: 8 }}>{title}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Item id={item.id} image={item.image} title={item.name} />
  );

  const handleMarkerDrag = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const firstAddress = data.results[0];
      onPlaceSelected(firstAddress, 'live');
    }
  };

  const handleMarkerDragDestination = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const firstAddress = data.results[0];
      onPlaceSelected(firstAddress, 'liveDestination');
    }
  };

  const togglePaymentModal = () => {
    API.makePaymentRequest({}).then(res => {
      console.log("Payment link: ", res);
      console.log("Payment state: ", paymentLink);
      setPaymentLink(res.url);
    }).catch(er => {
      console.log(er.message)
    })

    setPaymentModalVisible(!isPaymentModalVisible);
  }

  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log(message);
    if (message === 'Timeout') {
      setPaymentModalVisible(false);
      // Close the modal or WebView here upon cancellation
      // For example, if you're using a modal
      // Set a state variable to hide the modal
      // or call a function that handles closing the modal
    }
  };



  return (
    <>
      {
        pageLoading ? (
          <Lottie source={require('../../assets/images/json/car-loader3.json')} autoPlay loop style={globalStyles.loading} />
        ) : (


          <View style={styles.container} >
            <MapView
              toolbarEnabled={true}
              rotateEnabled={true}
              provider={PROVIDER_GOOGLE}
              initialRegion={INITIAL_POSITION}
              region={INITIAL_POSITION}
              // showsUserLocation={true}
              userLocationPriority={'passive'}
              userLocationUpdateInterval={5000}
              // userLocationAnnotationTitle={'My location'}
              // followsUserLocation={true}
              // showsMyLocationButton={true}
              mapPadding={{ top: 100, left: 0, right: 0, bottom: 0 }}
              // onPress={(event) => console.log(event.nativeEvent.coordinate)}
              onLayout={() => {
                // Map layout is ready
                console.log('Map layout is ready');
              }}
              onMapReady={() => {
                // Map is ready (not necessarily fully loaded)
                console.log('Map is ready');
              }}


              // loadingEnabled={false}
              // loadingIndicatorColor={'#000'}
              zoomEnabled={true}
              ref={mapRef}
              style={styles.map}>
              {origin && <Marker
                draggable
                coordinate={origin}
                centerOffset={{ x: 0, y: 0.5 }} // Adjust the y-offset if needed
                onDragEnd={(event) => handleMarkerDrag(event)}
              >
                <Image style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                  source={require("../../assets/images/png/marker.png")} />

              </Marker>}

              {destination && <Marker coordinate={destination} draggable onDragEnd={(event) => handleMarkerDragDestination(event)}>
                <Image style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                  source={require("../../assets/images/png/car.png")} /></Marker>}

              {showDirections && origin && destination && (
                <MapViewDirections optimizeWaypoints={true} origin={origin} destination={destination} apikey={API_KEY} strokeColor="#FDCD03"
                  strokeWidth={7} onReady={traceRouteOnReady}
                />
              )}


            </MapView>

            {isAlertVisible && (
              <CustomAlert
                visible={isAlertVisible}
                message={errorMessage}
                onClose={closeAlert}
              />
            )}


            <TouchableOpacity onPress={goToLocation} style={{
              position: "absolute", bottom: '30%', right: 10, borderRadius: 30, backgroundColor: "#fff"
            }}>
              <Image
                style={{ width: 40, height: 40 }}
                resizeMode="cover"
                source={require("../../assets/images/png/current.png")}
              />
            </TouchableOpacity>

            <View style={{ flex: 0.4 }}>
              {/* <View name='A' ref={bottomSheetModalARef} snapPoints={maxSnapPoints} index={0}> */}
              <View style={styles.sheetContainer}>
                <View style={styles.outerContainer}>


                  <View style={{ flexDirection: "row" }}>
                    <Image
                      style={{ position: "relative", top: 15 }}
                      source={require("../../assets/images/png/route.png")}
                    />
                    <View style={styles.inputContainer}>
                      <Pressable onPress={toggleOriginModal}>
                        {/* <Pressable onPress={() => openModal(1)}> */}
                        <View pointerEvents="none" >
                          <TextInput style={{ color: '#000' }} placeholderTextColor="#000" placeholder="Pickup" value={originVal} />
                        </View>
                      </Pressable>

                      <Pressable onPress={toggleDestinationModal}>
                        {/* <Pressable onPress={() => openModal(2)}> */}
                        <View pointerEvents="none">
                          <TextInput style={{ color: '#000' }} placeholderTextColor="#000" placeholder="Dropoff" value={destinationVal} />
                        </View>
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginHorizontal: 12 }}>
                  <TouchableOpacity style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 10,
                    borderColor: '#FDCD03',
                    backgroundColor: '#FDCD03',
                    height: 50,
                    width: '100%',
                  }} onPress={showMap}>
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Confirm Pickup
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>


            {/* <BottomSheetShow bottomRef={"B"} bottomSheetModalRef={bottomSheetModalBRef} snapPoints={snapPoints} placeRef={placeRef} onPlaceSelected={onPlaceSelected} clearText={clearText} />
        <BottomSheetShow bottomRef={"C"} bottomSheetModalRef={bottomSheetModalCRef} snapPoints={snapPoints} placeRef={destinationRef} onPlaceSelected={onPlaceSelected} clearText={clearDestinationText} /> */}

            <LocationModal
              visible={originModalVisible}
              toggleModal={toggleOriginModal}
              method={"pickup"}
              onPlaceSelected={onPlaceSelected}
              clearText={clearText}
              placeRef={placeRef}
            />

            <LocationModal
              visible={destinationModalVisible}
              toggleModal={toggleDestinationModal}
              method={"drop off"}
              onPlaceSelected={onPlaceSelected}
              clearText={clearDestinationText}
              placeRef={destinationRef}
            />





            {
              isBottomSheetOpen3 && (
                <BottomSheet name={"D"}
                  dismissOnPanDown={true}
                  enablePanDownToClose={true}
                  ref={bottomSheetModalDRef}
                  snapPoints={maxSnapPoints}
                  index={-1} >
                  <View style={{ flex: 1 }}>
                    {
                      isLoading ? (
                        <ActivityIndicator style={styles.loading} size="large" color="#000" />
                      ) : (
                        categories.length > 0 && duration > 0 ? (
                          <Card categories={categories} travelTime={convertMinsToTime(duration)} distance={distance + ' Km'} onPress={(selectedIds) => getData(selectedIds)} />
                        ) : null
                      )
                    }
                  </View>
                </BottomSheet>
              )
            }


            <BottomSheet name={"E"}
              dismissOnPanDown={true}
              enablePanDownToClose={true}
              ref={bottomSheetModalERef}
              snapPoints={maxSnapPointsCar}
              index={-1}
              handleComponent={() => (
                <View style={{ backgroundColor: '#FDCD03', height: 1, borderRadius: 10 }} />
              )}
            >

              <View
                style={{
                  flex: 1,
                  backgroundColor: "#FDCD03",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    {
                      categoryData ? (
                        <Text style={{ fontSize: 22, marginTop: 24, marginLeft: 20, fontWeight: 500 }}>
                          {categoryData.name} Cars
                        </Text>
                      ) : null
                    }
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                    {
                      categoryData.image == null || categoryData.image == "" ? (
                        ''
                      ) : (
                        <Image
                          style={{ height: 80, width: '60%' }}
                          source={{ uri: categoryData.image }}
                        />
                      )
                    }

                  </View>
                  <TouchableOpacity onPress={handleDismissEPress}>
                    <CROSS_ICON />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: "#fff",
                    flex: 1,
                    borderRadius: 15,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                    Cars
                  </Text>
                  <View >
                    <FlatList
                      horizontal
                      data={carsData}
                      renderItem={renderItem}
                      keyExtractor={(item) => item.id}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      marginHorizontal: 10,
                      paddingHorizontal: 15,
                      justifyContent: "space-between",
                      marginTop: 3,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                        Rs. {fare}
                      </Text>
                    </View>

                    <View style={{ flex: 0.6 }}>
                      <TouchableOpacity
                        style={styles.logout}
                        // onPress={togglePaymentModal}
                        onPress={bookRide}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 14,
                          }}
                        >
                          Book Ride
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>



            </BottomSheet>


            <View>
              <Modal
                animationIn={'slideInUp'}
                isVisible={isPaymentModalVisible}
                onPress={togglePaymentModal}
                coverScreen={true}
                onBackdropPress={togglePaymentModal}
                swipeDirection="down"
                onSwipeComplete={togglePaymentModal}
                onBackButtonPress={togglePaymentModal}
                propagateSwipe={true}
                style={styles.modal}>

                {paymentLink !== '' && (
                  <WebView
                    source={{ uri: paymentLink }}
                    style={{ flex: 1, width: '100%' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    originWhitelist={['*']}
                    startInLoadingState={false}
                    scalesPageToFit={true}
                    onMessage={handleMessage}
                    onError={(error) => console.error('WebView error:', error)}
                  />
                )}
              </Modal>
            </View>



          </View>


        )
      }
    </>
  );
};


export default Home;
