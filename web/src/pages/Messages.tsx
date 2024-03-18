import {
  faCaretLeft,
  faCaretRight,
  faMagnifyingGlass,
  faPaperPlane,
  faPhone,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "../components/Modal";
import { fetchNui } from "../utils/fetchNui";
import { ChatData, MessagesI, PhoneContext } from "../context/phoneContext";
import { AppContext } from "../context/appContext";
import {
  FormatMessageTime,
  GetCurrentDateKey,
  formatPhoneNumber,
} from "../utils/utils";
import Autocomplete from "../components/Autocomplete";
import { useNuiEvent } from "../hooks/useNuiEvent";
import NoAmount from "../components/NoAmount";
import Search from "../components/Search";

function Messages() {
  const messagesRef = useRef<HTMLDivElement>(null);
  const { chats, contacts, cid } = useContext(PhoneContext);
  const { setContact, setNoti, noti } = useContext(AppContext);
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<"messages" | "chat">("messages");
  const [contactNames, setContactNames] = useState<
    Array<{ name: string; number: string }>
  >([]);
  const [input, setInput] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<ChatData>({
    name: "",
    number: "",
    messages: [
      {
        date: "",
        messages: [{ data: [], message: "", sender: "", time: "", type: "" }],
      },
    ],
  });

  useNuiEvent("updateSelectedChat", (data: ChatData) => {
    const updatedContact = { ...selectedContact };
    updatedContact.messages = data.messages;
    setSelectedContact(updatedContact);
  });

  useNuiEvent("startNewMessage", (data: { name: string; number: string }) => {
    const contact = contactNames.find((obj) => obj.name === data.name);
    if (contact) {
      setSelectedContact({
        name: contact.name,
        number: contact.number,
        messages: [],
      });
      setPage("chat");
    } else {
      fetchNui("GetProfilePicture", input).then(() => {
        setSelectedContact({
          name: "",
          number: data.number,
          messages: [],
        });
        setPage("chat");
      });
    }
  });

  useEffect(() => {
    if (page === "chat") {
      scrollToBottom();
    }
  }, [page, selectedContact]);

  useEffect(() => {
    const arr: { name: string; number: string }[] = [{ name: "", number: "" }];
    contacts.map((contact) => {
      arr.push({ name: contact.name, number: contact.number });
    });
    setContactNames(arr);
  }, [contacts]);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const fetchSendMsg = () => {
    const newMsg: MessagesI = {
      date: GetCurrentDateKey(),
      messages: [
        {
          data: [],
          message: message,
          sender: cid?.toString() as string,
          time: FormatMessageTime(),
          type: "message",
        },
      ],
    };
    const updatedContact = { ...selectedContact };
    updatedContact.messages.push(newMsg);
    setSelectedContact(updatedContact);

    fetchNui("SendMessage", {
      ChatNumber: selectedContact.number,
      ChatDate: GetCurrentDateKey(),
      ChatMessage: message,
      ChatTime: FormatMessageTime(),
      ChatType: "message",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextAreaHeight(e.target);
  };

  const adjustTextAreaHeight = (e: HTMLTextAreaElement) => {
    e.style.height = "auto";
    e.style.height = `${e.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (message.trim() !== "") {
        e.preventDefault();
        fetchSendMsg();
        setMessage("");
      }
    }
  };

  const newMessage = () => {
    const contact = contactNames.find((obj) => obj.name === input);
    if (contact) {
      setSelectedContact({
        name: contact.name,
        number: contact.number,
        messages: [],
      });
      setPage("chat");
      setInput("");
    } else {
      fetchNui("GetProfilePicture", input).then((data) => {
        setSelectedContact({
          name: "",
          number: input,
          messages: [],
        });
        setPage("chat");
        setInput("");
      });
    }
  };

  const callNumber = (number: string) => {
    fetchNui("callNumber", number).then(() => {
      setNoti({ ...noti, open: true, type: "call" });
    });
  };

  const getLatestMsg = (chat: ChatData) => {
    const length = chat.messages.length - 1;
    const length2 = chat.messages[length].messages.length - 1;
    return chat.messages[length].messages[length2].message;
  };

  return (
    <>
      <Modal open={open}>
        <>
          <Autocomplete
            suggestions={contactNames}
            input={input}
            placeholder="Name or number"
            setInput={setInput}
          />
          <div className="flex justify-between mt-7">
            <button
              onClick={() => {
                setOpen(false);
              }}
              className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
              Cancel
            </button>
            <button
              onClick={() => {
                setOpen(false);
                newMessage();
              }}
              className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
              Confirm
            </button>
          </div>
        </>
      </Modal>

      {/* Chat Page */}
      <div
        className={`page bg-gradient-to-br from-emerald-600 to-cyan-600 flex-col justify-between pb-6 h-full ${
          page === "chat" ? "flex" : "hidden"
        }`}>
        <div className="bg-black/20 text-white text-sm py-2 px-5 rounded-md flex flex-col gap-1">
          <div className="flex justify-between items-center overflow-hidden w-full gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <FontAwesomeIcon
                icon={faCaretLeft}
                size="xl"
                className="text-white cursor-pointer"
                onClick={() => {
                  setPage("messages");
                }}
              />
              <div>
                <p className="capitalize whitespace-nowrap text-ellipsis overflow-hidden">
                  {selectedContact.name}
                </p>
                <p className="text-xs text-white/60">
                  {formatPhoneNumber(selectedContact.number)}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <FontAwesomeIcon
                icon={faPhone}
                size="lg"
                className="text-white cursor-pointer"
                onClick={() => {
                  callNumber(selectedContact.number);
                  setContact({
                    name: selectedContact.name,
                    number: selectedContact.number,
                  });
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <div
            ref={messagesRef}
            className="text-white my-3 overflow-y-auto w-full justify-end h-full">
            <>
              {selectedContact.messages.map((day) => (
                <>
                  {day.messages.map((msg) => (
                    <div
                      className={`flex items-center mt-1 ${
                        cid === msg.sender
                          ? "ml-10 justify-end"
                          : "mr-10 justify-start"
                      }`}>
                      <p
                        className={`w-fit py-2 px-3 rounded-md text-left ${
                          cid === msg.sender
                            ? "bg-primary-500/80"
                            : "bg-background-900/80"
                        }`}>
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </>
              ))}
            </>
          </div>

          <div className="flex gap-2 items-end mb-12">
            <textarea
              placeholder="Message..."
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none h-fit border-none outline-none rounded-md bg-black/40 text-white p-1 max-h-24 overflow-y-auto"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            />
            <button
              className="bg-primary-500 p-3 text-white rounded-full"
              onClick={() => {
                if (message.trim() !== "") {
                  fetchSendMsg();
                  setMessage("");
                }
              }}>
              <FontAwesomeIcon icon={faPaperPlane} size="lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Page */}
      <div
        className={`page bg-gradient-to-br from-emerald-600 to-cyan-600 ${
          page === "messages" ? "block" : "hidden"
        }`}>
        <Search
          value={search}
          setValue={setSearch}
          onClick={() => setOpen(true)}
          addIcon={faUserPlus}
        />
        <div className="overflow-y-auto h-full pb-12">
          {chats.length === 0 ? (
            <NoAmount name="messages" />
          ) : (
            <>
              {chats.map((chat) => (
                <div
                  className="bg-black/20 text-white text-sm py-2 px-5 rounded-md flex flex-col gap-1 cursor-pointer"
                  onClick={() => {
                    setPage("chat");
                    setSelectedContact(chat);
                  }}>
                  <div className="flex justify-between items-center overflow-hidden w-full gap-4">
                    <div className="flex flex-col overflow-hidden">
                      <p className="capitalize whitespace-nowrap text-ellipsis overflow-hidden pointer-events-none">
                        {chat.name}
                      </p>
                      <p className="text-xs text-white/60">
                        {getLatestMsg(chat)}
                      </p>
                    </div>
                    <div className="flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faCaretRight}
                        size="lg"
                        className="text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Messages;
