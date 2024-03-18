type Props = {
  open: boolean;
};

function Spinner({ open }: Props) {
  return (
    <div
      className={`${
        open ? "flex" : "hidden"
      } justify-center items-center absolute top-0 left-0 w-full h-full bg-black/70 z-50`}>
      <div className="border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full w-12 h-12 animate-spin"></div>
    </div>
  );
}

export default Spinner;
