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
    if (answer.menuChoice === 'View All Employees') {
        db.promise().query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id ORDER BY employee.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View Employees by Manager') {
        db.promise().query('SELECT employee.manager_id AS id, CONCAT(m.first_name, " ", m.last_name) AS manager, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id JOIN employee m ON employee.manager_id = m.id ORDER BY employee.manager_id')
            .then(([results, fields]) => {
                console.log('\n');
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View Employees by Department') {
        db.promise().query('SELECT department.id AS id, department.name AS department, employee.first_name, employee.last_name, role.title, role.salary, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id ORDER BY department.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View All Roles') {
        db.promise().query('SELECT role.id, role.title, role.salary, department.name FROM role JOIN department ON role.department_id = department.id ORDER BY role.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'View All Departments') {
        db.promise().query('SELECT * FROM department ORDER BY department.id')
            .then(([results, fields]) => {
                console.log('\n');
                console.table(results);
                mainMenu();
            });
    } else if (answer.menuChoice === 'Update Employee Role') {
        employeeList.push('[BACK]');
        roleList.push('[CANCEL]');
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
                    name: 'roleChoice',
                    message: 'Role for UPDATE:',
                    when: (input) => input.employeeChoice != '[BACK]',
                    choices: roleList,
                }
            ]);
        if (answers.employeeChoice != '[BACK]' && answers.roleChoice != '[CANCEL]') {
            db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId[roleList.indexOf(answers.roleChoice)], employeeId[employeeList.indexOf(answers.employeeChoice)]], (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Success");
                }
            })
        }
        mainMenu();

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
                    choices: employeeList,
                }
            ]);
        console.log(`${answers.employeeChoice}'s Manager is now ${answers.managerChoice}`);
        db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [employeeId[employeeList.indexOf(answers.managerChoice)], employeeId[employeeList.indexOf(answers.employeeChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
        mainMenu();
    } else if (answer.menuChoice === 'Add Employee') {
        // const roleResult = db.query('SELECT role.title FROM role');
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
                            console.log('  <-- Enter a Valid String.\n');
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
                            console.log('  <-- Enter a Valid String.\n');
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

        console.log(`${answers.first_name} ${answers.last_name} is now an Employee`);
        console.log(employeeList, answers.managerChoice, (employeeList.indexOf(answers.managerChoice) + 1))
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE (?, ?, ?, ?)', [answers.first_name, answers.last_name, roleId[roleList.indexOf(answers.roleChoice)], employeeId[employeeList.indexOf(answers.managerChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });
        mainMenu();



    } else if (answer.menuChoice === 'Add Role') {
        // const roleResult = db.query('SELECT role.title FROM role');


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
                            console.log('  <-- Enter a Valid String.\n');
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
                            console.log('  <-- Enter a Valid Number between 0-999999\n');
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
        console.log(`${answers.title} is now a Role`);
        await db.promise().query('INSERT INTO role (title, salary, department_id) VALUE (?, ?, ?)', [answers.title, answers.salary, departmentId[departmentList.indexOf(answers.departmentChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        }).then(mainMenu());

    } else if (answer.menuChoice === 'Add Department') {
        // const roleResult = db.query('SELECT role.title FROM role');
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
                            console.log('  <-- Enter a Valid String.\n');
                            return false;

                        }
                    }

                }
            ]);
        console.log(`${answers.name} is now a Department`);
        await db.promise().query('INSERT INTO department (name) VALUE (?)', [answers.name], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });

    } else if (answer.menuChoice === 'Delete Department') {
        // const roleResult = db.query('SELECT role.title FROM role');
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'departmentChoice',
                    message: 'Department to Delete:',
                    choices: departmentList,

                }
            ]);
        console.log(`${answers.name} had been Deleted`);
        await db.promise().query('DELETE FROM department WHERE id = (?)', [departmentId[departmentList.indexOf(answers.departmentChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });

    } else if (answer.menuChoice === 'Delete Role') {
        // const roleResult = db.query('SELECT role.title FROM role');
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'roleChoice',
                    message: 'Role to Delete:',
                    choices: roleList,

                }
            ]);
        console.log(`${answers.name} had been Deleted`);
        await db.promise().query('DELETE FROM role WHERE id = (?)', [roleId[roleList.indexOf(answers.roleChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });

    } else if (answer.menuChoice === 'Delete Employee') {
        // const roleResult = db.query('SELECT role.title FROM role');
        const answers = await inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employeeChoice',
                    message: 'Employee to Delete:',
                    choices: employeeList,

                }
            ]);
        console.log(`${answers.name} had been Deleted`);
        await db.promise().query('DELETE FROM employee WHERE id = (?)', [employeeId[employeeList.indexOf(answers.employeeChoice)]], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }

        });

    }
    mainMenu();
}
async function getEmployeeList() {
    db.promise().query('SELECT CONCAT(employee.first_name, " ", employee.last_name) AS name, id FROM employee ORDER BY id')
        .then(async ([results, fields]) => {
            employeeList = await results.map(function (obj) { return obj.name; });
            employeeId = await results.map(function (obj) { return obj.id; });
        });
}

async function getRoleList() {
    db.promise().query('SELECT role.title AS title, id FROM role ORDER BY id')
        .then(async ([results2, fields]) => {
            roleList = await results2.map(function (obj) { return obj.title; });
            roleId = await results2.map(function (obj) { return obj.id; });
        });
}

async function getDepartmentList() {
    db.promise().query('SELECT department.name AS name, id FROM department ORDER BY id')
        .then(async ([results3, fields]) => {
            departmentList = await results3.map(function (obj) { return obj.name; });
            departmentId = await results3.map(function (obj) { return obj.id; });
        });

}

async function mainMenu() {
    await getEmployeeList();
    await getRoleList();
    await getDepartmentList();
    const answer = await inquirer
        .prompt([
            {
                type: 'list',
                name: 'menuChoice',
                message: 'Main Menu:',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'Update Employee Manager', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'View Employees by Manager', 'View Employees by Department', 'Delete Employee', 'Delete Role', 'Delete Department', 'Quit'],
            }
        ]);
    // Update employee managers.

    // View employees by manager.

    // View employees by department.

    // Delete departments, roles, and employees.

    // View the total utilized budget of a department—in other words, the combined salaries of all employees in that department.
    // console.log('\n');
    await excecuteChoice(answer);


    // console.log(answers);
    // if (answers.menuChoice != 'Quit') {
    //     await excecuteChoice(answers);
    //     mainMenu();
    // }


}

mainMenu();