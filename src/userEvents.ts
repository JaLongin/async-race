import {
  createCar,
  deleteAllCars,
  tottalCarDelete,
  checkIfPagePossible,
  updateCar,
  generateCars,
} from "./requests";
import {
  renderPageList,
  startRide,
  carBreak,
  startRace,
  resetRace,
  renderWinnersPageList,
} from "./render";

let currentCarId: number = null;
let currentPage: number = 1;

function addNavListeners(): void {
  const winnersMain = document.getElementById("winners-main");
  const grgMain = document.getElementById("grg-main");
  document.getElementById("garage").addEventListener("click", () => {
    if (!winnersMain.classList.contains("hidden")) {
      winnersMain.classList.toggle("hidden");
    }
    if (grgMain.classList.contains("hidden")) {
      grgMain.classList.toggle("hidden");
    }
  });
  document.getElementById("winners").addEventListener("click", () => {
    if (winnersMain.classList.contains("hidden")) {
      renderWinnersPageList();
      winnersMain.classList.toggle("hidden");
    }
    if (!grgMain.classList.contains("hidden")) {
      grgMain.classList.toggle("hidden");
    }
  });
}

let addGrgListListeners: Function = null;
const updatePageList = async function Anon(pageNo: number = 1) {
  await renderPageList(pageNo);
  await addGrgListListeners();
};

function addCarListener(): void {
  const form = document.getElementById("fnew-car") as HTMLFormElement;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if ((form.elements[0] as HTMLInputElement).value !== "") {
      createCar({
        name: (form.elements[0] as HTMLInputElement).value,
        color: (form.elements[1] as HTMLInputElement).value,
      }).then(() => {
        updatePageList(currentPage);
      });
    } else {
      createCar().then(() => {
        updatePageList(currentPage);
      });
    }
    (form.elements[0] as HTMLInputElement).value = "";
    (form.elements[1] as HTMLInputElement).value = "";
  });
}

function generateCarsListener() {
  const generateButton = document.getElementById("generate-button");
  generateButton.addEventListener("click", async () => {
    await generateCars();
    await updatePageList(currentPage);
  });
}

function updateCarListener() {
  const form = document.getElementById("fupd-car") as HTMLFormElement;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentCarId !== null) {
      if ((form.elements[0] as HTMLInputElement).value !== "") {
        updateCar(currentCarId, {
          name: (form.elements[0] as HTMLInputElement).value,
          color: (form.elements[1] as HTMLInputElement).value,
        }).then(() => {
          updatePageList(currentPage);
          currentCarId = null;
        });
      } else {
        updateCar(currentCarId).then(() => {
          updatePageList(currentPage);
          currentCarId = null;
        });
      }
    }
  });
}

function addResetListener(): void {
  document
    .getElementById("reset-button")
    .addEventListener("click", async () => {
      deleteAllCars().then(() => {
        updatePageList();
        renderWinnersPageList();
      });
      currentPage = 1;
    });
}

function addRemoveListener(): void {
  document.querySelectorAll(".car-block").forEach((car) => {
    car.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("remove")) {
        tottalCarDelete(+car.getAttribute("number"));
        checkIfPagePossible(currentPage).then((res) => {
          if (res) {
            updatePageList(currentPage);
          } else {
            currentPage -= 1;
            updatePageList(currentPage);
          }
        });
      }
    });
  });
}

function addStartListener(): void {
  document.querySelectorAll(".car-block").forEach((car) => {
    car.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("start")) {
        startRide(+car.getAttribute("number"));
      }
    });
  });
}
function addBreakListener(): void {
  document.querySelectorAll(".car-block").forEach((car) => {
    car.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("break")) {
        carBreak(+car.getAttribute("number"));
      }
    });
  });
}

async function addSwitchPageListeners() {
  const nextPage = document.getElementById("grg-next-page");
  const prevPage = document.getElementById("grg-prev-page");
  nextPage.addEventListener("click", () => {
    currentPage += 1;
    checkIfPagePossible(currentPage).then((res) => {
      if (res) {
        updatePageList(currentPage);
      } else {
        currentPage -= 1;
      }
    });
  });
  prevPage.addEventListener("click", () => {
    currentPage -= 1;
    checkIfPagePossible(currentPage).then((res) => {
      if (res) {
        updatePageList(currentPage);
      } else {
        currentPage += 1;
      }
    });
  });
}
function addSelectListener() {
  document.querySelectorAll(".car-block").forEach((car) => {
    car.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("select")) {
        if (car.classList.contains("selected")) {
          currentCarId = 0;
          car.classList.remove("selected");
        } else {
          document.querySelectorAll(".car-block").forEach((car) => {
            car.classList.remove("selected");
          });
          car.classList.add("selected");
          currentCarId = +car.getAttribute("number");
        }
      }
    });
  });
}
function addRaceListener() {
  const raceButton = document.getElementById("race-button");
  raceButton.addEventListener("click", () => {
    if (raceButton.innerHTML === "Race") {
      startRace();
    } else {
      resetRace();
    }
  });
}
async function addEventListeners() {
  addCarListener();
  addResetListener();
  addSwitchPageListeners();
  updateCarListener();
  generateCarsListener();
  addNavListeners();
  addRaceListener();
}
addGrgListListeners = async function Anon() {
  addSelectListener();
  addRemoveListener();
  addStartListener();
  addBreakListener();
};

export { addEventListeners, updatePageList };
