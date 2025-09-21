import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Create the context
const SocketContext = createContext();

// Create a custom hook to easily access the socket
export const useSocket = () => {
  return useContext(SocketContext);
};

// Create the Provider component that will wrap our app
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  

  useEffect(() => {
    // Establish the connection when the component mounts
    // const newSocket = io("http://https://backend-sih-project-l67a.onrender.com");
     const newSocket = io("https://backend-sih-project-l67a.onrender.com");
    setSocket(newSocket);
    console.log("Socket connection established.");

    // Clean up the connection when the app is closed
    return () => {
      newSocket.close();
      console.log("Socket connection closed.");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};