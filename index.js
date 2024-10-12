import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import admin from './routes/admin.js';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import axios from 'axios';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use(session({
    secret: process.env.SESSION_SECRET,  // Use a strong secret stored in an environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  }));
  
app.set("view engine","ejs");
app.set(express.static(path.join(__dirname,'views')));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache'); // Prevent caching
    next();
});
const renderPage = (req,res,next)=>{
    const middlewareData = res.locals.data;
    const page = res.locals.page;

    res.render(page,{
        data: middlewareData
    })
}
app.get('/', (req, res, next) => {
    if (!req.session.user) {
        const error = new Error('Login first!');
        error.status = 401;
        return next(error);
    }else{
        return res.redirect('/dashboard')
    }
    next();
});

app.use('/dashboard',(req,res,next)=>{
    if(!req.session.user){
        const error = new Error('Login first!');
        error.status = 401;
        return next(error);
    }
     // If user is logged in, set username in res.locals
     res.locals.data = {};
    res.locals.data.username = req.session.username;
    next();
    
},admin,renderPage);

app.get('/logout',(req,res,next)=>{
    req.session.destroy((err) => {
        if (err) {
          return res.send('Error destroying session');
        }
        res.redirect('/login');
      });
})
app.get('/login',(req,res,next)=>{
    
    if (req.session.user) {
        return res.redirect('/dashboard'); // Redirect authenticated users to dashboard or other page
    }
    res.render('index');
})
app.post('/login',async (req,res,next)=>{
    const { username, password } = req.body;
    
    const postBody = {
        username : username,
        password : password
    }

    try {
        // Corrected URL and using response.data to access response body
        const response = await axios.post('https://bus-reservation-system-api.vercel.app/users/admin', postBody);
        
        req.session.user = response.data.id;
        req.session.username = username;
        res.redirect('/dashboard');
    
      } catch (error) {
        // Handle errors like request failure, etc.
        console.error('Error making request:', error.message);
        // You can pass the error to your error-handling middleware
        next(error);
      }
});
app.get('/profile/changepassword',(req,res,next)=>{
    
    if (req.session.user) {
        res.locals.data = {};
    res.locals.data.username = req.session.username;
    const middlewareData = res.locals.data;
        return res.render('changepassword',{
            data: middlewareData
        }); // Redirect authenticated users to dashboard or other page
    }else{
return res.redirect('/login');
    }
    
});
app.post('/profile/changepassword', async (req,res,next)=>{
    
    try{
        const {old_password, new_password,confirm_password} = req.body;
        const postBody = {
            username : req.session.username,
            password:old_password,
            newPassword : new_password,
            confirmPassword : confirm_password
        };
        const response = await axios.post('https://bus-reservation-system-api.vercel.app/users/admin/changepassword', postBody);
    
        return res.redirect('/dashboard');
    }catch(error){
        console.error('Error making request:', error.message);
        // You can pass the error to your error-handling middleware
        return res.redirect('/dashboard');
    }
});
//catches non existent url
app.get('*', (req, res, next) => {
    const requestedURL = req.url;
    const error = new Error('Wrong URL ' + requestedURL + " is not existent");
    error.status = 404; // You can set the status to 404 or any other appropriate status code.
    
    next(error); // Pass the error to the error-handling middleware.
});
app.use(function(err, req, res, next) {
    if(401 == err.status) {
       return res.redirect('/login')
    }

    if(err.status == 404){
       return res.status(404).render(
            '404',{
                Error: err
            }
        );
    }
    res.status(err.status || 500).send(err.message);
  });
  
const PORT =  process.env.PORT;
app.listen(PORT, ()=> {
console.log(`Server listening at http://localhost:${PORT}`);
});