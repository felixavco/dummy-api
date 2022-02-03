var jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { join } = require('path');
const { existsSync, writeFileSync, readFileSync } = require('fs');

const PATH = join(__dirname, '../data/user.json');
const SECRET = 'SECRET';

function register(request, response) {
  const { name, email, password } = request.body;
  let createdUser;
  const newUser = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password,
  };
  let invalidKeys = '';
  for (const key in newUser) {
    if (newUser[key] === undefined) {
      invalidKeys += `'${key}' `;
    }
  }

  if (invalidKeys) {
    return formatedResponse(response, 400, `Missing ${invalidKeys}`);
  }

  if (existsSync(PATH)) {
    const [user, users] = findBy('email', email);
    if (user) {
      return formatedResponse(response, 401, 'user already exist');
    }
    createdUser = save(JSON.stringify([...users, newUser]));
  } else {
    createdUser = save(JSON.stringify([newUser]));
  }

  if (createdUser) {
    delete newUser.password;
    return formatedResponse(response, 201, 'user created!', {
      user: newUser,
      token: getToken(newUser.id),
    });
  }
  return formatedResponse(response, 400, 'unable to create user');
}

function login(request, response) {
  const { email, password } = request.body;
  if (!email || !password) {
    formatedResponse(response, 404, 'invalid credentials');
  }
  if (existsSync(PATH)) {
    const [user] = findBy('email', email.toLowerCase());
    if (!user) {
      return formatedResponse(response, 404, 'invalid credentials');
    }

    if (user.password === password) {
      delete user.password;
      return formatedResponse(response, 200, 'ok', {
        user,
        token: getToken(user.id),
      });
    }
    return formatedResponse(response, 404, 'invalid credentials');
  }
}

function getUsers(request, response) {
  const users = findAll();
  if (users) {
    const safeUsers = users.map((user) => {
      const copy = { ...user };
      delete copy.password;
      return copy;
    });

    return formatedResponse(response, 200, 'ok', safeUsers);
  }
  return formatedResponse(response, 200, 'ok', []);
}

function getUser(request, response) {
  const { id } = request.params;
  const [user] = findBy('id', id);
  if (user) {
    const safeUser = { ...user };
    delete safeUser.password;
    return formatedResponse(response, 200, 'ok', safeUser);
  }
  return formatedResponse(response, 404, 'user not found');
}

function findAll() {
  try {
    const rawData = readFileSync(PATH);
    return JSON.parse(rawData);
  } catch (error) {
    console.error(error.toString());
    return [];
  }
}

function getToken(id) {
  return jwt.sign({ id }, SECRET, { expiresIn: '48h' });
}

function formatedResponse(res, status, msg, data = null) {
  return res.status(status).json({
    msg,
    data,
  });
}

function findBy(key, value) {
  try {
    const rawData = readFileSync(PATH);
    const data = JSON.parse(rawData);
    const item = data.find((user) => user[key] === value);
    return [item, data];
  } catch (error) {
    console.error(error.toString());
    return [undefined, []];
  }
}

function save(data) {
  try {
    writeFileSync(PATH, data);
    console.log('User created!');
    return true;
  } catch (error) {
    console.error(error.toString());
    return false;
  }
}

module.exports = {
  login,
  getUser,
  register,
  getUsers,
};
