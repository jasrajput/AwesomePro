import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const Card = (props) => {
  return (
    <View style={styles.container}>
      <View style={{ margin: 10 }}>
        <View
          style={[
            styles.listContainer,
            { borderColor: props.selectedId == props.id ? "#FDCD03" : "#fff" },
          ]}
        >
          <TouchableOpacity onPress={() => props.handleSelection(props.id)}>
            <Image source={props.image} />
            <Text style={{ textAlign: "center" }}>{props.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContainer: {
    borderWidth: 1,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: "#fff",
    margin: 15,
    padding: 5,
    height: 100,
    borderColor: "#fff",
  },

  logout: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#000000",
    backgroundColor: "#000000",
    height: 50,
    width: "100%",
    position: "relative",
    top: 30,
  },
});
