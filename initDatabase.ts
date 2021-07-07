/* This script initializes the database and its tables,
and additionally provides some sample data to show the website's
functionality more quickly. */

import config from './sql/config.json'
import adminConfig from './sql/adminConfig.json'
import con from './controllers/sql'
import { execSync } from 'child_process'
import bcrypt from 'bcrypt'
import { exit } from 'process';

/* Initialize the database and all its tables from the sql file */
async function init() {
    execSync('mysql -u ' + config.user + " --password=" + config.password + ' -e "source sql/initDatabase.sql"');
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
    await con.promise().query("INSERT INTO storyComments (id,username,comment) VALUES (?,?,?)",
    [1,"testuser2","What a well written and perfectly understandable story!"])
    console.log("Added stories to database!")
}

async function main() {
    await init() // Initialize the database
    
    // Populate the database with sample data, unless the user specifies not to.
    if (!process.argv.includes("noSamples")) {
        await addUsers()
        await addStories()
    }
    
    // Create an admin account with data from adminconfig.json if the user specifies
    if (process.argv.includes("admin")) {
        let hash = await bcrypt.hash(adminConfig.password,10)
        await con.promise().query("INSERT INTO users (username,pass,account) VALUES (?,?,?)",
        [adminConfig.user,hash,"admin"])
        console.log("Created admin with the username " + adminConfig.user + "!")
    }

    exit(0)
}

main()