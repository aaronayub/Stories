import config from './sql/config.json'
import { exec } from 'child_process'
import { exit } from 'process';

async function init() {
    const process = exec('mariadb -u ' + config.user + " --password=" + config.password + ' -e "source sql/initDatabase.sql"');
    console.log(process.stdout);
    console.log(process.stderr);
    console.log("\nInitialized database!")
}
init();
exit(0)