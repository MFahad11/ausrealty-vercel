import { GoogleMap, Marker } from "@react-google-maps/api";

const GoogleMaps = ({ lat, lon,view="hybrid" }:{
  lat: number;
  lon: number;
  view?: "roadmap" | "satellite" | "hybrid" | "terrain";
}) => {
  return (
    <div className="w-full max-w-[800px] h-[400px] my-6">
      <GoogleMap
        center={{ lat: lat, lng: lon }}  // Properly map to lat and lng for Google Maps
        zoom={19}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{
          mapTypeId: view, // Default to satellite view
          disableDefaultUI: false, // Optional: hide or show the default map controls
        }}
      >
        <Marker position={{ lat: lat, lng: lon }} />  {/* Proper lat, lng structure */}
      </GoogleMap>
    </div>
  );
};

export default GoogleMaps;
