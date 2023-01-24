import { API_KEY, API_URL } from './config';
import { AJAX } from './helpers';

import { RESULTS_PER_PAGE } from './config';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RESULTS_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
  shoppingList: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return (state.recipe = {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  });
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    await addShoppingList();

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

    state.search.results = data.data.recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
        ...(recipe.key && { key: recipe.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ingredient => {
    ingredient.quantity =
      (ingredient.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(element => element.id === id);

  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks;
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

export const uploadRecipe = async function (newRecipeData) {
  try {
    const ingredients = Object.entries(newRecipeData)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ingredient => {
        const ingredientsArray = ingredient[1]
          .split(',')
          .map(element => element.trim());

        if (ingredientsArray.length !== 3)
          throw new Error('Wrong ingredient format. Please try again!');

        const [quantity, unit, description] = ingredientsArray;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipeData.title,
      source_url: newRecipeData.sourceUrl,
      image_url: newRecipeData.image,
      publisher: newRecipeData.publisher,
      cooking_time: +newRecipeData.cookingTime,
      servings: +newRecipeData.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);

    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

export const addShoppingList = function () {
  if (!state.recipe.ingredients) {
    console.error('Recipe ingredients are not defined');
    return;
  }

  const ingredientsArray = [
    ...state.shoppingList,
    ...state.recipe.ingredients.map(ingredient =>
      ingredient.description
        .toLowerCase()
        .replace(
          /minced|squeezed|needed|need|pieces|warmed|frying|sliced|very|thin|against|the|grain|low|sodium|packed|cnstarch|medium|yellow|to taste| to |1|2|3|4|5|6|7|8|9|0|divided|fresh|quarts|quarter|temperature|room|whole| or |chopped|low-sodium|finely diced|sck|tsp|tsps|tbsp||to |heads| or |dried| cut |cut into| and |fine|finely|tins |tin |yel|tinned|whole|medium|small|low |sodium|as needed|package|packaged|grated|crushed|diced|chopped|to taste|ground|\d+|\b[a-z]\b|[^a-zA-Z0-9\s-]/gi,
          ''
        )
        .trim()
    ),
  ];

  state.shoppingList = ingredientsArray.filter(
    (ingredient, index, array) => array.indexOf(ingredient) === index
  );

  // console.log(state.shoppingList);
};
