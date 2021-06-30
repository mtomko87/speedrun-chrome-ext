/*
 * create global variables
 */
var api = new Api();

/*
 * set up necessary events
 */
// add category button
var addCategoryButton = document.getElementById("add-category-button");
addCategoryButton.addEventListener("click", () => {
    setPage("search");
    var searchBox = document.getElementById("search-box");
    searchBox.focus();
});

// search bar
var searchBox = document.getElementById("search-box");
searchBox.addEventListener("input", updateSearchResults);

// text delete button
var deleteTextButton = document.getElementById("delete-text-button");
deleteTextButton.addEventListener("click", () => {
    searchBox.value = "";
    searchBox.focus();
    updateSearchResults();
});

// back buttons
var searchBackButton = document.getElementById("search-back-button");
searchBackButton.addEventListener("click", () => {setPage("main");});

var categoriesBackButton = document.getElementById("categories-back-button");
categoriesBackButton.addEventListener("click", () => {setPage("search");});

var levelsBackButton = document.getElementById("levels-back-button");
levelsBackButton.addEventListener("click", () => {setPage("categories");});

var levelCategoriesBackButton = document.getElementById("level-categories-back-button");
levelCategoriesBackButton.addEventListener("click", () => {setPage("levels");});

// home buttons
var homeButtons = document.getElementsByClassName("home-button");
for (const homeButton of homeButtons) {
    homeButton.addEventListener("click", () => {setPage("main");});
}

// hide 'remove category' button
var mainPage = document.getElementById("main");
mainPage.addEventListener("click", hideCategoryButton);
// mainPage.addEventListener("contextmenu", hideCategoryButton);

var mainResults = document.getElementById("main-results");
mainResults.addEventListener("scroll", hideCategoryButton);

// chrome.storage.local.clear();

/*
 * call main function that populates our main page
 */
loadAllData();