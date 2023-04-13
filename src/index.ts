import './style.css';
import { setDefaultStructure, renderPageList, renderWinnersPageList } from './render';
// import { getCars } from './requests';
import { addEventListeners, updatePageList } from './userEvents';

async function index() {
  setDefaultStructure();
  await renderPageList();
  await updatePageList();
  await addEventListeners();
  await renderWinnersPageList();
}
index();
