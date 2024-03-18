import {
  faCompass,
  faMagnifyingGlass,
  faPhone,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoAmount from "../components/NoAmount";
import { useContext, useEffect, useState } from "react";
import { fetchNui } from "../utils/fetchNui";
import Spinner from "../components/Spinner";
import { AppContext } from "../context/appContext";
import Modal from "../components/Modal";
import { PhoneContext } from "../context/phoneContext";

interface PostProps {
  citizenid: string;
  name: string;
  number: string;
  message: string;
  date: number;
}

function Directory() {
  const { setContact, setNoti, noti } = useContext(AppContext);
  const { cid } = useContext(PhoneContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [posts, setPosts] = useState<Array<PostProps>>([]);

  useEffect(() => {
    setLoading(true);
    fetchNui<Array<PostProps>>("GetDirectoryPosts").then((posts) => {
      setPosts(posts);
      setLoading(false);
    });
  }, []);

  const callNumber = (number: string) => {
    fetchNui("callNumber", number).then(() => {
      setNoti({ ...noti, open: true, type: "call" });
    });
  };

  const deletePost = (post: PostProps) => {
    setPosts((prev: PostProps[]) => prev.filter(p => p.citizenid !== post.citizenid));
    fetchNui("DeleteDirectoryPost", post.citizenid);
  };

  const newPost = () => {
    const foundPost = posts.find((post) => post.citizenid === cid);
    if (!foundPost) {
      setLoading(true);
      fetchNui("NewDirectoryPost", message).then((post) => {
        const newPost = post as PostProps;

        setPosts((prev: PostProps[]) => [
          {
            citizenid: newPost.citizenid,
            name: newPost.name,
            number: newPost.number,
            message: newPost.message,
            date: Date.now(),
          },
          ...prev,
        ]);
        setLoading(false);
      });
    } else {
      setNoti({
        ...noti,
        open: true,
        type: "noti",
        header: "Directory",
        subheader: "You can only have 1 ad in the directory",
        icon: faCompass,
        iconBg: "from-blue-600 to-cyan-600",
        timeout: 2000,
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    const lowerCaseSearch = search.toLowerCase();
    const lowerCaseMessage = post.message.toLowerCase();
    const lowerCaseName = post.name.toLowerCase();
    return (
      lowerCaseMessage.includes(lowerCaseSearch) ||
      lowerCaseName.includes(lowerCaseSearch)
    );
  });

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
              }}
              className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
              Cancel
            </button>
            <button
              onClick={() => {
                newPost();
                setOpen(false);
              }}
              className="bg-secondary-700 py-1 px-2 text-sm rounded-md text-white/70 w-20">
              Post
            </button>
          </div>
        </>
      </Modal>

      <div className="page bg-gradient-to-br from-blue-600 to-cyan-600">
        <div className="text-right flex justify-between items-center w-full overflow-hidden gap-2">
          <div className="relative flex items-center">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md bg-black/40 text-white p-1 pr-6 text-sm placeholder:text-white/80 w-full border-none outline-none"
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="text-white/80 text-sm absolute right-0 top-1/2 transform -translate-y-1/2 pr-1"
            />
          </div>
          <FontAwesomeIcon
            onClick={() => {
              setOpen(true);
            }}
            icon={faPlus}
            className="text-white cursor-pointer"
          />
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <Spinner open={loading} />

          {!loading && (
            <>
              {posts.length ? (
                <>
                  {filteredPosts.map((post) => (
                    <div className="relative">
                      <div className="bg-black/20 text-white text-sm p-2 px-5 rounded-md flex flex-col gap-1 group">
                        <div className="flex justify-between items-center overflow-hidden w-full gap-2 relative">
                          <div className="flex flex-col overflow-hidden">
                            <p className="capitalize whitespace-nowrap text-ellipsis overflow-hidden text-md font-bold">
                              {post.name}
                            </p>
                            <p className="text-left leading-4 tracking-tighter text-xs">
                              {post.message}
                            </p>
                          </div>
                          <div className="absolute flex opacity-0 gap-2 group-hover:opacity-100 transition-all ease-in-out duration-100 right-0 top-0">
                            <FontAwesomeIcon
                              icon={faPhone}
                              size="sm"
                              className="text-white cursor-pointer"
                              onClick={() => {
                                callNumber(post.number);
                                setContact({
                                  name: post.name,
                                  number: post.number,
                                });
                              }}
                            />
                            {post.citizenid === cid && (
                              <FontAwesomeIcon
                                icon={faTrash}
                                size="sm"
                                className="text-white cursor-pointer"
                                onClick={() => {deletePost(post)}}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <NoAmount name="" type="directory" />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Directory;
