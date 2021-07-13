import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "./Map";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { GeoJSON, WFS } from "ol/format";
import GML from "ol/format/GML";
import { Feature } from "ol";
import { Select, Modify, Draw, Snap } from "ol/interaction";
import { Fill, Stroke, Circle, Style } from "ol/style";
import { Overlay } from "ol";
import "./app.css";
import { getCenter } from "ol/extent";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const WFSL = () => {
  const [showModal, setShowModal] = useState(false);
  const [event, setEvent] = useState("");
  const [featureGeom, setFeatureGeom] = useState([]);
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
        // geometryName: "geom",
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
        // extractGeometryName: true,
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

  const content = document.getElementById("popup-content");
  const popupHandler = (e) => {
    // const content = document.getElementById("popup-content");
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
    // map.addOverlay(overlay);
  }

  const createFeatureHandler = () => {
    const draw = new Draw({
      type: "Polygon",
      source: vector.getSource(),
    });

    draw.on("drawend", (e) => {
      setShowModal(true);
      const myFeature = e.feature;

      if (myFeature) {
        // console.log(myFeature);
        const geom = myFeature.getGeometry();
        // console.log(geom.transform("EPSG:3857", "EPSG:4326"));
        setFeatureGeom(geom);
        // saveFeatureHandler(myFeature);
      }
    });
    const snap = new Snap({
      source: vector.getSource(),
    });

    if (map) {
      map.addInteraction(draw);
      map.addInteraction(snap);
    }
  };

  const saveFeatureHandler = () => {
    const feature = new Feature({
      geometry: featureGeom,
      // name: "dummy",
    });

    // feature.set("geom", feature.getGeometry());
    // feature.setGeometryName("geom");

    // console.log(feature.getGeometry());
    // feature.set('geom', feature.getGeometry());
    // var fid = feature.getId();

    // console.log(feature);
    // const wfsFormat = new WFS();

    var format = new WFS({
      // geometryName:"geom",
      featureNS: "world",
      featureType: "ne_10m_admin_0_countries",
      schemaLocation:
        "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd http://www.openplans.org/world http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=world:ne_10m_admin_0_countries",
    });

    var node = format.writeTransaction([feature], null, null, {
      gmlOptions: {
        featureNS: "world",
        srsName: "EPSG:3857",
        featureType: "ne_10m_admin_0_countries",
      },
    });

    console.log(node);
    var test = new XMLSerializer().serializeToString(node);

    const url = "http://localhost:8080/geoserver/wfs";

    console.log(test);

    const postData = async (data) => {
      await fetch(url, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "text/xml; charset=utf-8",
          Accept: "*/*",
          "Accept-Language": "en-GB",
          "Accept-Encoding": "gzip, deflate",
          Connection: "Keep-alive",
          "Content-Length": data.length,
        }),
        body: data,
      });

      console.log("posting data to server");
    };

    postData(test);
    vector.getSource().addFeature(feature);
    vector.getSource().refresh();
  };

  const onchangeHandler = (e) => {
    setEvent(e.target.value);
  };

  return (
    <div>
      <button id="download" onClick={downloadHandler}>
        download
      </button>
      <button id="createFeature" onClick={createFeatureHandler}>
        Create Feature
      </button>

      <div>
        <select>
          <option value="select" onChange={onchangeHandler}>
            Select event
          </option>
          <option value="draw">Draw</option>
          <option value="modify">Modify</option>
        </select>
      </div>

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

      <div>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Do you want to save this feature ?</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" onClick={saveFeatureHandler}>
              Save changes
            </Button>
            <Button variant="danger" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default WFSL;
