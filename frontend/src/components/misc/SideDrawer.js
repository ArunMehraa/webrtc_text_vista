
import { Avatar,Box,Button,Text, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Spinner, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React from 'react';
import { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useHistory } from 'react-router-dom';
import ChatLoading from '../ChatLoading';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge';


const SideDrawer = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { user, setSelectedChat,chats,setChats,notifications,setNotifications} = ChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const toast = useToast();
    const handleSearch = async() => {
        if(!search){
            toast({
                title: "Please enter a name or email to search",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top-left"
              });
              return;
        }
        try{
            setLoading(true);
            const config = {
                headers:    {
                    Authorization: `Bearer ${user.token}`,
                },
            };
        const {data} = await axios.get(`/api/user?search=${search}`,config);

            setLoading(false);
            setSearchResult(data);
        } catch(error) {
            toast({
                title: "Error occured!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
                description: "Error occured while searching for users",
              });
              setLoading(false);
        }
    };
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push('/');
    };

    const accesssChat = async (userId) =>{
        try{
            setLoadingChat(true);

            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.post("/api/chat",{ userId },config);
            console.log(data);
            if(!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            console.log(data);
            setSelectedChat(data);
           setLoadingChat(false);
           onClose();

        }
        catch(error){
            toast({
                title: "Error fetching the chat!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
                description: error.message,
                console: error.message,
              });
              setLoadingChat(false);
        }
    }

    return (
        <>
            <Box display="flex" justifyContent='space-between' alignContent='center' bg="blackAlpha.800" w='100%' p='13px 10px 10px 10px' borderWidth='0.5px' borderColor="purple.500">
                <Tooltip label="search users to chat" hasArrow placement='bottom-end'>
                    <Button p="0.5%" variant="ghost" bg="gray.200" onClick={onOpen}>
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <Text d={{ base: "none", md: "flex" }} px="4" >
                            Search User
                        </Text>
                    </Button>
                </Tooltip>

                <Text fontSize="3xl" fontWeight="extrabold" textColor="white" textDecoration="Window" fontFamily='Work sans'>
                    Small Talks
                </Text>

                <div>
                    <Menu>
                        <MenuButton p={1} mr={3}>
                            <NotificationBadge count={notifications.length} />
                            <BellIcon color="whiteAlpha.900" fontSize={"2xl"} m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notifications.length && "No New Notifications"}
                            {notifications.map((notif) => (
                                <MenuItem key={notif._id} onClick={()=>{
                                    setSelectedChat(notif.chat);
                                    setNotifications(notifications.filter((n) => n !== notif));
                                }}>
                                    <Avatar size="xs" mr={2} name={notif.sender.name} src={notif.sender.pic} />
                                    {notif.chat.isGroupChat ? `New Messaeg in ${notif.chat.chatName}` : `New Message from ${getSender(user,notif.chat.users)} `}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu >
                        <MenuButton mr={1} bg="gray.200" as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic}></Avatar>
                        </MenuButton>
                        <MenuList>
                            <ProfileModel user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModel>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader bg="linear-gradient(to right, #02020a, #1f1c2e, #3c2f50, #604171, #8b5290)"  borderColor="gray" borderWidth="1px" borderBottomWidth="1px" textColor="white" >Search Users</DrawerHeader>
                    <DrawerBody bg="linear-gradient(to right top, #070715, #1f1c39, #3e2b5e, #663781, #973f9f)"  borderWidth={1} borderLeftStyle="none" borderColor={"gray"} >
                        <Box display="flex" pb={2} mt={2}>
                            <Input
                                bg={"whiteAlpha.800"}
                                placeholder='Search by Name or Email'
                                
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>
                                Go
                            </Button>
                        </Box>
                        {loading? (<ChatLoading/>) : (
                            searchResult?.map( (user) => (
                                <UserListItem
                                    key={user._id}
                                    user = {user}
                                    handleFunction={()=>accesssChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default SideDrawer;