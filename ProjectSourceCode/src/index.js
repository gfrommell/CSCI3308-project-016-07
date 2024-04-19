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
const { lutimes } = require('fs');



// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

Handlebars.registerHelper('getFirstImage', function (images) {
  if(images == undefined){
    return {"url":"https://ralfvanveen.com/wp-content/uploads//2021/06/Placeholder-_-Begrippenlijst.svg"};
  } else {
    return images[0];
  }
});

Handlebars.registerHelper('getNimagesFromIndex', function (images,index) {
  var ret = [];
  for(var i = index*4; i < (index*4 + 4); ++i ){
    if( ((images.length-1) >= (i)) && images[i].url != undefined){
      ret.push(`${images[i].url}`);
    } else {
      ret.push("https://ralfvanveen.com/wp-content/uploads//2021/06/Placeholder-_-Begrippenlijst.svg");
    }
  }
  return {"images": ret};
});

Handlebars.registerHelper('getImageAtIndex', function (images, index) {
  return images[index];
});

Handlebars.registerHelper('checkIndex', function (index) {
  return index == 0;
});

Handlebars.registerHelper('getImagesRows', function (images) {
  return (images.length / 4);
});

Handlebars.registerHelper('formatDate', function (date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${day}/${month}`;
});

Handlebars.registerHelper('formatDateInput', function (date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

Handlebars.registerHelper('formatDateIncrement', function (date, index) {
  const d = new Date(date);
  d.setDate(d.getDate() + index);
  const year = d.getFullYear();
  const month = String(d.getMonth()).padStart(2, '0');
  const day = String(d.getDate()+ index).padStart(2, '0');
  return `${year}/${day}/${month}`;
});

//https://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js/11924998#11924998
Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i) {
        block.data.index = i;
        block.data.first = i === 0;
        block.data.last = i === (n - 1);
        accum += block.fn(this);
    }
    return accum;
});

Handlebars.registerHelper('checkParksDay', function(parks, index) {
  var accum;
  for(var i = 0; i < parks.length; ++i) {
      if(parks[i].day_number == index){
        accum = parks[i];
      }
  }
  return accum;
});

Handlebars.registerHelper('eventForDay', function(events, index) {
  var accum = [];
  if(events == undefined){
    return;
  } else {
    for(var i = 0; i < events.length; ++i) {
        if(events[i].day_number == index){
          accum.push(events[i]);
        }
    }
    return accum;
  }
});

Handlebars.registerHelper('campsForDay', function(camps, index) {
  var accum = [];
  if(camps == undefined){
    return;
  } else {
    for(var i = 0; i < camps.length; ++i) {
        if(camps[i].day_number == index){
          accum.push(camps[i]);
        }
    }
    return accum;
  }
});

Handlebars.registerHelper('thingsForDay', function(things, index) {
  var accum = [];
  if(things == undefined){
    return;
  } else {
    for(var i = 0; i < things.length; ++i) {
        if(things[i].day_number == index){
          accum.push(things[i]);
        }
    }
    return accum;
  }
});

Handlebars.registerHelper('toursForDay', function(tours, index) {
  var accum = [];
  if(tours == undefined){
    return;
  } else {
    for(var i = 0; i < tours.length; ++i) {
        if(tours[i].day_number == index){
          accum.push(tours[i]);
        }
    }
    return accum;
  }
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
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

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

app.use(express.static(path.join('resources', 'js')));

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

    const query = `
  SELECT t.trip_id, t.trip_title, t.start_date, t.number_of_days, t.trip_progress
  FROM trips t
  LEFT JOIN trips_to_users ttu ON t.trip_id = ttu.trip_id
  WHERE t.username = $1 OR ttu.username = $1;
`;

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
app.get('/exploreParks/:keyword', (req, res) => {

  var q1 = `Select park_code, fullName, states, images, url FROM parks LIMIT 12;`;
  const key = req.params.keyword;

  if(key == 'none'){
            db.any(q1)
            .then(data => {

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
    } else {
      var q2 = `SELECT park_code, fullName, states, images, url FROM parks WHERE fullName ~~* '${key}%' OR fullName ~~* '% ${key}%' OR states ~~* '%${key}%' LIMIT 12;`
      db.any(q2)
          .then(data => {
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
    }
  
});

app.post('/exploreParks', (req, res) => {
    res.redirect(`/exploreParks/${req.body.keyword}`);
    res.status(200);
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

  const username = user.username;

  const query = `
    SELECT t.trip_id, t.trip_title, t.start_date, t.number_of_days, t.trip_progress
    FROM trips t
    LEFT JOIN trips_to_users ttu ON t.trip_id = ttu.trip_id
    WHERE t.username = $1 OR ttu.username = $1;
  `;

  db.any(query, [username])
    .then(data => {
      res.render('pages/allTrips', { 

        data: data

      });
    })
    .catch(err => {
      console.error('Error fetching all trips:', err);
      res.render('pages/allTrips', {
        error: true,
        message: "No data received"
      });
    });
});

app.get('/createTrip', (req, res) => {
  res.render('pages/createTrip', {

  });
});

app.get('/notifications', (req, res) => {
  const username = user.username;
  const query = `SELECT * FROM notifications WHERE receiver_username = $1 AND status IS NOT TRUE AND status IS NOT FALSE`;

  db.any(query, username)
    .then(data => {
      res.render('pages/notifications', {
        data: data,
        message: "Fetched notifications"
      })
    })
    .catch(err => {
      res.render('pages/notifications', {
        error: true,
        message: "Could not fetch notifications"
      })
      console.log("ERROR")
    })
});

app.post('/notifications/accepted', async (req, res) => {
  const { notificationId, receiverUsername, tripID } = req.body;
  try {
    await db.task(async task => {
      const insertQuery = 'INSERT INTO trips_to_users (trip_id, username) VALUES ($1, $2)';
      await task.none(insertQuery, [tripID, receiverUsername]);
      const updateQuery = 'UPDATE notifications SET status = true WHERE notifications_id = $1';
      await task.none(updateQuery, [notificationId]);
    });
    res.send({ success: true, message: 'Accepted' });
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).send({ success: false, message: 'Error processing your request', error: error.message });
  }
});


app.post('/notifications/declined', async (req, res) => {
  const { notificationId } = req.body;
  try {
    await db.task(async task => {
      const updateQuery = 'UPDATE notifications SET status = false WHERE notifications_id = $1';
      await task.none(updateQuery, [notificationId]);
    });
    res.send({ success: true, message: 'Declined' });
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).send({ success: false, message: 'Error processing your request', error: error.message });
  }
});



app.post("/createTrip", (req, res) => {
  const title = req.body.title;
  const startdate = req.body.startdate;
  const numDays = req.body.numdays;
  const username = user.username;
  const trip_id = req.body.trip_id
  let last_record;
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
    if(trip_id){

      await task.none(`DELETE FROM trips WHERE trip_id = $1`, [trip_id])
      last_record = await task.one(`SELECT trip_id FROM trips ORDER BY trip_id DESC LIMIT 1;`)
      
    }
    
    for (let i = 0; i <= numDays; i++) {

      await task.none(queryDays, [i, result.trip_id])
    }


  })
    .then(data => {
      if(trip_id){
        res.redirect(`/edit/${last_record.trip_id}`)
      }
      else{

        res.redirect('/home');
      }
      

        
      
      // else{
      //   res.redirect(`/edit/${last_record.trip_id}`)
      // }
    })
    .catch(err => {
      res.redirect('/createTrip', {
        error: true,
        message: "Could not create the trip!"
      })
      console.log("ERROR create trips did not work")
    })

});

// Delete row on the All trips page

app.post('/tripDelete', (req,res) => {
  const id = req.body.trip_id;
  const query = `
    DELETE FROM trips WHERE trip_id = ${id};
  `
  db.none(query)
  .then(()=>{
    res.redirect('/allTrips')
  })
  .catch(err=>{
    res.send(err)
  })
});

// Share trip
app.post('/tripShare',(req,res)=>{
  const id = req.body.trip_id;
  const sender = user.username;
  const receiver = req.body.receiver_id;
  //const date = new Date(year, month, day);
  //console.log(date);
  const query = `
    INSERT INTO notifications (trip_id,sender_username,receiver_username,message,date_sent)
    VALUES($1, $2, $3,'${sender} has invited you to their trip', '2024/4/13');
  `;


  db.any(query, [id,sender,receiver])
  .then(data =>{
    res.redirect('/allTrips');
  })
  .catch(err=>{
    res.render('pages/allTrips', {
      error: true,
      message: "Could not create the trip!"
    });
  })
});


app.get('/edit/:id/:day_id?', (req, res) => {
  const id = req.params.id;
  const day_id = req.params.day_id;
  const query = `
  SELECT * FROM trips WHERE trip_id = $1;`;
  let q2;
  const limit_query = 
  `
    SELECT number_of_days from trips WHERE trip_id = $1;
  `
  db.task('get-trip-days',  async task => {

    parks = `
      WITH
      aggregateParks AS (
        SELECT DISTINCT days.*, trips.*, days_to_parks.park_code, parks.fullName
        FROM days 
        INNER JOIN trips ON days.trip_id = trips.trip_id 
        LEFT JOIN days_to_parks ON days.day_id = days_to_parks.day_id 
        LEFT JOIN parks ON parks.park_code = days_to_parks.park_code
        WHERE trips.trip_id = $1
        ORDER BY days.day_id ASC
      )
      SELECT * FROM aggregateParks;
    `;

    events = `
      WITH
      aggregateEvents AS (
        SELECT DISTINCT days.*, trips.*, days_to_events.event_id, events.title
        FROM days 
        INNER JOIN trips ON days.trip_id = trips.trip_id 
        LEFT JOIN days_to_events ON days.day_id = days_to_events.day_id 
        LEFT JOIN events ON events.event_id = days_to_events.event_id
        WHERE trips.trip_id = $1
        ORDER BY days.day_id ASC
      )
      SELECT * FROM aggregateEvents;
    `;

    tours = `
      WITH
      aggregateTours AS (
        SELECT DISTINCT days.*, trips.*, days_to_tours.tour_id, tours.title
        FROM days 
        INNER JOIN trips ON days.trip_id = trips.trip_id 
        LEFT JOIN days_to_tours ON days.day_id = days_to_tours.day_id 
        LEFT JOIN tours ON tours.tour_id = days_to_tours.tour_id
        WHERE trips.trip_id = $1
        ORDER BY days.day_id ASC
      )
      SELECT * FROM aggregateTours;
    `;

    things = `
      WITH
      aggregateThings AS (
        SELECT DISTINCT days.*, trips.*, days_to_things.thing_id, things_to_do.title
        FROM days 
        INNER JOIN trips ON days.trip_id = trips.trip_id 
        LEFT JOIN days_to_things ON days.day_id = days_to_things.day_id 
        LEFT JOIN things_to_do ON things_to_do.thing_id = days_to_things.thing_id
        WHERE trips.trip_id = $1
        ORDER BY days.day_id ASC
      )
    SELECT * FROM aggregateThings;
    `;


    campgrounds = `
      WITH
      aggregateCamps AS (
        SELECT DISTINCT days.*, trips.*, days_to_campgrounds.campground_id, campgrounds.name
        FROM days 
        INNER JOIN trips ON days.trip_id = trips.trip_id 
        LEFT JOIN days_to_campgrounds ON days.day_id = days_to_campgrounds.day_id 
        LEFT JOIN campgrounds ON campgrounds.campground_id = days_to_campgrounds.campground_id
        WHERE trips.trip_id = $1
        ORDER BY days.day_id ASC
      )
    SELECT * FROM aggregateCamps;
    `;

    //return await task.batch([task.one(query, id), task.any(parks, id), task.any(events, id), task.any(tours, id), task.any(things, id), task.any(camps, id)]);
    return await task.batch([task.one(query, id), task.any(parks, id), task.any(events, id), task.any(tours, id), task.any(things, id), task.any(campgrounds, id)]);
  })
  .then(data=>{
    
    // data[0] is the trip data underneath the specific trip_id
    // data[1] is the park to days data
    // data[2] is the events to days data
    // data[3] is the tours to days data
    // data[4] is the things to days data
    // data[5] is the campgrounds to days data
    res.render('pages/tripEditDetails',{
      trip: data[0],
      parks: data[1],
      events: data[2],
      tours: data[3],
      things: data[4],
      camps: data[5],
      message: "Fetched data"
    })
  })
  .catch(err=>{
    res.render('pages/allTrips',{
      error: true,
      message: "Could not fetch notifications"
    })
    console.log("ERROR")
  })
});


app.post('/tripEdit', (req, res) => {
  const id = req.body.trip_id;
  // const 
  var q1 = '';
  var q2 = '';
  var q3 = '';

  //if user edited title
  if(!req.body.title.isEmpty){
    q1 = `UPDATE trips SET trip_title = '${req.body.title}' WHERE trip_id = ${id};`;
  }

   //if user edited start date
  if(!req.body.startdate.isEmpty){
    q2 = `UPDATE trips SET start_date = '${req.body.startdate}' WHERE trip_id = ${id};`;
  }

   //if user edited number of days
  if(!req.body.numdays.isEmpty){
    q3 = `UPDATE trips SET number_of_days = '${req.body.numdays}' WHERE trip_id = ${id};`;
  }

  db.task('edit-trip-information', task => {
    //run queries for each  field, unalteried fields will be empty queries
    return task.batch([task.any(q1), task.any(q2), task.any(q3)]);
  })
  .then(data=>{
    res.status(201);
    res.redirect(`/edit/${id}`);
  })
  .catch(err=>{
    res.status(err);
    res.redirect(`/edit/${id}`,{
      error: true,
      message: "Could not edit trip"
    })
  })
});

app.get('/edit/:id', (req,res) => {
  const id = req.params.id;
  const q1 = `
    SELECT * FROM trips 
    WHERE trip_id = $1;
  `;
  const q2 = `
    SELECT * FROM days
    WHERE trip_id = $1;
  `;

  db.task('get-trip-details', task => {
    return task.batch([task.any(q1, [id]), task.any(q2, [id])]);
  })
  .then(data => {
    res.render('pages/tripEditDetails', {
      trip: data[0],
      days: data[1],
      message: "Trip data fetched",
    });
  })
  .catch(err => {
    res.render('pages/allTrips', {
      error: true,
      message: "Unable to fetch trip data",
    });
    console.log("ERROR");
  });
});

app.route('/:trip_id/edit/:day_id')
  // Render a list of activites associated with a park? Or is it just a search bar and stuff?
  .get((req, res) =>{
    const data = {
      day_id : req.params.day_id,
      trip_id : req.params.trip_id
    }
    res.render('pages/activities',{data})
  })


  .post((req, res) =>{ //! insert into the days_to_parks

    const park_name = req.body.park_name;
    const trip_id = req.params.trip_id;
    const day_id = req.params.day_id;
    let park_code;
    
    const get_park_code = `
      SELECT park_code from parks WHERE fullName = $1;
    `

    const check_query =   `
      SELECT day_id from days_to_parks WHERE day_id = $1;
    `

    const query = `
      INSERT INTO days_to_parks (day_id, park_code) VALUES ($1, $2);
    
    `
    db.task(async task =>{
      let {park_code: pc} = await task.one(get_park_code, [park_name])
      park_code = pc
      
      const check = await task.any(check_query,[day_id]); // check if day_id already exists
      if(check.length == 0){
        await task.none(query, [day_id, park_code ]) // if day_id does not exist, insert the park_code
      }
      else{
        await task.none(`UPDATE days_to_parks SET park_code = $1 WHERE day_id = $2;`, [park_code ,day_id]) //update the park_code if day_id already exists
      }
   
    })
    .then(()=>{

      // res.redirect(`/${trip_id}/edit/${day_id}/${park_code}`)
      res.redirect(`/edit/${trip_id}/${day_id}`)
    })

  
 
  })

app.get('/:trip_id/edit/:day_id/:park_code', (req, res) =>{
 // Render everything associated with activities or events
  const trip_id = req.params.trip_id;
  const day_id = req.params.day_id;
  const park_code = req.params.park_code;
  const q1 = `
    SELECT title, event_id FROM events WHERE park_code = $1;
  `
  const q2 =`
  SELECT name, campground_id FROM campgrounds WHERE park_code = $1;
  ` 
  const q3 =`
    SELECT title, tour_id FROM tours WHERE park_code = $1;
  `

  const q4 = `
    SELECT things_to_do.title, things_to_do.thing_id FROM things_to_do
    LEFT JOIN parks_to_things ON parks_to_things.thing_id = things_to_do.thing_id
    WHERE parks_to_things.park_code = $1;
  `;

  db.task(async task =>{
    return await task.batch([task.any(q1, park_code), task.any(q2, park_code), task.any(q3, park_code), task.any(q4, park_code)]);
  })
  .then(data =>{
    console.log(data[3][0]);
    res.render('pages/items',{
      events:data[0],
      campgrounds:data[1],
      tours: data[2],
      things: data[3],
      day_id :day_id,
      trip_id :trip_id
    })
  })
  .catch(err =>{
    console.log("ERROR")
  })
  
})

app.post('/insert-event/:day_id/:event_id', (req, res) =>{
  // Add specific item to that day
  const day_id = req.params.day_id
  const event_id = req.params.event_id;
  const trip_id = req.body.trip_id;
  const query =
  `INSERT INTO days_to_events (day_id, event_id) VALUES ($1, $2)`

  db.none(query, [day_id, event_id])
  .then(()=>[
    res.redirect(`/edit/${trip_id}`)
  ])
  .catch(err=>{
    console.log("insert items error")
  })
  
})

app.post('/insert-thing/:day_id/:thing_id', (req, res) =>{
  // Add specific item to that day
  const day_id = req.params.day_id
  const thing_id = req.params.thing_id;
  const trip_id = req.body.trip_id;
  const query =
  `INSERT INTO days_to_things (day_id, thing_id) VALUES ($1, $2)`

  db.none(query, [day_id, thing_id])
  .then(()=>[
    res.redirect(`/edit/${trip_id}`)
  ])
  .catch(err=>{
    console.log("insert items error")
  })
  
})

app.post('/insert-campground/:day_id/:campground_id', (req, res) =>{
  // Add specific item to that day
  const day_id = req.params.day_id
  const campground_id = req.params.campground_id;
  const trip_id = req.body.trip_id;
  const query =
  `INSERT INTO days_to_campgrounds (campground_id, day_id) VALUES ($1, $2)`

  db.none(query, [campground_id, day_id])
  .then(()=>[
    res.redirect(`/edit/${trip_id}`)
  ])
  .catch(err=>{
    console.log("insert items error")
  })
  
})

app.post('/insert-tour/:day_id/:tour_id', (req, res) =>{
  // Add specific item to that day
  const day_id = req.params.day_id
  const tour_id = req.params.tour_id;
  const trip_id = req.body.trip_id;
  const query =
  `INSERT INTO days_to_tours (day_id, tour_id) VALUES ($1, $2)`

  db.none(query, [day_id, tour_id])
  .then(()=>[
    res.redirect(`/edit/${trip_id}`)
  ])
  .catch(err=>{
    console.log("insert items error")
  })
  
})

app.get('/park_details/:park_code', async (req, res) => {
  const parkCodePlus = req.params.park_code;
  const parkCode = parkCodePlus.substring(1);
  const query1 = `SELECT * FROM parks WHERE park_code = $1 LIMIT 1`;

  const query2 = `SELECT a.name
  FROM activities a
  JOIN activities_to_parks atp ON a.activity_id = atp.activity_id
  JOIN parks p ON atp.park_code = p.park_code
  WHERE p.park_code = $1;`;

  const query3 = `SELECT t.title, t.shortDescription, t.timeOfDayDescription, t.seasonDescription
  FROM things_to_do t
  JOIN parks_to_things ptt ON t.thing_id = ptt.thing_id
  JOIN parks p ON ptt.park_code = p.park_code
  WHERE p.park_code = $1;`;

  const q4 = `
    SELECT json_array_elements(parks.images)->'url' AS url FROM parks WHERE park_code = $1;
  `;

  try {
    const data = await db.oneOrNone(query1, [parkCode]);

    const data2 = await db.any(query2, [parkCode]);
    //console.log("Data from second query:", data2);

    const data3 = await db.any(query3, [parkCode]);
    //console.log("Data from third query:", data3);

    const image = await db.any(q4, [parkCode]);

    if (data) {
        res.render('pages/parkDetails', {
            data: data,
            data2: data2,
            data3: data3,
            images: image,
            message: "Fetched park data"
        });
    } else {
        res.render('pages/parkDetails', {
            error: true,
            message: "No data found for this park code"
        });
    }
} catch (err) {
    res.render('pages/parkDetails', {
        error: true,
        message: "Could not fetch park data",
        details: err.message 
    });
    console.log("ERROR:", err); 
}
});



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