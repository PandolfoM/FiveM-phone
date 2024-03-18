import {
  faCog,
  faUser,
  faPhone,
  faMessage,
  faDollarSign,
  faCompass,
  faCalculator,
  faScaleBalanced,
  faFolderOpen,
  faHouse,
  faCamera,
  faCar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { AppContext, Page } from "../context/appContext";

const apps = [
  {
    id: "settings",
    name: "Settings",
    icon: faCog,
    color: "from-pink-500 to-purple-700",
  },
  {
    id: "contacts",
    name: "Contacts",
    icon: faUser,
    color: "from-orange-700 to-yellow-600",
  },
  {
    id: "calls",
    name: "Calls",
    icon: faPhone,
    color: "from-emerald-600 to-yellow-400",
  },
  {
    id: "messages",
    name: "Messages",
    icon: faMessage,
    color: "from-emerald-600 to-cyan-600",
  },
  {
    id: "wallet",
    name: "Wallet",
    icon: faDollarSign,
    color: "from-cyan-600 to-emerald-600",
  },
  {
    id: "directory",
    name: "Directory",
    icon: faCompass,
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "calculator",
    name: "Calculator",
    icon: faCalculator,
    color: "from-amber-500 to-red-500",
  },
  {
    id: "cityhall",
    name: "City Hall",
    icon: faScaleBalanced,
    color: "from-purple-500 to-pink-700",
  },
  // {
  //   id: "documents",
  //   name: "Documents",
  //   icon: faFolderOpen,
  //   color: "from-amber-300 to-orange-400",
  // },
  {
    id: "property",
    name: "Property",
    icon: faHouse,
    color: "from-red-700 to-red-500",
  },
  {
    id: "twinsta",
    name: "Twinsta",
    icon: faCamera,
    color: "from-fuchsia-500 to-red-500",
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: faCar,
    color: "from-indigo-400 to-blue-500",
  },
];


function Home() {
  const { setPage } = useContext(AppContext);
  return (
    <div className="page gap-7 grid grid-cols-4 auto-rows-max justify-items-center">
      {apps.map((app) => (
        <div className="flex flex-col gap-1 cursor-pointer" key={app.id} onClick={() => (setPage(app.id as Page))}>
          <div
            className={`bg-gradient-to-br rounded-xl h-12 w-12 3xl:h-14 3xl:w-14 flex items-center justify-center ${app.color}`}>
            <FontAwesomeIcon
              icon={app.icon}
              size="xl"
              className="text-white opacity-80"
            />
          </div>
          <p className="text-white text-[0.6rem] text-center tracking-wide font-medium">
            {app.name}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Home;
