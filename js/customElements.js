/*
 * div on the main page that holds categories of the same game
 */
function createGameInfo(name, gameId) {

    // create the element
    let element = document.createElement("div");
    element.className = "game-info";
    element.id = gameId;

    // add game title
    let h3 = document.createElement("h3");
    h3.innerHTML = name;
    element.appendChild(h3);

    // create buttons to move up and down
    let upButton = document.createElement("button");
    upButton.className = "up-button";
    element.appendChild(upButton);
    let downButton = document.createElement("button");
    downButton.className = "down-button";
    element.appendChild(downButton);

    upButton.addEventListener("click", () => {
        reorderGames(gameId, "up");
        let prevSibling = element.previousSibling;
        if (prevSibling) element.parentElement.insertBefore(element, prevSibling);
    });

    downButton.addEventListener("click", () => {
        reorderGames(gameId, "down");
        let nextSibling = element.nextSibling;
        if (nextSibling) element.parentElement.insertBefore(element, nextSibling.nextSibling);
    });

    return element;
}

/*
 * div on the main page that shows information about a category and its WR
 */
function createCategoryInfo(levelName, categoryName, variables, time, players, link, badge, gameId, id) {

    // create the element
    let element = document.createElement("div");
    element.id = id;
    element.className = "category-info";
    element.addEventListener("click", () => {chrome.tabs.create({url: link, active: false});}); // go to sppedrun.com page on click
    element.addEventListener("contextmenu", (e) => { // open custom context menu on right click

        e.preventDefault();
        hideCategoryButton();

        element.classList.add("selected");

        let removeCategoryButton = document.getElementById("remove-category-button");
        removeCategoryButton.style.top = e.y + "px";
        removeCategoryButton.style.left = e.x + "px";
        removeCategoryButton.style.display = "block";
        removeCategoryButton.onclick = function() {
            removeCategory(gameId, id);
        };
    });

    // handle element dragging
    element.draggable = true;

    element.addEventListener("dragstart", (e) => {
        categoryDrag.startDrag(id, gameId);
    });

    element.addEventListener("dragover", (e) => {
        if (categoryDrag.dragParentId == gameId) {
            e.dataTransfer.dropEffect = "move";
            e.preventDefault();
        }
    });

    element.addEventListener("drop", (e) => {
        let dragElement = document.getElementById(categoryDrag.dragId);
        let insertBefore = false;
        let prevSibling = dragElement.previousSibling;
        while (prevSibling != null) {
            if (prevSibling == element) {
                insertBefore = true;
                break;
            }
            prevSibling = prevSibling.previousSibling;
        }
        if (insertBefore) dragElement.parentNode.insertBefore(dragElement, element);
        else dragElement.parentNode.insertBefore(dragElement, element.nextSibling);
        reorderCategories(gameId, categoryDrag.dragId, id);
    });

    // add text describing the category
    let categoryText = levelName ? levelName + " \u2014 " + categoryName : categoryName;
    for (const variable of variables) {
        categoryText += " (" + variable + ")";
    }

    let leftInfo = document.createElement("p");
    leftInfo.className = "info left-info";
    leftInfo.innerHTML = categoryText;
    element.appendChild(leftInfo);

    // add a div for the info on the right side
    let rightDiv = document.createElement("div");
    element.appendChild(rightDiv);

    // add text for WR time and players
    let rightInfo = document.createElement("p");
    rightInfo.className = "info";
    let runText = time;
    if (players.length > 0) runText += " by ";
    rightInfo.innerHTML = runText;

    // add player names and style them according to speedrun.com data
    for (let i = 0; i < players.length; i++) {
        let span = document.createElement("span");
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

    // set the width of the right div based on the width of the category info text
    let temp = document.createElement("p");
    temp.className = "info left-info";
    temp.innerHTML = categoryText;
    document.body.appendChild(temp);
    let infoWidth = temp.offsetWidth;
    temp.remove();

    rightDiv.style.maxWidth = 720 - infoWidth + "px";

    // add the div
    rightDiv.appendChild(rightInfo);

    // add a badge if this category has any special attributes (new, wr, top 3)
    if (badge) {

        let circle = document.createElement("div");
        circle.className = "badge";
        if (badge == "Added") circle.className += " badge-added";
        if (badge == "New WR") circle.className += " badge-wr";
        if (badge == "New Top 3") circle.className += " badge-top3";
        rightDiv.appendChild(circle); 

        let badgeText = document.createElement("p");
        badgeText.className = "badge-text";
        badgeText.innerHTML = badge;
        rightDiv.appendChild(badgeText);
    }

    return element;
}

/*
 * a placeholder for a category info div for while the data is being loaded
 */
function createCategoryInfoLoading() {

    let element = document.createElement("div");
    element.className = "category-info-loading";

    // create the "loading..." text
    let p = document.createElement("p");
    p.innerHTML = "Loading...";
    element.appendChild(p);

    return element;
}

/*
 * div that shows results when searching for a game
 */
function createSearchResult(name, gameId) {

    // create the element
    let element = document.createElement("div");
    element.className = "search-result";
    element.addEventListener("click", () => {loadCategories(name, gameId);});

    // add text with game title
    let p = document.createElement("p");
    p.innerHTML = name;
    element.appendChild(p);

    return element;
}

/*
 * div that shows information for a catgory and allows it to be added to
 * the main page
 */
function createCategoryResult(name, variables, gameId, levelId, categoryId) {

    // create the element
    let element = document.createElement("div");
    element.className = "category-result";

    // add text with category name
    let p = document.createElement("p");
    p.innerHTML = name;
    element.appendChild(p);

    // create a button to add this category
    let button = document.createElement("button");
    button.innerHTML = "Add";
    element.appendChild(button);

    // create a select for each variable that this category has
    let selectsDiv = document.createElement("div");
    for (const variable of variables) {
        let select = document.createElement("select");
        select.id = categoryId + variable.id;
        for (const [id, value] of Object.entries(variable.values.values)) {
            let option = document.createElement("option");
            option.value = id;
            option.text = value.label;
            select.appendChild(option);
        }
        selectsDiv.appendChild(select);
    }
    if (selectsDiv.firstChild) element.appendChild(selectsDiv);

    // when add button is clicked, gather the value of all selects and add this category
    button.addEventListener("click", () => {
        let variableChoices = {};
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
    
    // create the element
    let element = document.createElement("div");
    element.className = "search-result";
    element.addEventListener("click", () => {loadLevelCategories(name, levelId, gameId);});

    // add text with level name
    let p = document.createElement("p");
    p.innerHTML = name;
    element.appendChild(p);

    return element;
}

/*
 * popup that shows information and then disappears after a short time
 */
function createNotification(string, type) {

    // create the element
    let element = document.createElement("div");
    element.className = "notification" + (type == "success" ? "" : " error"); // add a class for this specific type of notification

    // add text with notification content
    let p = document.createElement("p");
    p.innerHTML = string + (type == "success" ? " \u2713" : " \u2718");
    element.appendChild(p);

    return element;
}