import React from "react";
import ReactDOM from "react-dom/client";
import { VisibilityProvider } from "./providers/VisibilityProvider";
import App from "./components/App";
import "./index.css";
import AppContextProvider from "./context/appContext";
import PhoneContextProvider from "./context/phoneContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppContextProvider>
      <PhoneContextProvider>
        <VisibilityProvider>
          <App />
        </VisibilityProvider>
      </PhoneContextProvider>
    </AppContextProvider>
  </React.StrictMode>
);
