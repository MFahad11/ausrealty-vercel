import React, { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { showToast } from "./ui/toast";

const GooglePlacesAutocomplete = ({
  onSelectAddress,
  isNSWCheck = true,
  address,
  setAddress,
  placeholder="Enter an address..."
}:{
  onSelectAddress?: (address: string) => void;
  isNSWCheck?: boolean;
  address: string;
  setAddress: (address: string) => void;
  placeholder?: string;
}) => {
  const [autocomplete, setAutocomplete] = useState(null);

  const handleLoad = (autocompleteInstance:any) => {
    setAutocomplete(autocompleteInstance);
  };

  const handlePlaceChanged = async () => {
    if (autocomplete) {
      // @ts-ignore
      const place = autocomplete.getPlace();
      if (place && place.address_components && place.geometry) {
        const addressComponents = place.address_components;

        // Extract the formatted address components
        const suburb =
          addressComponents.find(
            (component:{
              types: string[];
              
            }) =>
              component.types.includes("locality") &&
              component.types.includes("political")
          )?.long_name || "";

        let fullAddress = place.formatted_address;

        // Check if the address contains 'NSW'
        if (!fullAddress.includes("NSW")) {
          showToast("error", "Only NSW properties are allowed.");
          return;
        }

        // Step 1: Remove everything after 'NSW'
        let shortAddress = fullAddress.split("NSW")[0].trim();

        // Step 2: Dynamically replace abbreviations with long form from address components
        addressComponents
          .filter((component:{
            types: string[];
            long_name: string;
            short_name: string;
          }) => component.types.includes("route"))
          .forEach((component:{
            long_name: string;
            short_name: string;
          }) => {
            const longName = component.long_name;
            const shortName = component.short_name;

            // If the fullAddress contains the abbreviation (short name), replace it with the long name
            if (shortName && fullAddress.includes(shortName)) {
              shortAddress = shortAddress.replace(shortName, longName);
            }
          });

        // Set the final formatted address
        setAddress(shortAddress);
        if (onSelectAddress) {
          onSelectAddress(shortAddress);
        }
      } else {
        // Logic when the input is cleared or invalid place selected
        showToast("error", "Invalid place selected.");
      }
    }
  };

  const handleInputChange = (e:
    React.ChangeEvent<HTMLInputElement>
  ) => {
    setAddress(e.target.value);
    // Do not call onSelectAddress here
  };

  return (
    <Autocomplete
      onLoad={handleLoad}
      onPlaceChanged={handlePlaceChanged}
      options={{
        componentRestrictions: { country: ["au"] },
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["geocode"],
      }}
      className="w-full"
    >
      <div className="relative text-xs">
        <input
          type="text"
          value={address}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full relative flex-grow p-2 border border-mediumgray rounded outline-none focus:outline-none resize-none overflow-y-hidden min-h-[38px]"
        />
      </div>
    </Autocomplete>
  );
};

export default GooglePlacesAutocomplete;
