"use strict";
const mealsEl = document.getElementById("meals");
const favoritContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const popupCloseBtn = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meals");

  meal.innerHTML = `
    <div class="meal-header">
      ${random ? `<span class="random"> Random Recipe </span>` : ""}
      
      <img
        src= "${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
    </div>
    <div class="meal-body">
      <h4>${mealData.strMeal}</h4>
      <div class="fav-btn">
        <i class="vote-heart bi bi-heart-fill"></i>
      </div>
    </div>
  `;

  const btn = meal.querySelector(".meal-body .vote-heart");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }

    // clean the container
    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clean the container
  favoritContainer.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    let meal = await getMealById(mealId);

    addMealFav(meal);
  }
}

function addMealFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
    <img
      src="${mealData.strMealThumb}"
      alt="${mealData.strMeal}"
    /><span>${mealData.strMeal}</span>
    <button class="clear"><i class="bi bi-x-circle-fill"></i></button>
  `;

  const btn = favMeal.querySelector(".clear");

  btn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);
    fetchFavMeals();
  });

  // favMeal.addEventListener('click', ()=> {
  //   showMealInfo(mealData);
  // })

  favoritContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
  // clean it up
  mealInfoEl.innerHTML = "";
  // update the meal info
  const ingredients = [];

  const mealEl = document.createElement("div");
  // get Ingredients and Measures
  for (let i = 0; i < 20; i++) {
    if (mealData["strIngredient" + (i + 1)]) {
      ingredients.push(`${mealData["strIngredient" + (i + 1)]} - 
      ${mealData["strMeasure" + (i + 1)]}`);
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <div class="meal-info__body">
      <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
      <p>
        ${mealData.strInstructions}
      </p>
    </div>
    <h3>Ingredients:</h3>
    <ul>
      ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    </ul>
  `;

  mealInfoEl.appendChild(mealEl);

  // show the popup
  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  // clean container
  mealsEl.innerHTML = "";
  const search = searchTerm.value;

  const meals = await getMealBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  } else {
    mealsEl.innerHTML = "Oops! We couldn't find the item on the menu !";
    mealsEl.style.padding = "0 1rem 1rem";
    mealsEl.style.color = "red";
    mealsEl.style.textAlign = "center";
    mealsEl.style.fontSize = "16px";
    mealsEl.style.fontWeight = "800";
  }
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
