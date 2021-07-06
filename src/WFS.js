import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "./Map";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import GeoJSON from "ol/format/GeoJSON";
import { Select, Modify } from "ol/interaction";
import { Fill, Stroke, Circle, Style } from "ol/style";
import { Overlay } from "ol";
import "./app.css";
import { getCenter } from "ol/extent";

const WFS = () => {
  const [attValue, setAttValue] = useState([]);
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }
    map.addLayer(vector);
    map.addInteraction(select);
    map.addInteraction(modify);

    // return () => map.removeOverlay(overlay);
  }, [map]);

  var fill = new Fill({
    color: "rgba(255,255,255,0.4)",
  });
  var stroke = new Stroke({
    color: "red",
    width: 2,
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

  const vector = new VectorLayer({
    title: "MyLayer",
    source: new VectorSource({
      url: "http://localhost:8080/geoserver/world/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=world%3Ane_10m_admin_0_countries&outputFormat=application%2Fjson",
      format: new GeoJSON({
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }),
    }),
  });

  let select = new Select({
    style: styles,
  });
  let modify = new Modify({
    features: select.getFeatures(),
  });

  const downloadHandler = () => {
    const source = vector.getSource();
    console.log(source);

    const format = new GeoJSON({ featureProjection: "EPSG:3857" });

    const features = source.getFeatures();
    const json = format.writeFeatures(features);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "download.geojson";
    a.click();
    a.remove();
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

  const popupHandler = (e) => {
    const content = document.getElementById("popup-content");
    // content.innerHTML = "";
    if (map) {
      var feature = map.forEachFeatureAtPixel(e.pixel, (feature) => {
        return feature;
      });
    }

    if (feature) {
      // var coordinates = feature.getGeometry().getCoordinates();
      var coordinates = getCenter(feature.getGeometry().getExtent());

      // console.log(coordinates);

      overlay.setPosition(coordinates);
      const attObject = feature.getProperties();
      // setAttValue(attObject);
      const name = attObject["name"];
      const abbrev = attObject["abbrev"];

      // console.log(name);

      const popupMessage = feature.get("name");
      // console.log(popupMessage);
      if (content) {
        const element1 = document.createElement("p");
        element1.innerText = name;
        const element2 = document.createElement("p");
        element2.innerText = abbrev;

        content.appendChild(element1);
        content.appendChild(element2);
      }
    }
  };

  if (map) {
    map.on("singleclick", popupHandler);
    map.addOverlay(overlay);
  }

  return (
    <div>
      <button id="download" onClick={downloadHandler}>
        download
      </button>

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
    </div>
  );
};

export default WFS;
