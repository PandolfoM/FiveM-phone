import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AppContext, Page } from "../context/appContext";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { useContext, useEffect, useState } from "react";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import DynamicIsland from "./DynamicIsland";
import { PhoneContext } from "../context/phoneContext";

type TimeProps = {
  hour: string;
  minute: string;
};

type PhoneProps = {
  children: React.ReactNode;
};

function Phone({ children }: PhoneProps) {
  const { setPage, page: currentPage } = useContext(AppContext);
  const { background } = useContext(PhoneContext);
  const [time, setTime] = useState<TimeProps>({ hour: "11", minute: "58" });
  const [currentBg, setCurrentBg] = useState<string>("https://media.idownloadblog.com/wp-content/uploads/2017/11/minimal-gradient-iPhone-X-wallpaper-by-danielghuffman-light-blue-768x1663.jpg")
  useNuiEvent<TimeProps>("UpdateTime", (data) => {
    setTime(data);
  });

  useEffect(() => {
    if (background) {
      setCurrentBg(background)
    } else {
      setCurrentBg("https://media.idownloadblog.com/wp-content/uploads/2017/11/minimal-gradient-iPhone-X-wallpaper-by-danielghuffman-light-blue-768x1663.jpg")
    }
  }, [background]);

  return (
    <div
      className={`h-[600px] w-[300px] 3xl:w-[400px] 3xl:h-[800px] relative bg-black rounded-[3rem] flex flex-col gap-2 object-contain bg-cover bg-no-repeat border-[3px] overflow-hidden border-black z-[150] bg-bottom`} style={{backgroundImage: `url(${currentBg})`}}>
      {/* Header */}
      <div className="w-full h-11 flex items-center justify-start absolute px-5">
        {currentPage !== Page.Home && (
          <FontAwesomeIcon
            icon={faHouse}
            size="xs"
            className="text-white cursor-pointer z-[75]"
            onClick={() => setPage(Page.Home)}
          />
        )}
        <div className="text-white text-xs tracking-tighter ml-2">{`${time.hour}:${time.minute}`}</div>
        <DynamicIsland />
      </div>
      {/* Pages */}
      {children}
    </div>
  );
}

export default Phone;
