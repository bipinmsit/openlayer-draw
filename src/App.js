import React from "react";
import { Map } from "./Map";
import { fromLonLat } from "ol/proj";
import MapLayerSwitcher from "./MapLayerSwitcher";
import WFS from "./WFS";
import GetFeatureInfo from "./GetFeatureInfo";
import Inset from "./Inset";

const App = () => {
  return (
    <div>
      <Map center={fromLonLat([73.82745, 20.07567])} zoom={2}>
        <MapLayerSwitcher />
        {/* <GetFeatureInfo /> */}
        <Inset />
        <WFS />
      </Map>
    </div>
  );
};

export default App;

// fromLonLat([-73.82745, 41.07567])
// fromLonLat([73.961717, 18.563548])
// fromLonLat([73.82745, 20.07567])
