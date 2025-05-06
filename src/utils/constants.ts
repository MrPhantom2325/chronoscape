// Game region definitions
export const REGIONS = [
  { id: 'region1', x: 10, y: 10, width: 25, height: 20 },
  { id: 'region2', x: 40, y: 10, width: 25, height: 20 },
  { id: 'region3', x: 70, y: 10, width: 25, height: 20 },
  { id: 'region4', x: 53, y: 10, width: 25, height: 20 },
  { id: 'region5', x: 40, y: 40, width: 25, height: 20 },
  { id: 'region6', x: 70, y: 40, width: 25, height: 20 },
  { id: 'region7', x: 25, y: 70, width: 25, height: 20 },

];

// Hover-to-Reveal Zones (Gravitational Zones)
export const HOVER_ZONES = [
  { 
    id: 'mercury', 
    region: 'region1',
    x: 15, 
    y: 15, 
    width: 10, 
    height: 10, 
    tooltip: 'Mercury', 
    sequence: 0 
  },
  { 
    id: 'venus', 
    region: 'region1',
    x: 30, 
    y: 15, 
    width: 10, 
    height: 10, 
    tooltip: 'Venus', 
    sequence: 1 
  },
  { 
    id: 'earth', 
    region: 'region1',
    x: 45, 
    y: 15, 
    width: 10, 
    height: 10, 
    tooltip: 'Earth', 
    sequence: 2 
  },
  { 
    id: 'mars', 
    region: 'region2',
    x: 15, 
    y: 45, 
    width: 10, 
    height: 10, 
    tooltip: 'Mars', 
    sequence: 3
  },
  { 
    id: 'jupiter', 
    region: 'region2',
    x: 30, 
    y: 45, 
    width: 10, 
    height: 10, 
    tooltip: 'Jupiter', 
    sequence: 4
  },
  { 
    id: 'saturn', 
    region: 'region3',
    x: 75, 
    y: 15, 
    width: 10, 
    height: 10, 
    tooltip: 'Saturn', 
    sequence: 5
  },
  { 
    id: 'uranus', 
    region: 'region3',
    x: 90, 
    y: 15, 
    width: 10, 
    height: 10, 
    tooltip: 'Uranus', 
    sequence: 6
  },
];

// Slow-Hover Ink Zones
export const INK_ZONES = [
  { 
    id: 'ink1', 
    region: 'region4',
    x: 60, 
    y: 15, 
    width: 15, 
    height: 10, 
    message: 'The hunter watches from', 
    //hoverDuration: 0
  },
  { 
    id: 'ink2', 
    region: 'region5',
    x: 45, 
    y: 45, 
    width: 15, 
    height: 10, 
    message: 'Belt of three stars', 
    //hoverDuration: 0 
  },
];

// Lens-uncoverable regions
export const LENS_ZONES = [
  {
    id: 'lens1',
    region: 'region6',
    x: 75,
    y: 45,
    width: 15,
    height: 10,
    requiredLens: 'default',
    message: 'Ancient constellation...'
  },
  {
    id: 'lens2',
    region: 'region7',
    x: 30,
    y: 75,
    width: 15,
    height: 10,
    requiredLens: 'uv',
    message: 'Named after the mythical hunter'
  },
  
];

// Final answer for the text challenge
export const TEXT_CHALLENGE_ANSWER = 'ORION';