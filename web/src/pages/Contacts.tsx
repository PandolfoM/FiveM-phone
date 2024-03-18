import { useContext, useState } from "react";
import Modal from "../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faPen,
  faPhone,
  faTrash,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext, Page } from "../context/appContext";
import { fetchNui } from "../utils/fetchNui";
import { ContactData, PhoneContext } from "../context/phoneContext";
import NoAmount from "../components/NoAmount";
import Search from "../components/Search";

function Contacts() {
  const { setContact, setNoti, noti, setPage } = useContext(AppContext);
  const { contacts, setContacts } = useContext(PhoneContext);
  const [modalType, setModalType] = useState<"add" | "delete" | "edit">("add");
  const [open, setOpen] = useState<boolean>(false);
  const [numberInput, setNumberInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<ContactData>({
    name: "",
    number: "",
    iban: "",
  });

  const filteredContacts = contacts.filter((contact) => {
    return contact.name.toLowerCase().includes(search.toLowerCase());
  });

  const callNumber = (number: string) => {
    fetchNui("callNumber", number).then(() => {
      setNoti({ ...noti, open: true, type: "call" });
    });
  };

  const addContact = ({ name, number, iban }: ContactData) => {
    setContacts((prev) => [...prev, { name, number, iban }]);
    fetchNui("AddNewContact", { name, number, iban });
  };

  const removeContact = ({ name, number, iban }: ContactData) => {
    setContacts((prev) =>
      prev.filter((contact) => contact.number !== selectedContact.number)
    );
    fetchNui("RemoveContact", { name, number, iban });
  };

  const editContact = ({ name, number, iban }: ContactData) => {
    setContacts((prev) =>
      prev.filter((contact) => contact.number !== selectedContact.number)
    );
    setContacts((prev) => [...prev, { name, number, iban }]);
    fetchNui("EditContact", {
      name,
      number,
      iban,
      oldName: selectedContact.name,
      oldNumber: selectedContact.number,
      oldIban: iban,
    });
  };

  const msgNumber = (player: ContactData) => {
    setPage(Page.Messages);
    fetchNui("msgNumber", player);
  };

  return (
    <>
      <Modal open={open}>
        {modalType === "delete" ? (
          <>
            <p className="text-lg font-bold">Confirm?</p>
            <p className="text-sm pb-5">
              Would you like to remove
              <br />
              <span className="text-primary-500 font-bold">
                {selectedContact.name}
              </span>
              ?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setOpen(false);
                  setNameInput("");
                  setNumberInput("");
                }}
                className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
                Cancel
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setNameInput("");
                  setNumberInput("");
                  removeContact({
                    name: selectedContact.name,
                    number: selectedContact.number,
                    iban: selectedContact.iban,
                  });
                }}
                className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              type="string"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Name"
              className="bg-secondary-700 py-2 px-2 text-sm text-white w-full rounded-md mb-7 border-none outline-none"
            />
            <input
              maxLength={10}
              type="tel"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              placeholder="Phone Number"
              className="bg-secondary-700 py-2 px-2 text-sm text-white w-full rounded-md mb-7 border-none outline-none"
            />
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setOpen(false);
                  setNameInput("");
                  setNumberInput("");
                }}
                className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70">
                Cancel
              </button>
              <button
                disabled={numberInput.length < 1 || !nameInput}
                onClick={() => {
                  setOpen(false);
                  setNameInput("");
                  setNumberInput("");
                  if (modalType === "edit") {
                    editContact({
                      name: nameInput,
                      number: numberInput,
                      iban: selectedContact.iban,
                    });
                  } else {
                    addContact({
                      name: nameInput,
                      number: numberInput,
                      iban: selectedContact.iban,
                    });
                  }
                }}
                className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70">
                {modalType === "edit" ? "Confirm" : "Submit"}
              </button>
            </div>
          </>
        )}
      </Modal>

      <div className="page bg-gradient-to-br from-orange-700 to-yellow-600">
        <Search
          value={search}
          setValue={setSearch}
          onClick={() => {
            setModalType("add");
            setOpen(true);
          }}
          addIcon={faUserPlus}
        />
        <div className="overflow-y-auto h-full pb-12">
          {filteredContacts.length === 0 ? (
            <NoAmount name="contacts" />
          ) : (
            <>
              {filteredContacts
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((contact) => (
                  <div key={contact.number} className="relative mt-2">
                    <div className="bg-black/20 text-white text-sm p-2 px-5 rounded-md flex flex-col gap-1 group">
                      <div className="flex justify-between items-center overflow-hidden w-full gap-2 relative">
                        <div className="flex flex-col overflow-hidden">
                          <p className="capitalize whitespace-nowrap text-ellipsis overflow-hidden">
                            {contact.name}
                          </p>
                          <p>{contact.number}</p>
                        </div>
                        <div className="absolute flex opacity-0 gap-2 group-hover:opacity-100 transition-all ease-in-out duration-100 right-0 top-0">
                          <FontAwesomeIcon
                            icon={faPhone}
                            size="sm"
                            className="text-white cursor-pointer"
                            onClick={() => {
                              callNumber(contact.number);
                              setContact({
                                name: contact.name,
                                number: contact.number,
                              });
                            }}
                          />
                          <FontAwesomeIcon
                            icon={faComment}
                            size="sm"
                            className="text-white cursor-pointer"
                            onClick={() => {
                              msgNumber(contact);
                            }}
                          />
                          <FontAwesomeIcon
                            icon={faPen}
                            size="sm"
                            className="text-white cursor-pointer"
                            onClick={() => {
                              setSelectedContact(contact);
                              setModalType("edit");
                              setOpen(true);
                              setNameInput(contact.name);
                              setNumberInput(contact.number);
                            }}
                          />
                          <FontAwesomeIcon
                            icon={faTrash}
                            size="sm"
                            className="text-white cursor-pointer"
                            onClick={() => {
                              setModalType("delete");
                              setOpen(true);
                              setSelectedContact(contact);
                            }}
                          />
                        </div>
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

export default Contacts;
