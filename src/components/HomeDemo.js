import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
  FC,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Button,
  TextInput,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SplashScreen from "react-native-splash-screen";

export const withModalProvider = (Component) => () =>
  (
    <BottomSheetModalProvider>
      <Component />
    </BottomSheetModalProvider>
  );

const HomeDemo = () => {
  // refs
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // ...StyleSheet.absoluteFillObject,
    // justifyContent: "flex-end",
    // alignItems: "center",
  },

  map: {
    ...StyleSheet.absoluteFillObject,
    height: "70%",
  },

  sheetContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },

  contentContainer: {
    flex: 1,
    alignItems: "center",
  },

  inputStyle: {
    marginLeft: 20,
    height: 40,
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },

  inputContainer: {
    width: "100%",
  },

  outerContainer: {
    borderWidth: 0.5,
    borderRadius: 20,
    borderColor: "#fff",
    elevation: 2,
    backgroundColor: "#fff",
    margin: 15,
    padding: 5,
  },
});

export default HomeDemo;
