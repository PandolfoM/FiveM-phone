import {
  IconDefinition,
  faBank,
  faCamera,
  faCheck,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useState,
} from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";

export enum Page {
  Home = "home",
  Settings = "settings",
  Contacts = "contacts",
  Calls = "calls",
  Messages = "messages",
  Wallet = "wallet",
  Directory = "directory",
  Calculator = "calculator",
  CityHall = "cityhall",
  Documents = "documents",
  Property = "property",
  Twinsta = "twinsta",
  Vehicles = "vehicles",
}

interface NotiProps {
  open: boolean;
  header: string;
  subheader?: string;
  icon: IconDefinition;
  iconBg: string;
  type: "call" | "noti";
  buttons?: boolean;
  accept?: string;
  decline?: string;
  props?: object;
  timeout?: number;
}

interface ContactProps {
  name: string;
  number: string;
}

interface AppContext {
  page: Page;
  setPage: Dispatch<SetStateAction<Page>>;
  islandOpen: boolean;
  setIslandOpen: Dispatch<SetStateAction<boolean>>;
  contact: ContactProps;
  setContact: Dispatch<SetStateAction<ContactProps>>;
  noti: NotiProps;
  setNoti: Dispatch<SetStateAction<NotiProps>>;
}

export const AppContext = createContext<AppContext>({
  page: Page.Home,
  setPage: () => {},
  islandOpen: false,
  setIslandOpen: () => {},
  contact: { name: "", number: "" },
  setContact: () => {},
  noti: {
    open: false,
    icon: faCheck,
    iconBg: "bg-green",
    header: "Saved!",
    subheader: "",
    type: "noti",
    buttons: false,
    timeout: 2000,
  },
  setNoti: () => {},
});

function AppContextProvider(props: React.PropsWithChildren) {
  const [page, setPage] = useState<Page>(Page.Home);
  const [islandOpen, setIslandOpen] = useState<boolean>(false);
  const [contact, setContact] = useState<ContactProps>({
    name: "",
    number: "",
  });
  const [noti, setNoti] = useState<NotiProps>({
    open: false,
    icon: faCheck,
    iconBg: "bg-green",
    header: "Saved!",
    type: "noti",
    timeout: 2000,
  });

  useNuiEvent(
    "SetNoti",
    (data: {
      open: boolean;
      icon: string;
      iconBg: string;
      header: string;
      subheader: string;
      name: string;
      type: "noti" | "call";
      buttons?: boolean;
      accept?: string;
      decline?: string;
      props?: object;
      timeout?: number;
    }) => {
      setNoti({
        open: data.open,
        icon:
          data.icon === "phone"
            ? faPhone
            : data.icon === "bank"
            ? faBank
            : data.icon === "bank"
            ? faCamera
            : faPhone,
        iconBg: data.iconBg,
        header: data.header,
        subheader: data.subheader,
        type: data.type,
        buttons: data.buttons,
        accept: data.accept,
        props: data.props,
        decline: data.decline,
      });
      if (data.timeout) {
        setTimeout(() => {
          setNoti({ ...noti, open: false });
        }, data.timeout);
      }
    }
  );

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        islandOpen,
        setIslandOpen,
        contact,
        setContact,
        noti,
        setNoti,
      }}>
      {props.children}
    </AppContext.Provider>
  );
}

export default AppContextProvider;
