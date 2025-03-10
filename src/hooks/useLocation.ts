import { useContext } from "react";
import { LocationContext, LocationContextProps } from "../contexts/LocationContext";

export const useLocation = (): LocationContextProps => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
