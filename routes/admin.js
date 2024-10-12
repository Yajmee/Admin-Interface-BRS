import express from 'express';
import user from './users.js';
import bus from './bus.js';
import axios from 'axios';
import dayjs from 'dayjs';

const router = express.Router();
const baseURL = 'https://bus-reservation-system-api.vercel.app';
router.use('/users',user);
router.use('/bus',bus);
router.get('/', async (req, res, next) => {
    res.locals.page = 'dashboard';
    // Render the page for the dashboard
    const numberUser = await axios.get(`${baseURL}/users/count?id=${req.session.user}`);
    res.locals.data.count = numberUser.data;


    const response = await axios.get(`${baseURL}/routes/list`);

    const trips = response.data;

    res.locals.data.trips = [];
    console.log(trips);
    let data = [];
    for(const trip of trips){
        // Convert timestamp to Date object
        const millisecondsFromSeconds = trip.trip_date.seconds * 1000;
        const millisecondsFromNanoseconds = trip.trip_date.nanoseconds / 1000000;
        const totalMilliseconds = millisecondsFromSeconds + millisecondsFromNanoseconds;
        const date = new Date(totalMilliseconds);

        // Format using dayjs
        const formattedDate = dayjs(date).format('ddd, D MMM YYYY h:mma');
        const obj = {
            trip_date : formattedDate,
            bus_line : trip.bus_line,
            driver_name : trip.driver_name,
            passenger_count : trip.passenger_count
        }
        data.push(obj);
    }
    res.locals.data.trips = data;
    next();
});


export default router;
