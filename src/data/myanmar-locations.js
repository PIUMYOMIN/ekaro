/**
 * Myanmar Locations - Export for easy import in React components
 * Use: import { getMyanmarStates } from './myanmar-locations'
 */
 
export const getMyanmarStates = (language = 'en') => {
  if (language === 'mm' || language.startsWith('my')) {
    return require('./myanmar-locations-mm.json');
  }
  return require('./myanmar-locations-eng.json');
};

export const getStatesFromDB = (db) => {
  const stateMap = {};
  db.flats.regions_states.forEach(region => {
    const loc = db.locations.find(l => l.region_state === region);
    if (loc) {
      stateMap[loc.region_state] = loc.cities.map(c => c.city);
    }
  });
  return Object.entries(stateMap).map(([state, cities]) => ({ state, cities }));
};

export const FALLBACK_STATES_EN = getStatesFromDB(require('./myanmar-locations-eng.json'));
export const FALLBACK_STATES_MM = getStatesFromDB(require('./myanmar-locations-mm.json'));

// Default export for backward compatibility
export default getMyanmarStates;

