import { faCar, faMapPin } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoAmount from "../components/NoAmount";
import { useEffect, useState } from "react";
import { fetchNui } from "../utils/fetchNui";
import Spinner from "../components/Spinner";

interface VehProps {
  brand: string;
  fullname: string;
  garage: string;
  model: string;
  plate: string;
  state: string;
}

function Vehicles() {
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Array<VehProps>>([]);

  useEffect(() => {
    setLoading(true);
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    //   {
    //     brand: "Brand",
    //     fullname: "fullname",
    //     garage: "garage",
    //     model: "model",
    //     plate: "plate",
    //     state: "out",
    //   },
    // ]);
    fetchNui<Array<VehProps>>("SetupGarageVehicles").then((vehicles) => {
      if (vehicles) {
        setVehicles(vehicles);
      } else {
        setVehicles([]);
      }
      setLoading(false);
    });
  }, []);

  const trackVehicle = (plate: string) => {
    fetchNui("trackVehicle", plate);
  };

  return (
    <div className="page bg-gradient-to-br from-indigo-400 to-blue-500 overflow-y-auto h-full">
      <Spinner open={loading} />

      {!loading && (
        <>
          {vehicles.length ? (
            <>
              {vehicles.map((veh) => (
                <div className="bg-black/40 text-white p-3 rounded-md flex items-center gap-2 relative group mt-2">
                  <div className="min-w-10 min-h-10 w-10 h-10 bg-secondary-700 rounded-full p-2 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCar} size="lg" />
                  </div>
                  <div className="relative w-full">
                    <div className="flex flex-col justify-center overflow-hidden whitespace-nowrap">
                      <div className="flex gap-2 text-sm text-ellipsis overflow-hidden pointer-events-none">
                        <p>{veh.model}</p>
                        <p>{veh.plate}</p>
                      </div>
                      <p className="text-xs text-white/80 overflow-hidden pointer-events-none text-ellipsis">
                        {veh.garage}
                      </p>
                      <p className="text-xs text-white/80 overflow-hidden pointer-events-none text-ellipsis">
                        {veh.state}
                      </p>
                    </div>
                    <div className="absolute flex opacity-0 gap-2 group-hover:opacity-100 transition-all ease-in-out duration-100 right-0 top-0">
                      <FontAwesomeIcon
                        icon={faMapPin}
                        size="sm"
                        className="text-white cursor-pointer"
                        onClick={() => trackVehicle(veh.plate)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <NoAmount name="vehicles" />
          )}
        </>
      )}
    </div>
  );
}

export default Vehicles;
