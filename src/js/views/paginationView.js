import View from './View';
import icons from '../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerButtonClick(handler) {
    this._parentElement.addEventListener('click', function (event) {
      const button = event.target.closest('.btn--inline');

      if (!button) return;

      const goToPage = +button.dataset.goto;

      handler(goToPage);
    });
  }

  _generateMarkupButton(currentPage, numPages, type) {
    if (type === 'prev' && currentPage > 1) {
      return `
      <button data-goto=${
        currentPage - 1
      } class="btn--inline pagination__btn--prev">
        <svg class="search__icon"> 
          <use href="${icons}#icon-arrow-left">
          </use> 
        </svg> 
        <span>Page ${currentPage - 1}</span> 
      </button>`;
    }
    if (type === 'next' && currentPage < numPages) {
      return `
      <button data-goto=${
        currentPage + 1
      } class="btn--inline pagination__btn--next"> 
        <span>Page ${currentPage + 1}</span> 
        <svg class="search__icon"> 
          <use href="${icons}#icon-arrow-right">
          </use> 
        </svg> 
      </button>`;
    }
    return '';
  }

  _generateMarkup() {
    const currentPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    let prevButton = this._generateMarkupButton(currentPage, numPages, 'prev');
    let nextButton = this._generateMarkupButton(currentPage, numPages, 'next');

    return prevButton + nextButton;
  }
}

export default new PaginationView();
