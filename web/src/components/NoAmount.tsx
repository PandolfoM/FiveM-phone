type Props = {
  name: string;
  type?: "directory" | "twinsta";
};

function NoAmount({ name, type }: Props) {
  return (
    <div className="bg-black/20 text-white/80 text-xs py-3 px-5 rounded-md text-center">
      {type ? (
        <p>There are no {type} posts yet!</p>
      ) : (
        <p>You don't have any {name} yet!</p>
      )}
    </div>
  );
}

export default NoAmount;
