/* This script initializes or resets the MySQL backend for the Stories app. It creates the database and any tables needed. */

DROP DATABASE IF EXISTS storiesApp;
CREATE DATABASE storiesApp;
USE storiesApp;

/* All registered users */
CREATE TABLE users (
    username VARCHAR(40) NOT NULL PRIMARY KEY,
    pass VARCHAR(256) NOT NULL,
    account VARCHAR(32) DEFAULT 'user',
    registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* All written stories.
Users may omit adding a short description, but can't submit blank stories. */
CREATE TABLE stories (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    brief VARCHAR(256),
    content LONGTEXT NOT NULL,
    username VARCHAR(40) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users (username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* All ratings for a given story, by a given user*/
CREATE TABLE ratings (
    id INT UNSIGNED AUTO_INCREMENT NOT NULL,
    username VARCHAR(40) NOT NULL,
    rating TINYINT NOT NULL,
    PRIMARY KEY (id, username),
    FOREIGN KEY (username) REFERENCES users (username)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (id) REFERENCES stories (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* Login tokens for persistent sessions */
CREATE TABLE logins (
    token VARCHAR(128) NOT NULL PRIMARY KEY,
    username VARCHAR(40) NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users (username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);