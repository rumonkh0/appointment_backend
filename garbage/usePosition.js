import { useState, useEffect } from "react";

export const usePosition = () => {
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);

  const onChange = ({ coords }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  const onError = (err) => {
    setError(err.message);
  };

  useEffect(() => {
    const geo = navigator.geolocation;

    if (!geo) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Get current position
    const watcher = geo.watchPosition(onChange, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    // Clean up
    return () => geo.clearWatch(watcher);
  }, []);

  return { ...position, error };
};
