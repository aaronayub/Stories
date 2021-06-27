/* This script initializes the database and its tables,
and additionally provides some sample data to show the website's
functionality more quickly. */

import config from './sql/config.json'
import con from './controllers/sql'
import { execSync } from 'child_process'
import bcrypt from 'bcrypt'
import { exit } from 'process';

/* Initialize the database and all its tables from the sql file */
async function init() {
    execSync('mariadb -u ' + config.user + " --password=" + config.password + ' -e "source sql/initDatabase.sql"');
    console.log("Initialized database!")
}

/* Give the database some sample users */
async function addUsers() {
    let hash = await bcrypt.hash("testuser",10)
    await con.promise().query("INSERT INTO users (username,pass) VALUES (?,?),(?,?),(?,?)",
    ['testuser1',hash,'testuser2',hash,'testuser3',hash]);
    console.log("Added users to database!")
}

/* Give the database some sample stories */
async function addStories() {
    let story = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

    await con.promise().query("INSERT INTO stories (title, brief, content, username) VALUES (?,?,?,?)",
    ["Lorem Ipsum Text","Placeholder text, now in story form!",story,"testuser1"])
    console.log("Added stories to database!")
}

async function main() {
    await init() // Initialize the database
    
    // If the user entered the noSamples argument, do not add sample data
    if (process.argv[2] == "noSamples") exit(0)
    
    // Otherwise, populate the database with sample data
    await addUsers()
    await addStories()
    exit(0)
}

main()