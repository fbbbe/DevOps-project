import React, { createContext, useMemo, useState } from 'react';

const defaultValue = {
  user: null,
  setUser: () => {},
  favorites: [],
  toggleFavorite: () => {},
};

export const AppContext = createContext(defaultValue);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      favorites,
      toggleFavorite: (id) => {
        setFavorites((prev) =>
          prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
      },
    }),
    [user, favorites]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
