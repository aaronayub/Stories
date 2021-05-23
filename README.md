# Stories
This webapp allows users to write and display stories to publically. Other users can then read these stories, and rate them as well. Node.js, Express, Typescript, and MySQL are used for this project.

## Running the program
This website relies on a MySQL or MariaDB to host a database entitled "storiesApp". To test this out, SQL must be running, with a username and password entered for an SQL user with permission to create, select, and insert to databases, or at least the database entitled "storiesApp.

To initialize the database. You can run the script "sql/initDatabase.sql" provided by running a command such as "mysql -u USERNAME -p PASSWORD -e "source sql/initDatabase.sql"".

To run the program, modify the connection parameters in the index.ts file to use the proper host, username, and password. Make sure the PHP server is running, and then you can run "npm start" in the root directory. You can then visit the website at port 3000.