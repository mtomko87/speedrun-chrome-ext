/*
 * changes the main div of the document body
 */
function setPage(id) {

    // hide all pages
    var pages = document.getElementsByClassName("page");
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }

    // show the correct page
    var activePage = document.getElementById(id);
    activePage.style.display = "block";
}

/*
 * hides the 'remove category' button and resets selected categpry
 */
function hideCategoryButton() {

    var removeCategoryButton = document.getElementById("remove-category-button");
    removeCategoryButton.style.display = "none";

    var selectedCategories = document.getElementsByClassName("category-info selected");
    for (var category of selectedCategories) {
        category.classList.remove("selected");
    }
}

/*
 * searches for games that match the strig in the search box
 * and adds the results to the results div
 */
function updateSearchResults() {

    // get value from the search box
    var searchBox = document.getElementById("search-box");
    var text = searchBox.value;

    // clear previous search results
    var searchResults = document.getElementById("search-results");
    while (searchResults.firstChild) {
        searchResults.removeChild(searchResults.firstChild);
    }

    if (!text) return;

    // get search results and append to results div
    api.get("games", {name: text}).then(games => {
        if (searchBox.value != text) return; // if the search text has changed since we made this call, don't bother filling in the results
        for (const game of games) {
            var result = createSearchResult(game.names.international, game.id);
            searchResults.appendChild(result);
        }
    });
}

/*
 * shows the possible categories for a selected game 
 */
function loadCategories(name, gameId) {

    // set the correct page to show
    setPage("categories");

    // set the header of the page
    var categoriesHeader = document.getElementById("categories-header");
    categoriesHeader.innerHTML = name;

    // remove previous results
    var categoriesResults = document.getElementById("categories-results");
    while (categoriesResults.firstChild) {
        categoriesResults.removeChild(categoriesResults.firstChild);
    }

    // configure the 'view levels button' to point to the levels for this game
    api.get(`games/${gameId}/levels`).then(levels => {
        var viewLevelsButton = document.getElementById("view-levels-button");
        if (levels.length > 0) {
            viewLevelsButton.style.display = "block";
            viewLevelsButton.onclick = function(){ loadLevels(name, levels, gameId) };
        } else {
            viewLevelsButton.style.display = "none";
        }
    });

    // get the full level categories for this game and display them
    api.get(`games/${gameId}/categories`).then(categories => {
        for (const category of categories) {
            if (category.type != "per-game") continue;
            api.get(`categories/${category.id}/variables`).then(variables => {
                const applicableVars = variables.filter(variable => variable["is-subcategory"]);
                var result = createCategoryResult(category.name, applicableVars, gameId, null, category.id);
                categoriesResults.appendChild(result);
            });
        }
    });
}

/*
 * shows the avaliable levels for a game
 */
function loadLevels(name, levels, gameId) {

    // set the correct page to show
    setPage("levels");

    // set the header of the page
    var levelsHeader = document.getElementById("levels-header");
    levelsHeader.innerHTML = name;

    // remove previous results
    var levelsResults = document.getElementById("levels-results");
    while (levelsResults.firstChild) {
        levelsResults.removeChild(levelsResults.firstChild);
    }

    // display the levels
    for (const level of levels) {
        var result = createLevelResult(level.name, level.id, gameId);
        levelsResults.appendChild(result);
    }
}

/*
 * shows the possible categories for a selected level
 */
function loadLevelCategories(name, levelId, gameId) {

    // set the correct page to show
    setPage("level-categories");

    // set the header of the page
    var levelCategoriesHeader = document.getElementById("level-categories-header");
    levelCategoriesHeader.innerHTML = name;

    // remove previous results
    var levelCategoriesResults = document.getElementById("level-categories-results");
    while (levelCategoriesResults.firstChild) {
        levelCategoriesResults.removeChild(levelCategoriesResults.firstChild);
    }

    // get the categories for this level and display them
    api.get(`levels/${levelId}/categories`).then(categories => {
        for (const category of categories) {
            api.get(`categories/${category.id}/variables`).then(variables => {
                const applicableVars = variables.filter(variable => {
                    if (!variable["is-subcategory"]) return false;
                    if (variable.scope.type == "global" || variable.scope.type == "all-levels") return true;
                    if (variable.scope.type == "single-level" && variable.scope.level == levelId) return true;
                    return false;
                });
                var result = createCategoryResult(category.name, applicableVars, gameId, levelId, category.id);
                levelCategoriesResults.appendChild(result);
            });
        }
    });
}

/*
 * adds a category to the object in chrome's storage and adds that category to the main page
 */
function addCategory(gameId, levelId, categoryId, variables) {

    chrome.storage.local.get({categories: {}, gameOrder: []}, (data) => {

        var categories = data.categories;
        var gameOrder = data.gameOrder;

        // if this is a new game add add new fields
        if (!gameOrder.includes(gameId)) {
            categories[gameId] = [];
            gameOrder.push(gameId);
        }

        // create a unique id
        var id = (levelId ? levelId : "") + categoryId;
        for (const valueId of Object.values(variables).sort()) id += valueId;

        // check if this category is already added
        if (categories[gameId].find(element => element.id == id)) {
            showNotification("Category has already been added", "error");
            return;
        }

        // create and add the category object
        var newCategory = {
            id: id,
            levelId: levelId,
            categoryId: categoryId,
            variables: variables
        };
        categories[gameId].push(newCategory);

        // update storage
        chrome.storage.local.set({categories: categories, gameOrder: gameOrder});
        showNotification("Category added successfully", "success");

        // add the category to the main page
        var parent = document.getElementById(gameId);
        if (!parent) {
            var mainResults = document.getElementById("main-results");
            api.get(`games/${gameId}`).then(game => {
                var gameInfo = createGameInfo(game.names.international, gameId);
                mainResults.appendChild(gameInfo);
                makeCategoryInfo(gameInfo, gameId, newCategory);
            });
        } else {
            makeCategoryInfo(parent, gameId, newCategory);
        }
    });
}

/*
 * removes a category from chrome's storage and removes it from the main page
 */
function removeCategory(gameId, id) {

    // remove category from storage
    chrome.storage.local.get({categories: {}, gameOrder: []}, (data) => {
        var categories = data.categories;
        var gameOrder = data.gameOrder;
        var game = categories[gameId];
        var foundCategory = game.find(element => element.id == id);
        game.splice(game.indexOf(foundCategory), 1);
        if (game.length == 0) {
            delete categories[gameId];
            gameOrder.splice(gameOrder.indexOf(gameId), 1);
        }
        chrome.storage.local.set({categories: categories, gameOrder: gameOrder});
    });

    // remove category from main page
    document.getElementById(id).remove();
    var parent = document.getElementById(gameId);
    var isEmpty = true;
    for (const child of parent.children) {
        if (child.className == "category-info") isEmpty = false;
    }
    if (isEmpty) parent.remove();
}

/*
 * loads the data from storage and displays it on the main page
 */
function loadAllData() {

    // get the main div
    var mainResults = document.getElementById("main-results");

    chrome.storage.local.get({categories: {}, gameOrder: null}, (data) => {

        var categories = data.categories;
        var gameOrder = data.gameOrder;

        // set default order if order hasn't been set before
        if (gameOrder == null) {
            gameOrder = Object.keys(categories);
            chrome.storage.local.set({gameOrder: gameOrder});
        }

        // create an element for each game
        for (const gameId of gameOrder) {
            // create placeholder element to mantain order
            var placeholder = document.createElement("div");
            placeholder.id = "temp-" + gameId;
            mainResults.appendChild(placeholder);
            api.get(`games/${gameId}`).then(game => {
                var gameInfo = createGameInfo(game.names.international, gameId);
                mainResults.replaceChild(gameInfo, document.getElementById("temp-" + gameId));
                for (const category of categories[gameId]) {
                    makeCategoryInfo(gameInfo, gameId, category);
                }
            });
        }
    });
}

/*
 * get all the relevant information and send it to the element creation function
 */
function makeCategoryInfo(parent, gameId, category) {

    // create a placeholder while we load the data
    var placeholder = createCategoryInfoLoading();
    parent.appendChild(placeholder);

    // make api call
    var data = {
        top: 3,
        embed: "level,category,variables,players"
    };

    for (const [variableId, valueId] of Object.entries(category.variables)) {
        data["var-" + variableId] = valueId;
    }

    var call;
    if (category.levelId) call = `leaderboards/${gameId}/level/${category.levelId}/${category.categoryId}`;
    else call = `leaderboards/${gameId}/category/${category.categoryId}`;

    api.get(call, data).then(leaderboard => {

        const levelName = leaderboard.level.data.name ? leaderboard.level.data.name : null;

        const categoryName = leaderboard.category.data.name;

        // get string values for all variables
        var variableStrings = [];
        for (const [variableId, valueId] of Object.entries(category.variables)) {
            const foundVariable = leaderboard.variables.data.find(element => element.id == variableId);
            const value = foundVariable.values.values[valueId];
            variableStrings.push(value.label);
        }

        // format the time correctly
        var timeString = "";
        if (leaderboard.runs.length > 0) {

            var time = leaderboard.runs[0].run.times.primary_t;

            var hours = Math.floor(time / 3600);
            if (hours > 0) timeString += hours + "h";

            var minutes = Math.floor((time % 3600) / 60);
            if (minutes < 10 && time >= 3600) minutes = "0" + minutes;
            if (minutes > 0 || time >= 3600) timeString += " " + minutes + "m";

            var seconds = Math.floor(time % 60);
            if (seconds < 10 && time >= 60) seconds = "0" + seconds;
            if (seconds > 0 || time >= 60) timeString += " " + seconds + "s";

            if (time % 1 !== 0) {
                var milis = time % 1;
                milis *= 1000;
                milis = Math.floor(milis);
                if (milis < 10) milis = "00" + milis;
                else if (milis < 100) milis = "0" + milis;
                timeString += " " + milis + "ms";
            }
        } else {
            timeString = "no runs";
        }

        // get the players for this run
        var players = [];
        if (leaderboard.runs.length > 0) {
            for (const player of leaderboard.runs[0].run.players) {
                if (player.rel == "guest") players.push({name: player.name, style: "guest"});
                else if (player.rel == "user") {
                    const foundPlayer = leaderboard.players.data.find(element => element.id == player.id);
                    players.push({name: foundPlayer.names.international, style: foundPlayer["name-style"]});
                }
            }
        }

        const link = leaderboard.weblink;

        // determine if this category has any new times, and if so update in storage
        var badge = null;
        var runs = [];
        for (const run of leaderboard.runs) {
            runs.push(run.run.id);
        }
        if (!arraysEqual(runs, category.runs)) {
            if (!category.runs) badge = "Added";
            else if (runs[0] != category.runs[0]) badge = "New WR";
            else badge = "New Top 3";
            updateLeaderboard(gameId, category, runs);
        }

        // create the element and add it
        var categoryInfo = createCategoryInfo(levelName, categoryName, variableStrings, timeString, players, link, badge, gameId, category.id);
        parent.replaceChild(categoryInfo, placeholder);
    });
}

/*
 * helper function to update a category's leaderboard
 */
function updateLeaderboard(gameId, category, runs) {

    chrome.storage.local.get({categories: {}}, (data) => {
        var categories = data.categories;
        var game = categories[gameId];
        var foundCategory = game.find(element => element.id == category.id);
        foundCategory.runs = runs;
        chrome.storage.local.set({categories: categories});
    });
}

/*
 * helper function to determine if arrays are equal
 */
function arraysEqual(a, b) {

    if (a === b) return true;
    if (a == null || b == null || a == undefined || b == undefined) return false;
    if (a.length != b.length) return false;    

    for (var i = 0; i < a.length; i++) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

/*
 * helper function to create a notification and show it
 */
function showNotification(string, type) {

    var notif = createNotification(string, type);
    var notifBox = document.getElementById("notification-box");
    notifBox.appendChild(notif);
    notif.offsetWidth; // trigger reflow so transition plays
    notif.classList.add("shown");
    setTimeout(function() { notif.classList.remove("shown"); }, 2000);
    setTimeout(function() { notif.remove(); }, 2500);
}

/*
 * change the order in which categories will appear on the home page
 */
function reorderCategories(gameId, movingId, replacedId) {

    chrome.storage.local.get({categories: {}}, (data) => {
        var categories = data.categories;
        var game = categories[gameId];
        var movingIndex = 0;
        var replacedIndex = 0;
        for (var i = 0; i < game.length; i++) {
            if (game[i].id == movingId) movingIndex = i;
            if (game[i].id == replacedId) replacedIndex = i;
        }
        game.splice(replacedIndex, 0, game.splice(movingIndex, 1)[0]);
        chrome.storage.local.set({categories: categories});
    });
}

function reorderGames(gameId, direction) {

    chrome.storage.local.get({gameOrder: []}, (data) => {
        var gameOrder = data.gameOrder;
        var index = gameOrder.indexOf(gameId);
        var newIndex = (direction == "up") ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= gameOrder.length) return;
        gameOrder.splice(newIndex, 0, gameOrder.splice(index, 1)[0]);
        chrome.storage.local.set({gameOrder: gameOrder});
    });
}