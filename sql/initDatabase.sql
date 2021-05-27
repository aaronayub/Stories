/* This script initializes or resets the MySQL backend for the Stories app. It creates the database and any tables needed. */

DROP DATABASE IF EXISTS storiesApp;
CREATE DATABASE storiesApp;
USE storiesApp;

/* All registered users */
CREATE TABLE users (
    username VARCHAR(64) NOT NULL PRIMARY KEY,
    pass VARCHAR(256) NOT NULL,
    account VARCHAR(32) DEFAULT 'user',
    registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* All written stories.
Users may omit adding a short description, but can't submit blank stories. */
CREATE TABLE stories (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    brief VARCHAR(512),
    story LONGTEXT NOT NULL,
    username VARCHAR(64) NOT NULL,
    FOREIGN KEY (username) REFERENCES users (username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* All ratings for a given story, by a given user*/
CREATE TABLE ratings (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    username VARCHAR(64) NOT NULL,
    PRIMARY KEY (id, username),
    FOREIGN KEY (username) REFERENCES users (username)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id) REFERENCES stories (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);