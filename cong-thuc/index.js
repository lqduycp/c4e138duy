import { recipeCollectionSpread } from '../database/database-recipes.js';
import { render1RecipeBox, renderRecipeTagsAll, tickRecipeAdded } from '../function/render-recipebox.js';
import { addRecipeToMyCollection, afterAddRecipe } from '../function/cart-and-collection.js';
import { filterRecipeByTag, search } from '../function/search-filter-forCongThucPage.js';
import { loadMyCollectionFromLocalStorage } from '../function/localstorage.js';

document.addEventListener('DOMContentLoaded', () => {
  const toSearch = localStorage.getItem('toSearch');
  if (toSearch) {
    const key = JSON.parse(toSearch);
    const searchInput = document.getElementById('search-input');
    searchInput.value = key;
    search(key);
    localStorage.removeItem('toSearch');
  }
});

const top5TrendingRecipesId = ['110135-0002', '110133-0003', '110133-0002', '110134-0002', '110134-0003'];

const top5TrendingRecipes = top5TrendingRecipesId.map(value => {
  return recipeCollectionSpread().find(item => item.id === value);
});

// Render 5 món nổi bật lên slideshow
function renderTop5TrendingRecipes() {
  const parent = document.getElementById('trending');
  const childs = top5TrendingRecipes.map(item => (item = render1RecipeBox(item)));
  console.log(childs, parent);
  parent.innerHTML = childs.reduce((content, item) => content + item, '');
}

renderTop5TrendingRecipes();

// Auto slideshow
const slides = document.querySelectorAll('#trending .recipe-box');
let nowIndex = 0;
function showSlidesInRecipePage() {
  slides.forEach(slide => slide.classList.remove('active'));
  slides[nowIndex].classList.add('active');

  nowIndex++;
  nowIndex = (nowIndex + slides.length) % slides.length;
}

showSlidesInRecipePage();
setInterval(showSlidesInRecipePage, 9000);

// Nút Xem tất cả công thức
function seeAllListButton() {
  document.getElementById('see-all-list').addEventListener('click', () => {
    renderRecipeAll(recipeCollectionSpread());
  });
}

// Render tất cả công thức lên trang
export function renderRecipeAll(recipeList) {
  const parent = document.getElementById('all-list');
  const myCollection = loadMyCollectionFromLocalStorage();

  parent.innerHTML = recipeList.reduce((string, item) => string + render1RecipeBox(item), '');

  myCollection.forEach(recipe => {
    if (myCollection.find(item => item.id === recipe.id)) {
      afterAddRecipe(recipe);
    }
  });

  renderRecipeTagsAll();
  tickRecipeAdded();
  filterRecipeByTag();
  addRecipeToMyCollection();
}

renderRecipeAll(recipeCollectionSpread());
seeAllListButton();
