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
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  Image,
  Dimensions,
  PermissionsAndroid,
  Modal,
} from "react-native";

import API from "./API";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "../styles/Home.styles";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const API_KEY = 'AIzaSyB6Oq2DgMGkLbwrmW7KV9m295zN9mLVpkU';
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const INITIAL_POSITION = {
  latitude: 30.6800,
  longitude: 76.7221,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

import { notifyMessage, convertMinsToTime, calculateFare } from './helpers';

import BottomSheet, {
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { TextInput } from "react-native-gesture-handler";
import CROSS_ICON from "../../assets/images/svg/cross.svg";
import { apiKey } from './config';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from "react-native-geolocation-service";

navigator.geolocation = require('react-native-geolocation-service');

import Card from "./Card";
import MapViewDirections from "react-native-maps-directions";

const BottomSheetShow = ({ bottomSheetModalRef, snapPoints, placeRef, onPlaceSelected, bottomRef }) => {
  const isCurrentLocation = bottomRef == 'B' ? true : false;
  const method = bottomRef == 'B' ? 'origin' : 'destination';
  const label = bottomRef == 'B' ? 'Current location' : '';
  return (
    <BottomSheet name={bottomRef}
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      detach={true}
      index={-1} >
      <View style={{ flex: 1 }}>
        <GooglePlacesAutocomplete
          currentLocation={isCurrentLocation}
          renderLeftButton={() =>
            <TouchableOpacity>
              <MaterialCommunityIcons style={{ marginTop: 15, fontSize: 18, position: 'relative', left: 10 }} name={'arrow-left'} color={'#4B545A'} size={20} />
            </TouchableOpacity>}
          nearbyPlacesAPI='GooglePlacesSearch'
          ref={placeRef}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
          }}

          currentLocationLabel={label}
          debounce={200}
          listViewDisplayed={true}
          enablePoweredByContainer={false}
          placeholder={method}
          query={{
            key: API_KEY, components: 'country:in', language: 'en', types: 'address'
            // strictbounds: true, 
            // radius: "900000"
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
          onFail={error => console.log(error)}
          onNotFound={() => console.log('no results')}
          listEmptyComponent={() => (
            <View style={{ flex: 1 }}>
              <Text>No results were found</Text>
            </View>
          )}
        />
      </View>
    </BottomSheet>
  )
}

const Home = () => {
  const navigation = useNavigation();
  const placeRef = useRef();
  const destinationRef = useRef();
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState('');
  useEffect(() => {
    API.getUserDetails().then(res => {
      if (res) {
        setUserId(res.id);
      } else {
        navigation.navigate('Login');
      }

    }).catch(er => console.log(er.message))
  }, [userId])

  const getCarsByCategory = async (category_id) => {
    try {
      const cars = await API.getCarByCategory(category_id);
      return cars;
    } catch (er) {
      return notifyMessage(er.message);
    }
  };

  const mapRef = useRef(null);
  const bottomSheetModalARef = useRef(null);
  const bottomSheetModalBRef = useRef(null);
  const bottomSheetModalCRef = useRef(null);
  const bottomSheetModalDRef = useRef(null);
  const bottomSheetModalERef = useRef(null);



  const openModal = useCallback((param) => {
    if (param == 1) {
      if (bottomSheetModalBRef.current) {
        bottomSheetModalBRef.current.expand();
        placeRef.current.focus();

        navigation.setOptions({ headerShown: false })
      }
    } else {
      if (bottomSheetModalCRef.current) {
        bottomSheetModalCRef.current.expand();
        destinationRef.current.focus();

        navigation.setOptions({ headerShown: false })
      }
    }

  }, []);


  const moveTo = async (position) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      mapRef.current?.animateCamera(camera, { duration: 1000 })
    }
  }

  const [isLoading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [originVal, setOriginVal] = useState('');
  const [destinationVal, setDestinationVal] = useState('');
  const [destination, setDestination] = useState('');
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fare, setFare] = useState(0);

  const [carsData, setCarsData] = useState([]);
  const [selectedId, setSelectedID] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const snapPoints = useMemo(() => ["1%", "50%", '70%', "105%"], []);
  const maxSnapPoints = useMemo(() => ["35%"], []);
  const maxSnapPointsCar = useMemo(() => ["50%"], []);

  const edgePaddingValue = 70;

  const edgePadding = {
    top: edgePaddingValue,
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };


  const handleSelection = (id) => {
    console.log("Selected Car: " + id)
    var selectedIdInner = selectedId;
    if (selectedIdInner == id) {
      setSelectedID(null);
    } else {
      setSelectedID(id);
    }

    console.log("Selected Car State: " + selectedId)
  };

  const traceRouteOnReady = (args) => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration)
    }
  }

  const traceRoute = () => {
    console.log(origin)
    console.log(destination)
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }
  }

  const onPlaceSelected = (details, flag) => {

    navigation.setOptions({ headerShown: true })

    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };

    if (flag == 'origin') {
      setOriginVal(placeRef.current.getAddressText());
      setOrigin(position);
    } else {
      setDestination(position)
      setDestinationVal(destinationRef.current.getAddressText());
    }

    bottomSheetModalBRef.current.collapse();
    bottomSheetModalCRef.current.collapse();
    navigation.setOptions({ headerShown: true })

    moveTo(position);

  }

  const goToLocation = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (granted === "granted") {
      Geolocation.getCurrentPosition(
        (position) => {
          let region = {
            latitude: position['coords']['latitude'],
            longitude: position['coords']['longitude'],
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }
          mapRef.current?.animateToRegion(region);
        },
        (error) => {
          console.log(error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    }
  }

  const showMap = useCallback(() => {

    if (origin && destination) {
      if (parseFloat(origin.latitude) == parseFloat(destination.latitude)) {
        return notifyMessage('Origin and destination cannot be same');
      }

      traceRoute();
      bottomSheetModalDRef.current.snapToIndex(1);

      navigation.setOptions({ title: 'Taxi Selection' })
      setLoading(true);

      API.getCategories().then(response => {
        if (response.status == true) {
          setCategories(response.data);
          setLoading(false);
        }
      }).catch(er => {
        setLoading(false);
        notifyMessage(er.message);
        console.log(er.message)
      });


    } else {
      notifyMessage("Please select origin and destination first");
    }
  }, [traceRoute]);

  const handleDismissEPress = useCallback(() => {
    console.log(bottomSheetModalERef)
    bottomSheetModalERef.current.close();
  }, []);

  const bookRide = useCallback(() => {
    if (selectedId == null || selectedId == undefined) {
      return notifyMessage('Please select car first');
    }

    console.log(selectedId);


    navigation.navigate("SearchDrivers", {
      latitude: origin,
      longitude: destination,
      duration: duration,
      distance: distance,
      fare: fare,
      userId: userId
    });
  }, [origin, destination, distance, duration, fare]);

  const handleDismissCPress = useCallback(() => {
    if (bottomSheetModalCRef.current) {
      bottomSheetModalCRef.current.close();
    }
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
    if (id == null || id == undefined) {
      return notifyMessage('Please select category first');
    }

    setLoading(true);
    const carsList = await getCarsByCategory(id);
    console.log(carsList.data);
    setCarsData(carsList.data);
    setLoading(false);

    navigation.setOptions({ title: 'Select Cars' })

    const dummyData = {
      baseFare: 300,
      timeRate: 0.14,
      distanceRate: 0.97,
      surge: 2
    };

    const estimated_fare = calculateFare(dummyData.baseFare, dummyData.timeRate, duration, dummyData.distanceRate, distance, dummyData.surge);
    setFare(estimated_fare);

    bottomSheetModalERef.current.expand();
    bottomSheetModalCRef.current.close();

  };

  const Item = ({ id, title, image }) => (
    <View style={[
      styles.listContainer,
      { borderColor: selectedId == id ? "#FDCD03" : "#fff" },
    ]}>
      <TouchableOpacity onPress={() => handleSelection(id)}>
        <Image source={{ uri: `https://gscoin.live/public/images/cars/${image}` }} style={{ height: 60, width: 140 }} />
        <Text style={{ textAlign: "center" }}>{title}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Item id={item.id} image={item.image} title={item.title} />
  );

  return (
    <BottomSheetModalProvider style={styles.container}>
      <MapView
        toolbarEnabled={true}
        rotateEnabled={true}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_POSITION}
        showsUserLocation={true}
        userLocationPriority={'passive'}
        userLocationUpdateInterval={5000}
        userLocationAnnotationTitle={'My location'}
        followsUserLocation={true}
        showsMyLocationButton={true}
        mapPadding={{ top: 20, right: 20, bottom: 550, left: 20 }}
        onMapReady={() => {
          console.log('ready')
        }}
        loadingEnabled={true}
        loadingIndicatorColor={'#000'}
        zoomEnabled={true}
        ref={mapRef}
        style={styles.map}>

        {origin && <Marker
          draggable
          coordinate={origin}
        >
          <Image style={{ width: 50, height: 50 }}
            resizeMode="contain"
            source={require("../../assets/images/png/marker.png")} />

        </Marker>}

        {destination && <Marker coordinate={destination} draggable>
          <Image style={{ width: 40, height: 40 }}
            resizeMode="contain"
            source={require("../../assets/images/png/car.png")} /></Marker>}

        {showDirections && origin && destination && (
          <MapViewDirections origin={origin} destination={destination} apikey={API_KEY} strokeColor="#FDCD03"
            strokeWidth={7} onReady={traceRouteOnReady}
          />
        )}


      </MapView>


      <TouchableOpacity onPress={goToLocation} style={{
        position: "absolute", bottom: 250, right: 15, borderRadius: 30, backgroundColor: "#d2d2d2"
      }}>
        <Image
          style={{ width: 50, height: 50 }}
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
                <Pressable onPress={() => openModal(1)}>
                  <View pointerEvents="none">
                    <TextInput placeholder="Origin" value={originVal} />
                  </View>
                </Pressable>

                <Pressable onPress={() => openModal(2)}>
                  <View pointerEvents="none">
                    <TextInput placeholder="Destination" value={destinationVal} />
                  </View>
                </Pressable>
              </View>
            </View>
            <View style={{ flexDirection: "row", }}>
              <Image source={require("../../assets/images/png/map.png")} />
              <TouchableOpacity onPress={showMap}>
                <Text style={{ color: "#FCCC03", marginTop: 10 }}>
                  Show on a map
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <BottomSheetShow bottomRef={"B"} bottomSheetModalRef={bottomSheetModalBRef} snapPoints={snapPoints} placeRef={placeRef} onPlaceSelected={onPlaceSelected} />
      <BottomSheetShow bottomRef={"C"} bottomSheetModalRef={bottomSheetModalCRef} snapPoints={snapPoints} placeRef={destinationRef} onPlaceSelected={onPlaceSelected} />


      <BottomSheet name={"D"}
        ref={bottomSheetModalDRef}
        snapPoints={snapPoints}
        index={-1} >
        <View style={{ flex: 1 }}>
          {
            isLoading ? (
              <ActivityIndicator style={styles.loading} size="large" color="#000" />
            ) : (
              <Card categories={categories} travelTime={convertMinsToTime(duration)} distance={distance + ' Km'} onPress={(selectedIds) => getData(selectedIds)} />
            )
          }
        </View>
      </BottomSheet>


      <BottomSheet name={"E"}
        ref={bottomSheetModalERef}
        snapPoints={maxSnapPointsCar}
        index={-1}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FDCD03",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 26, marginTop: 45, marginLeft: 20 }}>
                {/* {categoryData.title} */}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              {/* <Image
                  style={{ height: 100, width: '70%' }}
                  source={categoryData.image}
                /> */}
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
            <Text style={{ fontSize: 15, fontWeight: "bold", marginTop: 15 }}>
              Features
            </Text>
            <View>
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
                margin: 10,
                justifyContent: "space-between",
                marginTop: 15,
              }}
            >
              <View>
                <Text style={{ fontSize: 26, fontWeight: "bold" }}>
                  Rs. {fare}
                </Text>
              </View>

              <View style={{ flex: 0.5 }}>
                <TouchableOpacity
                  style={styles.logout}
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
    </BottomSheetModalProvider>
  );
};


export default Home;
