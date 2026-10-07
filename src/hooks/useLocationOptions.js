import { useEffect, useMemo, useState } from 'react';

// The country/state/city dataset is several MB, so it's loaded as its own chunk the first time
// an address form needs it rather than being bundled into every page.
let libraryPromise = null;
const loadLibrary = () => {
  if (!libraryPromise) {
    libraryPromise = import('country-state-city').catch((err) => {
      libraryPromise = null;
      throw err;
    });
  }
  return libraryPromise;
};

const byName = (items, name) =>
  name ? items.find((item) => item.name.toLowerCase() === String(name).trim().toLowerCase()) : undefined;

// Option lists for cascading Country -> State -> City dropdowns. Values are stored as plain
// names (that's what the backend keeps), so the selected country/state names are mapped back to
// ISO codes here to look up their children.
export default function useLocationOptions(countryName, stateName) {
  const [lib, setLib] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadLibrary()
      .then((mod) => {
        if (!cancelled) setLib(mod);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const countries = useMemo(() => (lib ? lib.Country.getAllCountries() : []), [lib]);
  const country = byName(countries, countryName);

  const states = useMemo(
    () => (lib && country ? lib.State.getStatesOfCountry(country.isoCode) : []),
    [lib, country]
  );
  const state = byName(states, stateName);

  const cities = useMemo(
    () => (lib && country && state ? lib.City.getCitiesOfState(country.isoCode, state.isoCode) : []),
    [lib, country, state]
  );

  // How the child field should render: 'disabled' until its parent is chosen, 'select' when the
  // dataset has options for it, and 'text' when it doesn't (a country with no states listed, or
  // an old free-typed value that isn't in the dataset) so the user can still enter something.
  const childMode = (parentName, parent, children) => {
    if (!parentName) return 'disabled';
    if (!lib) return 'select';
    return parent && children.length > 0 ? 'select' : 'text';
  };

  return {
    countries: countries.map((c) => c.name),
    states: states.map((s) => s.name),
    cities: cities.map((c) => c.name),
    stateMode: childMode(countryName, country, states),
    cityMode: childMode(stateName, state, cities),
  };
}
