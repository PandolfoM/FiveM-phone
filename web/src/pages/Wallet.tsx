import { faBank, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import { fetchNui } from "../utils/fetchNui";
import { useNuiEvent } from "../hooks/useNuiEvent";

function Wallet() {
  const [open, setOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"transfer" | "charge">("transfer");
  const [loading, setLoading] = useState<boolean>(false);
  const [bank, setBank] = useState<number>(0);
  const [stateId, setStateId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    fetchNui<string>("GetBankBalance").then((bank) => {
      setBank(parseInt(bank));
      setLoading(false);
    });
  }, []);

  const transferMoney = () => {
    fetchNui("TransferMoney", { amount, stateId });
    setStateId("");
    setAmount("");
  };

  const chargePlayer = () => {
    fetchNui("ChargePlayer", { amount, stateId });
    setStateId("");
    setAmount("");
  }

  useNuiEvent("UpdateBank", (data) => {
    setBank(data as number);
  });

  return (
    <>
      <Spinner open={loading} />

      <Modal open={modalOpen}>
        <div className="flex flex-col gap-2 mb-7">
          <input
            type="string"
            placeholder="State ID"
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            className="bg-secondary-700 py-2 px-2 text-sm text-white w-full rounded-md border-none outline-none"
          />
          <input
            type="string"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-secondary-700 py-2 px-2 text-sm text-white w-full rounded-md border-none outline-none"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => {
              setModalOpen(false);
            }}
            className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
            Cancel
          </button>
          <button
            onClick={() => {
              if (modalType === "transfer") {
                transferMoney();
              } else {
                chargePlayer()
              }

              setModalOpen(false);
            }}
            className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
            {modalType === "transfer" ? "Send" : "Charge"}
          </button>
        </div>
      </Modal>

      {/* Context Menu */}
      <div
        className={`bg-background-900 absolute w-[4.5rem] h-auto right-2 top-[4.5rem] rounded-md text-white text-sm text-right p-1 flex-col gap-1 z-50 ${
          open ? "flex" : "hidden"
        }`}>
        <p
          className="cursor-pointer"
          onClick={() => {
            setOpen(false);
            setModalOpen(true);
            setModalType("transfer");
          }}>
          Transfer
        </p>
        <p
          className="cursor-pointer"
          onClick={() => {
            setOpen(false);
            setModalOpen(true);
            setModalType("charge");
          }}>
          Charge
        </p>
      </div>

      <div className="page bg-gradient-to-br from-cyan-600 to-emerald-600">
        <div className="text-right">
          <FontAwesomeIcon
            icon={faEllipsisV}
            className="text-white cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <div>
          <div className="bg-black/40 text-white p-3 rounded-md flex items-center gap-2 relative mt-2">
            <div className="min-w-10 min-h-10 w-10 h-10 bg-secondary-700 rounded-full p-2 flex items-center justify-center">
              <FontAwesomeIcon icon={faBank} size="lg" />
            </div>
            <p className="cursor-default overflow-x-auto">
              ${bank.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Wallet;
