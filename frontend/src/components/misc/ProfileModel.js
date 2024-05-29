import { Avatar, useDisclosure } from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import React from 'react';

const ProfileModel = ({user,children}) => {
    const {isOpen,onOpen,onClose} = useDisclosure();

    return (
       <>
        {children ? (
            <span onClick={onOpen}>{children}</span>
        ) : (
            <IconButton
                d={{base:"flex"}}
                icon={<ViewIcon/>}
                onClick={onOpen}
            />
        )}

        <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered >
         <ModalOverlay/>
         <ModalContent h="450px" bg="linear-gradient(to right top, #05030c, #1b1531, #321d56, #50227a, #751f9c)" borderWidth={0.1} borderColor="gray">
            <ModalHeader textColor="white" fontSize="40px" fontFamily="Work sans" display="flex" justifyContent="center" >{user.name}</ModalHeader>
            <ModalCloseButton/>
            <ModalBody display="flex" flexDir="column" alignItems="center" justifyContent="space-between" >
                {/* <Image borderRadius="full" boxSize="150px" src={user.pic} alt={user.name} /> */}
                <Avatar boxSize="170px" borderRadius="full" name={user.name} src={user.pic} />
                <Text textColor="white" fontSize={{base:"28px",md:"30px"}} fontFamily="Work sans" >
                    Email: {user.email}
                </Text>
            </ModalBody>

            <ModalFooter >
                <Button colorScheme="purple" mr={3} onClick={onClose}>
                    Close
                </Button>
            </ModalFooter>
         </ModalContent>

        </Modal>

       </>
    );
}

export default ProfileModel;