--DROP TABLE IF EXISTS users;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    email VARCHAR(50) NOT NULL
);

--DROP TABLE IF EXISTS trips;
CREATE TABLE trips(
    trip_id INTEGER PRIMARY KEY,
    start_date VARCHAR(50),
    number_of_days INTEGER,
    username VARCHAR(50) REFERENCES users (username) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS parks;
CREATE TABLE parks(
    park_code VARCHAR(4) PRIMARY KEY,
    park_url VARCHAR(200),
    park_latlong VARCHAR(100),
    park_full_name VARCHAR(100),
    states VARCHAR(20)
);

--DROP TABLE IF EXISTS campgrounds;
CREATE TABLE campgrounds(
    campground_id VARCHAR(50) PRIMARY KEY,
    campground_latlong VARCHAR(60),
    campground_name VARCHAR(60),
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE,
    campground_url VARCHAR(100)
);

--DROP TABLE IF EXISTS days;
CREATE TABLE days(
    day_id VARCHAR(50) PRIMARY KEY,
    day_number INTEGER,
    trip_id INTEGER REFERENCES trips (trip_id) ON DELETE CASCADE,
    campground_id VARCHAR(50) REFERENCES campgrounds (campground_id) ON DELETE CASCADE
);


--DROP TABLE IF EXISTS tours;
CREATE TABLE tours(
    tour_id VARCHAR(50) PRIMARY KEY,
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE,
    tour_duration VARCHAR(50),
    tour_title VARCHAR(50),
    tour_description VARCHAR(200)
);


--DROP TABLE IF EXISTS activities;
CREATE TABLE activities(
    activity_id VARCHAR(50) PRIMARY KEY,
    activity_name VARCHAR(50)
);

--DROP TABLE IF EXISTS things_to_do;
CREATE TABLE things_to_do(
    thing_id VARCHAR(50) PRIMARY KEY,
    thing_description VARCHAR(200),
    thing_url VARCHAR(100),
    thing_title VARCHAR(100),
    thing_duration VARCHAR(30),
    thing_location VARCHAR(100),
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS images;
CREATE TABLE images(
    image_url VARCHAR(200) PRIMARY KEY,
    image_title VARCHAR(100)
);

--DROP TABLE IF EXISTS events;
CREATE TABLE events(
    event_id VARCHAR(50) PRIMARY KEY,
    event_description VARCHAR(100),
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE,
    event_title VARCHAR(40),
    event_start VARCHAR(12),
    event_location VARCHAR(50)
);

--DROP TABLE IF EXISTS parks_to_things;
CREATE TABLE parks_to_things(
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE,
    thing_id VARCHAR(50) REFERENCES things_to_do (thing_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS things_to_activities;
CREATE TABLE things_to_activites(
    thing_id VARCHAR(50) REFERENCES things_to_do (thing_id) ON DELETE CASCADE,
    activity_id VARCHAR(50) REFERENCES activities (activity_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_parks;
CREATE TABLE days_to_parks(
    day_id VARCHAR(50) REFERENCES days (day_id) ON DELETE CASCADE, 
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS activities_to_parks;
CREATE TABLE activites_to_parks(
    activity_id VARCHAR(50) REFERENCES activities (activity_id) ON DELETE CASCADE,
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS images_to_parks;
CREATE TABLE images_to_parks(
    image_url VARCHAR(200) REFERENCES images (image_url) ON DELETE CASCADE,
    park_code VARCHAR(4) REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS campgrounds_to_images;
CREATE TABLE campgrounds_to_images(
    campground_id VARCHAR(50) REFERENCES campgrounds (campground_id) ON DELETE CASCADE,
    image_url VARCHAR(200) REFERENCES images (image_url) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS events_to_images;
CREATE TABLE events_to_images(
    image_url VARCHAR(200) REFERENCES images (image_url) ON DELETE CASCADE,
    event_id VARCHAR(50) REFERENCES events (event_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS tours_to_images;
CREATE TABLE tours_to_images(
    tour_id VARCHAR(50) REFERENCES tours (tour_id) ON DELETE CASCADE,
    image_url VARCHAR(200) REFERENCES images (image_url) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS tours_to_activities;
CREATE TABLE tours_to_activites(
    tour_id VARCHAR(50) REFERENCES tours (tour_id) ON DELETE CASCADE,
    activity_id VARCHAR(50) REFERENCES activities (activity_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_events;
CREATE TABLE days_to_events(
    day_id VARCHAR(50) REFERENCES days (day_id) ON DELETE CASCADE,
     event_id VARCHAR(50) REFERENCES events (event_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_things;
CREATE TABLE days_to_things(
    day_id VARCHAR(50) REFERENCES days (day_id) ON DELETE CASCADE,
    thing_id VARCHAR(50) REFERENCES things_to_do (thing_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_tours;
CREATE TABLE days_to_tours(
    day_id VARCHAR(50) REFERENCES days (day_id) ON DELETE CASCADE,
    tour_id VARCHAR(50) REFERENCES tours (tour_id) ON DELETE CASCADE
);




