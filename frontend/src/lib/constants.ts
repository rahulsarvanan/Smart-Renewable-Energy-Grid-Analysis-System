// Rajasthan Geography & Grid Constants
export const RAJASTHAN_CITIES = [
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, solar_capacity_kw: 2500, wind_capacity_kw: 1500, base_load_kw: 4500 },
  { name: 'Jodhpur', lat: 26.2389, lon: 73.0243, solar_capacity_kw: 5000, wind_capacity_kw: 2000, base_load_kw: 3800 },
  { name: 'Jaisalmer', lat: 26.9157, lon: 70.9083, solar_capacity_kw: 8000, wind_capacity_kw: 4000, base_load_kw: 1200 },
  { name: 'Bikaner', lat: 28.0229, lon: 73.3119, solar_capacity_kw: 6000, wind_capacity_kw: 1000, base_load_kw: 1800 },
  { name: 'Barmer', lat: 25.7532, lon: 71.3917, solar_capacity_kw: 4000, wind_capacity_kw: 4500, base_load_kw: 1500 },
  { name: 'Kota', lat: 25.2138, lon: 75.8648, solar_capacity_kw: 1000, wind_capacity_kw: 500, base_load_kw: 3500 },
  { name: 'Ajmer', lat: 26.4499, lon: 74.6399, solar_capacity_kw: 1500, wind_capacity_kw: 800, base_load_kw: 2500 },
  { name: 'Udaipur', lat: 24.5854, lon: 73.7125, solar_capacity_kw: 2000, wind_capacity_kw: 1200, base_load_kw: 2200 },
];

export const TOTAL_STATE_SOLAR_CAPACITY = RAJASTHAN_CITIES.reduce((acc, city) => acc + city.solar_capacity_kw, 0);
export const TOTAL_STATE_WIND_CAPACITY = RAJASTHAN_CITIES.reduce((acc, city) => acc + city.wind_capacity_kw, 0);

export const BESS_CONFIG = {
  capacity_kwh: 50000, // Total state BESS capacity
  max_charge_rate_kw: 10000,
  max_discharge_rate_kw: 10000,
  min_soc: 5, // %
  max_soc: 95, // %
};

export const PHYSICS_CONSTANTS = {
  SOLAR_EFFICIENCY: 0.20,
  WIND_CUT_IN: 3, // m/s
  WIND_RATED: 12, // m/s
  WIND_CUT_OUT: 25, // m/s
};
