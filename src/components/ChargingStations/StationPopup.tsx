import React from 'react';
import { Star, StarOff, Navigation, Power, Plug } from 'lucide-react';
import { ChargingStation } from '../../types/chargingStation';

interface StationPopupProps {
  station: ChargingStation;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  userLocation: [number, number];
}

export function StationPopup({
  station,
  isFavorite,
  onToggleFavorite,
  userLocation,
}: StationPopupProps) {
  const handleGetDirections = () => {
    const [lat, lon] = userLocation;
    window.open(
      `https://www.google.com/maps/dir/${lat},${lon}/${station.latitude},${station.longitude}`,
      '_blank'
    );
  };

  return (
    <div className="p-2 min-w-[300px]">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold">{station.name}</h3>
        <button
          onClick={onToggleFavorite}
          className={`p-1 rounded-full hover:bg-gray-100 ${
            isFavorite ? 'text-yellow-500' : 'text-gray-400'
          }`}
        >
          {isFavorite ? (
            <Star className="w-5 h-5 fill-current" />
          ) : (
            <StarOff className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-1">{station.address}</p>
      
      <div className="mt-3 space-y-2">
        <div className="text-sm">
          <span className="font-medium">Operator:</span> {station.operator}
        </div>

        {/* Connectors section */}
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center mb-2">
            <Plug className="w-4 h-4 mr-1 text-blue-600" />
            <h4 className="text-sm font-medium">
              Available Connectors ({station.numberOfConnectors}):
            </h4>
          </div>
          <div className="space-y-2">
            {station.connectorDetails.map((connector, index) => (
              <div 
                key={index}
                className="text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-medium">{connector.type}</span>
                  </div>
                  <span className="text-gray-500">x{connector.quantity}</span>
                </div>
                <div className="ml-4 mt-1 text-gray-600 text-xs">
                  <div>Level: {connector.level}</div>
                  {connector.powerKW && (
                    <div className="flex items-center">
                      <Power className="w-3 h-3 mr-1" />
                      {connector.powerKW}kW ({connector.currentType})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm">
          <span className="font-medium">Pricing:</span>{' '}
          {station.priceDescription}
        </div>

        <p className="text-xs text-gray-500">
          Last verified: {new Date(station.lastVerified).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={handleGetDirections}
        className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Navigation className="w-4 h-4 mr-2" />
        Get Directions
      </button>
    </div>
  );
}