export interface ConnectorDetail {
  type: string;
  status: string;
  level: string;
  powerKW: number | null;
  currentType: string;
  quantity: number;
}

export interface ChargingStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  connectorTypes: string[];
  connectorDetails: ConnectorDetail[];
  available: boolean;
  operator: string;
  powerKW: number | null;
  priceDescription: string;
  lastVerified: string;
  numberOfConnectors: number;
}