import {
  faPhone,
  faUser,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { fetchNui } from "../utils/fetchNui";
import { AppContext } from "../context/appContext";
import Spinner from "../components/Spinner";
import { compareTime } from "../utils/utils";
import Autocomplete from "../components/Autocomplete";
import { PhoneContext } from "../context/phoneContext";

interface recentCallsI {
  name: string;
  time: string;
  type: string;
  number: string;
}

function Calls() {
  const { setContact, setNoti, noti } = useContext(AppContext);
  const { contacts } = useContext(PhoneContext);
  const [open, setOpen] = useState<boolean>(false);
  const [numberInput, setNumberInput] = useState<string>("");
  const [recentCalls, setRecentCalls] = useState<Array<recentCallsI>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [contactNames, setContactNames] = useState<
    Array<{ name: string; number: string }>
  >([]);
  const callNumber = (number: string) => {
    fetchNui("callNumber", number).then(() => {
      setNoti({ ...noti, open: true, type: "call" });
    });
  };

  useEffect(() => {
    const arr: { name: string; number: string }[] = [{ name: "", number: "" }];
    contacts.map((contact) => {
      arr.push({ name: contact.name, number: contact.number });
    });
    setContactNames(arr);
  }, [contacts]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      fetchNui("getRecentCalls")
        .then((data) => {
          const rCall = data as recentCallsI[];
          setRecentCalls(rCall);
          setLoading(false);
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          setLoading(false);
        });

      setLoading(false);
    };

    fetchData();
  }, []);

  const callUser = () => {
    const contact = contactNames.find((obj) => obj.name === numberInput);
    setOpen(false);
    setNumberInput("");
    if (contact) {
      callNumber(contact.number);
      setContact({ name: contact.name, number: contact.number });
    } else {
      fetchNui("GetProfilePicture", numberInput).then(() => {
        callNumber(numberInput);
        setContact({ name: numberInput, number: numberInput });
      });
    }
  };

  return (
    <>
      <Modal open={open}>
        <Autocomplete
          input={numberInput}
          setInput={setNumberInput}
          suggestions={contactNames}
          placeholder="Name or number"
        />
        <div className="flex justify-between mt-7">
          <button
            onClick={() => setOpen(false)}
            className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
            Cancel
          </button>
          <button
            disabled={numberInput.length < 1}
            onClick={() => {
              callUser();
            }}
            className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
            Submit
          </button>
        </div>
      </Modal>

      <Spinner open={loading} />

      <div className="page bg-gradient-to-br from-emerald-600 to-yellow-500">
        <div className="text-right">
          <FontAwesomeIcon
            onClick={() => setOpen(true)}
            icon={faPhone}
            className="text-white cursor-pointer"
          />
        </div>
        <div className="text-center mt-5 flex flex-col gap-2">
          {recentCalls.length > 0 ? (
            <>
              {recentCalls.map((call) => (
                <div
                  key={call.time}
                  onClick={() => {
                    callNumber(call.number);
                    setContact({ number: call.number, name: call.name });
                  }}
                  className="w-full bg-black/40 h-20 m-auto rounded-xl overflow-hidden flex items-center gap-2 px-4 text-white/80 justify-start cursor-pointer">
                  <div className="rounded-full bg-background-900 min-w-8 w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>
                  <div className="text-left text-white flex flex-col gap-1 flex-nowrap whitespace-nowrap overflow-hidden text-ellipsis">
                    <p>{call.name}</p>
                    <p className="capitalize">
                      {call.type === "answered" || call.type === "missed"
                        ? "Incoming"
                        : call.type}
                    </p>
                    <p>{compareTime(call.time)}</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <FontAwesomeIcon
                icon={faXmarkCircle}
                size="lg"
                className="text-white"
              />
              <p className="text-white opacity-60">Nothing found!</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Calls;
