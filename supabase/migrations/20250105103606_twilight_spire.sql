/*
  # Add sample accessories data

  1. Sample Data
    - Adds initial set of EV accessories with descriptions and images
    - Categories include: Charging, Protection, Storage, Electronics
*/

INSERT INTO accessories (name, description, image_url, category) VALUES
  (
    'Fast Charging Adapter',
    'Universal fast charging adapter compatible with multiple EV brands. Supports up to 150kW charging speed.',
    'https://images.unsplash.com/photo-1697493714914-5b1e7049750a',
    'Charging'
  ),
  (
    'All-Weather Floor Mats',
    'Custom-fit all-weather floor mats with raised edges to protect your vehicle interior.',
    'https://images.unsplash.com/photo-1621259182978-fbf93132d53d',
    'Protection'
  ),
  (
    'Trunk Organizer',
    'Collapsible trunk organizer with multiple compartments and charging cable storage.',
    'https://images.unsplash.com/photo-1513334856095-eb02ee78707d',
    'Storage'
  ),
  (
    'Wireless Phone Charger',
    'Dashboard-mounted wireless phone charger with auto-clamping and 15W fast charging.',
    'https://images.unsplash.com/photo-1662947995689-ec5165848564',
    'Electronics'
  ),
  (
    'Portable Tire Inflator',
    'Compact electric tire inflator with digital pressure gauge and LED light.',
    'https://images.unsplash.com/photo-1635773054019-43c527ef6b1a',
    'Protection'
  );