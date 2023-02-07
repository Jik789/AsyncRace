// VIEWS
import ViewHeader from '../view/_ViewHeader';
import ViewFooter from '../view/_ViewFooter';
import ViewGarage from '../view/_ViewGarage';
import ViewWinners from '../view/_ViewWinners';

// Служебные программки
import CustomElement from '../utils/_createCustomElement';
import { deleteWinner } from '../DATA/api';

class ControllerMain {

  customElement: CustomElement
  viewHEADER: ViewHeader;
  viewFOOTER: ViewFooter;
  viewGarage: ViewGarage;
  viewWinners: ViewWinners;
  BODY: HTMLElement
  HEADER: HTMLElement
  MAIN: HTMLElement
  FOOTER: HTMLElement

  constructor() {
    this.customElement = new CustomElement();

    this.BODY = document.body
    this.HEADER = this.customElement.createElement('header', { className: "page-header _main-container" });
    this.MAIN = this.customElement.createElement('main');
    this.FOOTER = this.customElement.createElement('footer', { className: "page-footer _main-container" });
    this.customElement.addChildren(this.BODY, [this.HEADER, this.MAIN, this.FOOTER])

    this.viewHEADER = new ViewHeader();
    this.viewFOOTER = new ViewFooter();
    this.viewGarage = new ViewGarage();
    this.viewWinners = new ViewWinners();

    this.listenersController();
  }

  // Конец конструктора
  async init() {
    this.HEADER.append(this.viewHEADER.create());
    this.MAIN.append(await this.viewGarage.create());
    this.MAIN.append(await this.viewWinners.create());
    this.FOOTER.append(this.viewFOOTER.create());
  }

  // Слушатели событий
  listenersController() {
    // Обновление списка победителей
    this.BODY.addEventListener('updateWinnerList', async () => {
      await this.viewWinners.updateData();
    });

    // Обновление списка победителей
    this.BODY.addEventListener('updateWinnerList', async () => {
      await this.viewWinners.updateData();
    });

    this.BODY.addEventListener('deleteCars', async (event) => {
      const target = event.target as HTMLElement;
      const targetId = (target.closest('.itemCar') as HTMLElement).id;
      // Удалим из базы победителей
      await deleteWinner(targetId);
      // Обновим таблицу победителей
      await this.viewWinners.updateData();
    });

  }
  
}

export default ControllerMain

