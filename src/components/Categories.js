import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { FlatList } from "react-native-gesture-handler";

const Category = (props) => {
  const [title, setTitle] = useState("Select");
  const [selectedId, setSelectedID] = useState(null);

  const selectData = () => {
    props.onPress(selectedId);
  };

  const handleSelection = (id) => {
    console.log("Selected category: " + id)
    var selectedIdInner = selectedId;
    if (selectedIdInner == id) {
      setSelectedID(null);
    } else {
      setSelectedID(id);
    }

    setTitle("Selected");
  };

  const Item = ({ id, title, image }) => (
    <View
      style={[
        styles.listContainer,
        { borderColor: selectedId == id ? "#FDCD03" : "#fff" },
      ]}
    >
      <TouchableOpacity onPress={() => handleSelection(id)}>

        {
          image === null || image === '' ? (
            ''
          ) : (
            <Image source={{ uri: image }} style={{ height: 60, width: 140 }} />
          )
        }
        <Text style={{ textAlign: "center" }}>{title}</Text>
      </TouchableOpacity>
    </View>

  );

  const renderItem = ({ item }) => (
    <Item id={item.id} image={item.image} title={item.name} />
  );

  return (
    <View style={styles.container}>
      <View style={{ margin: 10 }}>
        <FlatList
          horizontal={true}
          scrollEnabled
          extraData={selectedId}
          data={props.categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  yellowBorder: {
    borderColor: "#000",
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
