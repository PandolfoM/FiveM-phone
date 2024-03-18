import { faHouse, faMapPin } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoAmount from "../components/NoAmount";
import { useEffect, useState } from "react";
import { fetchNui } from "../utils/fetchNui";
import Spinner from "../components/Spinner";

interface PropertyProps {
  house: string;
  coordsX: string;
  coordsY: string;
  coordsZ: string;
}

function Properties() {
  const [loading, setLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Array<PropertyProps>>([]);

  useEffect(() => {
    setLoading(true);
    fetchNui<Array<PropertyProps>>("SetupProperties").then((properties) => {
      if (properties) {
        setProperties(properties);
      } else {
        setProperties([]);
      }
      setLoading(false);
    });
  }, []);

  const locateProperty = (x: string, y: string) => {
    fetchNui("locateProperty", { x, y });
  };

  return (
    <div className="page bg-gradient-to-br from-red-700 to-red-500 overflow-y-auto h-full">
      <Spinner open={loading} />

      {!loading && (
        <>
          {properties.length ? (
            <>
              {properties.map((prop) => (
                <div className="bg-black/40 text-white p-3 rounded-md flex items-center gap-2 relative group mt-2">
                  <div className="min-w-10 min-h-10 w-10 h-10 bg-secondary-700 rounded-full p-2 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faHouse}
                      size="lg"
                    />
                  </div>
                  <div className="relative w-full">
                    <div className="flex flex-col justify-center overflow-hidden whitespace-nowrap">
                      <p className="text-xs text-white/80 overflow-hidden pointer-events-none text-ellipsis">
                        {prop.house}
                      </p>
                    </div>
                    <div className="absolute flex opacity-0 gap-2 group-hover:opacity-100 transition-all ease-in-out duration-100 right-0 top-0">
                      <FontAwesomeIcon
                        icon={faMapPin}
                        size="sm"
                        className="text-white cursor-pointer"
                        onClick={() =>
                          locateProperty(prop.coordsX, prop.coordsY)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <NoAmount name="properties" />
          )}
        </>
      )}
    </div>
  );
}

export default Properties;
