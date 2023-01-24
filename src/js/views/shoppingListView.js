import View from './View';
import previewView from './previewView';

// class ShoppingListView extends View {
//   _parentElement = document.querySelector('.shopping-list');
//   _errorMessage = `No ingredients yet.`;
//   _successMessage = ``;

//   addHandlerRender(handler) {
//     window.addEventListener('load', handler);
//   }

//   _generateMarkup() {
//     if (!this._data.length) {
//       return `<p class="error-message">${this._errorMessage}</p>`;
//     }

//     return `<ul class='shopping-list__list'>${this._data
//       .map(ingredient => `<li>${ingredient}</li>`)
//       .join('')}</ul>`;
//   }
// }

// export default new ShoppingListView();

class ShoppingListView extends View {
  _parentElement = document.querySelector('.shopping-list');
  _errorMessage = 'No ingredients yet.';
  _successMessage = ``;

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    if (!this._data.length) {
      return `
      <p class="error-message">${this._errorMessage}</p>
      `;
    }

    return `<ul class='shopping-list__list'>${this._data
      .map(
        ingredient =>
          `<li>${ingredient} <button class="shopping-list__delete-btn" type="button">X</button></li>`
      )
      .join('')}</ul>`;
  }

  _deleteHandler(event) {
    if (event.target.classList.contains('delete-btn')) {
      let ingredient = event.target.parentNode;
      ingredient.remove();
    }
  }
}

export default new ShoppingListView();
