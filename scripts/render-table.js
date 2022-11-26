/**
 * Max number of page buttons that should be generated on the students table
 */
const PAGE_LIMIT = 15;

/**
 * Legend button prefix text
 */
const LEGEND_PREFIX = "legend-button";

/**
 * Default active button ID. The first page should always be used as the default active
 * page whenever the button legend changes state.
 */
const ACTIVE_BUTTON = `${LEGEND_PREFIX}-1`;

/**
 * Default active button class that is always on the active button. This class will have to be
 * added and removed from buttons as the active button status is changed.
 */
const ACTIVE_CLASS = "active-button";

/**
 * AJAX timeout to reload the table. The user and teachers can both communicate with the database
 * by deleting or inserting. This ensures that the information on all clients are updated.
 */
const TABLE_LOAD_OFFSET = 250;

/**
 * Number of rows that the table in the student dashboard will display.
 * This value trumps all other display amount constraints.
 */
let pageLength = 5;

/**
 * Starting display index value. All rows that appear in the response array
 * before the pageStart index will not be displayed in the exams table
 */
let pageStart = 0;

/**
 * Length of the response array generated by querying the student's taken exams.
 * This will be the length of the total response array unless the user is searching
 * in which the response will be filtered.
 */
let responseLength = -1;

/**
 * ID of the current active page button. This needs to be separate so that its state can be
 * stored and used later. Previously a prevent_initial_call value was used to prevent unintended
 * behavior but this caused more problems.
 */
let activeButtonID = ACTIVE_BUTTON;

/**
 * The request code for loading the table. A request code of 1 is a request to load the students table.
 */
let requestCode = -1;

/**
 * Previous response. This will be used to determine whether the page needs to be reloaded or not.
 */
let previousResponse = "";

/**
 * Disable back and reload tables for every dashboard page
 */
function onLoad() {
    setInterval(loadTables, TABLE_LOAD_OFFSET);
}

/**
 * Load the tables based on a request
 */
function loadTables(forceReload = false) { 
    // Load table based on request code so it can be used for teacher table as well
    requestCode = Number(document.getElementById("table-rc").innerText);

    // User id
    const userid = sessionStorage.getItem("user_id");

    // Format request
    const credentials = `userid=${userid}&request=${requestCode}`;
    const ajax = new XMLHttpRequest();

    // Check AJAX
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            // If exams exist print table dynamically
            if (ajax.responseText == "false") {
                // Reset table state to default empty state
                responseLength = 0;
                resetTableState();
                previousResponse = "";
            }
            else {
                // Display results
                const response = JSON.parse(ajax.responseText);
                const filteredResponse = getSearchRows(response);
                
                // Only update if the previous response is different than the current response
                if (forceReload || !isSame(filteredResponse, previousResponse)) {
                    createTables(filteredResponse, pageStart);

                    // Update active button
                    setActiveButton(activeButtonID);
                }
                // Update previous response
                previousResponse = filteredResponse;
            }
        }
    }

    // Send request
    ajax.open("POST", "/post", true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(credentials);
}

/**
 * Clear the table
 */
function clearTables() {
    const table = document.getElementById("table");
    table.innerHTML = '';
}

/**
 * Populate all the rows within table
 * @param {string} response database response value with all table exam elements
 */
function createTables(response) {
    // Clear all previous rows being displayed in the table
    clearTables();

    // Get table and table legend
    const table = document.getElementById("table");
    const legend = document.getElementById("table-display-legend");

    // Format pageLength to display entire queried response
    if (pageLength == -1) 
        pageLength = response.length;

    // Calculate pageEnd from pageStart
    let pageEnd = Number(pageStart) + Number(pageLength);

    // Fix pageEnd if pageLength is not a factor of response.length
    if (pageEnd > response.length)
        pageEnd = response.length;

    // Calculate start from pageStart 
    let start = pageStart + 1;
    
    // Fix pageStart if pageLength is not a factor of response.length
    if (start > pageEnd)
        pageStart = pageEnd - pageLength;

    // If no response then reset pageStart to 0
    if (response.length == 0)
        pageStart = 0;

    // Set start to proper starting display value
    start = pageStart + 1;

    // Fix start if size is 0
    start = pageEnd == 0 ? 0 : start;

    // Set legend text
    legend.innerText = `Showing ${start} to ${pageEnd} of ${response.length} entries`;

    // Update the number of page buttons on screen
    createPageButtons(pageLength, response.length);

    // Display descriptors
    const row = table.insertRow(-1);
    row.classList.add("exam-row");

    // Horizontal header infromation
    const headers = getHeader();
    const data = ["index", "name", "title", "points", "date", "action"];

    // Create cell class descriptors
    const prefix = "cell";
    const delim = "-";
    
    // Generate cell identification 
    for (let i = 0; i < headers.length; i++) {
        const cell = row.insertCell(-1);
        cell.classList.add(prefix + delim + data[i]);
        cell.classList.add(prefix);
        cell.classList.add('row-cell');
        cell.classList.add('header-text');
        cell.id = `${data[i]}`;
        cell.innerHTML = headers[i];
    }

    // Don't display more results than gathered
    const maxDisplay = pageLength > response.length ? response.length : pageLength;
    let displayAmount = 0;

    // Display row results 
    for (let i = pageStart; i < response.length; i++) {
        if (displayAmount == maxDisplay)
            break;

        // Current exam
        const exam = response[i];
        const elements = [exam.exam_id, exam.name, exam.title, formatScore(exam.score, exam.points), formatDate(exam.date)];
        
        // Counter for how many rows are being displayed
        displayAmount++;

        // Create row and start populating it
        const row = table.insertRow(-1);
        row.classList.add("exam-row");

        // Use display amount to fix bug that displays incorrect row background color
        row.classList.add("row-" + (displayAmount % 2 == 0 ? "light" : "dark"));

        // Display only a certain number of elements
        for (let j = 0; j < data.length; j++) {
            const cell = row.insertCell(-1);
            cell.classList.add(prefix + delim + data[j]);
            cell.classList.add(prefix);
            cell.classList.add('row-cell');
            cell.id = `${data[j]}-${exam.exam_id}-${exam.user_id}`;
        }
        
        // Display row information
        for (let j = 0; j < elements.length; j++)
            row.cells[j].innerText = elements[j];

        // Create review and delete buttons
        createActionButtons(exam.exam_id, exam.user_id, !(formatScore(exam.score, exam.points) == "None"));
    }
}

/**
 * Create the action buttons take and review (if applicable) for each
 * exam within the students exam table. This will allow the students to take
 * the exam from their professor or review an already graded exam if it is ready.
 * @param {number} examID The id for the current exam
 */
function createActionButtons(examID, teacherID, isTaken) {
    // Create two buttons, rewview and delete
    const purpose = getPurpose(isTaken);
    
    // List of buttons to add to the screen
    let buttons = [];
    for (let i = 0; i < purpose.length; i++)
        buttons.push(document.createElement("button")); 

    // Get current action element
    const action = document.getElementById(`action-${examID}-${teacherID}`);

    // Create custom class and id list and add to table
    for (let i = 0; i < purpose.length; i++) {
        // Get the current purpose in a smaller variable
        const p = purpose[i];

        // Set id of button
        buttons[i].id = `${p}-${examID}-${teacherID}`;

        // Set classes of button
        buttons[i].classList.add("button");
        buttons[i].classList.add("action-button");
        buttons[i].classList.add(`button-${p}`);

        // Set inner text of button
        buttons[i].innerText = p;

        // If the current element is the review button
        if (p == "review") {
            const studentGrade = document.getElementById(`points-${examID}-${teacherID}`);

            // If the exam is ungraded don't add an action listen and add a class to change the color
            if (studentGrade.innerText == "Ungraded") {
                buttons[i].classList.add("ungraded-exam");
                action.appendChild(buttons[i]);
                continue;
            }
        }

        // Add onclick events to all action buttons
        buttons[i].onclick = function() {
            if (p == "delete")
                updateRequest(examID, teacherID, 3);
            else if (p == "take") {
                storeSessionExam(examID, teacherID);
                window.location.href = "/exam";
            }
            else if (p == "review") {
                /**
                 * Need to add separate onclick functions for review
                 * depending on if the user is a student or a teacher
                 */
                console.log("Review the exam");
            }
            else if (p == "grade") {

            }
        };
        action.appendChild(buttons[i]);
    }
}

/**
 * Store a exam's id into session
 * @param {number} exam_id - exam's id number
 */
 function storeSessionExam(exam_id, student_id) {
    const identifier = `${exam_id}-${student_id}`;
    sessionStorage.setItem('exam_request', identifier);
}

/**
 * Filters the response generated from the database with the users search
 * text. If any cell in an exam row contains any part of the search text
 * the row will be displayed to the user.
 * @param {HTMLCollection} response collection of user exams
 * @returns filtered response
 */
function getSearchRows(response) {
    // Get search bar input text
    const searchInput = document.getElementById("dash-search-input");
    const searchText = searchInput.value.toLowerCase();

    // If no text is being searched, quit.
    if (searchText == "") {
        responseLength = response.length;
        resetTableState();
        return response;
    }
    
    // Create filtered response
    let filteredResponse = [];
    for (let i = 0; i < response.length; i++) {
        const exam = response[i];
        const examElements = [exam.exam_id, exam.name, exam.title, formatScore(exam.score, exam.points), formatDate(exam.date)];
        
        // Check to see if exam contains search string
        for (let j = 0; j < examElements.length; j++) {
            let value = String(examElements[j]).toLowerCase();
    
            // If row contains search text, stop checking
            if (value.includes(searchText)) {
                filteredResponse.push(exam);
                break;
            }
        }
    }

    // Update responseLength with new filtered length
    responseLength = filteredResponse.length;
    resetTableState();
    return filteredResponse;
}

/**
 * The table page should be set to the default page on every search to avoid the active button
 * being set to a button that would no longer exist after a filtered search. Tables should be
 * reloaded after the active button is reset.
 */
function onSearch() {
    pageStart = 0;
    setActiveButton(ACTIVE_BUTTON);
    loadTables();
}

/**
 * Update the amount of rows that can be displayed in the student dashboard exams table
 */
function updateDisplayAmount() {
    const displayList = document.getElementById("results-amount");
    const displayAmount = displayList.options[displayList.selectedIndex].value;

    // Reset page start to default
    pageStart = 0;
    pageLength = displayAmount;

    if (activeButtonID != ACTIVE_BUTTON)
        setActiveButton(ACTIVE_BUTTON);

    // Reload table and page buttons
    loadTables(true);
    createPageButtons(pageLength, responseLength);
}

/**
 * Generates the pages buttons at the bottom right of the table.
 * @param {number} pageLength Number of elements to be displayed on a single page
 * @param {number} responseLength Number of elements available to be displayed
 */
function createPageButtons(pageLength, responseLength) {
    // Clear buttons container
    const buttonLegend = document.getElementById(`${LEGEND_PREFIX}s-container`);

    // Previous number of page buttons displayed on screen
    const previous = buttonLegend.childElementCount;

    // Reset buttons conatiner
    buttonLegend.innerHTML = '';

    // If no results are found exit
    // This clears the legend from the screen
    if (pageLength == -1)
        return;

    // Calcualte max buttons to show
    const numPages = responseLength / pageLength + 2;
    const displayAmount = numPages > PAGE_LIMIT ? PAGE_LIMIT : numPages;

    // If the results can be displayed in a single page don't show any buttons
    if (displayAmount <= 3)
        return;

    // Create array of strings that contain button innerText
    let buttonText = [];
    buttonText.push("Previous");
    for (let i = 0; i < displayAmount - 2; i++) {
        buttonText.push(String(i + 1));
    }
    buttonText.push("Next");

    // Create new buttons
    for (let i = 0; i < buttonText.length; i++) {
        const button = document.createElement('button');
        button.innerText = buttonText[i];
        button.classList.add(LEGEND_PREFIX);

        if (i == 0)
            button.id = `${LEGEND_PREFIX}-previous`;
        else if (i == buttonText.length - 1)
            button.id = `${LEGEND_PREFIX}-next`;
        else 
            button.id = `${LEGEND_PREFIX}-${i}`;

        // Add onclick to all buttons
        button.onclick = function() {
            updatePage(button.id);
        };
        buttonLegend.appendChild(button);
    }

    // Current number of page buttons displayed on screen
    const current = buttonLegend.childElementCount;

    // If page count is shorter than what it was previously
    if (current < previous) {
        // Check which button is active
        let active = getActiveID();

        // If active button isn't lost with lost page don't update
        if (active <= displayAmount - 2)
            return;

        // Update current page
        let newID = active - 1;

        // Calculate new active button id
        newID = newID > 0 ? newID : 1;

        // Calculate new pageStart and pageEnd variables
        pageStart = pageLength * (newID - 1);
        pageEnd = responseLength - pageStart;

        // Update active button
        const newButtonID = `${LEGEND_PREFIX}-${newID}`;

        // Only update active button if needed
        if (activeButtonID != newButtonID)
            setActiveButton(newButtonID);
    }
}

/**
 * Update the current active button
 */
function setActiveButton(id) {
    // Update global activeButtonID
    activeButtonID = id;

    // Remove current active button's active status
    const currentActiveButton = document.getElementsByClassName(ACTIVE_CLASS);
    if (currentActiveButton.length > 0)
        currentActiveButton[0].classList.remove(ACTIVE_CLASS)

    // Get new active button
    let button = document.getElementById(activeButtonID);

    // Only update button if it exists
    if (button != null)
        document.getElementById(activeButtonID).classList.add(ACTIVE_CLASS);
}

/**
 * This function will be called when the user clicks on a button to update the view on the student's
 * exam table. The table will need to be reloaded with a new starting index. 
 * @param {string} id button id
 */
function updatePage(id) {
    // Set the new button to the active id
    updateActiveButton(id);

    // Use the new active button for calculationsf
    let active = document.getElementsByClassName(ACTIVE_CLASS)[0];
    let activeID = active.id;

    // Calculate where the table should begin display results
    if (activeID == `${LEGEND_PREFIX}-previous`)
        pageStart = 0;
    else if (activeID == `${LEGEND_PREFIX}-next`) {
        const numPages = Math.ceil(responseLength / pageLength) + 2;
        const displayAmount = -2 + (numPages > PAGE_LIMIT ? PAGE_LIMIT : numPages);
        pageStart = pageLength * (displayAmount - 1);
    }
    else
        pageStart = pageLength * (Number(active.innerText) - 1);

    // Reload the tables forcefully
    loadTables(true);
}

/**
 * Update the current active button depending on which button was pressed.
 * @param {string} id button id
 */
function updateActiveButton(id) {
    // ID of currently active button
    const activeButton = document.getElementsByClassName(ACTIVE_CLASS)[0];

    // ID of new active button
    let newButton = document.getElementById(id);
    let newID = newButton.id;

    // Handle active button if previous or next was pressed
    // This will move the active status to the next available button instead
    // of marking next or previous as active.
    if (newID.includes("previous") || newID.includes("next")) {
        // Calcualte max buttons to show
        const numPages = Math.ceil(responseLength / pageLength) + 2;
        const displayAmount = -2 + (numPages > PAGE_LIMIT ? PAGE_LIMIT : numPages);

        // Move page depending on if previous or next was pressed
        let currentPage = getActiveID();
        currentPage += newID.includes("previous") ? -1 : 1;

        // Bound active status to all buttons excluding previous and next
        if (currentPage == 0)
            currentPage = 1;
        else if (currentPage == displayAmount + 1)
            currentPage = displayAmount;

        // Update newButton to its proper button
        newButton = document.getElementById(`${LEGEND_PREFIX}-${currentPage}`);
    }
    // Swap active status with current active button and new active button
    activeButton.classList.remove(ACTIVE_CLASS);
    newButton.classList.add(ACTIVE_CLASS);

    // Update global activeButtonID 
    activeButtonID = newButton.id;
}

/**
 * Delete the current exam. This only deletes the exam on the student side.
 * @param {number} examid id of exam to be deleted
 * @param {number} studenid id of student to delete exam from
 * @param {number} code request type
 */
function updateRequest(examid, studentid, code) {
    // Begin AJAX call
    const credentials = `examid=${examid}&studentid=${studentid}&request=${code}`;
    const ajax = new XMLHttpRequest();

    // Check AJAX
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            // If exams exist print table dynamically
            if (ajax.responseText == "true") 
                loadTables();
        }
    }

    // Send request
    ajax.open("POST", "/post", true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(credentials);
}

/**
 * Reset and load the table state depnding on length of the query resonse
 */
function resetTableState() {
    // Get all elements that need visibility changed
    const empty = document.getElementById("table-empty-records");
    const table = document.getElementById("table");
    const legend = document.getElementById("table-display-legend");

    resetActiveButton();

    // If no response found disable these elements
    if (responseLength == 0) {
        empty.classList.remove("disabled");
        table.classList.add("disabled");
        legend.classList.add("disabled");
    }
    // else enable these
    else {
        empty.classList.add("disabled");
        table.classList.remove("disabled");
        legend.classList.remove("disabled");
    }
}

/**
 * Check if the activeButton is null. If it is null, replace it with a new activeButton
 */
function resetActiveButton() {
    // Get active button
    let activeButton = document.getElementById(activeButtonID);

    // Check active button for null
    if (activeButton == null) {
        let index = getActiveID();
        let updated = false;
        
        // Set active button to the latest page available
        for (let i = index - 1; i > 0; i--) {
            let newID = `${LEGEND_PREFIX}-${i}`;
            if (document.getElementById(newID) != null) {
                activeButtonID = newID;
                update = true;
                break;
            }
        }

        // If a page can't get set, reset activeButton to default
        if (!updated)
            activeButton = ACTIVE_BUTTON;
    }
}

/**
 * Compare all the objects in the previous and current response arrays to determine
 * if the responses are the same. If the responses are not the same the updated response 
 * should be displayed on the screen. If the responses are the same it doesn't make sense
 * to update the entire table and page buttons.
 * @param {array} currentResponse the previous response array
 * @param {array} previousResponse the current response array
 * @returns true if the same, false otherwise
 */
function isSame(currentResponse, previousResponse) {
    // Check to see if the length is the same before checking every object
    if (currentResponse.length != previousResponse.length)
        return false;

    // Loop through every index of the response
    for (let i = 0; i < currentResponse.length; i++) {
        const currentA = Object.values(currentResponse[i]);
        const previousA = Object.values(previousResponse[i]);

        // Loop through every attribute of every index of the response and compare
        for (let j = 0; j < currentA.length; j++) {
            if (currentA[j] != previousA[j])
                return false;
        }
    }
    return true;
}

/**
 * Get all header information for a specific request type. 
 * @returns header information array
 */
function getHeader() {
    switch (requestCode) {
        case 1:
            return ['ID', 'Professor', 'Title', 'Score', 'Date', "Action"];
        case 2:
            return ['ID', 'Student', 'Title', 'Score', 'Date', "Action"];
    }
}

/**
 * Get all purpose information for a specific request type
 * @returns purpose information array
 */
function getPurpose(isTaken) {
    switch (requestCode) {
        case 1:
            return isTaken ? ["review"] : ['take'];
        case 2:
            return isTaken ? ["review", "delete"] : ["grade", "delete"];
    }
}

/**
 * Get the active id index number
 * @returns active id index number
 */
function getActiveID() {
    return Number(activeButtonID.substring(activeButtonID.lastIndexOf("-") + 1));
}

/**
 * Convert datetime string to a date string
 * @param {datetime} datetime a variable that contains the date and time
 * @returns date only as string
 */
function formatDate(datetime) {
    // Date is in format YYYY-MM-DD HOURS:MINUTES:SECONDS
    const date = new Date(datetime);
    return date.toLocaleDateString();
}

/**
 * Given the student scored points and the exam's total points amount
 * calculate the percentage that the student earned on the exam
 * @param {number} score  total points the student earned on the exam
 * @param {number} points total points the exam is worth 
 * @returns test score in percentage format
 */
function formatScore(score, points) {
    if (score == -1)
        return "None";
    else if (score == -2)
        return "Ungraded";
    return String(parseInt(score / points * 100)) + "%";
}

/**
 * Disable the back button
 */
 function disableBack() {
    window.history.forward();
}