import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import logo from './map-marker-svgrepo-com.svg'; // Assuming you have an SVG for the marker icon
import L from 'leaflet';

const customMarkerIcon = L.icon({
  iconUrl: logo,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const socket = io('http://localhost:1000'); // Replace with your Socket.IO server URL

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

function App() {
  const [location, setLocation] = useState([0, 0]);
  const [userPositions, setUserPositions] = useState({});

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);
          socket.emit('sendLocation', { latitude, longitude }); // Emit location data
        },
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout for better stability
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  useEffect(() => {
    socket.on('receiveLocation', (data) => {
      console.log(data);
      setUserPositions((prevUserPositions) => ({
        ...prevUserPositions,
        [data.id]: { latitude: data.latitude, longitude: data.longitude },
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
    });

    return () => {
      socket.off('receiveLocation');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div style={{ height: '100vh' }}>
      <MapContainer center={location} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <ChangeMapView coords={location} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(userPositions).map(([id, pos]) => (
          <Marker key={id} position={[pos.latitude, pos.longitude]} icon={customMarkerIcon}>
            <Popup>
              User {id}: {pos.latitude}, {pos.longitude}
            </Popup>
          </Marker>
        ))}
        <Marker position={location} icon={customMarkerIcon}>
          <Popup>
            Your location: {location[0]}, {location[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;
