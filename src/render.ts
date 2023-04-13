import flag from "./assets/red-flag.svg";
import Car from "./Icar";
import {
  getCars,
  getGrgPageCars,
  startStopEngine,
  switchDriveMode,
  createWinner,
  getWinners,
  updateWinner,
  getCar,
} from "./requests";
import bullSvg from "./bull";
import IraceResult from "./IraceResult";
import Iwinner from "./Iwinner";

let raceRes = [] as Array<IraceResult>;

const body = document.body as HTMLElement;
function setDefaultStructure(): void {
  body.innerHTML = `
  <nav id="nav">
    <button class="btn" id="garage">Garage</button>
    <button class="btn" id="winners">Winners</button>
  </nav>
  <main id="grg-main">
    <section id="grg-int">
      <form id="fnew-car">
      <input type="text" id="new-name">
      <input type="color" id="new-color">
      <input class="btn" type="submit" value="Add car">
      </form>
      <form id="fupd-car">
      <input type="text" id="upd-name">
      <input type="color" id="upd-color">
      <input class="btn" type="submit" value="Update car">
      </form>
      <br>
      <div id="buttons-block">
        <button class="btn" id="race-button">Race</button>
        <button class="btn" id="reset-button">Reset</button>
        <button class="btn" id="generate-button">Generate cars</button>
      </div>
    </section>
    <section id="grg-list">
      <h1>Garage(<span id="grg-num-of-cars"></span>)</h1>
      <div id="grg-page">
        <div id="grg-page-num">Page #<span id="page-num-field"></span></div>
        <div id="grg-page-list"></div>
      </div>
      <div id="switch-page">
        <button class="btn" id="grg-prev-page">Prev</button>
        <button class="btn" id="grg-next-page">Next</button>
      </div>
    </section>
  </main>
  <main id="winners-main" class="hidden">
      <section id="winners-list">
        <h1>Winners(<span id="wins-num-of-cars"></span>)</h1>
        <div id="wins-page">
          <div id="wins-page-num">Page #<span id="page-num-field"></span></div>
          <div id="wins-page-list">
            <table id="wins-table">
              <thead>
                <tr id="header-row">
                  <th class="th">Car</th>
                  <th class="th">Name</th>
                  <th class="th">Wins</thclass=>
                  <th class="th">Best time(seconds)</thclass=>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>
        <div id="switch-page">
          <button class="btn" id="wins-prev-page">Prev</button>
          <button class="btn" id="wins-next-page">Next</button>
        </div>
      </section>
    </main>
`;
}
function grgCarHTML(id: number, name: string, color: string): string {
  const line = `<div class='car-block' id='car-${id}' number="${id}">
    <div class="car-head">
      <button class="btn select">Select</button>
      <button class="btn remove">Remove</button>
      <span class="car-name">${name}</span>
    </div>
    <div class="car-bottom">
      <div class="bottom-buttons">
        <button class="btn start">Start</button>
        <button class="btn break inactive">Break</button>
      </div>
      <svg class="car-image" style="fill:${color}; height:100px; width: 100px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
      viewBox="0 0 511 511" xml:space="preserve">${bullSvg}</svg>
      <embed class="flag-image" style="height:100px; width: 50px" src="${flag}">
    </div>
  </div>`;
  return line;
}
// async function setNumOfCars() {
//   const grgNumOfCars = document.getElementById('grg-num-of-cars');
//   const totalCars = await getCars();
//   grgNumOfCars.innerHTML = `${totalCars.length}`;
// }
async function renderPageList(currentPage: number = 1) {
  // for product
  await getCars().then(async (resp) => {
    const grgNumOfCars = document.getElementById("grg-num-of-cars");
    const totalCars = resp;
    grgNumOfCars.innerHTML = `${totalCars.length}`;
    const pageNumHTML = document.getElementById("page-num-field");
    pageNumHTML.innerHTML = `${currentPage}`;
    const pageList = document.getElementById("grg-page-list");
    await getGrgPageCars(currentPage).then((res) => {
      const cars = res as Array<Car>;
      pageList.innerHTML = "";
      cars.forEach((car) => {
        pageList.innerHTML += grgCarHTML(car.id, car.name, car.color);
      });
    });
  });
}

async function carBreak(id: number) {
  const carBlockHTML = document.getElementById(`car-${id}`);
  const carEl = carBlockHTML.querySelector(".car-image") as HTMLElement;
  const startButton = carBlockHTML.querySelector(".start");
  const breakButton = carBlockHTML.querySelector(".break");
  if (!breakButton.classList.contains("inactive")) {
    breakButton.classList.toggle("inactive");
    if (startButton.classList.contains("inactive")) {
      startButton.classList.toggle("inactive");
    }
    startStopEngine(id, false).then(() => {
      if (carEl.classList.contains("riding")) {
        carEl.classList.toggle("riding");
      }
      setTimeout(() => {
        carEl.style.transform = "";
      }, 1000);
    });
  }
}

async function startRide(id: number) {
  const carId = `car-${id}`;
  const carBlockHTML = document.getElementById(carId);
  const startButton = carBlockHTML.querySelector(".start");
  const breakButton = carBlockHTML.querySelector(".break");
  const roadLendth =
    carBlockHTML.querySelector(".car-bottom").clientWidth - 170;
  const carEl = carBlockHTML.querySelector(".car-image") as HTMLElement;
  if (!startButton.classList.contains("inactive")) {
    startButton.classList.toggle("inactive");
    if (breakButton.classList.contains("inactive")) {
      breakButton.classList.toggle("inactive");
    }
    const response = await startStopEngine(id, true);
    const duration = response.distance / response.velocity;
    let engineWorks = true;
    switchDriveMode(id)
      .then(() => Promise.resolve(duration))
      .catch(() => {
        engineWorks = false;
        return Promise.resolve(null);
      });
    if (!carEl.classList.contains("riding")) {
      carEl.classList.toggle("riding");
    }
    let startAnimation = null as number;
    requestAnimationFrame(async function measure(time) {
      if (!startAnimation) {
        startAnimation = time;
      }
      const progress = (time - startAnimation) / duration;
      const translate = Math.floor(progress * roadLendth);
      carEl.style.setProperty("transform", `translateX(${translate}px)`);
      if (
        progress < 1 &&
        translate < roadLendth &&
        carEl.classList.contains("riding") &&
        engineWorks
      ) {
        requestAnimationFrame(measure);
      }
    });
  }
}

function resetRace() {
  const carBlocks = document.querySelectorAll(".car-block");
  document.getElementById("race-button").innerHTML = "Race";
  carBlocks.forEach((car) => {
    carBreak(+car.getAttribute("number"));
  });
  raceRes = [];
  try {
    document.querySelector(".pop-up").remove();
  } catch (e) {}
}
async function renderWinnersPageList() {
  await getWinners().then(async (resp) => {
    const winsNumOfCars = document.getElementById("wins-num-of-cars");
    const totalWinners = resp as Array<Iwinner>;
    winsNumOfCars.innerHTML = `${totalWinners.length}`;
    const pageNumHTML = document
      .getElementById("winners-list")
      .querySelector("#page-num-field");
    pageNumHTML.innerHTML = `${1}`;
    const winTable = document
      .getElementById("wins-table")
      .querySelector("tbody");
    winTable.innerHTML = "";
    totalWinners.forEach(async (winner, index) => {
      await getCar(winner.id).then((res) => {
        const winnerCar = res as Car;
        winTable.innerHTML += `<tr>
          <td>
          <svg class="car-image" style="fill:${winnerCar.color}; height:50px; width: 50px; position: relative" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
          viewBox="0 0 511 511" xml:space="preserve">${bullSvg}</svg>
          </td>
          <td>
            ${winnerCar.name}
          </td>
          <td>
            ${winner.wins}
          </td>
          <td>
            ${winner.time}
          </td>
        </tr>`;
      });
    });
  });
}

function finisher(
  carId: number,
  carEngineWorks: boolean,
  carTime: number,
  numberOfCars: number
): void {
  const lastRes = {
    id: carId,
    raceComplete: carEngineWorks,
    time: carTime,
  } as IraceResult;
  raceRes.push(lastRes);
  let bestRacer = {
    id: 0,
    raceComplete: true,
    time: 1000000000000,
  } as IraceResult;
  if (raceRes.length === numberOfCars) {
    raceRes.forEach((el) => {
      if (el.raceComplete && el.time < bestRacer.time) {
        bestRacer = el;
      }
    });
    raceRes = [];
    const popUp = document.createElement("div");
    popUp.classList.add("pop-up");
    if (bestRacer.id !== 0) {
      popUp.innerHTML = `${
        document
          .getElementById(`car-${bestRacer.id}`)
          .querySelector(".car-name").innerHTML
      } won`;
      getWinners().then((res) => {
        let found = false;
        const winners = res as Array<Iwinner>;
        winners.forEach((winner) => {
          if (winner.id === bestRacer.id) {
            found = true;
            updateWinner(bestRacer.id, {
              wins: winner.wins + 1,
              time: winner.time < bestRacer.time ? winner.time : bestRacer.time,
            });
          }
        });
        if (!found) {
          createWinner({ id: bestRacer.id, wins: 1, time: bestRacer.time });
        }
      });
      renderWinnersPageList();
    } else {
      popUp.innerHTML = "No winner";
    }
    document.getElementById("grg-page").append(popUp);
    setTimeout(() => {
      document.querySelector(".pop-up").remove();
      resetRace();
    }, 6000);
  }
}

async function startRaceRide(id: number, numberOfCars: number) {
  const carId = `car-${id}`;
  const carBlockHTML = document.getElementById(carId);
  const startButton = carBlockHTML.querySelector(".start");
  const breakButton = carBlockHTML.querySelector(".break");
  const roadLendth =
    carBlockHTML.querySelector(".car-bottom").clientWidth - 170;
  const carEl = carBlockHTML.querySelector(".car-image") as HTMLElement;
  if (!startButton.classList.contains("inactive")) {
    startButton.classList.toggle("inactive");
    if (breakButton.classList.contains("inactive")) {
      breakButton.classList.toggle("inactive");
    }
    const startTime = Date.now();
    const response = await startStopEngine(id, true);
    const duration = response.distance / response.velocity;
    let engineWorks = true;
    switchDriveMode(id)
      .then(() => Promise.resolve(duration))
      .catch(() => {
        engineWorks = false;
        return Promise.resolve(null);
      });
    if (!carEl.classList.contains("riding")) {
      carEl.classList.toggle("riding");
    }
    let startAnimation = null as number;
    requestAnimationFrame(async function measure(time) {
      if (!startAnimation) {
        startAnimation = time;
      }
      const progress = (time - startAnimation) / duration;
      const translate = Math.floor(progress * roadLendth);
      carEl.style.setProperty("transform", `translateX(${translate}px)`);
      if (
        progress < 1 &&
        translate < roadLendth &&
        carEl.classList.contains("riding") &&
        engineWorks
      ) {
        requestAnimationFrame(measure);
      } else {
        finisher(
          id,
          engineWorks,
          (Date.now() - startTime) / 1000,
          numberOfCars
        );
      }
    });
  }
}

function startRace() {
  const carBlocks = document.querySelectorAll(".car-block");
  if (carBlocks.length !== 0) {
    resetRace();
    document.getElementById("race-button").innerHTML = "Reset race";
    carBlocks.forEach((car) => {
      startRaceRide(+car.getAttribute("number"), carBlocks.length);
    });
  }
}

export {
  setDefaultStructure,
  renderPageList,
  startRide,
  carBreak,
  startRace,
  resetRace,
  renderWinnersPageList,
};
