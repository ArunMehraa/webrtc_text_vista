import { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { ChatState } from "./ChatProvider";

const SocketContext = createContext();

const socket = io("https://main--medotchat.netlify.app"); ///////////////////////////change this to your server address

const ContextProvider = ({ children }) => {
  const { user } = ChatState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [name, setName] = useState("");
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [calling, setCalling] = useState(false);
  const [userSocketId, setUserSocketId] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);

  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef();

  useEffect(() => {
    const handleMe = (id) => {
      try {
        socket.emit("storeMe", { userId: user._id, socketId: id });
      } catch {
        console.log("got error!");
      }
      setMe(id);
    };

    const handleCallUser = ({ from, name: callerName, signal }) => {
      setUserSocketId(from);
      setReceivingCall(true);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    };

    socket.on("me", handleMe);

    socket.on("callUser", handleCallUser);

    socket.on("callEnded", () => {
      setCallEnded(true);
      setCalling(false);
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      window.location.reload();
    });

    // Cleanup event listeners on unmount
    return () => {
      socket.off("me", handleMe);
      socket.off("callUser", handleCallUser);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const getStream = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
      return currentStream; // Return the stream
    } catch (error) {
      console.error("Failed to get media stream:", error);
      throw error; // Rethrow the error to be caught by the caller
    }
  };

  const answerCall = async () => {
    try {
      setCallAccepted(true);
      const currentStream = await getStream(); // Wait for the stream
      // setStream(currentStream);
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream,
      });
      // Attach event listeners
      peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: call.from });
      });
      peer.on("stream", (remoteStream) => {
        try {
          userVideo.current.srcObject = remoteStream;
        } catch {
          console.log("error aa raha h userVideo.current.srobject");
        }
      });
      peer.signal(call.signal);
      connectionRef.current = peer;
    } catch (error) {
      console.error("Error answering call:", error);
    }
  };

  const callUser = async (id) => {
    try {
      setCalling(true);
      setUserSocketId(id);
      const currentStream = await getStream(); // Wait for the stream
      const peer = new Peer({
        initiator: true,
        trickle: false,
        config: {
          iceServers: [
            {
              urls: "stun:numb.viagenie.ca",
              username: "sultan1640@gmail.com",
              credential: "98376683",
            },
            {
              urls: "turn:numb.viagenie.ca",
              username: "sultan1640@gmail.com",
              credential: "98376683",
            },
          ],
        },
        stream: currentStream,
      });
      // setStream(currentStream);
      // Attach event listeners
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: id,
          signalData: data,
          from: me,
          name: user.name,
        });
      });
      peer.on("stream", (remoteStream) => {
        try {
          userVideo.current.srcObject = remoteStream;
        } catch {
          console.log("error aa raha h userVideo.current.srobject");
        }
      });
      // Wait for 'callAccepted' event from server
      await new Promise((resolve) => {
        socket.on("callAccepted", (signal) => {
          setCallAccepted(true);
          peer.signal(signal);
          resolve();
        });
      });
      connectionRef.current = peer;
    } catch (error) {
      console.error("Error calling user:", error);
    }
  };
  const leaveCall = () => {
    setCallEnded(true);
    setCalling(false);
    socket.emit("callEnded", userSocketId);
    window.location.reload();
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        calling,
        getStream,
        receivingCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
export { ContextProvider, SocketContext };

