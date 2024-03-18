import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import Search from "../components/Search";
import { PhoneContext, TweetData } from "../context/phoneContext";
import Modal from "../components/Modal";
import { fetchNui } from "../utils/fetchNui";
import NoAmount from "../components/NoAmount";

function Twinsta() {
  const { tweets, setTweets } = useContext(PhoneContext);
  const [search, setSearch] = useState<string>("");
  const [showOverlay, setShowOverlay] = useState<number | null>(0);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const renderContent = (content: string) => {
    // Regular expression to find image links
    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|gif|jpeg))/gi;

    // Replace image links with img tags
    const replacedContent = content.split(imageRegex).map((part, index) => {
      if (index % 2 === 0) {
        // Text part
        return <span key={index}>{part}</span>;
      } else {
        // Image part
        return (
          <img
            key={index}
            src={part}
            alt="Image"
            className="w-24"
            onMouseEnter={() => {
              setShowOverlay(index - 1);
              setImageSrc(part);
            }}
            onMouseLeave={() => {
              setShowOverlay(null);
            }}
          />
        );
      }
    });

    // Render content as JSX elements
    return <div>{replacedContent}</div>;
  };

  const newPost = () => {
    fetchNui("NewTwinstaPost", message).then((post) => {
      const newPost = post as TweetData;

      setTweets((prev: TweetData[]) => [
        {
          citizenid: newPost.citizenid,
          name: newPost.name,
          message: newPost.message,
          date: Date.now(),
        },
        ...prev,
      ]);
    });
  };

  return (
    <>
      <Modal open={open}>
        <>
          <textarea
            placeholder="Message..."
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md resize-none bg-secondary-700 border-none outline-none text-white p-1 h-44 text-sm"
          />
          <div className="flex justify-between mt-7">
            <button
              onClick={() => {
                setOpen(false);
                setMessage("");
              }}
              className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
              Cancel
            </button>
            <button
              onClick={() => {
                newPost();
                setOpen(false);
                setMessage("");
              }}
              className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
              Post
            </button>
          </div>
        </>
      </Modal>
      <div className="page bg-gradient-to-br from-fuchsia-500 to-red-500">
        <Search
          value={search}
          setValue={setSearch}
          onClick={() => setOpen(true)}
          addIcon={faPlus}
        />
        <div className="overflow-y-auto h-full pb-12">
          {tweets.length ? (
            <>
              {tweets.map((post, i) => (
                <div key={i} className="mt-2 flex flex-col gap-2">
                  <div className="bg-black/20 text-white text-sm p-2 px-5 rounded-md flex flex-col gap-1 overflow-y-auto group">
                    <p>{post.name}</p>
                    <div className="text-left leading-4 tracking-tighter text-xs">
                      {renderContent(post.message)}
                    </div>
                    {showOverlay === i && (
                      <img
                        src={imageSrc}
                        alt=""
                        className="absolute pointer-events-none block w-56 z-[200]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <NoAmount name="" type="twinsta" />
          )}
        </div>
      </div>
    </>
  );
}

export default Twinsta;
