'use client'
import { useState, useEffect, useRef } from "react";
import { firestore } from '@/firebase'
import { Box, Stack, Typography, Button, Modal, TextField, ThemeProvider, createTheme } from '@mui/material'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%', // Ensures the modal content takes up the full height of the screen
  outline: 0,
};

const innerStyle = {
  width: 400,
  bgcolor: 'white',
  border: 'none',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  textAlign: 'center',
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF',
    },
    secondary: {
      main: '#FF6584',
    },
    background: {
      default: '#f0f2f5',
    },
    text: {
      primary: '#333',
      secondary: '#666',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const snapshot = query(collection(firestore, 'inventory'));
    const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
      const inventoryList = [];
      querySnapshot.forEach((doc) => {
        inventoryList.push({
          name: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleClose = () => setOpen(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      addItem(itemName);
      setItemName('');
      handleClose();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="grid"
        gridTemplateRows="auto 1fr auto"
        justifyContent="center"
        alignItems="center"
        gap={2}
        bgcolor="background.default"
        p={2}
      >
        <Modal open={open} onClose={handleClose} sx={style}>
          <Box sx={innerStyle}>
            <Typography variant="h6" color="#333">Add Item</Typography>
            <Stack width="100%" direction="column" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                inputRef={inputRef}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <Button variant="contained" color="primary" onClick={() => { addItem(itemName); setItemName(''); handleClose(); }}>
                Add
              </Button>
            </Stack>
            <Typography variant="h6" color="#333" p={1}></Typography>
          </Box>
        </Modal>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add New Item
        </Button>
        <Box border="none" p={2} borderRadius={2} bgcolor="white" boxShadow="0px 5px 15px rgba(0, 0, 0, 0.1)">
          <Box
            width="100%"
            height="100px"
            bgcolor="primary.main"
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius={1}
            p={2}
          >
            <Typography variant="h2" color="white" textAlign="center">
              Inventory Items
            </Typography>
          </Box>
          <Stack 
            width="100%" 
            spacing={2} 
            overflow="auto" 
            mt={2} 
            maxHeight="500px" 
            sx={{ overflowX: 'auto' }} 
          >
            {inventory.map(({ name, quantity }) => (
              <Box
                key={name}
                p={3}
                bgcolor="#f9f9f9"
                borderRadius={2}
                boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
              >
                <Stack direction="column" spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="text.primary" p={1}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
                      Remove
                    </Button>
                  </Stack>
                  <Typography variant="h6" color="text.secondary" p={1}>
                    Quantity: {quantity}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
        <ResponsiveContainer width="80%" height={200}>
          <BarChart data={inventory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            {inventory.length > 0 && (
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }} 
                labelStyle={{ color: '#333' }} 
              />
            )}
            <Bar dataKey="quantity" fill={theme.palette.primary.main} radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ThemeProvider>
  );
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////// Version with photo cap and AI detection

// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import { firestore } from '@/firebase';
// import { Box, Stack, Typography, Button, Modal, TextField, ThemeProvider, createTheme } from '@mui/material';
// import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// const style = {
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   height: '100%', // Ensures the modal content takes up the full height of the screen
//   outline: 0,
// };

// const innerStyle = {
//   width: 400,
//   bgcolor: 'white',
//   border: 'none',
//   boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
//   borderRadius: 16,
//   p: 4,
//   display: 'flex',
//   flexDirection: 'column',
//   gap: 3,
//   textAlign: 'center',
// };

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#6C63FF',
//     },
//     secondary: {
//       main: '#FF6584',
//     },
//     background: {
//       default: '#f0f2f5',
//     },
//     text: {
//       primary: '#333',
//       secondary: '#666',
//     },
//   },
//   typography: {
//     fontFamily: 'Roboto, Arial, sans-serif',
//     h2: {
//       fontWeight: 700,
//       fontSize: '2.5rem',
//     },
//     h6: {
//       fontWeight: 500,
//       fontSize: '1.25rem',
//     },
//     button: {
//       textTransform: 'none',
//       fontWeight: 600,
//     },
//   },
//   shape: {
//     borderRadius: 8,
//   },
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             transform: 'scale(1.05)',
//             boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
//           },
//         },
//       },
//     },
//   },
// });

// export default function Home() {
//   const [inventory, setInventory] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [itemName, setItemName] = useState('');
//   const inputRef = useRef(null);
//   const [cameraOpen, setCameraOpen] = useState(false);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const snapshot = query(collection(firestore, 'inventory'));
//     const unsubscribe = onSnapshot(snapshot, (querySnapshot) => {
//       const inventoryList = [];
//       querySnapshot.forEach((doc) => {
//         inventoryList.push({
//           name: doc.id,
//           ...doc.data(),
//         });
//       });
//       setInventory(inventoryList);
//     });
//     return () => unsubscribe();
//   }, []);

//   const addItem = async (item) => {
//     const docRef = doc(collection(firestore, 'inventory'), item);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const { quantity } = docSnap.data();
//       await setDoc(docRef, { quantity: quantity + 1 });
//     } else {
//       await setDoc(docRef, { quantity: 1 });
//     }
//   };

//   const handleOpenCamera = () => {
//     setCameraOpen(true);
//     navigator.mediaDevices.getUserMedia({ video: true })
//       .then(stream => {
//         videoRef.current.srcObject = stream;
//       });
//   };

//   const handleCapture = () => {
//     const context = canvasRef.current.getContext('2d');
//     context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
//     videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//     setCameraOpen(false);
//     sendImageToAPI(canvasRef.current.toDataURL('image/jpeg'));
//   };

//   const sendImageToAPI = async (imageData) => {
//     const response = await fetch('/api/openai-recognition', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: imageData })
//     });
//     const items = await response.json();
//     items.forEach(item => addItem(item));
//   };

//   const handleOpen = () => {
//     setOpen(true);
//     setTimeout(() => {
//       inputRef.current?.focus();
//     }, 0);
//   };

//   const handleClose = () => setOpen(false);

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       addItem(itemName);
//       setItemName('');
//       handleClose();
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         width="100vw"
//         height="100vh"
//         display="grid"
//         gridTemplateRows="auto 1fr auto"
//         justifyContent="center"
//         alignItems="center"
//         gap={2}
//         bgcolor="background.default"
//         p={2}
//       >
//         <Modal open={open} onClose={handleClose} sx={style}>
//            <Box sx={innerStyle}>
//              <Typography variant="h6" color="#333">Add Item</Typography>
//              <Stack width="100%" direction="row" spacing={2}>
//                <TextField
//                 variant="outlined"
//                 fullWidth
//                 value={itemName}
//                 inputRef={inputRef}
//                 onChange={(e) => setItemName(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 autoFocus
//               />
//               <Button variant="contained" color="primary" onClick={() => { addItem(itemName); setItemName(''); handleClose(); }}>
//                 Add
//               </Button>
//             </Stack>
//           </Box>
//         </Modal>
//         <Button variant="contained" color="primary" onClick={handleOpen}>
//           Add New Item
//         </Button>
//         <Modal open={open} onClose={() => setOpen(false)} sx={style}>
//           <Box sx={innerStyle}>
//             <Typography variant="h6" color="#333">Add Item</Typography>
//             <Stack width="100%" direction="row" spacing={2}>
//               <TextField
//                 variant="outlined"
//                 fullWidth
//                 value={itemName}
//                 inputRef={inputRef}
//                 onChange={(e) => setItemName(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && addItem(itemName)}
//                 autoFocus
//               />
//               <Button variant="contained" color="primary" onClick={() => { addItem(itemName); setItemName(''); setOpen(false); }}>
//                 Add
//               </Button>
//             </Stack>
//           </Box>
//         </Modal>
//         <Button variant="contained" color="primary" onClick={handleOpenCamera}>
//           Capture Pantry Image
//         </Button>
//         <Modal open={cameraOpen} onClose={() => setCameraOpen(false)} sx={style}>
//           <Box sx={{ ...innerStyle, width: 'auto', height: 'auto', padding: 0 }}>
//             <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%' }} />
//             <Button variant="contained" color="primary" onClick={handleCapture}>
//               Capture
//             </Button>
//           </Box>
//         </Modal>
//         <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
//         <Box border="none" p={2} borderRadius={2} bgcolor="white" boxShadow="0px 5px 15px rgba(0, 0, 0, 0.1)">
//           <Box
//             width="100%"
//             height="100px"
//             bgcolor="primary.main"
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             borderRadius={1}
//             p={2}
//           >
//             <Typography variant="h2" color="white" textAlign="center">
//               Inventory Items
//             </Typography>
//           </Box>
//           <Stack 
//             width="100%" 
//             spacing={2} 
//             overflow="auto" 
//             mt={2} 
//             maxHeight="500px" 
//             sx={{ overflowX: 'auto' }} 
//           >
//             {inventory.map(({ name, quantity }) => (
//               <Box
//                 key={name}
//                 p={3}
//                 bgcolor="#f9f9f9"
//                 borderRadius={2}
//                 boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
//               >
//                 <Stack direction="column" spacing={1}>
//                   <Stack direction="row" justifyContent="space-between" alignItems="center">
//                     <Typography variant="h6" color="text.primary" p={1}>
//                       {name.charAt(0).toUpperCase() + name.slice(1)}
//                     </Typography>
//                     <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
//                       Remove
//                     </Button>
//                   </Stack>
//                   <Typography variant="h6" color="text.secondary" p={1}>
//                     Quantity: {quantity}
//                   </Typography>
//                 </Stack>
//               </Box>
//             ))}
//           </Stack>
//         </Box>
//         <ResponsiveContainer width="80%" height={200}>
//           <BarChart data={inventory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
//             <XAxis dataKey="name" stroke="#888" />
//             <YAxis stroke="#888" />
//             {inventory.length > 0 && (
//               <Tooltip 
//                 contentStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }} 
//                 labelStyle={{ color: '#333' }} 
//               />
//             )}
//             <Bar dataKey="quantity" fill={theme.palette.primary.main} radius={[10, 10, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </Box>
//     </ThemeProvider>
//   );
// }
