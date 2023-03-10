import CustomElement from '../utils/_createCustomElement';
import state from '../DATA/state'
import { addCarSVGImageGarage, createRandomCar } from '../utils/utils';
import finishImg from '../../assets/img/png/finish.png';
import { ICar, IPaginationGarage, IWinner } from '../typingTS/_interfaces';
import { CarStatusEnum } from '../typingTS/_type';
import { getCarsList, getCar, createCar, deleteCar, updateCar, startEngine, checkCar, saveWinner } from '../DATA/api';
import { CAR_IN_PAGE, COUNT_RANDOM_CAR, START_WIDTH, FINISH_WIDTH, MILLISECONDS_IN_SECOND, FPS, ERROR_ANIMATION, DEFAULT_GENERATE_NAME } from '../utils/const';


class ViewGarage {
  customElement: CustomElement;
  createCarSetting: ICar;
  updateCarSetting: ICar;
  paginationGarage: IPaginationGarage;
  carsDataPage: ICar[];
  carsElementPage: HTMLElement[];
  raceWinner: IWinner;
  activeUpdateCar: boolean;

  pageMainGarage: HTMLElement;
  createNameCarInput: HTMLElement;
  createColorCarInput: HTMLElement;
  createCarButton: HTMLElement;
  updateNameCarInput: HTMLElement;
  updateColorCarInput: HTMLElement;
  updateCarButton: HTMLElement;
  raceStartButton: HTMLElement;
  raceResetButton: HTMLElement;
  generateCarButton: HTMLElement;
  garageCountCars: HTMLElement;
  garageCountPages: HTMLElement;
  garageCarsList: HTMLElement;
  prevPageButton: HTMLElement;
  nextPageButton: HTMLElement;
  winText: HTMLElement;
  succesButton: HTMLElement;
  showWinnerContainer: HTMLElement;

  EVENT: { [x: string]: Event }

  constructor() {
    this.customElement = new CustomElement();

    this.createCarSetting = {
      name: 'Default name',
      color: '#000000',
    };

    this.updateCarSetting = {
      name: 'New name',
      color: '#000000',
      id: 0,
    };

    this.paginationGarage = {
      maxPage: 1,
      currentPage: 1,
    };

    this.raceWinner = {
      id: 0,
      wins: 0,
      time: 0,
    };

    this.carsDataPage = [];
    this.carsElementPage = [];
    this.activeUpdateCar = false;

    this.pageMainGarage = this.customElement.createElement('div', { className: 'page-main-garage _main-container in-page' });
    // ???????????????????????????? ?? ???????????????? ????????????
    this.createNameCarInput = this.customElement.createElement('input', { type: 'text', className: 'createNameCar nameCar', placeholder: `${this.createCarSetting.name}` });
    this.createColorCarInput = this.customElement.createElement('input', { type: 'color', className: 'createColorCar colorCar'});
    this.createCarButton = this.customElement.createElement('button', { className: '_btn createButtonCar', textContent:'Create' });
    this.updateNameCarInput = this.customElement.createElement('input', { type: 'text', className: 'updateNameCar nameCar', placeholder: `${this.updateCarSetting.name}` });
    this.updateColorCarInput = this.customElement.createElement('input', { type: 'color', className: 'updateColorCar colorCar' });
    this.updateCarButton = this.customElement.createElement('button', { className: '_btn updateButtonCar', textContent:'Update' });
    this.raceStartButton = this.customElement.createElement('button', { className: '_btn raceStartButton', textContent:'Start' });
    this.raceResetButton = this.customElement.createElement('button', { className: '_btn raceResetButton', textContent:'Reset' });
    this.raceResetButton.setAttribute('disabled', 'disabled');
    this.generateCarButton = this.customElement.createElement('button', { className: '_btn generateCarButton', textContent:'Generate Car' });
    // ?????????????????? ??????????????
    this.garageCountCars = this.customElement.createElement('h2', { className: 'garageCountCars', textContent:'Garage (4)' });
    this.garageCountPages = this.customElement.createElement('h2', { className: 'garageCountPages', textContent:'Page ???1' });
    this.garageCarsList = this.customElement.createElement('div', { className: 'garageCarsList' });
    // ???????????? ???????????????????????? ??????????????
    this.prevPageButton = this.customElement.createElement('button', { className: '_btn prevPageButton', textContent:'Prev' });
    this.nextPageButton = this.customElement.createElement('button', { className: '_btn nextPageButton', textContent:'Next' });
    // ???????? ?? ????????????????????
    this.showWinnerContainer = this.customElement.createElement('div', { className: 'winning-message' });
    this.winText = this.customElement.createElement('div', { className: 'winText', textContent: '???????????????? ??????????????????' });
    this.succesButton = this.customElement.createElement('button', { className: '_btn succesButton', textContent:'Okay' });

    this.EVENT = {
      updateWinnerList: new Event('updateWinnerList', { bubbles: true }),
      deleteCars: new Event('deleteCars', { bubbles: true }),
    }

    this.listenersMain();
    this.setDisableUpdateInput();
  }

  listenersMain():void {
    // ???????????????????? ???? ?????????????????? ???????? ???????????????? ??????????????
    this.createNameCarInput.addEventListener('input', (event) => {
      this.createNameCar(event);
    });
    // ???????????????????? ???? ???????????????? ???????? ???????????????? ??????????????
    this.createColorCarInput.addEventListener('input', (event) => {
      this.createColorCar(event);
    });
    // ???????????????????? ???? ???????????? ???????????????????? ??????????????
    this.createCarButton.addEventListener('click', () => {
      this.clickAddCar();
    });
    // ???????????????????? ???? ???????????? ???????????????????? 100 ??????????????
    this.generateCarButton.addEventListener('click', () => {
      this.clickAddOneHundredCar();
    });
    // ???????????????????? ???? ?????????????????? ???????? ???????????????????? ??????????????
    this.updateNameCarInput.addEventListener('input', (event) => {
      this.updateNameCar(event);
    });
    // ???????????????????? ???? ???????????????? ???????? ???????????????????? ??????????????
    this.updateColorCarInput.addEventListener('input', (event) => {
      this.updateColorCar(event);
    });
    // ???????????????????? ???? ???????????? ???????????????????? ??????????????
    this.updateCarButton.addEventListener('click', () => {
      this.updateCarButton.dispatchEvent(this.EVENT.updateWinnerList);
      this.clickUpdateCar();
    });
    // ???????????????????? ???? ???????????? ???????????????????? ????????????????
    this.prevPageButton.addEventListener('click', () => {
      this.setPrevPage();
    });
    // ???????????????????? ???? ???????????? ?????????????????? ????????????????
    this.nextPageButton.addEventListener('click', () => {
      this.setNextPage();
    });
    // ???????????????????? ???? ???????????? ???????????? ??????????
    this.raceStartButton.addEventListener('click', () => {
      this.startRace();
    });
    // ???????????????????? ???? ???????????? ?????????????????? ??????????
    this.raceResetButton.addEventListener('click', () => {
      this.stopRace();
    });
    // ???????????????????? ???? ???????????? ???????????????? ???????????????????? ???????? ?? ??????????????????????
    this.succesButton.addEventListener('click', () => {
      this.succesButton.dispatchEvent(this.EVENT.updateWinnerList);
      this.hideWinner();
    });
  }

  async create() {
    //Garage ??????????????????
    const garageContainer = this.customElement.createElement('section', { className: 'garage _container' });
    this.customElement.addChildren(this.pageMainGarage, [garageContainer, this.showWinnerContainer]);

    //???????????????????? showWinner
    this.customElement.addChildren(this.showWinnerContainer, [this.winText, this.succesButton]);

    //???????????????????? garageContainer
    const garageContainerCreateUpdate = this.customElement.createElement('div', { className: 'garageContainerCreateUpdate' });
    const garageContainerRaceInterface = this.customElement.createElement('div', { className: 'garageContainerRaceInterface' });
    const garageContainerChangeListButton = this.customElement.createElement('div', { className: 'garageContainerChangeListButton' });
    this.customElement.addChildren(garageContainer, [garageContainerCreateUpdate, garageContainerRaceInterface, garageContainerChangeListButton]);

    //???????????????????? garageContainerCreateUpdate
    const garageCreate = this.customElement.createElement('div', { className: 'garageCreate' });
    const garageUpdate = this.customElement.createElement('div', { className: 'garageUpdate' });
    const garageFunctionally = this.customElement.createElement('div', { className: 'garageFunctionally' });
    this.customElement.addChildren(garageContainerCreateUpdate, [garageCreate, garageUpdate, garageFunctionally]);

    //???????????????????? garageCreate, garageUpdate, garageFunctionally
    this.customElement.addChildren(garageCreate, [this.createNameCarInput, this.createColorCarInput, this.createCarButton]);
    this.customElement.addChildren(garageUpdate, [this.updateNameCarInput, this.updateColorCarInput, this.updateCarButton]);
    this.customElement.addChildren(garageFunctionally, [this.raceStartButton, this.raceResetButton, this.generateCarButton]);

    //???????????????????? garageContainerRaceInterface
    this.customElement.addChildren(garageContainerRaceInterface, [this.garageCountCars, this.garageCountPages, this.garageCarsList]);

    //???????????????????? this.garageCarsList
    await this.updateData(); 

    //???????????????????? garageContainerChangeListButton
    this.customElement.addChildren(garageContainerChangeListButton, [this.prevPageButton, this.nextPageButton]);

    return this.pageMainGarage
  }

  async updateData() {
    // ?????????????? ???????? ?????????????? ?? ??????????????
    const carList: ICar[] = await getCarsList();
    // ?????????????? ?????????? ?? ?????????? ?? ??????????????????????
    await this.setTextGarageCount(carList.length);
    // ?????????????????? ???????????? ?????????????????? ?????? ??????????????????
    await this.renderCarAndPage();
  }

  // ?????????? ???????????????? ?????????????? ?????????????? ?????????????????????? ?????? ?????????????????????? ??????????????????
  async renderCarAndPage() {
    const carList: ICar[] = await getCarsList();
    // ?????????????????? ???????????????????????? ?????????????????? ?????? ??????????????????
    this.paginationGarage.maxPage = Math.ceil(carList.length / CAR_IN_PAGE);
    if (!carList.length) this.paginationGarage.maxPage = 1;
    // ????????????????, ?????????? ???? ???????? ???????????? ?????????????????? ?????? ???????????????? ???????? ?????????????? ?? ??????
    if (this.paginationGarage.currentPage > this.paginationGarage.maxPage && carList.length !== 1) this.paginationGarage.currentPage = this.paginationGarage.maxPage;
    // ?????????????????? ??????????????????
    await this.setTextGaragePage();
    // ???????????????? ???????????? ?????????????????? ?????? ??????????????????
    const newListElement = carList.slice((this.paginationGarage.currentPage - 1) * CAR_IN_PAGE, this.paginationGarage.currentPage * CAR_IN_PAGE);
    // ???????????????? ????????????????
    this.customElement.addChildren(this.garageCarsList, [...await this.renderCar(newListElement)]);
  }

  //?????????????????????????????? ?????????????????? ???????????? ??????????
  async renderCar(carList: ICar[]) {
    //?????????????? ?????????????? ??????????????????, ???????????? ?????????? ????????????????????, ???????????? ?????????????????? ??????????????
    this.carsDataPage = [];
    this.carsElementPage = [];

    this.garageCarsList.innerHTML = '';

    for (const itemCar of carList) {
      // ???????????????? ?????????????????? ??????????????
      const itemCarContainer = this.customElement.createElement('div', { className: `itemCar`, id:`${itemCar.id}` });

      //?????????????? ???????? ????????????
      const finish = this.customElement.createElement('img', { className: 'finishImg', src:`${finishImg}` });

      // ???????????????? itemCarContainer
      const carContainerTop = this.customElement.createElement('div', { className: 'carContainerTop' });
      const carContainerBot = this.customElement.createElement('div', { className: 'carContainerBot' });
      this.customElement.addChildren(itemCarContainer, [carContainerTop, carContainerBot, finish]);

      // ???????????????? carContainerTop
      const selectRaceTopButton = this.customElement.createElement('button', { className: '_btn selectRaceTopButton', textContent:'Select' });
      const removeRaceTopButton = this.customElement.createElement('button', { className: '_btn removeRaceTopButton', textContent:'Remove' });
      const nameCarTopRace = this.customElement.createElement('h2', { className: 'nameCarRace', textContent: `${itemCar.name}` });
      this.customElement.addChildren(carContainerTop, [selectRaceTopButton, removeRaceTopButton, nameCarTopRace]);

      selectRaceTopButton.addEventListener('click', (event) => {
        this.selectCar(event, itemCar.id);
      });
      removeRaceTopButton.addEventListener('click', (event) => {
        removeRaceTopButton.dispatchEvent(this.EVENT.deleteCars);
        this.deleteCar(event, itemCar.id);
      });

      // ???????????????? carContainerBot
      const carContainerStartStop = this.customElement.createElement('div', { className: 'carContainerStartStop' });

      // ???????????????? carContainerStartStop
      const startRaceBotButton = this.customElement.createElement('button', { className: '_btn startRaceBotButton', textContent:'Start' });
      const resetRaceBotButton = this.customElement.createElement('button', { className: '_btn resetRaceBotButton', textContent:'Stop' });
      resetRaceBotButton.setAttribute('disabled', 'disabled');

      startRaceBotButton.addEventListener('click', (event) => {
        this.startDriveCar(event, resetRaceBotButton, String(itemCar.id), itemCarContainer, carImg);
      });
      resetRaceBotButton.addEventListener('click', (event) => {
        this.stopDriveCar(event, startRaceBotButton , String(itemCar.id), itemCarContainer, carImg);
      });

      this.customElement.addChildren(carContainerStartStop, [startRaceBotButton, resetRaceBotButton]);

      const carImg = addCarSVGImageGarage(itemCar.color);
      this.customElement.addChildren(carContainerBot, [carContainerStartStop, carImg]);

      // ???????????????? ???????????? ?????????????????? ?????????????? ?? ???????????? ???????????????? ????????????
      this.carsDataPage.push(itemCar);
      this.carsElementPage.push(itemCarContainer);
    }

    return this.carsElementPage
  }

  // ?????????? ???????????????????? ?????????? ???????????? ???? ???????????????????? ????????????????
  createNameCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createCarSetting.name = target.value
  }

  //?????????? ???????????????????? ?????????? ???????????? ???? ????????????????????
  createColorCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createCarSetting.color = target.value
  }

  // ?????????? ???????????????????? ?????????? ???????????? ???? ???????????????????? ????????????????
  updateNameCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateCarSetting.name = target.value
  }

  //?????????? ???????????????????? ?????????? ???????????? ???? ????????????????????
  updateColorCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateCarSetting.color = target.value
  }

  //???????? ???????????????????? ??????????????
  async clickAddCar() {
    await createCar(this.createCarSetting);
    await this.updateData(); 
  }

  //???????? ???????????????????? 100 ??????????????
  async clickAddOneHundredCar() {
    this.generateCarButton.setAttribute('disabled', 'disabled');
    this.generateCarButton.textContent = 'wait...';

    for (let i = 0; i < COUNT_RANDOM_CAR; i++) {
      await createCar(createRandomCar());
    }

    this.generateCarButton.removeAttribute('disabled');
    this.generateCarButton.textContent = DEFAULT_GENERATE_NAME;

    await this.updateData(); 
  }

  //?????????? ?????????????????? ??????????????
  async clickUpdateCar() {
    await updateCar(String(this.updateCarSetting.id), this.updateCarSetting);
    await this.updateData();
    this.activeUpdateCar = false;
    this.setDisableUpdateInput();
  }

  //?????????? ???????????????? ??????????????
  async deleteCar(event: Event, carId: number = 0) {
    // ???????????????? ?????????????? ???? ??????????
    await deleteCar(String(carId));
    await this.updateData();
    //???????????????? ?????????????? ???? ?????????????? ??????????????????????
  }

  //?????????? ?????????????????? ???????? ?????????????? ?? ???????????? ??????????????
  async selectCar(event: Event, carId:number = 0) {
    this.removeDisableUpdateInput();
    this.activeUpdateCar = true;

    const target = event.target as HTMLElement;

    // ?????????????? ?????????? ?? ???????? ????????????????
    const allCarElement = Array.prototype.slice.call(this.garageCarsList.childNodes);
    allCarElement.forEach(item => item.querySelector('.selectRaceTopButton').classList.remove('_active'));

    //?????????????? ???????? ???????????? ?????????? ????????????????
    target.classList.add('_active');

    //?????????????? id ?????????????????? ?????????????? ?? updateCarSetting
    this.updateCarSetting.id = carId;
  }

  // ?????????? ???????????????????? ???????????????????? ?????????? ?? ??????????
  async setTextGarageCount(countCar: number) {
    this.garageCountCars.textContent = `Garage (${countCar})`
  }

  // ?????????? ???????????????????? ?????????????? ???????????????? ?? ??????????
  async setTextGaragePage() {
    this.garageCountPages.textContent = `Pages (${this.paginationGarage.currentPage})`
  }

  // ?????????? ?????? ???????????????????? ???????????????????? ??????????????????
  async setPrevPage() {
    if (this.paginationGarage.currentPage > 1) {
      this.paginationGarage.currentPage -= 1;
      this.raceStartButton.removeAttribute('disabled');
      this.raceResetButton.setAttribute('disabled', 'disabled');
      await this.stopRace();
      await this.updateData(); 
    }
  }

  // ?????????? ?????? ???????????????????? ?????????????????? ??????????????????
  async setNextPage() {
    if (this.paginationGarage.currentPage < this.paginationGarage.maxPage) {
      this.paginationGarage.currentPage += 1;
      this.raceStartButton.removeAttribute('disabled');
      this.raceResetButton.setAttribute('disabled', 'disabled');
      await this.stopRace();
      await this.updateData(); 
    }
  }

  //?????????? ???????????????????? ???????????????? ???????????????????????????? ?????? ???????????? ????????????????????
  setDisableUpdateInput() {
    this.updateNameCarInput.setAttribute('disabled', 'disabled');
    this.updateColorCarInput.setAttribute('disabled', 'disabled');
    this.updateCarButton.setAttribute('disabled', 'disabled');
  }

  //?????????? ???????????????????? ???????????????? ???????????????????????????? ?????? ???????????? ????????????????????
  removeDisableUpdateInput() {
    this.updateNameCarInput.removeAttribute('disabled');
    this.updateColorCarInput.removeAttribute('disabled');
    this.updateCarButton.removeAttribute('disabled');
  }


  ///////////////////// ???????? ?? ?????????????? /////////////////////

  // ?????????? ???????????? ????????????, ?????? ?????? ?????????????????? ???????????? ?? ???????????????? ?????????? ??????????????????
  async startDriveCar(event: Event | null = null, buttonStop: HTMLElement, id: string, itemCarContainer:HTMLElement, carImageElement: HTMLElement, btnStart: HTMLElement | null = null): Promise<void> {
    let buttonStart: HTMLElement;
    if (!event) {
      buttonStart = btnStart as HTMLElement;
    } else {
      buttonStart = event.target as HTMLElement;
    }
    const seletBtn = itemCarContainer.querySelector('.selectRaceTopButton') as HTMLElement;
    const removeBtn = itemCarContainer.querySelector('.removeRaceTopButton') as HTMLElement;

    // ???????????????? ???????????? ????????????, ????????????????, ???????????? ?? ?????????????? ????????
    seletBtn.setAttribute('disabled', 'disabled');
    removeBtn.setAttribute('disabled', 'disabled');
    buttonStart.setAttribute('disabled', 'disabled');
    buttonStop.removeAttribute('disabled');
    this.setDisableUpdateInput();
    // ???????????????? ?????????????????? ??????????????
    await this.startEngineCar(buttonStop, id, itemCarContainer, carImageElement);
    // ???????????????? ?????????????? ???? ???? ???????????????? ?????? ??????
    await this.checkEngineStatus(id);
  }

  // ?????????? ?????????????? ???????????? ??????????????
  async startEngineCar(buttonStop: HTMLElement, id: string, itemCarContainer:HTMLElement, carImageElement: HTMLElement): Promise<void> {
    // ?????????????????? ?????????????????? ?????? ????????????
    const speed = await startEngine(id);
    const time = Math.floor(speed.distance / speed.velocity);
    const trackWidth = itemCarContainer.offsetWidth - ERROR_ANIMATION - FINISH_WIDTH;

    // ???????????????? ???????????? ?????????????? ?? ???????????? ???????????????? ??????????
    this.changeCarStatus(id, CarStatusEnum.started);
    this.animationCarDrive(trackWidth, time, carImageElement, id);
  }

  // ?????????? ???????????????? ???????????? ????????????
  async checkEngineStatus(id: string): Promise<void> {
    const data = await checkCar(id);
    if (!data.success) {
        state.carStatus.set(id, CarStatusEnum.drive);
    }
  }

  // ?????????? ???????????? ?????????????????? ??????????????
  async stopDriveCar(event: Event | null = null, buttonStart: HTMLElement, id: string, itemCarContainer:HTMLElement, carImageElement: HTMLElement, btnStop: HTMLElement | null = null): Promise<void> {
    let buttonStop: HTMLElement;
    if (!event) {
      buttonStop = btnStop as HTMLElement;
    } else {
      buttonStop = event.target as HTMLElement;
    }
    const seletBtn = itemCarContainer.querySelector('.selectRaceTopButton') as HTMLElement;
    const removeBtn = itemCarContainer.querySelector('.removeRaceTopButton') as HTMLElement;

    // ???????????????? ???????????? ????????
    buttonStop.setAttribute('disabled', 'disabled');
    //???????????? ???????????? ??????????????
    this.changeCarStatus(id, CarStatusEnum.stopped);
    // ???????????????????? ???? ???????????? ??????????
    carImageElement.style.transform = `translateX(0px)`;
    // ?????????????? ???????????????? ????????????, ???????????????????????????? ?? ????????????????
    seletBtn.removeAttribute('disabled');
    removeBtn.removeAttribute('disabled');
    buttonStart.removeAttribute('disabled');
    if (this.activeUpdateCar) {
      this.removeDisableUpdateInput();
    }
  }

  // ?????????? ???????????????? ???????????????????????? ?????????????? ????????????????????
  animationCarDrive (endTrack: number, duration: number, carImg: HTMLElement, id: string): void {
    let currentX = START_WIDTH;
    const framesCount = (duration / MILLISECONDS_IN_SECOND) * FPS;
    const oneTick = (endTrack - currentX) / framesCount;
    const copy = carImg;
    
    const shot = async () => {
      currentX += oneTick;
      copy.style.transform = `translateX(${currentX}px)`;
      if (currentX < endTrack && state.carStatus.get(id) === CarStatusEnum.started) {
        requestAnimationFrame(shot);
      } else if (state.carStatus.get(id) === CarStatusEnum.stopped) {
        copy.style.transform = `translateX(0px)`;
      } else if (state.isRace && state.carStatus.get(id) === CarStatusEnum.started) {
        state.isRace = false;
        const car = await getCar(id);
        // ?????????????? ???????????? ????????????????????
        this.showWinner(car, duration / MILLISECONDS_IN_SECOND);
        // ?????????????? ?? ?????????????? ?????????????????????? ???????????? ????????????????????
        await saveWinner((String(car.id)), duration / MILLISECONDS_IN_SECOND);
      }
    };
    shot();
  }

  // ?????????????????? ?????????????? ?????????? ?????????????? ????????
  changeCarStatus(id: string, status: number): void  {
    const oldStatus = state.carStatus.get(id);
    if (oldStatus !== status) {
      state.carStatus.set(id, status);
    }
  }

  // ?????????? ???????????? ?????????? ?????? ???????? ??????????????
  async startRace() {
    // ???????????????? ???????????? ????????????
    this.raceStartButton.setAttribute('disabled', 'disabled');

    //????????????, ?????? ?????????? ??????????????
    state.isRace = true;

    // ?????????????? ?????????????? ?????? ???????????? ??????????????
    this.carsDataPage.forEach((item) => {
      const currentElement = document.getElementById(`${item.id}`) as HTMLElement;
      const resetBtn = currentElement?.querySelector('.resetRaceBotButton') as HTMLElement;
      const startBtn = currentElement?.querySelector('.startRaceBotButton') as HTMLElement;
      const img = currentElement?.querySelector('.car-image') as HTMLElement;
      this.startDriveCar(null, resetBtn, String(item.id), currentElement, img, startBtn)
    });

    // ?????????????? ???????????????? ??????????
    this.raceResetButton.removeAttribute('disabled');
  }

  // ?????????? ?????????? ?????????? ?????? ???????? ??????????????
  async stopRace() {
    // ???????????????? ???????????? ??????????
    this.raceResetButton.setAttribute('disabled', 'disabled');

    // ?????????????????? ?????????????? ?????? ???????????? ????????????
    this.carsDataPage.forEach((item) => {
      const currentElement = document.getElementById(`${item.id}`) as HTMLElement;
      const resetBtn = currentElement?.querySelector('.resetRaceBotButton') as HTMLElement;
      const startBtn = currentElement?.querySelector('.startRaceBotButton') as HTMLElement;
      const img = currentElement?.querySelector('.car-image') as HTMLElement;
      this.stopDriveCar(null, startBtn, String(item.id), currentElement, img, resetBtn);
    });

    // ?????????????? ???????????????? ????????????
    this.raceStartButton.removeAttribute('disabled');
  }

  showWinner(car: ICar, duration:number) {
    this.winText.textContent = `${car.name} won in ${duration} sec`
    this.showWinnerContainer.classList.add('displayshow');
  }

  hideWinner() {
    this.showWinnerContainer.classList.remove('displayshow');
  }
}

export default ViewGarage
