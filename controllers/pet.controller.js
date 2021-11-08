const { join } = require('path');
const { readFileSync } = require('fs');

const PATH = join(__dirname, '../data/pet.json');

function getPets(request, response) {
  try {
    const rawData = readFileSync(PATH);
    const data = JSON.parse(rawData);
    return response.json({ msg: 'ok', data });
  } catch (error) {
    console.error(error.toString());
    return response.json({ msg: 'error', data: null });
  }
}

function getPet(request, response) {
  const { id } = request.params;
  try {
    const rawData = readFileSync(PATH);
    const data = JSON.parse(rawData)
      .find((pet) => pet.id === id);
    return response.json({ msg: 'ok', data });
  } catch (error) {
    console.error(error.toString());
    return response.json({ msg: 'error', data: null });;
  }
}


module.exports = {
  getPet,
  getPets
}