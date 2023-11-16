
const express = require('express'); 

const cors = require('cors');

const app = express(); 
const PORT = 3022
; 

app.use(cors());
const apiRoutes = require('./routes');

// Middlewares básicos
app.use(express.json());
app.use('/', apiRoutes);
  

app.listen(PORT, (error) =>{ 
    if(!error) 
        console.log("Server is Successfully Running,  and App is listening on port "+ PORT) 
    else 
        console.log("Error occurred, server can't start", error); 
    } 
);



