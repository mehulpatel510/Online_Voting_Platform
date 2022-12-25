import { html, css, LitElement } from 'lit-element';

export class NavigationBar extends LitElement {
  static get properties() {
    return {
      items: {
        type: Array 
      }
    };
  }

  static get styles() {
    return css`
      :host {
        display: inline-block;
        font-family: sans-serif;
        --element-background-color: white;
        --item-selected-background-color: #213f7f;
        --item-selected-border-radius: 5rem;
        --item-selected-label-color: white;
        --item-label-font-size: 0.65rem;
        --item-width: 6rem;
        --item-height: 1.7rem;
      }
      * {
        box-sizing: border-box;
      }
      .navigation-bar {
        border-radius: 0.75rem;
        background-color: var(--element-background-color);
        padding: 0.25rem 0.5rem;
      }
      .navigation-bar__wp-items {
        position: relative;
        display: inline-flex;
        flex-wrap: wrap;
      }

      .navigation-bar__item,
      .navigation-bar__item.active,
      .figure-background {
        display: inline-flex;
        position: relative;
        width: var(--item-width);
        height: var(--item-height);
        justify-content: space-between;
        align-items: center;
        z-index: 2;
        padding: 0.25rem 2rem 0.25rem 0.25rem;
        cursor: pointer;
      }
      .navigation-bar__item:not(.active) {
        padding: 0.25rem 0.25rem 0.25rem 0.25rem;
      }

      .figure-background {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        background-color: var(--item-selected-background-color);
        border-radius: var(--item-selected-border-radius);
        transition: 0.33s ease-in-out;
      }

      .navigation-bar__item {
        justify-content: space-around;
        color: var(--item-label-color, black);
      }
      .navigation-bar__item.active {
        justify-content: flex-start;
        border-radius: var(--item-selected-border-radius);
        color: var(--item-selected-label-color);
        cursor: pointer;
        padding-right: 0;
      }

      .navigation-bar__item-img--active,
      .navigation-bar__item-img {
        pointer-events: none;
        display: none;
        transform: scale(0.8);
        width: var(--item-img-width, 25px);
        height: var(--item-img-height, 25px);
      }

      .navigation-bar__item.active .navigation-bar__item-img--active,
      .navigation-bar__item:not(.active) .navigation-bar__item-img {
        display: inline-block;
      }

      .navigation-bar__item-label {
        pointer-events: none;
        display: none;
      }

      .navigation-bar__item.active .navigation-bar__item-label {
        display: inline-block;
        font-size: var(--item-label-font-size);
        font-weight: 700;
        margin-left: 0.125rem;
      }
    `;
  }

  constructor() {
    super();
    this.items = [];
  }

  render() {
    return html`
      <div class="navigation-bar">
        <div class="navigation-bar__wp-items">
          ${this.items.length === 0
            ? 'The menu has no items'
            : html`
                ${this.items.map(
                  (item, index) => html`
                    <div
                      id="navigation-bar__item${index}"
                      class="navigation-bar__item ${item.selected
                        ? 'active'
                        : ''}"
                      @click="${e => this._selectItem(e, item, index)}"
                    >
                      <img
                        class="navigation-bar__item-img--active"
                        src="${item.urlImgActive}"
                      />
                      <img
                        class="navigation-bar__item-img"
                        src="${item.urlImg}"
                      />
                      <span class="navigation-bar__item-label">
                        ${item.label}</span
                      >
                    </div>
                  `
                )}
                <div id="figureBackground" class="figure-background"></div>
              `}
        </div>
      </div>
    `;
  }

  firstUpdated(changes) {
    if (!changes.get('items')) {
      this._setfirstPositionFigureBackground();
    }
  }

  _selectItem(e, selectedItem, index) {
    this._moveFigureBackground(e.target);
    if (!selectedItem.selected) {
      this._unselectItem();
      selectedItem.selected = true;
      this.items = [...this.items];
    }
    this.dispatchEvent(
      new CustomEvent('on-select-item', {
        detail: { ...selectedItem, index },
      })
    );
  }

  _setfirstPositionFigureBackground() {
    let indexSelectedItem = this.items.findIndex(item => item.selected);
    if (indexSelectedItem >= 0) {
      let navigationBarItem = this.shadowRoot.querySelector(
        `#navigation-bar__item${indexSelectedItem}`
      );
      let figureBackground = this.shadowRoot.querySelector('#figureBackground');
      figureBackground.style.top = navigationBarItem.offsetTop + 'px';
      figureBackground.style.left = navigationBarItem.offsetLeft + 'px';
    }
  }
  _moveFigureBackground({ offsetTop, offsetLeft }) {
    let figureBackground = this.shadowRoot.querySelector('#figureBackground');
    figureBackground.style.top = offsetTop + 'px';
    figureBackground.style.left = offsetLeft + 'px';
  }

  _unselectItem() {
    let itemFound = this.items.find(item => item.selected);
    if (itemFound) {
      itemFound.selected = false;
    }
  }
}
