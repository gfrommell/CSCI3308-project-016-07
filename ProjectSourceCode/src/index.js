// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const { error } = require('console');



// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

Handlebars.registerHelper('formatDate', function (date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${day}/${month}`;
});
// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });


// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


const user = {
  username: undefined,
  password: undefined,
  email: undefined
}



app.get('/', (req, res) => {
  res.redirect('/login'); //this will call the /anotherRoute route in the API
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});


app.get('/home', (req, res) => {
  if (req.session.user) {

    const query = "SELECT trip_title, start_date , number_of_days, trip_progress FROM trips WHERE username = $1;";

    db.any(query, [user.username])
      .then(data => {
        res.render('pages/home', { data: data });
      })
      .catch((err) => {
        res.render('pages/home', { data: [] });
        console.log("error")
      });


  } else {
    res.redirect('/login'); // redirect users to login page  
  }
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});



// Register
app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);

  // To-DO: Insert username and hashed password into the 'users' table
  const username = req.body.username;
  const email = req.body.email;

  if (!username || !hash || !email) {
    return res.status(400).send('Missing required fields');
  }

  const query = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3);`;
  db.any(query, [username, hash, email])
    .then(data => {
      res.status(200);
      res.redirect('/login')
    })
    .catch((err) => {
      res.status(400);
      res.redirect('/register')
      console.log("error")
    });
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  // const password = req.body.password;

  const query = `SELECT username, password, email from users WHERE username = $1;`;

  db.one(query, [username])
    .then(async (data) => {
      const match = await bcrypt.compare(req.body.password, data.password);

      if (match) { // login successesful
        user.username = data.username; // save data to the user object 
        user.password = data.password;
        user.email = data.email;

        req.session.user = user;
        req.session.save();
        res.status(200);
        res.redirect("/home")
      }
      else {
        res.status(400);
        res.render('pages/login', {
          error: true,
          message: 'Incorrect username or password'
        })
      }
    })
    .catch(err => {
      res.status(400);
    })


});

//Explore Parks 
app.get('/exploreParks', (req, res) => {
  var q1 = `Select park_code, fullName, states, json_array_elements(parks.images)->>'url' FROM parks LIMIT 12;`;
  console.log("EXPLORE PATHS----")
  db.any(q1)
    .then(data => {
      console.log(data)
      res.render('pages/exploreParks', {
        data: data,
      });
      res.status(200);
    })
    .catch(err => {
      res.status(400);
      res.render('pages/exploreParks', {
        error: true,
        message: 'no data',
      })
    })
});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

app.get('/alltrips', (req, res) => {

  const query = 'SELECT trip_title, start_date, number_of_days, trip_progress FROM trips WHERE username = $1;';

  db.any(query, [user.username])
    .then(data => {
      //res.status(200);
      res.render('pages/allTrips', {
        data: data
      })
    })
    .catch(err => {
      res.render('pages/allTrips', {
        error: true,
        message: "No data received"
      })
    })
});

app.get('/createTrip', (req, res) => {
  res.render('pages/createTrip', {

  });
});


app.post("/createTrip", (req, res) => {
  const title = req.body.title;
  const startdate = req.body.startdate;
  const numDays = req.body.numdays;
  const username = user.username;
  if (!username) {
    res.status(400).send("How did you even get this far without logging in???")
  }
  const trip_progress = "Planned"; // this is default


  //Insert into trips table and also return trip_id and num_days to be used to insert into days table
  const queryTrips = `
    INSERT INTO trips (trip_title, start_date, number_of_days, username, trip_progress)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING trip_id, number_of_days; 
  `

  const queryDays = `
    INSERT INTO days (day_number, trip_id) VALUES ($1, $2);
  `

  db.task(async task => {
    // result will have trip_id and number_of_days
    const result = await task.one(queryTrips, [title, startdate, numDays, username, trip_progress]);
    for (let i = 1; i <= numDays; i++) {

      await task.none(queryDays, [i, result.trip_id])
    }


  })
    .then(data => {
      res.render('pages/home', {
        message: "Created Trip Successfully!"
      })
    })
    .catch(err => {
      res.render('pages/home', {
        error: true,
        message: "Could not create the trip!"
      })
      console.log("ERROR create trips did not work")
    })

});


app.post('/trip/delete',(req,res)=>{
  const id = req.body.trip_id;
  const query =  `
    DELETE FROM trips where trip_id = ${id};
  `
})

app.get('/trip_id/edit/day_id', (req,res) =>{

})

app.get('/trip_id/edit/day_id/park_code', (req, res) =>{

})

app.get('/trip_id/edit/day_id/park_code/id', (req, res) =>{
  
})
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});


// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);;
console.log('Server is listening on port 3000');
