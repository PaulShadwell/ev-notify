import React from 'react';
import { Filter } from 'lucide-react';
import { ChargingStation } from '../../types/chargingStation';

interface ChargingStationFiltersProps {
  stations: ChargingStation[];
  selectedConnectors: string[];
  onFilterChange: (connectors: string[]) => void;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
  useKilometers: boolean;
  onUnitChange: (useKm: boolean) => void;
}

export function ChargingStationFilters({
  stations,
  selectedConnectors,
  onFilterChange,
  searchRadius,
  onRadiusChange,
  useKilometers,
  onUnitChange,
}: ChargingStationFiltersProps) {
  // Get unique connector types from all stations
  const connectorTypes = Array.from(
    new Set(stations.flatMap(station => station.connectorTypes))
  ).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium">Filters</h3>
        </div>
      </div>

      {/* Distance Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Search Radius: {searchRadius} {useKilometers ? 'km' : 'miles'}
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={searchRadius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={useKilometers}
              onChange={() => onUnitChange(true)}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-sm">Kilometers</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              checked={!useKilometers}
              onChange={() => onUnitChange(false)}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-sm">Miles</span>
          </label>
        </div>
      </div>

      {/* Connector Types */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Connector Types</h4>
        {connectorTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`connector-${type}`}
              checked={selectedConnectors.includes(type)}
              onChange={() => {
                if (selectedConnectors.includes(type)) {
                  onFilterChange(selectedConnectors.filter(t => t !== type));
                } else {
                  onFilterChange([...selectedConnectors, type]);
                }
              }}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`connector-${type}`} className="text-sm">
              {type}
            </label>
          </div>
        ))}
      </div>

      {selectedConnectors.length > 0 && (
        <button
          onClick={() => onFilterChange([])}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}