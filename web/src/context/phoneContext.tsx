import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { fetchNui } from "../utils/fetchNui";

export interface ContactData {
  name: string;
  number: string;
  iban: string;
}

interface MessageData {
  message: string;
  time: string;
  sender: string;
  type: string;
  data: object;
}

export interface MessagesI {
  messages: MessageData[];
  date: string;
}

export interface ChatData {
  name: string;
  number: string;
  messages: MessagesI[];
}

export interface TweetData {
  citizenid: string;
  name: string;
  message: string;
  date: number;
}

interface PhoneContext {
  contacts: ContactData[];
  setContacts: Dispatch<SetStateAction<ContactData[]>>;
  chats: ChatData[];
  setChats: Dispatch<SetStateAction<ChatData[]>>;
  tweets: TweetData[];
  setTweets: Dispatch<SetStateAction<TweetData[]>>;
  cid: string;
  setCid: Dispatch<SetStateAction<string>>;
  background: string;
  setBackground: Dispatch<SetStateAction<string>>;
  muted: boolean;
  setMuted: Dispatch<SetStateAction<boolean>>;
  mutedNoti: boolean;
  setMutedNoti: Dispatch<SetStateAction<boolean>>;
}

export const PhoneContext = createContext<PhoneContext>({
  contacts: [],
  setContacts: () => {},
  chats: [],
  setChats: () => {},
  tweets: [],
  setTweets: () => {},
  cid: "",
  setCid: () => {},
  background: "",
  setBackground: () => {},
  muted: false,
  setMuted: () => {},
  mutedNoti: false,
  setMutedNoti: () => {},
});

function PhoneContextProvider(props: React.PropsWithChildren) {
  const [contacts, setContacts] = useState<Array<ContactData>>([]);
  const [chats, setChats] = useState<Array<ChatData>>([]);
  const [tweets, setTweets] = useState<Array<TweetData>>([]);
  const [cid, setCid] = useState<string>("");
  const [background, setBackground] = useState<string>("");
  const [muted, setMuted] = useState<boolean>(false);
  const [mutedNoti, setMutedNoti] = useState<boolean>(false);

  useEffect(() => {
    const muted = localStorage.getItem("muted");
    fetchNui("SetMuted", JSON.parse(muted as string));
  }, []);

  useNuiEvent("UpdateContacts", (data) => {
    const contactsData = data as ContactData[];
    setContacts(contactsData);
  });

  useNuiEvent("UpdateChat", (data) => {
    const chatData = data as ChatData[];
    const arr = Object.values(chatData);
    setChats(arr);
  });

  useNuiEvent("UpdateTwinsta", (data) => {
    const tweetData = data as TweetData[];
    setTweets(tweetData);
  });

  useNuiEvent("NewTwinsta", (data) => {
    const tweetData = data as TweetData;
    setTweets(prev => [{citizenid: tweetData.citizenid, date: Date.now(), message: tweetData.message, name: tweetData.name}, ...prev]);
  });

  useNuiEvent("myPhoneNumber", (data: string) => {
    localStorage.setItem("phoneNumber", data);
  });

  useNuiEvent("myCitizenid", (data: string) => {
    setCid(data);
  });

  useNuiEvent("UpdateBG", (data: string) => {
    setBackground(data);
  });

  useNuiEvent("UpdateMuted", (data: boolean) => {
    setMuted(data);
  });

  useNuiEvent("UpdateMutedNoti", (data: boolean) => {
    setMutedNoti(data);
  });

  return (
    <PhoneContext.Provider
      value={{
        contacts,
        setContacts,
        chats,
        setChats,
        tweets,
        setTweets,
        cid,
        setCid,
        background,
        setBackground,
        muted,
        setMuted,
        mutedNoti,
        setMutedNoti,
      }}>
      {props.children}
    </PhoneContext.Provider>
  );
}

export default PhoneContextProvider;
