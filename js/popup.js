/*
 * create global variables
 */
let api = new Api();
let categoryDrag = new CategoryDrag();

/*
 * set up necessary events
 */
// add category button
let addCategoryButton = document.getElementById("add-category-button");
addCategoryButton.addEventListener("click", () => {
    setPage("search");
    let searchBox = document.getElementById("search-box");
    searchBox.focus();
});

// search bar
let searchBox = document.getElementById("search-box");
searchBox.addEventListener("input", updateSearchResults);

// text delete button
let deleteTextButton = document.getElementById("delete-text-button");
deleteTextButton.addEventListener("click", () => {
    searchBox.value = "";
    searchBox.focus();
    updateSearchResults();
});

// back buttons
let searchBackButton = document.getElementById("search-back-button");
searchBackButton.addEventListener("click", () => {setPage("main");});

let categoriesBackButton = document.getElementById("categories-back-button");
categoriesBackButton.addEventListener("click", () => {setPage("search");});

let levelsBackButton = document.getElementById("levels-back-button");
levelsBackButton.addEventListener("click", () => {setPage("categories");});

let levelCategoriesBackButton = document.getElementById("level-categories-back-button");
levelCategoriesBackButton.addEventListener("click", () => {setPage("levels");});

// home buttons
let homeButtons = document.getElementsByClassName("home-button");
for (const homeButton of homeButtons) {
    homeButton.addEventListener("click", () => {setPage("main");});
}

// hide 'remove category' button
let mainPage = document.getElementById("main");
mainPage.addEventListener("click", hideCategoryButton);
mainPage.addEventListener("dragstart", hideCategoryButton)

let mainResults = document.getElementById("main-results");
mainResults.addEventListener("scroll", hideCategoryButton);

// help button
let helpButton = document.getElementById("help-button");
helpButton.addEventListener("click", () => {
    let help = document.getElementById("help");
    help.style.display = "block";
});

// close help buttonm
let closeHelpButton = document.getElementById("close-help-button");
closeHelpButton.addEventListener("click", () => {
    let help = document.getElementById("help");
    help.style.display = "none";
});

// chrome.storage.local.clear();

/*
 * call main function that populates our main page
 */
loadAllData();