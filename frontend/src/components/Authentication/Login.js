import React,{useState} from "react";
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {

    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleClick = () => setShow(!show);
    const toast = useToast();
    const history = useHistory();
    const {setUser} = ChatState();

    const submitHandler = async() => {
        setLoading(true);
        if(!Email || !Password) {
            toast({
                title: "Please enter all fields",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom"
              });
              setLoading(false);
              return;
        }
        try{
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const {data} = await axios.post('/api/user/login', {email:Email, password: Password}, config);

            toast({
                title: "Logged in successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "bottom"
              });
                setUser(data);
              localStorage.setItem('userInfo', JSON.stringify(data));
                setLoading(false);
                history.push('/chats');
        }
        catch(error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
              });
              setLoading(false);
        }
    };


    return (
        <VStack spacing={"10px"}>

            <FormControl id='email2' isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Enter Your Email" onChange={(e)=> setEmail(e.target.value)}/>
            </FormControl>
            <FormControl id='password2' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                <Input type={show? "text" :"password"} placeholder="Enter Your Password" onChange={(e)=> setPassword(e.target.value)}/>
                <InputRightElement width={'4.5rem'}>
                    <Button bg="gray.300" color={"blackAlpha.500"} h={'1.75rem'} size={'sm'} onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button colorScheme="purple" color={"white"} width={"100%"} style={{marginTop:20}} onClick={submitHandler} isLoading={loading} >
                Login
            </Button>
        </VStack>
    );
};

export default Login;
