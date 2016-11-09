import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "test": {
        "display": "flex",
        "WebkitBoxPack": "center",
        "MsFlexPack": "center",
        "justifyContent": "center",
        "backgroundColor": "rgba(255, 89, 125, 0.5)"
    },
    "te": {
        "display": "flex"
    }
});