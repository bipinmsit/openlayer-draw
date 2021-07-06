import React, { useContext, useEffect, useState } from "react";
import { Group as LayerGroup, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { MapContext } from "./Map";
import { Fill, Stroke, Circle, Style } from "ol/style";
import { Overlay } from "ol";
import "./app.css";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { get as getProjection } from "ol/proj";

const GetFeatureInfo = () => {
  const [layerName, setLayerName] = useState([]);
  const { map } = useContext(MapContext);
  useEffect(() => {
    if (!map) {
      return;
    }

    const workspaceName = "custom";

    fetch(
      `http://localhost:8080/geoserver/rest/workspaces/${workspaceName}/layers`
    )
      .then((response) => response.json())
      .then((data) => {
        const { layer } = data.layers;
        setLayerName(layer);
      })
      .catch((err) => console.log("Error: ", err));

    map.addLayer(overlays);
    map.addOverlay(overlay);
  }, [map]);

  // define coordinate system "EPSG:2260"

  const epsg2260 = () => {
    proj4.defs(
      "EPSG:2260",
      "+proj=tmerc +lat_0=38.83333333333334 +lon_0=-74.5 +k=0.9999 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs"
    );
    register(proj4);
    const usaProjection = getProjection("EPSG:2260");

    return usaProjection;
  };

  //   Popup
  const container = document.getElementById("popup");
  var overlay = new Overlay({
    element: container,
    // autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });

  //   function for style
  const featureStyle = () => {
    var fill = new Fill({
      color: "rgba(255,0,0,0.4)",
    });
    var stroke = new Stroke({
      color: "#3399CC",
      width: 1.25,
    });
    var styles = [
      new Style({
        image: new Circle({
          fill: fill,
          stroke: stroke,
          radius: 5,
        }),
        fill: fill,
        stroke: stroke,
      }),
    ];

    return styles;
  };

  //   vector layer getting from geoserver

  const overlays = new LayerGroup({
    title: "Overlays",
    layers: [],
  });

  for (let i = 0; i < layerName.length; i++) {
    // console.log(layerName[i].href);

    const vector = new VectorLayer({
      // title: "My Layer",
      source: new VectorSource({
        // url: "http://localhost:8080/geoserver/world/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=world%3Ane_10m_airports&maxFeatures=50&outputFormat=application%2Fjson",
        url: layerName[i].href,
        format: new GeoJSON({
          dataProjection: epsg2260(),
          featureProjection: "EPSG:3857",
        }),
      }),
      style: featureStyle,
    });

    overlays.getLayers().push(vector);
  }

  // const vector = new VectorLayer({
  //   title: "My Layer",
  //   source: new VectorSource({
  //     url: "http://localhost:8080/geoserver/world/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=world%3Ane_10m_airports&maxFeatures=50&outputFormat=application%2Fjson",
  //     format: new GeoJSON({
  //       dataProjection: "EPSG:4326",
  //       featureProjection: "EPSG:3857",
  //     }),
  //   }),
  //   style: featureStyle,
  // });

  //   popup handler
  const popupHandler = (e) => {
    const content = document.getElementById("popup-content");
    // content.innerHTML = "";
    if (map) {
      var feature = map.forEachFeatureAtPixel(e.pixel, (feature) => {
        return feature;
      });
    }

    if (feature) {
      var coordinates = feature.getGeometry().getCoordinates();
      overlay.setPosition(coordinates);

      if (feature) {
        // var coordinates = feature.getGeometry().getCoordinates();
        overlay.setPosition(coordinates);
        const attObject = feature.getProperties();
        const name = attObject["name"];

        // console.log(name);

        const popupMessage = feature.get("name");
        if (content) {
          content.innerText = name;
        }
      }
    }
  };

  if (map) {
    map.on("singleclick", popupHandler);
  }

  //   console.log(popupMessage);

  return (
    <div id="popup" className="ol-popup">
      <a
        href="#"
        id="popup-closer"
        className="ol-popup-closer"
        onClick={() => {
          overlay.setPosition(undefined);
          return false;
        }}
      ></a>
      <div id="popup-content"></div>
    </div>
  );
};

export default GetFeatureInfo;
