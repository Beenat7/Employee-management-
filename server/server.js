require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
//const path = require("path");
const app = express();

//app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());
const port = 5000;


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
db.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      process.exit(1); // Exit process if connection fails
    } else {
      console.log("Connected to the MySQL database.");
    }
  });

app.post("/adddep", (req, res) => {
    const depname = req.body.depname; 
    db.query(
      "INSERT INTO Departments (department_name) VALUES (?)",
      [depname],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send("Values Inserted");
        }
      }
    );
  });

  app.get("/readdep", (req, res) => {
    db.query("SELECT * FROM Departments", (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving departments");
      } else {
        res.send(result);
      }
    });
  });

  app.put("/updatedep", (req, res) => {
    const { depId, newDepName } = req.body; // Destructure department ID and new name from request body
  
    if (!depId || !newDepName) {
      return res.status(400).send("Both department ID and new department name are required.");
    }
  
    const sql = "UPDATE Departments SET department_name = ? WHERE department_id = ?";
    const values = [newDepName, depId];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error updating department:", err);
        res.status(500).send("Error updating department.");
      } else if (result.affectedRows === 0) {
        res.status(404).send("Department not found.");
      } else {
        console.log(result.affectedRows + " record updated");
        res.send("Department updated successfully.");
      }
    });
  });


  app.delete("/deletedep/:depId", (req, res) => {
    const depId = req.params.depId; // Get department ID from URL parameters 
    // SQL query to delete the department
    const sql = "DELETE FROM Departments WHERE department_id = ?";
    db.query(sql, [depId], (err, result) => {
      if (err) {
        console.error("Error deleting department:", err);
        res.status(500).send("Error deleting department.");
      } else if (result.affectedRows === 0) {
        res.status(404).send("Department not found."); // If no department is deleted
      } else {
        console.log("Department deleted successfully:", result);
        res.send("Department deleted successfully.");
      }
    });
  });



  //employee codes 
  app.post('/addemployee', (req, res) => {
    const {
      first_name, last_name, email, phone_number, hire_date, department_id, position_id, salary_id, address_city, address_house_num
    } = req.body;
  
    const sql = `INSERT INTO Employees 
      (first_name, last_name, email, phone_number, hire_date, department_id, position_id, salary_id, address_city, address_house_num) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(sql, [
      first_name, last_name, email, phone_number, hire_date, department_id, position_id, salary_id, address_city, address_house_num
    ], (err, result) => {
      if (err) {
        console.error('Error adding employee: ', err);
        res.status(500).send('Error adding employee');
      } else {
        res.send('Employee added successfully!');
      }
    });
  });

  app.get('/getemployees', (req, res) => {
    const sql = 'SELECT * FROM Employees';
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).send('Error retrieving employee data');
      }
      res.json(result);
    });
  });

app.get('/getemployee/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM Employees WHERE employee_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length > 0) {
      res.send(result[0]);
    } else {
      res.status(404).send('Employee not found');
    }
  });
});

// Update employee by ID
app.put('/updateemployee/:id', (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone_number,
    hire_date,
    department_id,
    position_id,
    salary_id,
    address_city,
    address_house_num,
  } = req.body;

  const sql = `
    UPDATE Employees SET 
      first_name = ?, 
      last_name = ?, 
      email = ?, 
      phone_number = ?, 
      hire_date = ?, 
      department_id = ?, 
      position_id = ?, 
      salary_id = ?, 
      address_city = ?, 
      address_house_num = ?
    WHERE employee_id = ?`;

  db.query(sql, [
    first_name,
    last_name,
    email,
    phone_number,
    hire_date,
    department_id,
    position_id,
    salary_id,
    address_city,
    address_house_num,
    id,
  ], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Employee updated successfully');
  });
});

app.delete('/deleteemployee/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Employees WHERE employee_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.affectedRows > 0) {
      res.send('Employee deleted successfully');
    } else {
      res.status(404).send('Employee not found');
    }
  });
});


//Position 
app.post('/addposition', (req, res) => {
  const { position_name } = req.body;
  const sql = 'INSERT INTO Positions (position_name) VALUES (?)';
  
  db.query(sql, [position_name], (err, result) => {
    if (err) {
      console.error('Error adding the position:', err);
      res.status(500).send('Error adding the position.');
      return;
    }
    res.status(200).send('Position added successfully.');
  });
});

app.get('/getpositions', (req, res) => {
  const sql = 'SELECT * FROM Positions';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching the positions:', err);
      res.status(500).send('Error fetching the positions.');
      return;
    }
    res.json(results); // Send the results as JSON
  });
});

app.get('/getposition/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM Positions WHERE position_id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (result.length > 0) {
      res.send(result[0]);
    } else {
      res.status(404).send('Position not found');
    }
  });
});

app.put('/updateposition/:id', (req, res) => {
  const { id } = req.params;
  const { position_name } = req.body;

  const sql = `UPDATE Positions SET position_name = ? WHERE position_id = ?`;

  db.query(sql, [position_name, id], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send('Position updated successfully');
  });
});


app.delete('/deleteposition/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Positions WHERE position_id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting the position:', err);
      res.status(500).send('Error deleting the position.');
      return;
    }

    if (result.affectedRows > 0) {
      res.send('Position deleted successfully.');
    } else {
      res.status(404).send('Position not found.');
    }
  });
});

//Salarie
app.post('/createsalarie', (req, res) => {
  const { salary_amount } = req.body;
  let tax_amount = 0;

 
  if (salary_amount >= 1000 && salary_amount <= 30000) {
    tax_amount = salary_amount * 0.10;
  } else if (salary_amount >= 31000 && salary_amount <= 80000) {
    tax_amount = salary_amount * 0.20;
  } else if (salary_amount > 80000) {
    tax_amount = salary_amount * 0.30;
  }
  const sql = 'INSERT INTO Salaries (salary_amount, Tax_Amount) VALUES (?, ?)';
  db.query(sql, [salary_amount, tax_amount], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    res.send('Salary and tax stored successfully');
  });
});

app.get('/readsalarie', (req, res) => {
  const sql = 'SELECT * FROM Salaries';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(results);
  });
});

app.get('/getsalarie/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM Salaries WHERE salary_id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send('Error fetching salary');
    }
    if (result.length === 0) {
      return res.status(404).send('Salary not found');
    }
    res.send(result[0]); // Send the first (and only) salary row
  });
});

// Update salary by ID
app.put('/updatesalarie/:id', (req, res) => {
  const { id } = req.params;
  const { salary_amount } = req.body;

  // Validate salary_amount is a valid number
  if (isNaN(salary_amount) || salary_amount <= 0) {
    return res.status(400).send('Invalid salary amount');
  }

  // Calculate Tax Amount based on salary rules
  let taxAmount;
  if (salary_amount >= 1000 && salary_amount <= 30000) {
    taxAmount = (salary_amount * 0.10).toFixed(2);
  } else if (salary_amount > 30000 && salary_amount <= 80000) {
    taxAmount = (salary_amount * 0.20).toFixed(2);
  } else if (salary_amount > 80000) {
    taxAmount = (salary_amount * 0.30).toFixed(2);
  } else {
    return res.status(400).send('Invalid salary amount');
  }

  const sql = `
    UPDATE Salaries SET 
      salary_amount = ?, 
      Tax_Amount = ? 
    WHERE salary_id = ?`;

  db.query(sql, [salary_amount, taxAmount, id], (err, result) => {
    if (err) {
      // Enhanced logging to capture the full error details
      console.error('Error updating salary:', JSON.stringify(err, null, 2));
      return res.status(500).send('Error updating salary');
    }

    // Log the SQL query result to ensure the update is being executed
    console.log('SQL query result:', JSON.stringify(result, null, 2));

    // Check if the update affected any rows (i.e., the salary was found)
    if (result.affectedRows === 0) {
      return res.status(404).send('Salary not found');
    }

    // If successful, return a success message
    res.send('Salary and tax updated successfully');
  });
});


app.delete('/deletesalarie/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'DELETE FROM Salaries WHERE salary_id = ?';
  
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).send('Error deleting salary');
    }
    
    if (result.affectedRows > 0) {
      res.send('Salary deleted successfully');
    } else {
      res.status(404).send('Salary not found');
    }
  });
});

const PORT = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server is listening on port ${PORT}`);
  });