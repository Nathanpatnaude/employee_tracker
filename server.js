const db = require('./config/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');


async function excecuteChoice(answers) {
    if (answers.menuChoice === 'View All Employees') {
        db.promise().query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.manager_id = employee.id')
            .then(([results, fields]) => {
                console.table(results);
                mainMenu();
            });
    } else if (answers.menuChoice === 'View All Roles') {
        db.promise().query('SELECT role.id, role.title, role.salary, department.name FROM role JOIN department ON role.department_id = department.id')
            .then(([results, fields]) => {
                console.table(results);
                mainMenu();
            });
    } else if (answers.menuChoice === 'View All Departments') {
        db.promise().query('SELECT * FROM department')
            .then(([results, fields]) => {
                console.table(results);
                mainMenu();
            });
    } else if (answers.menuChoice === 'Update Employee Role') {
        // const roleResult = db.query('SELECT role.title FROM role');
        db.promise().query('SELECT CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title AS title FROM employee CROSS JOIN role ON employee.role_id = role.id')
            .then(async ([results, fields]) => {
                
                const employeeList = await results.map(function (obj) { return obj.name; });
                employeeList.push('[BACK]');
                console.log(employeeList);
                const roledata =  await results.map(function (obj) { return obj.title; });
                const roleList = [...new Set(roledata)];
                roleList.push('[CANCEL]');
                // console.log(roleResult);
                const answers = await inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'employeeChoice',
                            message: `Employee to UPDATE:`,
                            choices: employeeList,
                        },
                        {
                            type: 'list',
                            name: 'roleChoice',
                            message: 'Role for UPDATE:',
                            when: (input) => input.employeeChoice != '[BACK}',
                            choices: roleList,
                        }
                    ]);
                // console.log([employeeList.indexOf(answers.employeeChoice) + 1, roleList.indexOf(answers.roleChoice) + 1]);
                db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleList.indexOf(answers.roleChoice) + 1, employeeList.indexOf(answers.employeeChoice) + 1], (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('UPDATED');
                    }
                });


                mainMenu();
            });
    }
}

async function mainMenu() {

    const answers = await inquirer
        .prompt([
            {
                type: 'list',
                name: 'menuChoice',
                message: 'Main Menu:',
                choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
            }
        ]);

    // console.log('\n');
    await excecuteChoice(answers);


    // console.log(answers);
    // if (answers.menuChoice != 'Quit') {
    //     await excecuteChoice(answers);
    //     mainMenu();
    // }


}

mainMenu();