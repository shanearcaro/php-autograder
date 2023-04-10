//Add up to 5 test cases to the file
function extraTestCase() {
    const prefix = "testCase";
    var numOfCases;

    //Check if there are 5 test cases and if there are, return
    for(let i=3; i<=5; i++){
        if(document.getElementById(prefix + i + "Label") == null){
            numOfCases = i;
            break;
        }
        else
            numOfCases = i;
        if(numOfCases == 5)
            return;
    }
    
    // Create elements for test case label and input fields and add attributes
    const labelName = prefix + numOfCases + "Label";
    const inputName = prefix + numOfCases + "Input";
    const testCaseSolutionLabel = prefix + numOfCases + "SolutionLabel";
    const testCaseSolutionInput = prefix + numOfCases + "Solution";
    const breakId1 = "break1" + numOfCases;
    const breakId2 = "break2" + numOfCases;
    const breakId3 = "break3" + numOfCases;
    const breakId4 = "break4" + numOfCases;

    const testCaseLabel = document.createElement("label");
    const testCaseInput = document.createElement("input");
    const solutionLabel = document.createElement("label");
    const solutionInput = document.createElement("input");
    const lineBreak1 = document.createElement("br");
    const lineBreak2 = document.createElement("br");
    const lineBreak3 = document.createElement("br");
    const lineBreak4 = document.createElement("br");

    //Set attributes for test case label
    testCaseLabel.setAttribute("for", inputName);
    testCaseLabel.setAttribute("id", labelName);
    testCaseLabel.setAttribute("class", "test-label");
    testCaseLabel.innerHTML = "Test Case " + numOfCases;

    //Set attributes for test case input box
    testCaseInput.setAttribute("name", inputName);
    testCaseInput.setAttribute("type", "text");
    testCaseInput.setAttribute("id", inputName);
    testCaseInput.setAttribute("class", "test-input");

    //Set attributes for solution label
    solutionLabel.setAttribute("for", testCaseSolutionInput);
    solutionLabel.setAttribute("id", testCaseSolutionLabel);
    solutionLabel.setAttribute("class", "test-label");
    solutionLabel.innerHTML = "Test Case " + numOfCases + " Expected Solution";

    //Set attributes for solution input
    solutionInput.setAttribute("name", testCaseSolutionInput);
    solutionInput.setAttribute("type", "text");
    solutionInput.setAttribute("id", testCaseSolutionInput);
    solutionInput.setAttribute("class", "solution-input");

    //Sets ids for all of the line breaks
    lineBreak1.setAttribute("id", breakId1);
    lineBreak2.setAttribute("id", breakId2);
    lineBreak3.setAttribute("id", breakId3);
    lineBreak4.setAttribute("id", breakId4);

    numOfCases = numOfCases - 1;
    const getAddButtonId = document.getElementById("testCaseButton");
    const getRemoveId = document.getElementById("removeTestCaseButton");

    getAddButtonId.insertAdjacentElement('beforebegin', testCaseLabel);
    getAddButtonId.insertAdjacentElement('beforebegin', lineBreak1);
    getAddButtonId.insertAdjacentElement('beforebegin', testCaseInput);
    getAddButtonId.insertAdjacentElement('beforebegin', lineBreak2);

    getRemoveId.insertAdjacentElement('beforebegin', solutionLabel);
    getRemoveId.insertAdjacentElement('beforebegin', lineBreak3);
    getRemoveId.insertAdjacentElement('beforebegin', solutionInput);
    getRemoveId.insertAdjacentElement('beforebegin', lineBreak4);


}

//Remove test cases 3 to 5
function removeTestCase() {
    const prefix = "testCase";
    var numOfCases;

    //Check if there are  only 2 test cases and if there are, return
    for(let i=5; i>=2; i--){
        if(document.getElementById(prefix + i + "Label") == null)
            continue;
        else{
            numOfCases = i;
            break;
        }
    }

    if(numOfCases == 2)
        return;
    
    const labelName = prefix + numOfCases + "Label";
    const inputName = prefix + numOfCases + "Input";
    const testCaseSolutionLabel = prefix + numOfCases + "SolutionLabel";
    const testCaseSolutionInput = prefix + numOfCases + "Solution";

    const breakId1 = "break1" + numOfCases;
    const breakId2 = "break2" + numOfCases;
    const breakId3 = "break3" + numOfCases;
    const breakId4 = "break4" + numOfCases;

    const getTestCaseLabel = document.getElementById(labelName);
    const getTestCaseInput = document.getElementById(inputName);
    const getSolutionLabel = document.getElementById(testCaseSolutionLabel);
    const getSolutionInput = document.getElementById(testCaseSolutionInput);
    const getBreakId1 = document.getElementById(breakId1);
    const getBreakId2 = document.getElementById(breakId2);
    const getBreakId3 = document.getElementById(breakId3);
    const getBreakId4 = document.getElementById(breakId4);

    getTestCaseLabel.parentNode.removeChild(getTestCaseLabel);
    getTestCaseInput.parentNode.removeChild(getTestCaseInput);
    getSolutionLabel.parentNode.removeChild(getSolutionLabel);
    getSolutionInput.parentNode.removeChild(getSolutionInput);
    getBreakId1.parentNode.removeChild(getBreakId1);
    getBreakId2.parentNode.removeChild(getBreakId2);
    getBreakId3.parentNode.removeChild(getBreakId3);
    getBreakId4.parentNode.removeChild(getBreakId4);
}

function storeQuestion() {
    const requestCode = 13;
    const text = document.getElementById("question").value;
    const difficulty = document.getElementById("difficulty").value;
    var constraint = document.getElementById("constraint").value;
    const category = document.getElementById("category").value;
    const testCases = document.getElementsByClassName("test-input");
    const solutions = document.getElementsByClassName("solution-input");
    
    const credentials = `text=${text}&difficulty=${difficulty}&constraint=${constraint}&category=${category}&request=${requestCode}`;
    const ajax = new XMLHttpRequest();

    //Make sure question box isn't empty
    if(!text || text.trim().length == 0){
        console.log("Please enter a question");
        return;
    }

    //Make sure test cases aren't empty strings
    for(let i=0; i < testCases.length; i++){
        if(!testCases[i].value || testCases[i].value.trim().length == 0){
            console.log("Input a value for all test cases");
            return;
        }
        if(!solutions[i].value || solutions[i].value.trim().length == 0){
            console.log("Input a value for all test case solutions");
            return;
        }
    }

    var functionName = testCases[0].value.split('(');

    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            console.log(ajax.responseText);
            //The response text will be the id of the last exam created
            const questionId = JSON.parse(ajax.responseText);
            if (ajax.responseText == "false") {
                /**
                 * This should also never fail. The best way of dealing with this would be to make the
                 * answers get added to sesssion data and then reload the page and answers on a failure
                 * and try again. This might get added in a later version if I have time.
                 */
                window.location.href = "/404";
                }

            for (let i = 0; i < testCases.length; i++) {
                storeTestCases(testCases[i].value, solutions[i].value, questionId);
            }

            //Store default test cases for the constraints
            storeTestCases(functionName[0], functionName[0], questionId);

            switch (constraint) {
                case 'NULL':
                    storeTestCases("None", "None", questionId);
                    break;
                case 'For':
                    storeTestCases("For", "For", questionId);
                    break;
                case 'While':
                    storeTestCases("While", "While", questionId);
                    break;
                case 'Recursion':
                    storeTestCases("Recursion", "Recursion", questionId);
                    break;
            }
            //window.location.href = "/teacher";
        }
    }
    ajax.open("POST", "/post", true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(credentials);
}

function storeTestCases(testCase, solution, questionId) {
    const requestCode = 14;
    const credentials = `questionid=${questionId}&case=${testCase}&answer=${solution}&request=${requestCode}`;
    const ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            //The response text will be the id of the last exam created
            console.log(ajax.responseText);
            if (ajax.responseText == "false") {
                /**
                 * This should also never fail. The best way of dealing with this would be to make the
                 * answers get added to sesssion data and then reload the page and answers on a failure
                 * and try again. This might get added in a later version if I have time.
                 */
                window.location.href = "/404";
            }
        }
    }

    ajax.open("POST", "/post", true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.send(credentials);

}