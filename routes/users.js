import express from 'express';
import axios from 'axios';
const router = express.Router();


const baseURL = 'https://bus-reservation-system-api.vercel.app'
router.get('/passenger', async (req, res, next) => {
    res.locals.page = 'passenger';
    // Render the page for passengers

    const response = await axios.get(`${baseURL}/users/select?id=${req.session.user}&role=passenger`);

    res.locals.data.passenger = response.data;
    console.log(response.data);

    next();
});

router.get('/driver', async (req, res, next) => {
    res.locals.page = 'driver';
    // Render the page for drivers

    const response = await axios.get(`${baseURL}/users/select?id=${req.session.user}&role=driver`);

    res.locals.data.driver = response.data;
    next();
});

router.get('/driver/add', (req, res, next) => {
    res.locals.page = 'add-driver'; // Ensure the correct page is set for adding a driver
    
    next();
});

router.post('/driver/add', async (req, res, next) => {
    // Handle adding a driver here (e.g., save to the database)
    res.locals.page = 'driver'; // Or redirect/render another page after adding
    const {username,password,first_name,last_name}=  req.body;
    const postBody = {
        username : username,
        password : password,
        first_name: first_name,
        last_name : last_name
    }
    try{
        const response = await axios.post('https://bus-reservation-system-api.vercel.app/users/driver/register',postBody);

        if(response.status !== 200){
            res.locals.data.message = response.data.message;
            return next();
        }

        return res.redirect('/dashboard/users/driver');
    }catch(error){
        console.log(error);
    }
    
});

export default router