INSERT INTO department (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
       ("Salesperson", 80000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 120000, 2),
       ("Account Manager", 160000, 3),
       ("Accountant", 120000, 3),
       ("Legal Team Lead", 250000, 4),
       ("Laywer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUE ("Rainer", "Kushwara", 1, null),
      ("Thomas", "Murphey", 2, 1),
      ("Francis", "Murphey", 3, null),
      ("Suhni", "Gar", 4, 3),
      ("Zeikligar", "Tanis", 5, null),
      ("Rohtan", "Sinat", 6, 5),
      ("Garbranth", "Scalbrock", 7, null),
      ("Kiathus", "Valeous", 8, 7);
