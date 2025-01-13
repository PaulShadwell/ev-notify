import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Filter, MapPin } from 'lucide-react';
import { ChargingStation } from '../../types/chargingStation';
import { fetchNearbyStations } from '../../lib/api/openChargeMap';
import { ChargingStationFilters } from './ChargingStationFilters';
import { StationPopup } from './StationPopup';

// MapUpdater component to handle map center updates
function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

// Helper function to get station icon based on type
function getStationIcon(station: ChargingStation) {
  // Tesla-specific icon for Tesla stations
  if (station.connectorTypes.some(type => type.includes('Tesla'))) {
    return new Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }

  // Default blue icon for other stations
  return new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

export function ChargingMap() {
  const [userLocation, setUserLocation] = useState<[number, number]>([51.505, -0.09]); // Default to London
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([]);
  const [searchRadius, setSearchRadius] = useState(20);
  const [useKilometers, setUseKilometers] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Using default location.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Using default location.');
    }
  }, []);

  // Fetch stations when location or search parameters change
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        setError(null);
        const [lat, lon] = userLocation;
        const data = await fetchNearbyStations(lat, lon, searchRadius, useKilometers);
        setStations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load charging stations');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [userLocation, searchRadius, useKilometers]);

  // Filter stations based on selected connector types
  const filteredStations = selectedConnectors.length > 0
    ? stations.filter(station =>
        station.connectorTypes.some(type =>
          selectedConnectors.includes(type)
        )
      )
    : stations;

  // Handle favorite toggling
  const toggleFavorite = (stationId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(stationId)) {
        newFavorites.delete(stationId);
      } else {
        newFavorites.add(stationId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Filters Panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 w-full"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
        
        {showFilters && (
          <div className="mt-4">
            <ChargingStationFilters
              stations={stations}
              selectedConnectors={selectedConnectors}
              onFilterChange={setSelectedConnectors}
              searchRadius={searchRadius}
              onRadiusChange={setSearchRadius}
              useKilometers={useKilometers}
              onUnitChange={setUseKilometers}
            />
          </div>
        )}
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="absolute top-16 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
          Loading charging stations...
        </div>
      )}
      
      {error && (
        <div className="absolute top-16 right-4 z-[1000] bg-red-50 text-red-700 rounded-lg shadow-lg p-4">
          {error}
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={userLocation}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={userLocation} />

        {/* User Location Marker */}
        <Marker
          position={userLocation}
          icon={new Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })}
        >
          <Popup>You are here</Popup>
        </Marker>

        {/* Station Markers */}
        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={getStationIcon(station)}
          >
            <Popup>
              <StationPopup
                station={station}
                isFavorite={favorites.has(station.id)}
                onToggleFavorite={() => toggleFavorite(station.id)}
                userLocation={userLocation}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}