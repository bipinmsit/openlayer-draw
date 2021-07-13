import React from "react";
import { Map } from "./Map";
import { fromLonLat } from "ol/proj";
import MapLayerSwitcher from "./MapLayerSwitcher";
import WFSL from "./WFSL";
import GetFeatureInfo from "./GetFeatureInfo";
import Inset from "./Inset";
import GetMapFid from "./GetMapFid";

const App = () => {
  return (
    <div>
      <Map center={fromLonLat([-73.82745, 41.07567])} zoom={2}>
        <MapLayerSwitcher />
        {/* <GetFeatureInfo /> */}
        <Inset />
        {/* <WFSL /> */}
        <GetMapFid />
      </Map>
    </div>
  );
};

export default App;

// fromLonLat([-73.82745, 41.07567])
// fromLonLat([73.961717, 18.563548])
// fromLonLat([73.82745, 20.07567])
