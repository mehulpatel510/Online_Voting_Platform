import { html, fixture, oneEvent, expect } from '@open-wc/testing';
import img from '/assets/images/image.png';
import imgActive from '/assets/images/image-active.png';
import '../navigation-bar.js';

describe('NavigationBar', () => {
  it('set items', async () => {
    let items = [
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: true,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
    ];
    const el = await fixture(
      html`<navigation-bar .items="${items}"></navigation-bar>`
    );
    expect(el.items).to.equal(items);
  });

  it('unselect item, change state true to false', async () => {
    let items = [
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: true,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
    ];
    const el = await fixture(
      html`<navigation-bar .items="${items}"></navigation-bar>`
    );
    el.unselectItem();
    expect(el.items[0].selected).to.equal(false);
  });

  it('select item, change state false to true', async () => {
    let items = [
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: true,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
    ];
    const el = await fixture(
      html`<navigation-bar .items="${items}"></navigation-bar>`
    );
    el.selectItem(null, el.items[1], 1);
    expect(el.items[1].selected).to.equal(true);
  });

  it('select item, dont change state when item is already selected', async () => {
    let items = [
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: true,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
    ];
    const el = await fixture(
      html`<navigation-bar .items="${items}"></navigation-bar>`
    );
    el.selectItem(null, el.items[0], 0);
    expect(el.items[0].selected).to.equal(true);
  });

  it('emmit event', async () => {
    let items = [
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: true,
      },
      {
        urlImg: img,
        urlImgActive: imgActive,
        label: 'Desc',
        selected: false,
      },
    ];
    const el = await fixture(
      html`<navigation-bar .items="${items}"></navigation-bar>`
    );
    el.selectItem(null, el.items[1], 1);
    oneEvent(el, 'on-item-select').then(ev => {
      expect(ev).to.exist;
    });
  });
});
