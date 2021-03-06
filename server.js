const express = require('express');
const { register, login, getUsers, getUser } = require('./controllers/user.controller');
const { getPets, getPet } = require('./controllers/pet.controller');


const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.post('/register', register);
app.post('/login', login);
app.get('/users', getUsers);
app.get('/users/:id', getUser);
app.get('/pets', getPets);
app.get('/pets/:id', getPet);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})

