import { View, Text, MapView, LocationSearch } from "@aws-amplify/ui-react";
import { useState } from "react";
import { Marker } from "react-map-gl";

import "./LocationPicker.css";

interface Properties {
    initialCoordinates: { longitude?: number, latitude?: number };
    onCoordinatesChange: (data: { longitude?: number, latitude?: number }) => void;
    disabled?: boolean;
}

function LocationPicker(props: Properties) {
    const [{ lat, lng }, setLocation] = useState<{ lat: number, lng: number }>({
        lat: props.initialCoordinates.latitude ?? 0,
        lng: props.initialCoordinates.longitude ?? 0
    });

    return (
        <View className={props.disabled ? "LocationPicker LocationPicker-Disabled" : "LocationPicker"}>
            <Text className="PurchaseForm-Label">Presentation Location</Text>
            <Text color="var(--amplify-colors-font-secondary)" marginBottom="0.5em">
                Choose the exact geolocation to present your gift card using the map and the location search box. 
            </Text>
            <MapView 
                initialViewState={{
                    latitude: lat,
                    longitude: lng,
                    zoom: 14,
                }} onMove={e => setLocation(e.target.getCenter())} style={{ width: "100%", maxHeight: 500, borderRadius: 10 }}>
                <Marker latitude={lat} longitude={lng} />
                <LocationSearch position="top-left" popup={false} marker={false} showResultMarkers={false} />
            </MapView>
        </View>
    );
}

export default LocationPicker;
