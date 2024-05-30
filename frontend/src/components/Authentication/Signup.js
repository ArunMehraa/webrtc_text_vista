import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from "@chakra-ui/react";
import React, {useState} from "react";
import { useToast } from '@chakra-ui/react'
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Signup = () => {


    const [Name, setName] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [Pic, setPic] = useState("");
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history = useHistory();
    const {setUser} = ChatState();

    const handleClick = () => setShow(!show);

    const postDetails = (pics) => {
       setLoading(true);
       if(pics===undefined) {
               toast({
                title: "Please select an image",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom"
              });
              return;
         }
         if(pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "small-talkss");
            data.append("cloud_name", "arunmehra");
            fetch("https://api.cloudinary.com/v1_1/arunmehra/image/upload", {
                method: 'POST',
                body: data
            })
            .then((res)=>res.json())
            .then(data=>{
                setPic(data.url.toString());
                setLoading(false);
            })
            .catch((err)=>{
                console.log(err);
                setLoading(false);
            });
    }
    else {
         toast({
            title: "Please select an image",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom"
            });
            setLoading(false);
            return;
        }
    }

    const submitHandler = async() => {
            setLoading(true);

            if(!Name || !Email || !Password || !ConfirmPassword) {
                 toast({
                    title: "Please fill all the fields",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });
                setLoading(false);
                return; 
            }
            if(Password !== ConfirmPassword) {
                 toast({
                    title: "Passwords do not match",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });
                return;
            }
            try{
                const config = {
                    headers: {
                        "Content-Type": "application/json"
                    },
                };

                const {data} = await axios.post("/api/user", {name: Name, email: Email, password: Password, pic: Pic}, config);

                toast({
                    title: "Account Created Successfully",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom"
                });
                setUser(data)
                localStorage.setItem("userInfo", JSON.stringify(data));
                setLoading(false);
                history.push("/chats");
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
        <VStack spacing={"5px"}>
            <FormControl id='name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input type="text" placeholder="Enter Your Name" onChange={(e)=> setName(e.target.value)}/>
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Enter Your Email" onChange={(e)=> setEmail(e.target.value)}/>
            </FormControl>
            <FormControl id='password' isRequired>
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
            <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input type="password" placeholder="Enter Your Password" onChange={(e)=> setConfirmPassword(e.target.value)}/>
            </FormControl>
            <FormControl id='picture' >
                <FormLabel>Upload Your Picture</FormLabel>
                <Input type="file" p={1.5} accept="image/*" onChange={(e)=> postDetails(e.target.files[0])}/>
            </FormControl>

            <Button colorScheme="purple" color={"white"} width={"100%"} style={{marginTop:20}} onClick={submitHandler} isLoading={loading}>
                Sign Up
            </Button>
        </VStack>
    );
}

export default Signup;
