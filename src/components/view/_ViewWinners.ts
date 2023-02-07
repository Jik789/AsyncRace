import CustomElement from '../utils/_createCustomElement';
import { addCarSVGImageWinners } from '../utils/utils';
import { ICar, IPaginationGarage, IWinner } from '../typingTS/_interfaces';
import { getWinners } from '../DATA/api';
import { WINNERS_IN_PAGE } from '../utils/const';
import state from '../DATA/state';

class ViewWinners {
  customElement: CustomElement;
  paginationWinners: IPaginationGarage;
  carsDataPage: ICar[];
  carsElementPage: HTMLElement[];

  pageMainWinners: HTMLElement;
  tableWinnersBody: HTMLElement;
  prevPageButton: HTMLElement;
  nextPageButton: HTMLElement;
  winnersCountCars: HTMLElement;
  winnersCountPages: HTMLElement;
  tableWinnerWins: HTMLElement;
  tableWinnerTime: HTMLElement;

  EVENT: { [x: string]: Event };

  constructor() {
    this.customElement = new CustomElement();

    this.paginationWinners = {
      maxPage: 1,
      currentPage: 1,
    };

    this.carsDataPage = [];
    this.carsElementPage = [];

    this.pageMainWinners = this.customElement.createElement('div', { className: 'page-main-winners _main-container in-page hide-block' });
    // Интерфейс победителей
    this.winnersCountCars = this.customElement.createElement('h2', { className: 'winnersCountCars', textContent:'Winners (4)' });
    this.winnersCountPages = this.customElement.createElement('h2', { className: 'winnersCountPages', textContent:'Page №1' });
    this.tableWinnersBody = this.customElement.createElement('tbody', { className: 'tableWinnerBody' });
    // Кнопки переключения страниц
    this.prevPageButton = this.customElement.createElement('button', { className: '_btn prevPageButton', textContent:'Prev' });
    this.nextPageButton = this.customElement.createElement('button', { className: '_btn nextPageButton', textContent:'Next' });
    // Для сортировки
    this.tableWinnerWins = this.customElement.createElement('th', { className: 'sorting sortingWins', textContent: 'Wins ▼▲' });
    this.tableWinnerTime = this.customElement.createElement('th', { className: 'sorting sortingTime', textContent: 'Best time ▼▲' });
    
    this.EVENT = {
      clickOnBacket: new Event('clickOnBacket', { bubbles: true }),
      clickOnLogo: new Event('clickOnLogo', { bubbles: true })
    }

    this.listenersMain();
  }

  listenersMain():void {
    // Обработчик на кнопку предыдущей страницы
    this.prevPageButton.addEventListener('click', () => {
      this.setPrevPage();
    });
    // Обработчик на кнопку следующей страницы
    this.nextPageButton.addEventListener('click', () => {
      this.setNextPage();
    });
    // Обработчик на кнопку следующей страницы
    this.tableWinnerWins.addEventListener('click', () => {
      this.setSortWins();
    });
    // Обработчик на кнопку следующей страницы
    this.tableWinnerTime.addEventListener('click', () => {
      this.setSortTime();
    });
  }

  async create(): Promise<HTMLElement> {
    //winners контейнер
    const winnersContainer = this.customElement.createElement('section', { className: 'winners _container' });
    this.customElement.addChildren(this.pageMainWinners, [winnersContainer]);

    //заполнение winnersContainer
    const tableWinner = this.customElement.createElement('table', { className: 'tableWinner' });
    const winnersContainerChangeListButton = this.customElement.createElement('div', { className: 'winnersContainerChangeListButton' });
    this.customElement.addChildren(winnersContainer, [this.winnersCountCars, this.winnersCountPages, tableWinner, winnersContainerChangeListButton]);

    //заполнение tableWinner
    const tableWinnerHead = this.customElement.createElement('thead', { className: 'tableWinnerHead' });
    this.customElement.addChildren(tableWinner, [tableWinnerHead, this.tableWinnersBody]);

    //заполнение tableWinnerHead
    const tableWinnerHeadTr = this.customElement.createElement('tr');
    this.customElement.addChildren(tableWinnerHead, [tableWinnerHeadTr]);

    //заполнение tableWinnerHeadTr
    const tableWinnerHeadThPosition = this.customElement.createElement('th', { textContent: 'Position' });
    const tableWinnerHeadThCar = this.customElement.createElement('th', { textContent: 'Car' });
    const tableWinnerHeadThName = this.customElement.createElement('th', { textContent: 'Name' });
    this.customElement.addChildren(tableWinnerHeadTr, [tableWinnerHeadThPosition, tableWinnerHeadThCar, tableWinnerHeadThName, this.tableWinnerWins, this.tableWinnerTime]);

    //заполнение this.tableWinnerBody
    await this.updateData(); 

    //заполнение winnersContainerChangeListButton
    this.customElement.addChildren(winnersContainerChangeListButton, [this.prevPageButton, this.nextPageButton]);
    
    return this.pageMainWinners
  }

  async updateData():Promise<void> {
    // Получим лист машинок победителей с сервера
    const carWinnersList: IWinner[] = await getWinners();
    // Обновим текст в шапке с количеством победителей
    await this.setTextWinnersCount(carWinnersList.length);
    // Установим нужную страничку для пагинации
    await this.renderCarAndPage(carWinnersList);
  }

  // Метод создания нужного массива автмообилей для последующей отрисовки
  async renderCarAndPage(carList:IWinner[]):Promise<void> {
    //Отсортируеем карточки
    const carListSort =  [...this.sortWinnerList(carList)]
    // Установим максимальную страничку для пагинации
    this.paginationWinners.maxPage = Math.ceil(carListSort.length / WINNERS_IN_PAGE);
    if (!carListSort.length) this.paginationWinners.maxPage = 1;
    // Проверка, чтобы не было пустой странички при удалении всех машинок с неё
    if (this.paginationWinners.currentPage > this.paginationWinners.maxPage) this.paginationWinners.currentPage = this.paginationWinners.maxPage;
    // Установим страничку
    await this.setTextGaragePage();
    // Создадим массив элементов для отрисовки
    const newListElement = carListSort.slice((this.paginationWinners.currentPage - 1) * WINNERS_IN_PAGE, this.paginationWinners.currentPage * WINNERS_IN_PAGE);
    // Отрисуем элементы
    this.customElement.addChildren(this.tableWinnersBody, [...await this.renderWinList(newListElement)]);
  }

  async renderWinList(car: IWinner[] = []): Promise<HTMLElement[]> {
    const itemContainer: HTMLElement[] = [];
    this.tableWinnersBody.innerHTML = '';
    let positionLocal = 1;

    for (const itemCar of car) {
      const positionWinners = (this.paginationWinners.currentPage - 1) * WINNERS_IN_PAGE + positionLocal;
      positionLocal++
      const itemCarContainer = this.customElement.createElement('tr', { className: `${itemCar.id}` });
      const tableWinnerHeadTdPosition = this.customElement.createElement('td', { textContent: `${positionWinners}` });

      const tableWinnerHeadTdCar = this.customElement.createElement('td');
      const carImg = addCarSVGImageWinners((itemCar.car as ICar).color);
      this.customElement.addChildren(tableWinnerHeadTdCar, [carImg]);
      const tableWinnerHeadTdName = this.customElement.createElement('td', { textContent: `${(itemCar.car as ICar).name}` });
      const tableWinnerHeadTdWins = this.customElement.createElement('td', { textContent: `${itemCar.wins}` });
      const tableWinnerHeadTdTime = this.customElement.createElement('td', { textContent: `${itemCar.time}` });
      this.customElement.addChildren(itemCarContainer, [tableWinnerHeadTdPosition, tableWinnerHeadTdCar, tableWinnerHeadTdName, tableWinnerHeadTdWins, tableWinnerHeadTdTime]);

      itemContainer.push(itemCarContainer)
    }

    return itemContainer
  }

  // Метод обновления количества машин в шапке
  async setTextWinnersCount(countCar: number):Promise<void> {
    this.winnersCountCars.textContent = `Winners (${countCar})`
  }

  // Метод обновления текущей страницы в шапке
  async setTextGaragePage():Promise<void> {
    this.winnersCountPages.textContent = `Pages (${this.paginationWinners.currentPage})`
  }

  // Метод для назначения предыдущей странички
  async setPrevPage():Promise<void> {
    if (this.paginationWinners.currentPage > 1) {
      this.paginationWinners.currentPage -= 1;
      await this.updateData(); 
    }
  }

  // Метод для назначения соедующей странички
  async setNextPage():Promise<void> {
    if (this.paginationWinners.currentPage < this.paginationWinners.maxPage) {
      this.paginationWinners.currentPage += 1;
      await this.updateData(); 
    }
  }

  // Метод сортировки по победам
  async setSortWins():Promise<void> {
    this.tableWinnerWins.classList.remove('sortingActive');
    this.tableWinnerTime.classList.remove('sortingActive');

    if (state.sort !== 'winsMaxMin') {
      state.sort = 'winsMaxMin';
    } else if (state.sort === 'winsMaxMin') {
      state.sort = 'winsMinMax';
    }

    this.tableWinnerWins.classList.add('sortingActive');
    await this.updateData(); 
  }

  async setSortTime():Promise<void> {
    this.tableWinnerWins.classList.remove('sortingActive');
    this.tableWinnerTime.classList.remove('sortingActive');

    if (state.sort !== 'timeMinMax') {
      state.sort = 'timeMinMax';
    } else if (state.sort === 'timeMinMax') {
      state.sort = 'timeMaxMin';
    }

    this.tableWinnerTime.classList.add('sortingActive');
    await this.updateData(); 
  }

  //Метод сортировки
  sortWinnerList(itemList:IWinner[]):IWinner[] {
    let resultSort:IWinner[] = [];

    if (state.sort === 'start') {
      resultSort = [...itemList]
    }
    if (state.sort === 'winsMaxMin') {
      resultSort = itemList.sort(function(a, b) {
        return b.wins - a.wins;
      });
    }
    if (state.sort === 'winsMinMax') {
      resultSort = itemList.sort(function(a, b) {
        return a.wins - b.wins;
      });
    }
    if (state.sort === 'timeMaxMin') {
      resultSort = itemList.sort(function(a, b) {
        return b.time - a.time;
      });
    }
    if (state.sort === 'timeMinMax') {
      resultSort = itemList.sort(function(a, b) {
        return a.time - b.time;
      });
    }

    return resultSort
  }
}

export default ViewWinners
