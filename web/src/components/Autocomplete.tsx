import { Dispatch, SetStateAction, useState } from "react";

type Props = {
  suggestions: { name: string, number: string }[];
  input: string;
  placeholder: string;
  setInput: Dispatch<SetStateAction<string>>
};

function Autocomplete({ suggestions, input, setInput, placeholder }: Props) {
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ name: string, number: string }>>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userInput = e.currentTarget.value;
    const filteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    setActiveSuggestion(0);
    setFilteredSuggestions(filteredSuggestions);
    setShowSuggestions(true);
    setInput(e.currentTarget.value);
  };

  const onClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    setActiveSuggestion(0);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setInput(e.currentTarget.innerText);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setInput(filteredSuggestions[activeSuggestion].name);
    } else if (e.key === "ArrowUp") {
      if (activeSuggestion === 0) {
        return;
      }
      setActiveSuggestion(activeSuggestion - 1);
    } else if (e.key === "ArrowDown") {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }
      setActiveSuggestion(activeSuggestion + 1);
    }
  };

  let suggestionsListComponent;

  if (showSuggestions && input) {
    if (filteredSuggestions.length) {
      suggestionsListComponent = (
        <ul className="relative bg-secondary-700 text-left w-full rounded-md mt-1 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => {
            // const className = index === activeSuggestion ? "suggestion-active" : "";

            return (
              <li
                className="px-2 py-1 cursor-pointer"
                key={suggestion.number}
                onClick={onClick}
              >
                {suggestion.name}
              </li>
            );
          })}
        </ul>
      );
    }
  }

  return (
    <>
      <input
        type="text"
        onChange={handleChange}
        onKeyDown={onKeyDown}
        value={input}
        placeholder={placeholder}
        className="bg-secondary-700 py-2 px-2 text-sm text-white w-full rounded-md border-none outline-none"
      />
      {suggestionsListComponent}
    </>
  );
}

export default Autocomplete;
