const db = require('./config/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');
var employeeList = [];
var roleList = [];
var departmentList = [];
var employeeId = [];
var roleId = [];
var departmentId = [];


async function excecuteChoice(answer) {
    // function responds to the answer.menuChoice from mainMenu();
    // View/SELECT queries use .promise so they resolve a console.table before calling mainMenu()
    // .then keeps the table from being overwritten by the menu
    const answerArray = answer.menuChoice.split(" ");
    if (answer.menuChoice === 'View All Employees') {
        db.promise().query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id ORDER BY employee.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.log(getGraphic(`  ALL EMPLOYEES BY EMPLOYEE ID  `));
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View Employees by Manager') {
        db.promise().query('SELECT employee.manager_id AS id, CONCAT(m.first_name, " ", m.last_name) AS manager, CONCAT(employee.first_name, " ",employee.last_name) AS employees, role.title, department.name AS department, role.salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id JOIN employee m ON employee.manager_id = m.id ORDER BY employee.manager_id')
            .then(([results, fields]) => {
                console.log('\n');
                console.log(getGraphic(`  ALL MANAGERS  WITH EMPLOYEES  `));
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View Employees by Department') {
        db.promise().query('SELECT department.id AS id, department.name AS department, CONCAT(employee.first_name, " ", employee.last_name) AS employees, role.title, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id ORDER BY department.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.log(getGraphic(`  ALL EMPLOYEES  BY DEPARTMENT  `));
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View All Roles') {
        db.promise().query('SELECT role.id, role.title, role.salary, department.name FROM role JOIN department ON role.department_id = department.id ORDER BY role.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.log(getGraphic(`  ALL   ROLES   BY   ROLE   ID  `));
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View All Departments') {
        db.promise().query('SELECT id, name AS department_name FROM department ORDER BY department.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.log(getGraphic(`ALL DEPARTMENTS BY DEPARTMENT ID`));
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View Total Utilized Budget') {
        db.promise().query('SELECT department.id, department.name AS department, SUM(role.salary) AS salary_total FROM department INNER JOIN role ON department.id = role.department_id JOIN employee ON role.id = employee.role_id GROUP BY department.id, department.name')
            .then(([results, fields]) => {
                console.log('\n');
                console.log(getGraphic(` TOTAL UTILIZED BUDGET BY DEPT. `));
                console.table(results);
                mainMenu();
            });
            
    } else if (answer.menuChoice === 'Update Employee Role') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeChoice',
                    message: 'Employee to UPDATE:',
                    choices: [...employeeList, '[BACK]'],
                },
                {
                    type: 'list',
                    name: 'roleChoice',
                    message: 'Role for UPDATE:',
                    when: (input) => input.employeeChoice != '[BACK]',
                    choices: [...roleList, '[CANCEL]'],
                }
            ]);
        if (answers.employeeChoice != '[BACK]' && answers.roleChoice != '[CANCEL]') {
            db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId[roleList.indexOf(answers.roleChoice)], employeeId[employeeList.indexOf(answers.employeeChoice)]], (err, result) => {
                if (err) {
                    console.log(err);
                }
            })
            console.log(getGraphic(`   EMPLOYEE   ROLE    UPDATED   `));
        }
    } else if (answer.menuChoice === 'Update Employee Manager') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeChoice',
                    message: 'Employee to UPDATE:',
                    choices: employeeList,
                },
                {
                    type: 'list',
                    name: 'managerChoice',
                    message: 'Employee to be Manager:',
                    choices: [...employeeList, '[NONE]'],
                }
            ]);
            var managerparam;
        if (answers.managerChoice === '[NONE]') {
            managerparam = null;
        } else {
            managerparam = employeeId[employeeList.indexOf(answers.managerChoice)];
        }
        console.log(getGraphic(`  EMPLOYEE   MANGER   UPDATED   `));
        console.log(`${answers.employeeChoice}'s Manager is now ${answers.managerChoice}`);
        db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [managerparam, employeeId[employeeList.indexOf(answers.employeeChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
    
    } else if (answer.menuChoice === 'Add Employee') {
        employeeList.push('[NONE]');
        const answers = await inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'First Name:',
                    validate: nameInput => {
                        if (nameInput) {
                            return true;
                        } else {
                            console.log('  <-- Enter a Valid String.');
                            return false;

                        }
                    }

                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'Last Name:',
                    validate: nameInput => {
                        if (nameInput) {
                            return true;
                        } else {
                            console.log('  <-- Enter a Valid String.');
                            return false;

                        }
                    }

                },
                {
                    type: 'list',
                    name: 'roleChoice',
                    message: 'Role for Employee:',
                    choices: roleList,
                },
                {
                    type: 'list',
                    name: 'managerChoice',
                    message: 'Manager for Employee:',
                    choices: employeeList,
                }
            ]);
        var managerparam;
        if (answers.managerChoice === '[NONE]') {
            managerparam = null;
        } else {
            managerparam = employeeId[employeeList.indexOf(answers.managerChoice)];
        }
        console.log(getGraphic(` EMPLOYEE  ADDED  TO  DATABASE  `));
        console.log(`${answers.first_name} ${answers.last_name} is now an Employee`);
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE (?, ?, ?, ?)', [answers.first_name, answers.last_name, roleId[roleList.indexOf(answers.roleChoice)], managerparam], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });
    } else if (answer.menuChoice === 'Add Role') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Role Title:',
                    validate: nameInput => {
                        if (nameInput) {
                            return true;
                        } else {
                            console.log('  <-- Enter a Valid String.');
                            return false;

                        }
                    }

                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Salary[0--999,999]:',
                    validate: salaryInput => {
                        if (isNaN(salaryInput) || salaryInput === "" || salaryInput < 0 || salaryInput > 999999) {
                            console.log('  <-- Enter a Valid Number between 0-999999');
                            return false;
                        } else {
                            return true;
                        }
                    }

                },
                {
                    type: 'list',
                    name: 'departmentChoice',
                    message: 'Department for Role:',
                    choices: departmentList,
                }
            ]);
        console.log(getGraphic(`   ROLE   ADDED  TO  DATABASE   `));
        console.log(`${answers.title} is now a Role`);
        await db.promise().query('INSERT INTO role (title, salary, department_id) VALUE (?, ?, ?)', [answers.title, answers.salary, departmentId[departmentList.indexOf(answers.departmentChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });

    } else if (answer.menuChoice === 'Add Department') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Department Name:',
                    validate: nameInput => {
                        if (nameInput) {
                            return true;
                        } else {
                            console.log('  <-- Enter a Valid String.');
                            return false;
                        }
                    }
                }
            ]);
        console.log(getGraphic(` DEPARTMENT  ADDED TO  DATABASE `));
        console.log(`${answers.name} is now a Department`);
        await db.promise().query('INSERT INTO department (name) VALUE (?)', [answers.name], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
    } else if (answer.menuChoice === 'Delete Department') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'departmentChoice',
                    message: 'Department to Delete:',
                    choices: departmentList,
                }
            ]);
        console.log(getGraphic(`    DEPARTMENT     DELETED      `));
        console.log(`${answers.name} had been Deleted`);
        await db.promise().query('DELETE FROM department WHERE id = (?)', [departmentId[departmentList.indexOf(answers.departmentChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
    } else if (answer.menuChoice === 'Delete Role') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'roleChoice',
                    message: 'Role to Delete:',
                    choices: roleList,
                }
            ]);
        console.log(getGraphic(`       ROLE       DELETED       `));
        console.log(`${answers.name} had been Deleted`);
        await db.promise().query('DELETE FROM role WHERE id = (?)', [roleId[roleList.indexOf(answers.roleChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });
    } else if (answer.menuChoice === 'Delete Employee') {
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeChoice',
                    message: 'Employee to Delete:',
                    choices: employeeList,

                }
            ]);
        console.log(getGraphic(`    EMPLOYEE       DELETED      `));
        console.log(`${answers.name} had been Deleted`);
        await db.promise().query('DELETE FROM employee WHERE id = (?)', [employeeId[employeeList.indexOf(answers.employeeChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
    } else {
        console.log(getGraphic(`  Bye! `));
        process.exit([1]);
    }
    if (answerArray[0] != 'View') {
        mainMenu();
    }
}
//Build a list of employees and thier ID for inquirer answers in executeChoice(choice)
async function getEmployeeList() {
    db.promise().query('SELECT CONCAT(employee.first_name, " ", employee.last_name) AS name, id FROM employee ORDER BY id')
        .then(async ([results, fields]) => {
            employeeList = await results.map(function (obj) { return obj.name; });
            employeeId = await results.map(function (obj) { return obj.id; });
        });
}

//Build a list of roles and thier ID for inquirer answers in executeChoice(choice)
async function getRoleList() {
    db.promise().query('SELECT role.title AS title, id FROM role ORDER BY id')
        .then(async ([results2, fields]) => {
            roleList = await results2.map(function (obj) { return obj.title; });
            roleId = await results2.map(function (obj) { return obj.id; });
        });
}

//Build a list of departments and thier ID for inquirer answers in executeChoice(choice)
async function getDepartmentList() {
    db.promise().query('SELECT department.name AS name, id FROM department ORDER BY id')
        .then(async ([results3, fields]) => {
            departmentList = await results3.map(function (obj) { return obj.name; });
            departmentId = await results3.map(function (obj) { return obj.id; });
        });

}

async function mainMenu() {
    //rebuild all lists to check for changes
    await getEmployeeList();
    await getRoleList();
    await getDepartmentList();
    const answer = await inquirer
        .prompt([
            {
                type: 'list',
                name: 'menuChoice',
                message: 'Main Menu:',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'Update Employee Manager', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'View Employees by Manager', 'View Employees by Department', 'View Total Utilized Budget', 'Delete Employee', 'Delete Role', 'Delete Department', 'Quit'],
            }
        ]);
    await excecuteChoice(answer);
}

const getGraphic = (text) => {
    if (text === 'Welcome' || text === `  Bye! `) {
        return `
+--------------------------------+
| ' .' '. '  . ' .   . .' . '  .'|
|.   . .(_). .                   |
|.  . ..  .. .        . .' ' '. .|
|'  ..  .. ..... .  .. . . . ... |
|.  . ..'. ..//...  ... '.  '.  .|
|'...'  ... ////    . .,  ' .. . |
|..  ' . /////// /  '...    . '. |
||      ///////\\      . .'. ..  .|
|/|-.-.-///////  \\--.-^---^- .-^-|
|---- / /////\/\\\\\--^|.i/| ^)\  /- /|
|.'--// //\\\\\  \\\|\||/\\|=|/ v /|- /'|
|, -_ /\/|||||\\...\|)||.)(|o)),-'/:|
+--------------------------------+
|  EMPLOYEE TRACKER  (${text})   |
+--------------------------------+`;
    } else {
        return `+--------------------------------+
|${text}|
+--------------------------------+`
    }
}

console.log(getGraphic('Welcome'));
mainMenu();