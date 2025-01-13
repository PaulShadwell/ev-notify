import { ChargingStation } from '../../types/chargingStation';

const OCM_API_KEY = import.meta.env.VITE_OCM_API_KEY;
const BASE_URL = 'https://api.openchargemap.io/v3';

export async function fetchNearbyStations(
  latitude: number,
  longitude: number,
  radius: number = 20,
  useKilometers: boolean = true
): Promise<ChargingStation[]> {
  if (!OCM_API_KEY) {
    throw new Error('OpenChargeMap API key is not configured');
  }

  try {
    const url = new URL(`${BASE_URL}/poi/`);
    const params = {
      key: OCM_API_KEY,
      output: 'json',
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      distance: radius.toString(),
      distanceunit: useKilometers ? 'km' : 'miles',
      maxresults: '100',
      verbose: 'false',
      includecomments: 'false',
      compact: 'false'
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from API');
    }

    return data.map((station: any): ChargingStation => {
      const connections = station.Connections || [];
      
      const connectorDetails = connections.map((conn: any) => {
        const connType = conn.ConnectionType || {};
        return {
          type: connType.Title || connType.FormalName || 'Unknown',
          status: conn.StatusType?.Title || 'Unknown',
          level: conn.Level?.Title || 'Unknown',
          powerKW: conn.PowerKW || null,
          currentType: conn.CurrentType?.Title || 'Unknown',
          quantity: conn.Quantity || 1
        };
      });

      const connectorTypes = Array.from(new Set(
        connectorDetails.map(conn => conn.type)
      ));

      const totalConnectors = connectorDetails.reduce((sum, conn) => sum + conn.quantity, 0);
      const maxPower = Math.max(...connectorDetails.map(conn => conn.powerKW || 0));

      return {
        id: station.ID?.toString() || '',
        name: station.AddressInfo?.Title || 'Unknown Location',
        latitude: station.AddressInfo?.Latitude || latitude,
        longitude: station.AddressInfo?.Longitude || longitude,
        address: station.AddressInfo ? 
          [
            station.AddressInfo.AddressLine1,
            station.AddressInfo.Town,
            station.AddressInfo.StateOrProvince
          ].filter(Boolean).join(', ') : 
          'Address unavailable',
        connectorTypes,
        connectorDetails,
        available: station.StatusType?.IsOperational ?? true,
        operator: station.OperatorInfo?.Title || 'Unknown',
        powerKW: maxPower || null,
        priceDescription: station.UsageCost || 'Contact operator for pricing',
        lastVerified: station.DateLastVerified || new Date().toISOString(),
        numberOfConnectors: totalConnectors
      };
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch charging stations: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching charging stations');
  }
}