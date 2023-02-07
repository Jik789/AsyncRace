import { createElement } from '../utils/utils';

class ViewFooter {
  create() {
    const footer = `
  <section class="footer _container">
    <div class="footer__item github">
      <div class="footer__link-container">
        <div class="footer__link-container-item">
          <a href="https://github.com/Jik789" class="footer__link footer__github"></a>
          <p class="footer__author">JiK789</p>
        </div>
      </div>
    </div>
    <p class="footer__item date-relese">2022</p>
    <div class="footer__item rsschool">
      <a href="https://rs.school/index.html" class="footer__link footer__rsschool"></a>
    </div>
  </section>`
  return createElement(footer)
  }
}

export default ViewFooter