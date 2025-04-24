import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePosition } from "../hooks/usePosition"; // Custom hook for getting user position

const NearbyHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(5);
  const { latitude, longitude, error: positionError } = usePosition();

  useEffect(() => {
    const fetchNearbyHospitals = async () => {
      if (latitude && longitude) {
        try {
          setLoading(true);
          const res = await axios.get(
            `/api/v1/hospitals/distance?longitude=${longitude}&latitude=${latitude}&maxDistance=${
              radius * 1000
            }`
          );
          setHospitals(res.data.data);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch nearby hospitals");
          setLoading(false);
        }
      }
    };

    fetchNearbyHospitals();
  }, [latitude, longitude, radius]);

  if (positionError) {
    return (
      <div className="alert alert-danger">
        Error getting your location: {positionError}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="nearby-hospitals">
      <h2>Hospitals Near You</h2>

      <div className="form-group mb-4">
        <label htmlFor="radius">Search Radius (km)</label>
        <input
          type="range"
          className="form-range"
          id="radius"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <span>{radius} km</span>
      </div>

      {hospitals.length === 0 ? (
        <p>No hospitals found within {radius} km.</p>
      ) : (
        <div className="row">
          {hospitals.map((hospital) => (
            <div key={hospital._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{hospital.name}</h5>
                  <p className="card-text">
                    <strong>Address:</strong> {hospital.address.street},{" "}
                    {hospital.address.city}, {hospital.address.state}
                  </p>
                  <p className="card-text">
                    <strong>Distance:</strong>{" "}
                    {hospital.distanceInKm.toFixed(1)} km (
                    {hospital.distanceInMiles.toFixed(1)} miles)
                  </p>
                  {hospital.specialty && hospital.specialty.length > 0 && (
                    <p className="card-text">
                      <strong>Specialties:</strong>{" "}
                      {hospital.specialty.join(", ")}
                    </p>
                  )}
                  <a
                    href={`/hospitals/${hospital._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyHospitals;
