import { stringObject } from '../typingTS/_type'


class CustomElement {

  createElement(tagName: string = 'div', options?: stringObject) {
    const element = document.createElement(tagName);
    if (options) {
      Object.assign(element, options);
    }
    return element
  }

  addChildren(Father: HTMLElement, children: (HTMLElement | string)[]) {
    Father.append(...children);
  }
}

export default CustomElement 
