import express from 'express';
import user from './users.js';
import bus from './bus.js';
import axios from 'axios';
import dayjs from 'dayjs';

const router = express.Router();
const baseURL = 'https://bus-reservation-system-api.vercel.app';
router.use('/users',user);
router.use('/bus',bus);
const formatDate = (seconds,nanoseconds)=>{
// Convert timestamp to Date object
const millisecondsFromSeconds = seconds * 1000;
const millisecondsFromNanoseconds = nanoseconds / 1000000;
const totalMilliseconds = millisecondsFromSeconds + millisecondsFromNanoseconds;
const date = new Date(totalMilliseconds);

return date;
}
router.get('/', async (req, res, next) => {
    try{
        res.locals.page = 'dashboard';
        // Render the page for the dashboard
        const url =`${baseURL}/users/count?id=${req.cookies['userId']}`
        const numberUser = await axios.get(url);
        res.locals.data.count = numberUser.data;
    
    
        const response = await axios.get(`${baseURL}/ticket/all`);
        const trips = response.data;
    
        res.locals.data.trips = [];
        let data = [];
        let ticketCount = 0;
        
        for(const trip of trips){
            ticketCount++;
            console.log(trip);
            
            const bookingDate = formatDate(trip.booking_date.seconds, trip.booking_date.nanoseconds);
            const tripDate = formatDate(trip.route.trip_date.seconds,trip.route.trip_date.nanoseconds);

            // Format using dayjs
            const formattedTrip= dayjs(tripDate).format('ddd, D MMM YYYY h:mma');
            const formattedBooking = dayjs(bookingDate).format('ddd, D MMM YYYY h:mma');
            const passengerName = `${trip.passenger.first_name} ${trip.passenger.last_name}`;
            const tripOrigin = trip.route.origin;
            const tripDestination = trip.route.destination;
            const seatOccupied = trip.number_of_seats_occupied;
            const ticketNumber = trip.ticket_number;
            const obj = {
                ticketNumber : ticketNumber,
                tripDate : formattedTrip,
                bookingDate : formattedBooking,
                passengerName : passengerName,
                origin : tripOrigin,
                destination : tripDestination,
                seatOccupied : seatOccupied
            }
            data.push(obj);
        }
        res.locals.data.count.ticketCount = ticketCount; 
        res.locals.data.trips = data;
        next();
    }catch(error){
         // Check if the error is an Axios error
         if (error.response) {
            // Server responded with a status other than 2xx
            console.error(`Error: ${error.response.status} - ${error.response.data}`);
            return res.status(error.response.status).send({
                error: 'Error fetching user count from the server.',
                details: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error: No response received from server', error.request);
            return res.status(500).send({
                error: 'Server is not responding. Please try again later.'
            });
        } else {
            // Something happened in setting up the request
            console.error('Error: Problem with request setup', error.message,error.stack);
            return res.status(500).send({
                error: 'Internal server error. Please try again later.'
            });
        }
        next(error);
    }
    
});


export default router;
