--Relations Tables, Images table

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

--DROP TABLE IF EXISTS days;
CREATE TABLE days(
    day_id SERIAL PRIMARY KEY,
    day_number INTEGER,
    trip_id INTEGER REFERENCES trips (trip_id) ON DELETE CASCADE,
    campground_id text REFERENCES campgrounds (campground_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS images;
CREATE TABLE images(
    caption text,
    url text,
    credit text,
    title text,
    altText text,
    image_id SERIAL PRIMARY KEY
    
);


--DROP TABLE IF EXISTS parks_to_things;
CREATE TABLE parks_to_things(
    thing_id text REFERENCES things_to_do (thing_id) ON DELETE CASCADE,
    park_code text REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS things_to_activities;
CREATE TABLE activities_to_things(
    activity_id text REFERENCES activities (activity_id) ON DELETE CASCADE,
    thing_id text REFERENCES things_to_do (thing_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_parks;
CREATE TABLE days_to_parks(
    day_id INTEGER REFERENCES days (day_id) ON DELETE CASCADE, 
    park_code text REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS activities_to_parks;
CREATE TABLE activities_to_parks(
    activity_id text REFERENCES activities (activity_id) ON DELETE CASCADE,
    park_code text REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS images_to_parks;
CREATE TABLE images_to_parks(
    image_id INTEGER REFERENCES images (image_id) ON DELETE CASCADE,
    park_code text REFERENCES parks (park_code) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS campgrounds_to_images;
CREATE TABLE images_to_campgrounds(
    image_id INTEGER REFERENCES images (image_id) ON DELETE CASCADE,
    campground_id text REFERENCES campgrounds (campground_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS tours_to_images;
CREATE TABLE images_to_tours(
    tour_id text REFERENCES tours (tour_id) ON DELETE CASCADE,
    image_id INTEGER REFERENCES images (image_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS tours_to_activities;
CREATE TABLE activities_to_tours(
    activity_id text REFERENCES activities (activity_id) ON DELETE CASCADE,
    tour_id text REFERENCES tours (tour_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_events;
CREATE TABLE days_to_events(
    day_id INTEGER REFERENCES days (day_id) ON DELETE CASCADE,
    event_id text REFERENCES events (event_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_things;
CREATE TABLE days_to_things(
    day_id INTEGER REFERENCES days (day_id) ON DELETE CASCADE,
    thing_id text REFERENCES things_to_do (thing_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_tours;
CREATE TABLE days_to_tours(
    day_id INTEGER REFERENCES days (day_id) ON DELETE CASCADE,
    tour_id text REFERENCES tours (tour_id) ON DELETE CASCADE
);

--DROP TABLE IF EXISTS days_to_tours;

--https://www.postgresql.org/docs/9.3/functions-json.html For doing SQL methods with json data

--INSERT for images under parks, relational images_to_parks, activities_to_parks

    --images
    INSERT INTO images
    SELECT json_array_elements(images)->> 'caption', json_array_elements(images)->> 'url', json_array_elements(images)->> 'credit', json_array_elements(images)->> 'title', json_array_elements(images)->> 'altText'
    FROM parks;

    --remove duplicate images
    DELETE FROM images 
    WHERE  image_id NOT IN (SELECT Min(image_id) FROM images GROUP BY url);

    --images_to_parks
    WITH 
        parkImages AS (
            SELECT json_array_elements(parks.images)->>'url' AS url, park_code FROM parks 
        )
    INSERT INTO images_to_parks
    SELECT image_id, parkImages.park_code FROM images INNER JOIN parkImages ON images.url = parkImages.url;

    --activities_to_parks
    WITH 
        parkActivities AS (
            SELECT json_array_elements(parks.activities)->>'id' AS id, park_code FROM parks 
        )
    INSERT INTO activities_to_parks
    SELECT activity_id, parkActivities.park_code FROM activities INNER JOIN parkActivities ON activities.activity_id = parkActivities.id;

--INSERT for images under tours, relational images_to_tours, activities_to_tours, tours_to_parks

    --images
    INSERT INTO images
    SELECT json_array_elements(images)->> 'caption', json_array_elements(images)->> 'url', json_array_elements(images)->> 'credit', json_array_elements(images)->> 'title', json_array_elements(images)->> 'altText'
    FROM tours;

    --remove duplicate images
    DELETE FROM images 
    WHERE  image_id NOT IN (SELECT Min(image_id) FROM images GROUP BY url);

    --images_to_tours
    WITH 
        tourImages AS (
            SELECT json_array_elements(tours.images)->>'url' AS url, tour_id FROM tours
        )
    INSERT INTO images_to_tours
    SELECT tourImages.tour_id, image_id FROM images INNER JOIN tourImages ON images.url = tourImages.url;

    --activities_to_tours
    WITH 
        tourActivities AS (
            SELECT json_array_elements(tours.tour_activities)->>'id' AS id, tour_id FROM tours
        )
    INSERT INTO activities_to_tours
    SELECT activity_id, tourActivities.tour_id FROM activities INNER JOIN tourActivities ON activities.activity_id = tourActivities.id;


--INSERT for parks_to_things, activities_to_things

    --parks_to_things
    INSERT INTO parks_to_things
    SELECT thing_id, json_array_elements(relatedParks)->> 'parkCode'
    FROM things_to_do;

    --activities_to_things
    WITH 
        thingActivities AS (
            SELECT json_array_elements(things_to_do.thing_activities)->>'id' AS id, thing_id FROM things_to_do
        )
    INSERT INTO activities_to_things
    SELECT activity_id, thingActivities.thing_id FROM activities INNER JOIN thingActivities ON activities.activity_id = thingActivities.id;


--INSERT for images under campgrounds, relational images_to_campgrounds

    --images
    INSERT INTO images
    SELECT json_array_elements(images)->> 'caption', json_array_elements(images)->> 'url', json_array_elements(images)->> 'credit', json_array_elements(images)->> 'title', json_array_elements(images)->> 'altText'
    FROM campgrounds;

    --remove duplicate images
    DELETE FROM images 
    WHERE  image_id NOT IN (SELECT Min(image_id) FROM images GROUP BY url);

    --images_to_campgrounds
    WITH 
        campImages AS (
            SELECT json_array_elements(campgrounds.images)->>'url' AS url, campground_id FROM campgrounds
        )
    INSERT INTO images_to_campgrounds
    SELECT image_id, campImages.campground_id FROM images INNER JOIN campImages ON images.url = campImages.url;


