import {
  faCheckCircle,
  faPhone,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/appContext";
import { fetchNui } from "../utils/fetchNui";
import { useNuiEvent } from "../hooks/useNuiEvent";

function DynamicIsland() {
  const { contact, setContact, noti, setNoti } = useContext(AppContext);
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const [answeredCall, setAnsweredCall] = useState<boolean>(false);
  const [muteNoti, setMuteNoti] = useState<boolean>(false);
  const localMuteNoti = localStorage.getItem("muteNoti");

  useEffect(() => {
    setMuteNoti(JSON.parse(localMuteNoti as string));
  }, [localMuteNoti]);
  useNuiEvent("EndCall", () => {
    setNoti({ ...noti, open: false });
    setContact({ name: "", number: "" });
    setIncomingCall(false);
  });
  useNuiEvent("setInCall", () => {
    setAnsweredCall(true);
  });
  useNuiEvent(
    "IncomingCallAlert",
    (data: {
      canceled: boolean;
      callData: { name: string; number: string };
    }) => {
      const canceled = data.canceled;
      const callData = data.callData;
      if (!canceled) {
        setContact({ name: callData.name, number: callData.number });
        setNoti({ ...noti, open: true, type: "call" });
        setIncomingCall(true);
      } else {
        setContact({ name: "", number: "" });
        setNoti({ ...noti, open: false });
        setIncomingCall(false);
      }
    }
  );

  const fetchEndCall = () => {
    setContact({ name: "", number: "" });
    setNoti({ ...noti, open: false });
    fetchNui("endCall", contact.number);
  };

  const fetchAnswerCall = () => {
    fetchNui("answerCall", contact.number)
      .then((data) => {
        const boolData = data as boolean;
        setIncomingCall(!boolData);
        setAnsweredCall(boolData);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div
      className={`bg-black rounded-3xl max-h-0 mt-2 absolute top-0 left-0 right-0 mx-auto flex flex-col justify-center items-center overflow-hidden z-[100] ${
        noti.open && !muteNoti
          ? "w-11/12 max-h-20 min-h-20 rounded-3xl"
          : noti.open && muteNoti
          ? "w-24 min-h-7"
          : "w-24 min-h-7"
      }`}
      onClick={() => {
        if (noti.open && noti.type === "noti") {
          setNoti({ ...noti, open: false });
        }
      }}
      style={{ transition: "max-height 0.5s ease, width 0.5s ease" }}>
      <div className="w-full absolute flex items-center justify-center top-[6px]">
        <div
          className={`h-4 rounded-full aspect-square`} //${noti.open && "mt-2"}
          style={{
            background:
              "radial-gradient(#6667ac, transparent 50%) no-repeat 33.3% 10%/75% 50%, radial-gradient(#454680, transparent 50%) no-repeat 60% 85%/50% 50%",
          }}
        />
      </div>
      {noti.open && !muteNoti && (
        <>
          <div className="flex justify-between w-full px-3 absolute">
            <div className="w-full gap-2 flex justify-between items-center overflow-hidden">
              <div className="flex gap-2 items-center overflow-hidden">
                <div
                  className={`bg-gradient-to-br min-w-8 w-8 h-8 rounded-lg flex items-center justify-center ${
                    noti.type === "noti"
                      ? noti.iconBg
                      : "from-emerald-600 to-yellow-400"
                  }`}>
                  <FontAwesomeIcon
                    icon={noti.type === "noti" ? noti.icon : faPhone}
                    className="text-white"
                  />
                </div>
                <div className="flex flex-col text-white/80 pointer-events-none cursor-default overflow-hidden">
                  {noti.type === "noti" ? (
                    <>
                      <p className="font-bold text-xs whitespace-nowrap text-ellipsis overflow-hidden">
                        {noti.header}
                      </p>
                      <p className="text-xs text-white/60 whitespace-nowrap text-ellipsis overflow-hidden">{noti.subheader}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-xs whitespace-nowrap text-ellipsis overflow-hidden">
                        {contact.name}
                      </p>
                      {incomingCall ? (
                        <p className="text-xs text-white/60">Incoming...</p>
                      ) : answeredCall ? (
                        <p className="text-xs text-white/60">
                          Call in progress...
                        </p>
                      ) : (
                        <p className="text-xs text-white/60">Dialing...</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              {!incomingCall && !noti.buttons ? (
                <>
                  {noti.type === "call" && (
                    <FontAwesomeIcon
                      icon={faXmarkCircle}
                      className="text-red-500 cursor-pointer"
                      onClick={() => {
                        fetchEndCall();
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <FontAwesomeIcon
                    icon={faXmarkCircle}
                    className="text-red-500 cursor-pointer"
                    onClick={() => {
                      if (noti.decline) {
                        fetchNui(noti.decline, noti.props);
                      } else {
                        fetchEndCall();
                      }
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 cursor-pointer"
                    onClick={() => {
                      if (noti.accept) {
                        fetchNui(noti.accept, noti.props);
                      } else {
                        fetchAnswerCall();
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mb-2 h-4"></div>
        </>
      )}
    </div>
  );
}

export default DynamicIsland;
