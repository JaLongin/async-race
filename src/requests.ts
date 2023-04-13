import Car from './Icar';
import presetNames from './presetNames.json';

const urly: string = 'https://jal-async-race.onrender.com';

async function getCars() {
  const response = await fetch(`${urly}/garage`);
  return response.json();
}

async function getCar(id:number) {
  const response = await fetch(`${urly}/garage/${id}`);
  return response.json();
}

const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;

function randomCarData(): object {
  const car = { name: '', color: '' };
  car.name = `${presetNames.brand[Math.floor(Math.random() * 10)]}
  ${presetNames.models[Math.floor(Math.random() * 10)]}`.replace(/(\r\n|\n|\r)/gm, '');
  car.color = randomColor();
  return car;
}

async function createCar(data:object = randomCarData()) {
  const response = await fetch(`${urly}/garage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
async function generateCars() {
  await Promise.allSettled((new Array(100)).fill('').map(async () => { await createCar(); }));
}
async function updateCar(id: number, data:object = randomCarData()) {
  const response = await fetch(`${urly}/garage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json();
}

async function deleteCar(id: number) {
  const response = await fetch(`${urly}/garage/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
async function deleteWinner(id: number) {
  const response = await fetch(`${urly}/winners/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}
async function tottalCarDelete(id: number) {
  await deleteCar(id);
  await deleteWinner(id);
}
async function deleteAllCars() {
  const cars = await getCars() as Array<Car>;
  await Promise.allSettled(cars.map(async (car) => { await tottalCarDelete(car.id); }));
}

async function startStopEngine(id: number, engineStarts: boolean) {
  const response = await fetch(`${urly}/engine/?id=${id}&status=${engineStarts ? 'started' : 'stopped'}`, {
    method: 'PATCH',
  });
  return response.json();
}
async function switchDriveMode(id: number) {
  const response = await fetch(`${urly}/engine/?id=${id}&status=drive`, {
    method: 'PATCH',
  });
  return new Promise((resolve, reject) => {
    try {
      resolve(response.json());
    } catch (e) {
      reject(e);
    }
  });
}

async function checkIfPagePossible(pageNo: number) {
  return ((Math.ceil((await getCars()).length / 7) >= pageNo) && pageNo > 0) || pageNo === 1;
}
async function getGrgPageCars(pageNo: number) {
  const cars = await getCars();
  return cars.slice((pageNo - 1) * 7, pageNo * 7);
}
async function getWinners() {
  const response = await fetch(`${urly}/winners`);
  return response.json();
}
async function getWinner(id:number) {
  const response = await fetch(`${urly}/winners/${id}`);
  return response.json();
}

async function createWinner(data:object) {
  const response = await fetch(`${urly}/winners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json();
}
async function updateWinner(id: number, data:object) {
  const response = await fetch(`${urly}/winners/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
export {
  getCars, createCar, updateCar, tottalCarDelete, deleteAllCars,
  getGrgPageCars, checkIfPagePossible, generateCars, startStopEngine,
  switchDriveMode, getWinners, createWinner, updateWinner, getCar, getWinner,
};
