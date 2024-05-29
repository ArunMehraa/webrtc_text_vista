import React, { useState } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/ChatProvider';
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics'
import GroupChatModal from './misc/GroupChatModal';


const MyChats = ({fetchAgain}) => {
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState()
    const [loggedUser, setLoggedUser] = useState();
    const toast = useToast();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        }
        catch (error) {
            toast({
                title: "Something went wrong!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
                description: "Error occured while fetching chats",
            });
        }
    }

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
        fetchChats();
        // eslint-disable-next-line
    }, [fetchAgain]);

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDir="column"
            alignItems="center"
            p={4}
            bg="blackAlpha.700"
            w={{ base: "100%", md: "31%" }}
            borderRadius="lg"
            // borderWidth="0px"
            borderRightWidth={"1px"}
        >
            <Box
                pb={3}
                px={3}
                fontWeight="bold"
                textColor="white"
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
                display="flex"
                w="100%"
                justifyContent="space-between"
                alignItems="center"
            >
                Chats
            <GroupChatModal >
                <Button
                    bg="messenger.50"
                    display="flex"
                    fontSize={{ base: "17px", md: "10px", lg:"17px"  }}
                    rightIcon={<AddIcon />}
                    >New Group Chat</Button>
            </GroupChatModal>
            </Box>
            <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="whiteAlpha.300"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
                >
                    {chats ? (
                            <Stack overflowY='scroll' >
                                {chats.map((chat) => (
                                    <Box
                                        onClick={() => setSelectedChat(chat)}
                                        cursor="pointer"
                                        bg={selectedChat === chat ? "purple.600" : "whiteAlpha.700"}
                                        color={selectedChat === chat ? "white" : "black"}
                                        px={3}
                                        py={2}
                                        borderRadius="lg"
                                        key={chat._id}
                                        >

                                           <Text>
                                                {!chat.isGroupChat ? (getSender(loggedUser,chat.users)) : (chat.chatName)}
                                            </Text>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <ChatLoading />
                        )
                        }

            </Box>
        </Box>
    );
}

export default MyChats;