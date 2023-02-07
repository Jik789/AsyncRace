import CustomElement from '../utils/_createCustomElement';

class ViewHeader {
  logoTitle: HTMLElement;
  toGarage: HTMLElement;
  toWinners: HTMLElement;
  customElement: CustomElement;
  EVENT: { [x: string]: Event }

  constructor() {
    this.customElement = new CustomElement();

    this.logoTitle = this.customElement.createElement('h1', { className: 'logo__title', textContent: 'Async Race' });
    this.toGarage = this.customElement.createElement('p', { className: 'garage-link h-txt h-txt-active', textContent: 'Garage'  });
    this.toWinners = this.customElement.createElement('p', { className: 'winners-link h-txt', textContent: 'Winners' });

    this.EVENT = {
      clickOnGaragePage: new Event('clickOnGaragePage', { bubbles: true }),
      clickOnWinnersPage: new Event('clickOnWinnersPage', { bubbles: true })
    }

    this.listenersMain();
  }

  listenersMain():void {
    // Обработчик клика на страничку гаража
    this.toGarage.addEventListener('click', (event) => {
      this.toGarage.dispatchEvent(this.EVENT.clickOnGaragePage);
      this.changePage(event);
    });

    // Обработчик клика на страничку победителей
    this.toWinners.addEventListener('click', (event) => {
      this.toWinners.dispatchEvent(this.EVENT.clickOnWinnersPage);
      this.changePage(event);
    });
  }

  create():HTMLElement {
    //Header контейнер
    const headerContainer = this.customElement.createElement('section', { className: 'header _container' });
    // Основные секции header
    const headerLogo = this.customElement.createElement('a', { className: 'header__logo logo', href: '#' });
    const containerGarageWinners = this.customElement.createElement('div', { className: 'containerGarageWinners'});

    this.customElement.addChildren(headerContainer, [headerLogo, containerGarageWinners])
    // Заполнение headerLogo
    this.customElement.addChildren(headerLogo, [this.logoTitle]);
    // Заполнение containerGarageWinners
    this.customElement.addChildren(containerGarageWinners, [this.toGarage, this.toWinners]);
    return headerContainer
  }

  changePage(event: Event): void {
    const target = event.target as HTMLElement;
    const main = document.querySelector('main');

    // Найдем наши 2 странички в main и переведем в массив, чтобы можно было нормально работать
    const mainChild = Array.prototype.slice.call(main?.childNodes);
    const garage = mainChild[0];
    const winners = mainChild[1];

    //Удалим все стили
    mainChild.forEach(item => item.classList.remove('hide-block'));
    this.toGarage.classList.remove('h-txt-active');
    this.toWinners.classList.remove('h-txt-active');

    //Назначим стили в зависимости от кнопки
    if (target.classList.contains('garage-link')) {
      winners.classList.add('hide-block');
      this.toGarage.classList.add('h-txt-active');
    } else if (target.classList.contains('winners-link')) {
      garage.classList.add('hide-block');
      this.toWinners.classList.add('h-txt-active');
    }
  }
}

export default ViewHeader
