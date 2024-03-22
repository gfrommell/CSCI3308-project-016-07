CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    email VARCHAR(50) NOT NULL
);

CREATE TABLE trips(
    trip_id INTEGER PRIMARY KEY,
    username VARCHAR(50) FOREIGN KEY,
    start_date VARCHAR(50),
    number_of_days INTEGER,
);

CREATE TABLE days(
    day_id VARCHAR(50) PRIMARY KEY, 
    park_id FOREIGN KEY,
    campground_id FOREIGN KEY,
    day_number INTEGER,
);

CREATE TABLE campgrounds(
    campground_id VARCHAR(50) PRIMARY KEY
);

CREATE TABLE tours(
    tour_id VARCHAR(50) PRIMARY KEY,
    park_id FOREIGN KEY,
    duration VARCHAR(50),
    title VARCHAR(50),
    description VARCHAR(100)
);

CREATE TABLE parks(
    park_id VARCHAR(50) PRIMARY KEY,
);

CREATE TABLE activites(
    activite_id VARCHAR(50) PRIMARY KEY,
    description VARCHAR(100)
);

CREATE TABLE things_to_do(
    things_to_do_id VARCHAR(50) PRIMARY KEY,
    description VARCHAR(100)
);

CREATE TABLE images(
    image_id INTEGER PRIMARY KEY,
    image_url VARCHAR(100),
    caption VARCHAR(100),
);

CREATE TABLE events(
    event_id VARCHAR(50) PRIMARY KEY
    description VARCHAR(100)
)

CREATE TABLE places(
    place_id VARCHAR(50) PRIMARY KEY,
)

CREATE TABLE parks_to_things(
    park_id VARCHAR(50) FOREIGN KEY,
    things_to_do_id VARCHAR(50) FOREIGN KEY
);

CREATE TABLE things_to_activites(
    things_to_do_id VARCHAR(50) FOREIGN KEY,
    activite_id VARCHAR(50) FOREIGN KEY,
);

CREATE TABLE days_to_trips(
    day_id VARCHAR(50) FOREIGN KEY, 
    trip_id INTEGER FOREIGN KEY,
);

CREATE TABLE activites_to_parks(
    activite_id VARCHAR(50) FOREIGN KEY,
    park_id VARCHAR(50) FOREIGN KEY,
);

CREATE TABLE images_to_parks(
    image_id INTEGER FOREIGN KEY,
    park_id VARCHAR(50) FOREIGN KEY,
);

CREATE TABLE places_to_images(
    place_id VARCHAR(50) FOREIGN KEY,
    image_id INTEGER FOREIGN KEY
);

CREATE TABLE places_to_parks(
    place_id VARCHAR(50) FOREIGN KEY,
    park_id VARCHAR(50) FOREIGN KEY,
);

CREATE TABLE tours_to_images(
    tour_id VARCHAR(50) FOREIGN KEY,
    image_id INTEGER FOREIGN KEY
);

CREATE TABLE tours_to_activites(
     tour_id VARCHAR(50) FOREIGN KEY,
     activite_id VARCHAR(50) FOREIGN KEY,
)

CREATE TABLE campgrounds_to_images(
    campground_id VARCHAR(50) FOREIGN KEY,
    image_id INTEGER FOREIGN KEY
);

CREATE TABLE days_to_events(
    day_id VARCHAR(50) FOREIGN KEY,
    event_id VARCHAR(50) FOREIGN KEY
);

CREATE TABLE days_to_things(
    day_id VARCHAR(50) FOREIGN KEY,
    things_to_do_id VARCHAR(50) FOREIGN KEY
);

CREATE TABLE days_to_parks(
    day_id VARCHAR(50) FOREIGN KEY,
    park_id VARCHAR(50) FOREIGN KEY,
);

CREATE TABLE days_to_tours(
    day_id VARCHAR(50) FOREIGN KEY,
    tour_id VARCHAR(50) FOREIGN KEY,
);

CREATE TABLE days_to_places(
    day_id VARCHAR(50) FOREIGN KEY,
    place_id VARCHAR(50) FOREIGN KEY,
);

