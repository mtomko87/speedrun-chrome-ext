/*
 * div on the main page that holds categories of the same game
 */
function createGameInfo(name, gameId) {

    var element = document.createElement("div");
    element.className = "game-info";
    element.id = gameId;

    var h3 = document.createElement("h3");
    h3.innerHTML = name;
    element.appendChild(h3);

    return element;
}

/*
 * div on the main page that shows information about a category and its WR
 */
function createCategoryInfo(levelName, categoryName, variables, time, players, link, badge, gameId, id) {

    var element = document.createElement("div");
    element.id = id;
    element.className = "category-info";
    element.addEventListener("click", () => {chrome.tabs.create({url: link});});
    element.addEventListener("contextmenu", (e) => {

        e.preventDefault();
        hideCategoryButton();

        element.classList.add("selected");

        var removeCategoryButton = document.getElementById("remove-category-button");
        removeCategoryButton.style.top = e.y + "px";
        removeCategoryButton.style.left = e.x + "px";
        removeCategoryButton.style.display = "block";
        removeCategoryButton.onclick = function() {
            removeCategory(gameId, id);
        };
    });

    var categoryText = levelName ? levelName + " \u2014 " + categoryName : categoryName;
    for (const variable of variables) {
        categoryText += " (" + variable + ")";
    }

    var leftInfo = document.createElement("p");
    leftInfo.className = "info";
    leftInfo.innerHTML = categoryText;
    element.appendChild(leftInfo);

    var rightDiv = document.createElement("div");
    element.appendChild(rightDiv);

    var rightInfo = document.createElement("p");
    rightInfo.className = "info";
    var runText = time;
    if (players.length > 0) runText += " by ";
    rightInfo.innerHTML = runText;

    for (var i = 0; i < players.length; i++) {
        var span = document.createElement("span");
        span.innerHTML = players[i].name;
        if (players[i].style !== "guest") {
            span.className = "player-span";
            if (players[i].style.style == "solid") {
                span.style.color = players[i].style.color.dark;
            } else {
                span.className = span.className + " player-gradient";
                span.style["background-image"] = `linear-gradient(to right, ${players[i].style["color-from"].dark}, ${players[i].style["color-to"].dark})`;
            }
        }
        rightInfo.appendChild(span);
        if (i == players.length - 2) {
            rightInfo.innerHTML = rightInfo.innerHTML + " and ";
        } else if (i < players.length - 1) {
            rightInfo.innerHTML = rightInfo.innerHTML + ", ";
        }
    }

    rightDiv.appendChild(rightInfo);

    if (badge) {

        var circle = document.createElement("div");
        circle.className = "badge";
        if (badge == "Added") circle.className += " badge-added";
        if (badge == "New WR") circle.className += " badge-wr";
        if (badge == "New Top 3") circle.className += " badge-top3";
        rightDiv.appendChild(circle); 

        var badgeText = document.createElement("p");
        badgeText.className = "badge-text";
        badgeText.innerHTML = badge;
        rightDiv.appendChild(badgeText);
    }

    return element;
}

/*
 * div that shows results when searching for a game
 */
function createSearchResult(name, gameId) {

    var element = document.createElement("div");
    element.className = "search-result";
    element.addEventListener("click", () => {loadCategories(name, gameId);});

    var p = document.createElement("p");
    p.innerHTML = name;
    element.appendChild(p);

    return element;
}

/*
 * div that shows information for a catgory and allows it to be added to
 * the main page
 */
function createCategoryResult(name, variables, gameId, levelId, categoryId) {

    var element = document.createElement("div");
    element.className = "category-result";

    var p = document.createElement("p");
    p.innerHTML = name;
    element.appendChild(p);

    var button = document.createElement("button");
    button.innerHTML = "Add";
    element.appendChild(button);

    var selectsDiv = document.createElement("div");
    for (const variable of variables) {
        var select = document.createElement("select");
        select.id = categoryId + variable.id;
        for (const [id, value] of Object.entries(variable.values.values)) {
            var option = document.createElement("option");
            option.value = id;
            option.text = value.label;
            select.appendChild(option);
        }
        selectsDiv.appendChild(select);
    }
    if (selectsDiv.firstChild) element.appendChild(selectsDiv);

    button.addEventListener("click", () => {
        var variableChoices = {};
        for (const variable of variables) {
            const choice = document.getElementById(categoryId + variable.id).value;
            variableChoices[variable.id] = choice;
        }
        addCategory(gameId, levelId, categoryId, variableChoices);
    });

    return element;
}

/*
 * div that shows a level when viewing all levels of a game
 */
function createLevelResult(name, levelId, gameId) {
    
    var element = document.createElement("div");
    element.className = "search-result";
    element.addEventListener("click", () => {loadLevelCategories(name, levelId, gameId);});

    var p = document.createElement("p");
    p.innerHTML = name;
    element.appendChild(p);

    return element;
}

/*
 * popup that shows information and then disappears after a short time
 */
function createNotification(string, type) {

    var element = document.createElement("div");
    element.className = "notification" + (type == "success" ? "" : " error");

    var p = document.createElement("p");
    p.innerHTML = string + (type == "success" ? " \u2713" : " \u2718");
    element.appendChild(p);

    return element;
}