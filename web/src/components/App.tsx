import React, { useContext } from "react";
import { AppContext, Page } from "../context/appContext";
import { debugData } from "../utils/debugData";
import Phone from "./Phone";
import Home from "../pages/Home";
import Calls from "../pages/Calls";
import Contacts from "../pages/Contacts";
import Settings from "../pages/Settings";
import Messages from "../pages/Messages";
import Vehicles from "../pages/Vehicles";
import Properties from "../pages/Properties";
import Wallet from "../pages/Wallet";
import Directory from "../pages/Directory";
import Calculator from "../pages/Calculator";
import CityHall from "../pages/CityHall";
import Twinsta from "../pages/Twinsta";

// This will set the NUI to visible if we are
// developing in browser
debugData([
  {
    action: "setVisible",
    data: true,
  },
]);

const App: React.FC = () => {
  const currentPage: Page = useContext(AppContext).page;
  return (
    <div className="flex justify-end items-end h-full pr-1 pb-1">
      <Phone>
        {currentPage === Page.Home && <Home />}
        {currentPage === Page.Settings && <Settings />}
        {currentPage === Page.Contacts && <Contacts />}
        {currentPage === Page.Calls && <Calls />}
        {currentPage === Page.Messages && <Messages />}
        {currentPage === Page.Property && <Properties />}
        {currentPage === Page.Vehicles && <Vehicles />}
        {currentPage === Page.Wallet && <Wallet />}
        {currentPage === Page.Directory && <Directory />}
        {currentPage === Page.Calculator && <Calculator />}
        {currentPage === Page.CityHall && <CityHall />}
        {currentPage === Page.Twinsta && <Twinsta />}
      </Phone>
    </div>
  );
};

export default App;
