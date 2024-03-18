import {
  faDivide,
  faEquals,
  faMinus,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const operationClass =
  "w-14 h-14 rounded-md transition-[background, color] duration-500 ease-in-out";

function Calculator() {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [firstOperand, setFirstOperand] = useState<number>(0);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const [activeOperator, setActiveOperator] = useState<string | null>(null);

  const inputDigit = (digit: number) => {
    if (waitingForSecondOperand) {
      if (activeOperator) setActiveOperator(null);
      setDisplayValue(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(
        displayValue === "0" ? String(digit) : displayValue + digit
      );
    }
  };

  const inputDecimal = () => {
    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  const clearDisplay = () => {
    setDisplayValue("0");
    setActiveOperator(null);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (firstOperand === 0) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = evaluate(firstOperand, inputValue, operator);
      setDisplayValue(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    setActiveOperator(nextOperator);
  };

  const evaluate = (firstOperand: number, secondOperand: number, operator: string) => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  return (
    <div className="page bg-background-900 flex gap-2 flex-col">
      <div className="w-full h-12 text-white text-5xl text-right mt-28 mb-3">
        {displayValue}
      </div>
      <div className="grid grid-rows-5 grid-cols-4 gap-2 text-white text-2xl">
        <button
          className="col-span-3 bg-secondary-700 h-14 rounded-md"
          onClick={clearDisplay}>
          AC
        </button>
        <button
          className={`${operationClass} ${
            activeOperator === "/" ? "bg-white text-black" : "bg-primary-500"
          }`}
          onClick={() => performOperation("/")}>
          <FontAwesomeIcon icon={faDivide} />
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(9)}>
          9
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(1)}>
          1
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(2)}>
          2
        </button>
        <button
          className={`${operationClass} ${
            activeOperator === "*" ? "bg-white text-black" : "bg-primary-500"
          }`}
          onClick={() => performOperation("*")}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(3)}>
          3
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(4)}>
          4
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(5)}>
          5
        </button>
        <button
          className={`${operationClass} ${
            activeOperator === "-" ? "bg-white text-black" : "bg-primary-500"
          }`}
          onClick={() => performOperation("-")}>
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(6)}>
          6
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(7)}>
          7
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={() => inputDigit(8)}>
          8
        </button>
        <button
          className={`${operationClass} ${
            activeOperator === "+" ? "bg-white text-black" : "bg-primary-500"
          }`}
          onClick={() => performOperation("+")}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button
          className="bg-secondary-700 h-14 rounded-md col-span-2"
          onClick={() => inputDigit(0)}>
          0
        </button>
        <button
          className="bg-secondary-700 w-14 h-14 rounded-md"
          onClick={inputDecimal}>
          .
        </button>
        <button
          className={`${operationClass} ${
            activeOperator === "=" ? "bg-white text-black" : "bg-primary-500"
          }`}
          onClick={() => performOperation("=")}>
          <FontAwesomeIcon icon={faEquals} />
        </button>
      </div>
    </div>
  );
}

export default Calculator;
