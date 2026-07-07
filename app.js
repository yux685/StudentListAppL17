const express = require('express'); 
const mysql = require('mysql2');
const multer = require('multer'); 
const app = express(); 


// Set up multer for file uploads
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, 'public/images'); // Directory to save uploaded files
},
filename: (req, file, cb) => {
cb(null, file.originalname); 
}
});
const upload = multer({ storage: storage });


// Create MySQL connection 
const connection = mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: 'RP738964$', 
    database: 'c237_studentlistapp' 
}); 

connection.connect((err) => { 
    if (err) { 
        console.error('Error connecting to MySQL:', err); 
        return; 
    } 
    console.log('Connected to MySQL database'); 
}); 

// Set up view engine 
app.set('view engine', 'ejs'); 
//  enable static files 
app.use(express.static('public')); 
// enable form processing
app.use(express.urlencoded({
    extended: true
}));





// Define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM students';
  // Fetch data from MySQL
  connection.query( sql , (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving students'); 
    }
   // Render HTML page with data
   res.render('index', { students: results });
  });
});



//display student by id
app.get('/student/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM students WHERE studentId = ?';
  // Fetch data from MySQL
  connection.query( sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving student by ID'); 
    }
    //check if any student with the given ID was found
    if (results.length > 0) {
      // Render HTML page with data
      res.render('student', { student: results[0] });
    } else {
      // If no student with the given ID was found,  render a 404 page or handle it accordingly
      res.status(404).send('Student not found');
    }
  });
});


//add student
app.get('/addStudent', (req, res) => {
  res.render('addStudent'); 
});

app.post('/addStudent', upload.single('image'), (req, res) => {
  // Extract student data from the request body (assuming you have a form to submit student data)
  const { name, dob, contact } = req.body;
  let image;
  if (req.file) {
    image = req.file.filename; // Save only the filename
  } else {
    image = null;
  }

  const sql = 'INSERT INTO students (name, dob, contact, image) VALUES (?, ?, ?, ?)';
  // Insert the new student into the database
  connection.query(sql, [name, dob, contact, image], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error('Error adding student:', error.message);
      return res.send('Error adding student');
    } else {
      //send a success response
      res.redirect('/'); 
    }
    
  });
});


app.get('/editStudent/:id', (req,res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM students WHERE studentId = ?';
  // Fetch data from MySQL based on the student ID
  connection.query( sql , [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error retrieving student by ID'); 
    }
    // Check if any student with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the student data
      results[0].dob = results[0].dob.toLocaleDateString('en-CA');
      res.render('editStudent', { student: results[0] });
    } else {
      // If no student with the given ID was found, render a 404 page or handle it accordingly
      res.send('Student not found');
    }
  });
});

app.post('/editStudent/:id', upload.single('image'), (req, res) => {
  const studentId = req.params.id;
  // Extract student data from the request body
  const { name, dob, contact } = req.body;
  let image = req.body.currentImage; //retrieve current image filename
    if (req.file) { //if new image is uploaded
      image = req.file.filename; // set image to be new image filename
  }
  const sql = 'UPDATE students SET name = ? , dob = ?, contact = ?, image = ? WHERE studentId = ?';
   
  // Insert the new student into the database
  connection.query( sql , [name, dob, contact, image, studentId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error updating student:", error);
      res.send('Error updating student');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});

app.get('/deleteStudent/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'DELETE FROM students WHERE studentId = ?';
  connection.query( sql , [studentId], (error, results) => {
    if (error) {
      // Handle any error that occurs during the database operation
      console.error("Error deleting student:", error);
      res.send('Error deleting student');
    } else {
      // Send a success response
      res.redirect('/');
    }
  });
});


const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));