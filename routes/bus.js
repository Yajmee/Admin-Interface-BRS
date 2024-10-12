import express from 'express';
import axios from 'axios';
const router = express.Router();


const baseURL = 'https://bus-reservation-system-api.vercel.app';
router.get('/', async (req, res, next) => {
    res.locals.page = 'bus';
    const response = await axios.get(`${baseURL}/bus/all`); 
    res.locals.data.bus = response.data;
    next();
});

router.get('/add', async (req, res, next) => {
    try{
        res.locals.page = 'add-bus';
        //List the driver here 
        const busLines = [
            'abliner',
            'alps',
            'bltb',
            'bsc',
            'rrcg'
        ];
        res.locals.data.busLines = busLines;
        axios.get(`${baseURL}/bus/nodriver`)
  .then(response => {
    // Handle success
    console.log(response.data);
    res.locals.data.drivers = response.data;
        next();
  })
  .catch(error => {
    if (error.response) {
      // The request was made, and the server responded with a status code outside the range of 2xx
      if (error.response.status === 404) {
        res.locals.data.error = error.response.data.message;
            return next();
      } else {
        res.locals.data.error = error.response.data.message;
            return next();
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an error
      console.log('Error:', error.message);
    }
  });

        
       
        
    }catch(error){
        console.log(error);
        res.locals.data.error = error.data
    }
});

router.post('/add', async (req, res, next) => {
    // Handle adding a bus here
    const {bus_line,driver_id,bus_type,registration,bus_number,total_seat} = req.body;

    const postBody = {
        driver_id : req.body.driver_id,
        bus_line : req.body.bus_line,
        registration : req.body.registration,
        bus_number : req.body.bus_number,
        bus_type : req.body.bus_type,
        total_seats : req.body.total_seat,
    }

    const response = await axios.post(`${baseURL}/bus/register`,postBody);

    return res.redirect('/dashboard/bus');
    
});


export default router