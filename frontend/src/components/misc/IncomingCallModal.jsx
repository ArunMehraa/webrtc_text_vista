
import React, { useContext, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  useDisclosure,
  Icon
} from '@chakra-ui/react';
import { SocketContext } from '../../Context/SocketContext';
import { MdCall, MdCallEnd } from "react-icons/md";
import { FaVideo } from "react-icons/fa6";

const IncomingCallModal = () => {
  const { call, callAccepted, leaveCall, answerCall } = useContext(SocketContext);
  const { isOpen, onOpen, onClose: onCloseModal } = useDisclosure();
  const toast = useToast();
  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (call.isReceivingCall && !callAccepted) {
      onOpen();
      if (ringtoneRef.current) {
        ringtoneRef.current.play();
      }
    }
  }, [call.isReceivingCall, callAccepted, onOpen]);

  const handleAnswer = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    answerCall();
    onCloseModal();
  };

  const handleClose = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    onCloseModal();
    leaveCall();
    toast({
      title: 'Call ended.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <>
      <audio ref={ringtoneRef} src="/ringtone.mp3" loop />
      {call.isReceivingCall && !callAccepted ? (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl" closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent borderRadius="xl" borderColor="purple" borderWidth="1px" bg="linear-gradient(to right top, #05030c, #1b1531, #321d56, #50227a, #751f9c)" boxShadow="md">
            <ModalHeader  color={"white"}>Incoming Video Call</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={3} alignItems="center">
                <Icon as={FaVideo} color="white" size="60px" fontSize="70px" mb={0} />
                <Text color="white" fontSize="80px" textOverflow="clip" fontFamily="cursive" >{call.name}</Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={4} width="100%" justifyContent="center" marginBottom="30px" marginTop="20px">
                <Button
                  colorScheme="red"
                  color="white"
                  onClick={handleClose}
                  p="4"
                  leftIcon={<MdCallEnd size="30px" />}
                >
                  Decline
                </Button>
                <Button
                  colorScheme="green"
                  onClick={handleAnswer}
                  p="4"
                  leftIcon={<MdCall size="30px" />}
                >
                  Answer
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </>
  );
};

export default IncomingCallModal;
