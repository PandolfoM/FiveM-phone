import {
  IconDefinition,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, SetStateAction } from "react";

type Props = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onClick: () => void;
  addIcon?: IconDefinition;
};

function Search({ value, setValue, onClick, addIcon }: Props) {
  return (
    <div className="text-right flex justify-between items-center w-full overflow-hidden gap-2 mb-2">
      <div className="relative flex items-center">
        <input
          placeholder="Search..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-md bg-black/40 text-white p-1 pr-6 text-sm placeholder:text-white/80 w-full border-none outline-none"
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="text-white/80 text-sm absolute right-0 top-1/2 transform -translate-y-1/2 pr-1"
        />
      </div>
      {addIcon && (
        <FontAwesomeIcon
          onClick={onClick}
          icon={addIcon}
          className="text-white cursor-pointer"
        />
      )}
    </div>
  );
}

export default Search;
