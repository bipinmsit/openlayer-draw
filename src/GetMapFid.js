import React, { useContext, useEffect } from "react";
import { MapContext } from "./Map";
import { Image as ImageLayer } from "ol/layer";
import { ImageWMS } from "ol/source";

const GetMapFid = () => {
  const { map } = useContext(MapContext);
  useEffect(() => {
    if (!map) {
      return;
    }
    const fetchApi = async () => {
      const fetchMapFid = await fetch(
        "http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=topp:states&featureid=states.23"
      );

      const data = await fetchMapFid.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");

      console.log(xml);

      //   map.addLayer(data);
    };

    fetchApi();
  }, [map]);
  return <div></div>;
};

export default GetMapFid;
