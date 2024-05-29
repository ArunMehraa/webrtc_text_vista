import { Grid, Box, Flex, Button } from "@chakra-ui/react";
import { SocketContext } from "../../Context/SocketContext";
import { useContext, useState,useEffect, useRef } from "react";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import { BsMicMuteFill, BsMicFill } from "react-icons/bs";
import { MdCallEnd } from "react-icons/md";


const VideoChat = () => {
  const {
    name,
    callAccepted,
    myVideo,
    userVideo,
    callEnded,
    calling,
    leaveCall,
    receivingCall,
  } = useContext(SocketContext);
  if (!calling && !receivingCall) return null;
  return (
    <>
      {(calling || receivingCall) && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100%"
          bg="rgba(0, 0, 0, 0.9)"
          zIndex="1000"
        >
          {calling ? (
            <CallerVideo
              name={name}
              myVideo={myVideo}
              userVideo={userVideo}
              callEnded={callEnded}
              callAccepted={callAccepted}
              calling={calling}
              leaveCall={leaveCall}
            />
          ) : (
            <CalleeVideo
              name={name}
              myVideo={myVideo}
              userVideo={userVideo}
              callAccepted={callAccepted}
              callEnded={callEnded}
              leaveCall={leaveCall}
            />
          )}
        </Box>
      )}
    </>
  );
};

export default VideoChat;



const CalleeVideo = ({
  myVideo,
  userVideo,
  callAccepted,
  callEnded,
  leaveCall,
}) => {
  const myVideoRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  useEffect(() => {
    const videoElement = myVideoRef.current;
    if (!videoElement) return;

    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      offset = {
        x: videoElement.offsetLeft - e.clientX,
        y: videoElement.offsetTop - e.clientY,
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX + offset.x;
      const newY = e.clientY + offset.y;

      // Ensure the video doesn't move outside the box
      const container = videoElement.parentElement;
      const containerRect = container.getBoundingClientRect();
      const videoRect = videoElement.getBoundingClientRect();

      if (
        newX >= 0 &&
        newY >= 0 &&
        newX + videoRect.width <= containerRect.width &&
        newY + videoRect.height <= containerRect.height
      ) {
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    videoElement.addEventListener("mousedown", handleMouseDown);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [callAccepted]);

  const toggleMute = () => {
    setMuted((prevMuted) => {
      const newMuted = !prevMuted;
      myVideo.current.muted = newMuted;
      return newMuted;
    });
  };

  const toggleSpeaker = () => {
    setSpeakerOn((prevSpeakerOn) => !prevSpeakerOn);
    userVideo.current.muted = !speakerOn;
  };

  return (
    <>
      {callAccepted && !callEnded && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          bg="transparent"
          position="relative"
        >
          {/* User's video */}
          <Box
            position="relative"
            w={{ base: "80%", md: "75%" }}
            h={{ base: "80%", md: "100%" }}
            bg="black"
            border="1px solid purple"
            borderRadius="5px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Grid colSpan={1} w="100%" h="100%">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Grid>
            {/* My video - smaller and draggable */}
            <Box
              ref={myVideoRef}
              position="absolute"
              bottom="10%"
              right="10%"
              w={{ base: "30%", md: "20%" }}
              h={{ base: "20%", md: "25%" }}
              bg="black"
              style={{
                cursor: "move",
                borderRadius: "10px",
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
            >
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          </Box>

          {/* Control Buttons */}
          <Flex
            direction="column"
            align="center"
            width="250px"
            // mt="1"
            // bg="white"
            borderColor="gray"
            borderWidth="0.2px"
            // borderRadius="10px"
            p="2"
          >
            <Flex justify="space-between" mt="1" width="200px" mb="2">
              <Button
                colorScheme=""
                color="white"
                onClick={toggleSpeaker}
                borderRadius="50%"
                p="4"
              >
                {speakerOn ? (
                  <HiOutlineSpeakerWave size="39px" />
                ) : (
                  <HiOutlineSpeakerXMark size="39px" />
                )}
              </Button>
              <Button
                colorScheme=""
                color="white"
                onClick={toggleMute}
                borderRadius="50%"
                p="4"
              >
                {muted ? (
                  <BsMicMuteFill size="35px" />
                ) : (
                  <BsMicFill size="35px" />
                )}
              </Button>
              <Button
                onClick={leaveCall}
                borderRadius="20%"
                colorScheme="red"
                p="4"
                height="40px"
                width="100px"
                marginLeft="10px"
                // paddingLeft="20px"
              >
                <MdCallEnd size="35px" />
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
};



const CallerVideo = ({
  myVideo,
  userVideo,
  callAccepted,
  callEnded,
  leaveCall,
  calling,
}) => {
  const myVideoRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  useEffect(() => {
    const videoElement = myVideoRef.current;
    if (!videoElement) return;

    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      offset = {
        x: videoElement.offsetLeft - e.clientX,
        y: videoElement.offsetTop - e.clientY,
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX + offset.x;
      const newY = e.clientY + offset.y;

      // Ensure the video doesn't move outside the box
      const container = videoElement.parentElement;
      const containerRect = container.getBoundingClientRect();
      const videoRect = videoElement.getBoundingClientRect();

      if (
        newX >= 0 &&
        newY >= 0 &&
        newX + videoRect.width <= containerRect.width &&
        newY + videoRect.height <= containerRect.height
      ) {
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    videoElement.addEventListener("mousedown", handleMouseDown);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("mousedown", handleMouseDown);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [calling]);

  const toggleMute = () => {
    setMuted((prevMuted) => {
      const newMuted = !prevMuted;
      myVideo.current.muted = newMuted;
      return newMuted;
    });
  };

  const toggleSpeaker = () => {
    setSpeakerOn((prevSpeakerOn) => !prevSpeakerOn);
    userVideo.current.muted = !speakerOn;
  };

  return (
    <>
      {calling && !callEnded && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="100%"
          bg="transparent"
          position="relative"
        >
          {/* User's video */}
          <Box
            position="relative"
            w={{ base: "80%", md: "75%" }}
            h={{ base: "80%", md: "100%" }}
            bg="black"
            border="1px solid purple"
            borderRadius="5px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Grid colSpan={1} w="100%" h="100%">
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Grid>
            {/* My video - smaller and draggable */}
            <Box
              ref={myVideoRef}
              position="absolute"
              bottom="10%"
              right="10%"
              w={{ base: "30%", md: "20%" }}
              h={{ base: "20%", md: "25%" }}
              bg="black"
              style={{
                cursor: "move",
                borderRadius: "10px",
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
            >
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          </Box>

          {/* Control Buttons */}
          <Flex
            direction="column"
            align="center"
            width="250px"
            // mt="1"
            // bg="white"
            borderColor="gray"
            borderWidth="0.2px"
            // borderRadius="10px"
            p="2"
          >
            <Flex justify="space-between" mt="1" width="200px" mb="2">
              <Button
                colorScheme=""
                color="white"
                onClick={toggleSpeaker}
                borderRadius="50%"
                p="4"
              >
                {speakerOn ? (
                  <HiOutlineSpeakerWave size="39px" />
                ) : (
                  <HiOutlineSpeakerXMark size="39px" />
                )}
              </Button>
              <Button
                colorScheme=""
                color="white"
                onClick={toggleMute}
                borderRadius="50%"
                p="4"
              >
                {muted ? (
                  <BsMicMuteFill size="35px" />
                ) : (
                  <BsMicFill size="35px" />
                )}
              </Button>
              <Button
                onClick={leaveCall}
                borderRadius="20%"
                colorScheme="red"
                p="4"
                height="40px"
                width="100px"
                marginLeft="10px"
                // paddingLeft="20px"
              >
                <MdCallEnd size="35px" />
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
};




