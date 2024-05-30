import React, { useEffect, useState, useContext } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  IconButton,
  Input,
  Spinner,
  Text,
  FormControl,
  Avatar,
} from "@chakra-ui/react";

import { getSenderFull, getSenderPic, getSender } from "../config/ChatLogics";
import ProfileModel from "./misc/ProfileModel";
import UpdateGroupChatModal from "./misc/UpdateGroupChatModal";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { SocketContext } from "../Context/SocketContext";
import { MdOutlineVideoCall } from "react-icons/md";

const ENDPOINT = "https://small-talks-c376.onrender.com";
//////////////////change this to your server address

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {
    user,
    selectedChat,
    notifications,
    setNotifications,
  } = ChatState();
  const { callUser, calling, receivingCall } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to Send Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Give notification
        if (!notifications.includes(newMessageReceived)) {
          setNotifications([newMessageReceived, ...notifications]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleVideoCall = () => {
    // callUser(idToCall);
    const sender = getSenderFull(user, selectedChat.users);
    const userToCall = sender._id;
    callUser(userToCall);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            textColor="white"
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <Avatar
              src={
                selectedChat.isGroupChat
                  ? selectedChat.chatPic
                  : getSenderPic(user, selectedChat.users)
              }
              size="md"
              display="flex"
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <div
                    style={{
                      justifyContent: "space-between",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {!calling && !receivingCall && (
                      <IconButton
                      colorScheme="white"
                      size={"md"}
                      mr={3}
                      d={{ base: "flex" }}
                      icon={<MdOutlineVideoCall size="md" />}
                      onClick={handleVideoCall}
                      />
                    )}
                    <ProfileModel
                      user={getSenderFull(user, selectedChat.users)}
                      style={{ marginLeft: "20px" }}
                    />
                  </div>
                    {/* <IconButton
                      display={{ base: "flex", md: "none" }}
                      icon={<ArrowBackIcon />}
                      onClick={() => setSelectedChat("")}
                    /> */}
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}

                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="whiteAlpha.300"
            w="100%"
            h="100%"
            borderRadius=""
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                textColor="white"
                variant="filled"
                placeholder="Type a message.."
                bg="linear-gradient(to right, #010009, #18151b, #292328, #3c3236, #4e4244)"
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" color="gray.500">
            Select a chat to start messaging
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
