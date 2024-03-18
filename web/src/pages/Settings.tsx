import { useContext, useEffect, useState } from "react";
import { formatPhoneNumber } from "../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/appContext";
import { fetchNui } from "../utils/fetchNui";
import { PhoneContext } from "../context/phoneContext";

const Input = ({
  value,
  name,
  disabled,
  onChange,
}: {
  value: string;
  name: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="relative group">
      <input
        disabled={disabled}
        type="text"
        value={value}
        onChange={onChange}
        className="p-3 pt-5 pb-2 pl-2 block w-full border-none outline-none text-white bg-secondary-700 rounded-md text-sm bottom-0"
      />
      <label
        className={`text-sm absolute pointer-events-none left-2 transition-all duration-200 ease-in-out group-focus-within:top-1 group-focus-within:text-xs group-focus-within:text-white ${
          value ? "top-1 text-xs text-white" : "top-3 text-white/60"
        }`}>
        {name}
      </label>
    </div>
  );
};

const Checkbox = ({
  value,
  name,
  onChange,
}: {
  value: boolean;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="w-5 h-5 bg-secondary-700 outline-none border-none rounded-md appearance-none transition-all checked:bg-primary-500"
        checked={value}
        onChange={onChange}
      />
      <label className="text-white/60 text-sm select-none relative">
        {name}
        {value && (
          <span className="absolute top-0 -left-6 pointer-events-none">
            <FontAwesomeIcon icon={faCheck} className="text-white" />
          </span>
        )}
      </label>
    </div>
  );
};

function Settings() {
  const { setNoti, noti } = useContext(AppContext);
  const { cid, background, setBackground, muted, setMuted, mutedNoti, setMutedNoti } =
    useContext(PhoneContext);
  const [url, setUrl] = useState<string>("");
  const [mute, setMute] = useState<boolean>(false);
  const [muteNoti, setMuteNoti] = useState<boolean>(false);

  useEffect(() => {
    setUrl(background);
    setMute(muted);
    setMuteNoti(mutedNoti);
  }, [background, muted, mutedNoti]);

  const handleSave = () => {
    setBackground(url);
    setMuted(mute);
    setMutedNoti(muteNoti);
    fetchNui("SaveSettings", { background: url, muted: mute, mutedNoti: muteNoti });
    fetchNui("SetMuted", mute);
    setNoti({
      open: true,
      icon: faCheck,
      iconBg: "bg-green-500",
      header: "Settings",
      subheader: "Saved!",
      type: "noti",
    });
    setTimeout(() => {
      setNoti({ ...noti, open: false });
    }, 2000);
  };

  return (
    <div className="page bg-background-900 flex gap-2 flex-col">
      <Input
        value={formatPhoneNumber(localStorage.getItem("phoneNumber") as string)}
        name="Phone Number"
        disabled={true}
      />
      <Input value={cid} name="State ID" disabled={true} />
      <Input
        value={url}
        name="Background URL"
        onChange={(e) => {
          setUrl(e.target.value);
        }}
      />
      <Checkbox
        name="Muted"
        onChange={(e) => setMute(e.target.checked)}
        value={mute}
      />
      <Checkbox
        name="Mute Notifications"
        onChange={(e) => setMuteNoti(e.target.checked)}
        value={muteNoti}
      />
      <button
        className="mt-3 bg-primary-500 text-white px-4 py-2 rounded-md w-max m-auto text-xs font-medium"
        onClick={handleSave}>
        Save
      </button>
    </div>
  );
}

export default Settings;
