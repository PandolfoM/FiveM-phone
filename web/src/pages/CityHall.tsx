import {
  faAngleLeft,
  faComment,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { fetchNui } from "../utils/fetchNui";
import { AppContext, Page } from "../context/appContext";
import { PhoneContext } from "../context/phoneContext";

type PageType =
  | "home"
  | "employees"
  | "announcements"
  | "doj"
  | "dmv"
  | "medical"
  | "dispatch"
  | "other"
  | "ballots";

type ButtonProps = {
  header: string;
  subheader: string;
  onDuty?: number;
  newPage: PageType;
};

type PlayerProps = {
  header: string;
  subheader: string;
  player: JobData;
};

type JobData = {
  name: string;
  number: string;
};

type JobProps = {
  judges: JobData[];
  lawyers: JobData[];
  medics: JobData[];
};

const BtnStyles =
  "bg-secondary-700 rounded-md text-left w-full p-2 group relative";

function CityHall() {
  const { setNoti, noti, setContact, setPage } = useContext(AppContext);
  const [lastPage, setLastPage] = useState<PageType[]>(["home"]);
  const [dirPage, setDirPage] = useState<PageType>("home");
  const [jobs, setJobs] = useState<JobProps>({
    judges: [],
    lawyers: [],
    medics: [],
  });

  useEffect(() => {
    fetchNui("GetPlayerJobs").then((data) => {
      setJobs(data as JobProps);
    });
  }, [dirPage]);

  const callNumber = (number: string) => {
    fetchNui("callNumber", number).then(() => {
      setNoti({ ...noti, open: true, type: "call" });
    });
  };

  const msgNumber = (player: JobData) => {
    setPage(Page.Messages);
    fetchNui("msgNumber", player);
  };

  const Button = ({ header, subheader, newPage, onDuty }: ButtonProps) => {
    return (
      <button
        className={`${BtnStyles} ${onDuty === 0 ? "hidden" : "block"}`}
        onClick={() => {
          setDirPage(newPage);
          setLastPage((prev) => [...prev, dirPage]);
        }}>
        <p className="text-sm tracking-tight leading-5">{header}</p>
        <p className="text-[.65rem] tracking-tight leading-4">{subheader}</p>
      </button>
    );
  };

  const PlayerCard = ({ header, subheader, player }: PlayerProps) => {
    return (
      <button className={BtnStyles}>
        <p className="text-sm tracking-tight leading-5">{header}</p>
        <p className="text-[.65rem] tracking-tight leading-4">{subheader}</p>
        <div className="absolute flex opacity-0 gap-2 group-hover:opacity-100 transition-all ease-in-out duration-100 right-0 top-0 p-2">
          <FontAwesomeIcon
            icon={faPhone}
            size="sm"
            onClick={() => {
              callNumber(player.number);
              setContact({ name: player.name, number: player.number });
            }}
          />
          <FontAwesomeIcon
            icon={faComment}
            size="sm"
            onClick={() => {
              msgNumber(player);
            }}
          />
        </div>
      </button>
    );
  };

  return (
    <div className="page bg-background-900 flex gap-2 flex-col text-white">
      <div
        className={`flex items-center ${
          dirPage !== "home" ? "justify-between" : "justify-center"
        }`}>
        {dirPage !== "home" && (
          <button
            className="bg-white rounded-full h-5 w-5 flex items-center justify-center cursor-pointer"
            onClick={() => {
              setDirPage(lastPage[lastPage.length - 1]);
              setLastPage((prev) => [...prev.slice(0, -1)]);
            }}>
            <FontAwesomeIcon
              icon={faAngleLeft}
              size="xs"
              className="text-black pointer-events-none"
            />
          </button>
        )}
        <h1 className="text-2xl font-medium text-center m-0">City Hall</h1>
        {dirPage !== "home" && <div className="h-5 w-5"></div>}
      </div>

      {/* Content */}
      {/* Home Page */}
      <div className="flex flex-col gap-2">
        {dirPage === "home" && (
          <>
            <Button
              header="State Announcements"
              subheader="View announcements from the government."
              newPage="announcements"
            />
            <Button
              header="Government Employees"
              subheader="View on-duty government employees."
              newPage="employees"
            />
            {/* 
            <Button
              header="Ballots"
              subheader="View upcoming ballots."
              newPage="ballots"
            />
            */}
          </>
        )}

        {/* Gov Employees Page */}
        {dirPage === "employees" && (
          <>
            <Button
              header="DOJ"
              subheader={`${
                jobs.judges.length + jobs.lawyers.length
              } employees`}
              onDuty={jobs.judges.length + jobs.lawyers.length}
              newPage="doj"
            />
            <Button
              header="DMV"
              subheader={`${"0"} employees`}
              newPage="dmv"
              onDuty={0}
            />
            <Button
              header="Medical"
              subheader={`${jobs.medics.length} employees`}
              onDuty={jobs.medics.length}
              newPage="medical"
            />
            <Button
              header="Dispatch"
              subheader={`${"0"} employees`}
              onDuty={0}
              newPage="dispatch"
            />
            <Button
              header="Other"
              subheader={`${"0"} employees`}
              onDuty={0}
              newPage="other"
            />
          </>
        )}

        {/* DOJ Page */}
        {dirPage === "doj" && (
          <>
            {jobs.lawyers.length > 0 && (
              <>
                <h3>Attorney</h3>
                {jobs.lawyers.map((lawyer) => (
                  <PlayerCard
                    header={lawyer.name}
                    subheader="Available"
                    player={lawyer}
                  />
                ))}
              </>
            )}

            {jobs.judges.length > 0 && (
              <>
                <h3>Judges</h3>
                {jobs.judges.map((judge) => (
                  <PlayerCard
                    header={judge.name}
                    subheader="Available"
                    player={judge}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* Medics Page */}
        {dirPage === "medical" && (
          <>
            <h3>Medic</h3>
            {jobs.medics.map((medic) => (
              <PlayerCard
                header={medic.name}
                subheader="Available"
                player={medic}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default CityHall;
