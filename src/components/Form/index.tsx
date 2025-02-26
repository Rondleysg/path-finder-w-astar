import { useEffect, useState } from "react";
import { useLocation } from "../../hooks/useLocation";
import { Location } from "../../types/types";
import { getAddressFromLatLng, getLatLngFromAddress } from "../../services/map-service";
import Input from "../Input";
import hasStartingPoint from "../../helpers/hasStartingPoint";
import "./index.scss";

interface FormProps {
  map: google.maps.Map | null;
}

const Form = ({ map }: FormProps) => {
  const { startingPoint, addLocation, addStartingPoint } = useLocation();
  const [settingStartingPoint, setSettingStartingPoint] = useState<boolean>(true);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postCode, setPostCode] = useState("");
  const [country, setCountry] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");
  const title = settingStartingPoint ? "Set starting point" : "Add point to route";
  const description = settingStartingPoint
    ? "Fill in the information below with the address to add the starting point of the route"
    : "Fill in the information below with the address to add a point where the route should pass";

  useEffect(() => {
    setSettingStartingPoint(!hasStartingPoint(startingPoint));

    if (map) {
      map.addListener("click", async function (event: google.maps.MapMouseEvent) {
        if (event.latLng) {
          const address = await getAddressFromLatLng({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });

          if (typeof address === "string") {
            setErrorMessage(address);
            return;
          }

          setStreetAddress(
            `${address.address_components[1].long_name}, ${address.address_components[0].long_name}`
          );
          setCity(address.address_components[2].long_name);
          setState(address.address_components[4].long_name);
          setCountry(address.address_components[5].long_name);
          setPostCode(address.address_components[6].long_name);
          setErrorMessage("");
          setSuccessMessage("Address loaded by click on the map");
        }
      });
    }
  }, [startingPoint, map]);

  const clearForm = () => {
    setErrorMessage("");
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fullAddress = `${streetAddress}, ${city}, ${state}, ${postCode}, ${country}`;
    const latlng = await getLatLngFromAddress(fullAddress);

    if (typeof latlng === "string") {
      setErrorMessage(latlng);
      return;
    }

    const newLocation: Location = {
      endName: fullAddress,
      streetAddress,
      city,
      state,
      postCode,
      country,
      latlng,
    };

    (settingStartingPoint ? addStartingPoint : addLocation)(newLocation);

    setSuccessMessage("Address added successfully!");
    clearForm();
  };

  return (
    <div className="form-container">

      <div className="form-titles">
        <h1>{title}</h1>
        <p>{description}</p>
        {!settingStartingPoint && (
          <p className="info-message">You can fill the information of form clicking on the map!</p>
        )}
      </div>

      <form className="form" onSubmit={handleFormSubmit}>
        <Input
          name="address"
          label="Street address"
          required
          placeholder="Example: Av. João Alves Filho, CENTRO"
          onChange={(e) => setStreetAddress(e.target.value)}
          value={streetAddress}
          type="text"
        />
        <Input
          name="city"
          label="City"
          required
          placeholder="Example: Tobias Barreto"
          onChange={(e) => setCity(e.target.value)}
          value={city}
          type="text"
        />
        <Input
          name="state"
          label="State"
          required
          placeholder="Example: Sergipe"
          onChange={(e) => setState(e.target.value)}
          value={state}
          type="text"
        />
        <Input
          name="postCode"
          label="Postcode"
          required
          placeholder="Example: 49300-000"
          onChange={(e) => setPostCode(e.target.value)}
          value={postCode}
          type="text"
        />
        <Input
          name="country"
          label="Country"
          required
          placeholder="Example: Brasil"
          onChange={(e) => setCountry(e.target.value)}
          value={country}
          type="text"
        />
        
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="d-flex justify-center">
          <button className="form-submit-btn" type="submit">
            {title}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Form;
