import { Box } from "@chakra-ui/react";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/misc/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import VideoChat from "../components/misc/VideoChat";
import IncomingCallModal from "../components/misc/IncomingCallModal";
import { ContextProvider } from "../Context/SocketContext";

const Chatpage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <>
      <ContextProvider>
        <div style={{ width: "100%" }}>
          {user && <SideDrawer />}
          <Box
            display="flex"
            justifyContent="space-between"
            w="100%"
            height="91.5vh"
            mt="0.4%"
            p="0.5%"
          >
            {user && <MyChats fetchAgain={fetchAgain} />}
            {user && (
              <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            )}
          </Box>
        </div>
        <IncomingCallModal />
        <VideoChat />
      </ContextProvider>
    </>
  );
};

export default Chatpage;
