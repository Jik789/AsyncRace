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
    // Редактирование и создание машины
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
    // Интерфейс гоночек
    this.garageCountCars = this.customElement.createElement('h2', { className: 'garageCountCars', textContent:'Garage (4)' });
    this.garageCountPages = this.customElement.createElement('h2', { className: 'garageCountPages', textContent:'Page №1' });
    this.garageCarsList = this.customElement.createElement('div', { className: 'garageCarsList' });
    // Кнопки переключения страниц
    this.prevPageButton = this.customElement.createElement('button', { className: '_btn prevPageButton', textContent:'Prev' });
    this.nextPageButton = this.customElement.createElement('button', { className: '_btn nextPageButton', textContent:'Next' });
    // Инфа о победителе
    this.showWinnerContainer = this.customElement.createElement('div', { className: 'winning-message' });
    this.winText = this.customElement.createElement('div', { className: 'winText', textContent: 'Тестовое сообщение' });
    this.succesButton = this.customElement.createElement('button', { className: '_btn succesButton', textContent:'Okay' });

    this.EVENT = {
      updateWinnerList: new Event('updateWinnerList', { bubbles: true }),
      deleteCars: new Event('deleteCars', { bubbles: true }),
    }

    this.listenersMain();
    this.setDisableUpdateInput();
  }

  listenersMain():void {
    // Обработчик на текстовое поле создания машинки
    this.createNameCarInput.addEventListener('input', (event) => {
      this.createNameCar(event);
    });
    // Обработчик на цветовое поле создания машинки
    this.createColorCarInput.addEventListener('input', (event) => {
      this.createColorCar(event);
    });
    // Обработчик на кнопку добавления машинки
    this.createCarButton.addEventListener('click', () => {
      this.clickAddCar();
    });
    // Обработчик на кнопку добавления 100 машинок
    this.generateCarButton.addEventListener('click', () => {
      this.clickAddOneHundredCar();
    });
    // Обработчик на текстовое поле обновления машинки
    this.updateNameCarInput.addEventListener('input', (event) => {
      this.updateNameCar(event);
    });
    // Обработчик на цветовое поле обновления машинки
    this.updateColorCarInput.addEventListener('input', (event) => {
      this.updateColorCar(event);
    });
    // Обработчик на кнопку обновления машинки
    this.updateCarButton.addEventListener('click', () => {
      this.updateCarButton.dispatchEvent(this.EVENT.updateWinnerList);
      this.clickUpdateCar();
    });
    // Обработчик на кнопку предыдущей страницы
    this.prevPageButton.addEventListener('click', () => {
      this.setPrevPage();
    });
    // Обработчик на кнопку следующей страницы
    this.nextPageButton.addEventListener('click', () => {
      this.setNextPage();
    });
    // Обработчик на кнопку старта гонки
    this.raceStartButton.addEventListener('click', () => {
      this.startRace();
    });
    // Обработчик на кнопку остановки гонки
    this.raceResetButton.addEventListener('click', () => {
      this.stopRace();
    });
    // Обработчик на кнопку закрытия модального окна с победителем
    this.succesButton.addEventListener('click', () => {
      this.succesButton.dispatchEvent(this.EVENT.updateWinnerList);
      this.hideWinner();
    });
  }

  async create() {
    //Garage контейнер
    const garageContainer = this.customElement.createElement('section', { className: 'garage _container' });
    this.customElement.addChildren(this.pageMainGarage, [garageContainer, this.showWinnerContainer]);

    //Заполнение showWinner
    this.customElement.addChildren(this.showWinnerContainer, [this.winText, this.succesButton]);

    //Заполнение garageContainer
    const garageContainerCreateUpdate = this.customElement.createElement('div', { className: 'garageContainerCreateUpdate' });
    const garageContainerRaceInterface = this.customElement.createElement('div', { className: 'garageContainerRaceInterface' });
    const garageContainerChangeListButton = this.customElement.createElement('div', { className: 'garageContainerChangeListButton' });
    this.customElement.addChildren(garageContainer, [garageContainerCreateUpdate, garageContainerRaceInterface, garageContainerChangeListButton]);

    //заполнение garageContainerCreateUpdate
    const garageCreate = this.customElement.createElement('div', { className: 'garageCreate' });
    const garageUpdate = this.customElement.createElement('div', { className: 'garageUpdate' });
    const garageFunctionally = this.customElement.createElement('div', { className: 'garageFunctionally' });
    this.customElement.addChildren(garageContainerCreateUpdate, [garageCreate, garageUpdate, garageFunctionally]);

    //заполнение garageCreate, garageUpdate, garageFunctionally
    this.customElement.addChildren(garageCreate, [this.createNameCarInput, this.createColorCarInput, this.createCarButton]);
    this.customElement.addChildren(garageUpdate, [this.updateNameCarInput, this.updateColorCarInput, this.updateCarButton]);
    this.customElement.addChildren(garageFunctionally, [this.raceStartButton, this.raceResetButton, this.generateCarButton]);

    //заполнение garageContainerRaceInterface
    this.customElement.addChildren(garageContainerRaceInterface, [this.garageCountCars, this.garageCountPages, this.garageCarsList]);

    //заполнение this.garageCarsList
    await this.updateData(); 

    //заполнение garageContainerChangeListButton
    this.customElement.addChildren(garageContainerChangeListButton, [this.prevPageButton, this.nextPageButton]);

    return this.pageMainGarage
  }

  async updateData() {
    // Получим лист машинок с сервера
    const carList: ICar[] = await getCarsList();
    // Обновим текст в шапке с количеством
    await this.setTextGarageCount(carList.length);
    // Установим нужную страничку для пагинации
    await this.renderCarAndPage();
  }

  // Метод создания нужного массива автмообилей для последующей отрисовки
  async renderCarAndPage() {
    const carList: ICar[] = await getCarsList();
    // Установим максимальную страничку для пагинации
    this.paginationGarage.maxPage = Math.ceil(carList.length / CAR_IN_PAGE);
    if (!carList.length) this.paginationGarage.maxPage = 1;
    // Проверка, чтобы не было пустой странички при удалении всех машинок с неё
    if (this.paginationGarage.currentPage > this.paginationGarage.maxPage && carList.length !== 1) this.paginationGarage.currentPage = this.paginationGarage.maxPage;
    // Установим страничку
    await this.setTextGaragePage();
    // Создадим массив элементов для отрисовки
    const newListElement = carList.slice((this.paginationGarage.currentPage - 1) * CAR_IN_PAGE, this.paginationGarage.currentPage * CAR_IN_PAGE);
    // Отрисуем элементы
    this.customElement.addChildren(this.garageCarsList, [...await this.renderCar(newListElement)]);
  }

  //Непосредственно отрисовка нужных машин
  async renderCar(carList: ICar[]) {
    //Обнулим текущий контейнер, массив машин участников, массив элементов машинок
    this.carsDataPage = [];
    this.carsElementPage = [];

    this.garageCarsList.innerHTML = '';

    for (const itemCar of carList) {
      // Заполним контейнер машинки
      const itemCarContainer = this.customElement.createElement('div', { className: `itemCar`, id:`${itemCar.id}` });

      //Сделаем флаг финиша
      const finish = this.customElement.createElement('img', { className: 'finishImg', src:`${finishImg}` });

      // Заполним itemCarContainer
      const carContainerTop = this.customElement.createElement('div', { className: 'carContainerTop' });
      const carContainerBot = this.customElement.createElement('div', { className: 'carContainerBot' });
      this.customElement.addChildren(itemCarContainer, [carContainerTop, carContainerBot, finish]);

      // Заполним carContainerTop
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

      // Заполним carContainerBot
      const carContainerStartStop = this.customElement.createElement('div', { className: 'carContainerStartStop' });

      // Заполним carContainerStartStop
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

      // Заполним массив элементов машинок и массив объектов данных
      this.carsDataPage.push(itemCar);
      this.carsElementPage.push(itemCarContainer);
    }

    return this.carsElementPage
  }

  // Метод присовения имени машине по введенному значению
  createNameCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createCarSetting.name = target.value
  }

  //Метод присвоения цвета машине по указанному
  createColorCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createCarSetting.color = target.value
  }

  // Метод присовения имени машине по введенному значению
  updateNameCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateCarSetting.name = target.value
  }

  //Метод присвоения цвета машине по указанному
  updateColorCar(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateCarSetting.color = target.value
  }

  //Метд добавления машинки
  async clickAddCar() {
    await createCar(this.createCarSetting);
    await this.updateData(); 
  }

  //Метд добавления 100 машинок
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

  //Метод изменения машинки
  async clickUpdateCar() {
    await updateCar(String(this.updateCarSetting.id), this.updateCarSetting);
    await this.updateData();
    this.activeUpdateCar = false;
    this.setDisableUpdateInput();
  }

  //Метод удаления машинки
  async deleteCar(event: Event, carId: number = 0) {
    // Удаление машинок из гонки
    await deleteCar(String(carId));
    await this.updateData();
    //Удаление машинки из таблицы победителей
  }

  //Метод изменения вида инпутов и кнопки машинки
  async selectCar(event: Event, carId:number = 0) {
    this.removeDisableUpdateInput();
    this.activeUpdateCar = true;

    const target = event.target as HTMLElement;

    // Очистим класс у всех кнопочек
    const allCarElement = Array.prototype.slice.call(this.garageCarsList.childNodes);
    allCarElement.forEach(item => item.querySelector('.selectRaceTopButton').classList.remove('_active'));

    //Добавим цвет только нашей кнопочке
    target.classList.add('_active');

    //Запишем id выбранной машинки в updateCarSetting
    this.updateCarSetting.id = carId;
  }

  // Метод обновления количества машин в шапке
  async setTextGarageCount(countCar: number) {
    this.garageCountCars.textContent = `Garage (${countCar})`
  }

  // Метод обновления текущей страницы в шапке
  async setTextGaragePage() {
    this.garageCountPages.textContent = `Pages (${this.paginationGarage.currentPage})`
  }

  // Метод для назначения предыдущей странички
  async setPrevPage() {
    if (this.paginationGarage.currentPage > 1) {
      this.paginationGarage.currentPage -= 1;
      this.raceStartButton.removeAttribute('disabled');
      this.raceResetButton.setAttribute('disabled', 'disabled');
      await this.stopRace();
      await this.updateData(); 
    }
  }

  // Метод для назначения соедующей странички
  async setNextPage() {
    if (this.paginationGarage.currentPage < this.paginationGarage.maxPage) {
      this.paginationGarage.currentPage += 1;
      this.raceStartButton.removeAttribute('disabled');
      this.raceResetButton.setAttribute('disabled', 'disabled');
      await this.stopRace();
      await this.updateData(); 
    }
  }

  //Метод блокировки кнопочек редактирование при старте приложения
  setDisableUpdateInput() {
    this.updateNameCarInput.setAttribute('disabled', 'disabled');
    this.updateColorCarInput.setAttribute('disabled', 'disabled');
    this.updateCarButton.setAttribute('disabled', 'disabled');
  }

  //Метод блокировки кнопочек редактирование при старте приложения
  removeDisableUpdateInput() {
    this.updateNameCarInput.removeAttribute('disabled');
    this.updateColorCarInput.removeAttribute('disabled');
    this.updateCarButton.removeAttribute('disabled');
  }


  ///////////////////// БЛОК С ГОНКАМИ /////////////////////

  // Метод старта машины, где она запускает движок и вероятно может сломаться
  async startDriveCar(event: Event | null = null, buttonStop: HTMLElement, id: string, itemCarContainer:HTMLElement, carImageElement: HTMLElement, btnStart: HTMLElement | null = null): Promise<void> {
    let buttonStart: HTMLElement;
    if (!event) {
      buttonStart = btnStart as HTMLElement;
    } else {
      buttonStart = event.target as HTMLElement;
    }
    const seletBtn = itemCarContainer.querySelector('.selectRaceTopButton') as HTMLElement;
    const removeBtn = itemCarContainer.querySelector('.removeRaceTopButton') as HTMLElement;

    // Отключим кнопку старта, удаления, выбора и включим стоп
    seletBtn.setAttribute('disabled', 'disabled');
    removeBtn.setAttribute('disabled', 'disabled');
    buttonStart.setAttribute('disabled', 'disabled');
    buttonStop.removeAttribute('disabled');
    this.setDisableUpdateInput();
    // Запустим двигатель машинки
    await this.startEngineCar(buttonStop, id, itemCarContainer, carImageElement);
    // Проверим машинку на то работает или нет
    await this.checkEngineStatus(id);
  }

  // Метод запуска движка машинки
  async startEngineCar(buttonStop: HTMLElement, id: string, itemCarContainer:HTMLElement, carImageElement: HTMLElement): Promise<void> {
    // Установим параметры для машины
    const speed = await startEngine(id);
    const time = Math.floor(speed.distance / speed.velocity);
    const trackWidth = itemCarContainer.offsetWidth - ERROR_ANIMATION - FINISH_WIDTH;

    // Поменяем статус машинки и начнем анимацию гонки
    this.changeCarStatus(id, CarStatusEnum.started);
    this.animationCarDrive(trackWidth, time, carImageElement, id);
  }

  // Метод проверки движка машины
  async checkEngineStatus(id: string): Promise<void> {
    const data = await checkCar(id);
    if (!data.success) {
        state.carStatus.set(id, CarStatusEnum.drive);
    }
  }

  // Метод сброса состояния машинки
  async stopDriveCar(event: Event | null = null, buttonStart: HTMLElement, id: string, itemCarContainer:HTMLElement, carImageElement: HTMLElement, btnStop: HTMLElement | null = null): Promise<void> {
    let buttonStop: HTMLElement;
    if (!event) {
      buttonStop = btnStop as HTMLElement;
    } else {
      buttonStop = event.target as HTMLElement;
    }
    const seletBtn = itemCarContainer.querySelector('.selectRaceTopButton') as HTMLElement;
    const removeBtn = itemCarContainer.querySelector('.removeRaceTopButton') as HTMLElement;

    // Отключим кнопку стоп
    buttonStop.setAttribute('disabled', 'disabled');
    //Сменим статус машинки
    this.changeCarStatus(id, CarStatusEnum.stopped);
    // Переместим на старое место
    carImageElement.style.transform = `translateX(0px)`;
    // Включим кнопочку старта, редактирования и удаления
    seletBtn.removeAttribute('disabled');
    removeBtn.removeAttribute('disabled');
    buttonStart.removeAttribute('disabled');
    if (this.activeUpdateCar) {
      this.removeDisableUpdateInput();
    }
  }

  // Метод анимации передвижения машинки конкретной
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
        // Покажем окошко победителя
        this.showWinner(car, duration / MILLISECONDS_IN_SECOND);
        // Занесем в таблицу победителей нашего победителя
        await saveWinner((String(car.id)), duration / MILLISECONDS_IN_SECOND);
      }
    };
    shot();
  }

  // Изменения статуса машки которая едет
  changeCarStatus(id: string, status: number): void  {
    const oldStatus = state.carStatus.get(id);
    if (oldStatus !== status) {
      state.carStatus.set(id, status);
    }
  }

  // Метод старта гонок для всех машинок
  async startRace() {
    // Отключим кнопку старта
    this.raceStartButton.setAttribute('disabled', 'disabled');

    //Укажем, что гонка активна
    state.isRace = true;

    // Вызовем гоночку для каждой машинки
    this.carsDataPage.forEach((item) => {
      const currentElement = document.getElementById(`${item.id}`) as HTMLElement;
      const resetBtn = currentElement?.querySelector('.resetRaceBotButton') as HTMLElement;
      const startBtn = currentElement?.querySelector('.startRaceBotButton') as HTMLElement;
      const img = currentElement?.querySelector('.car-image') as HTMLElement;
      this.startDriveCar(null, resetBtn, String(item.id), currentElement, img, startBtn)
    });

    // Включим кнопочку стопа
    this.raceResetButton.removeAttribute('disabled');
  }

  // Метод стопа гонок для всех машинок
  async stopRace() {
    // Отключим кнопку стопа
    this.raceResetButton.setAttribute('disabled', 'disabled');

    // Остановим гоночку для каждой машинк
    this.carsDataPage.forEach((item) => {
      const currentElement = document.getElementById(`${item.id}`) as HTMLElement;
      const resetBtn = currentElement?.querySelector('.resetRaceBotButton') as HTMLElement;
      const startBtn = currentElement?.querySelector('.startRaceBotButton') as HTMLElement;
      const img = currentElement?.querySelector('.car-image') as HTMLElement;
      this.stopDriveCar(null, startBtn, String(item.id), currentElement, img, resetBtn);
    });

    // Включим кнопочку старта
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
