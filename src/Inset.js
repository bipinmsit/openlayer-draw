import React, { useContext, useEffect } from "react";
import { OverviewMap, defaults as defaultsControls } from "ol/control";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { MapContext } from "./Map";

const Inset = () => {
  const { map } = useContext(MapContext);
  useEffect(() => {
    if (!map) {
      return;
    }
    map.addControl(overviewMapControl);
  });
  const overviewMapControl = new OverviewMap({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
  });
  return <div></div>;
};

export default Inset;
