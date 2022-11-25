<!DOCTYPE html>
<html lang="en">
<head>
    <base href="">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
    <link rel="Stylesheet" href="style/style.css?<?php echo time();?>">
    <link rel="Stylesheet" href="style/student/student.css?<?php echo time();?>"> 
    <link rel="Stylesheet" href="style/teacher/questions.css?<?php echo time();?>">
    <?php include(dirname(__FILE__, 3) . "/style/includes/stylesheets.php");?>
    <script type="text/javascript" src="scripts/update-view.js??<?php echo time();?>"></script>
    <title>Create Questions</title>
</head>
<body>
    <?php include(dirname(__FILE__, 3) . "/views/includes/header.php");?>
    <div class="content-area">
        <p class="disabled" id="table-rc">4</p>  
        <div class="question-form"> 
            <form method="post" id="question-submission">
                <label for="question" class="form-label"> Write a Question <span class="form-required">*</span></label><br>
                <textarea name="question" type="text" id="question" class="form-input"></textarea><br>
                <label for="category" class="form-label">Category<span class="form-required">*</span></label><br>
                <input name="category" type="text" id="category" class="form-input"></input><br>
                <label for="difficulty" class="form-label"> Difficulty <span class="form-required">*</span></label><br>
                <select name="difficulty" id="difficulty" class="form-input">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select><br>
                <label for="constraint" class="form-label"> Constraint </label><br>
                <select name="constraints" id="constraint" class="form-input">
                    <option value="none">No Constraint</option>
                    <option value="for">For Constraint</option>
                    <option value="while">While Constraint</option>
                    <option value="recursion">Recursion Constraint</option>
                </select><br>

                <div class="test-case-area">
                    <div class="test-case-div">
                        <label for="testCase1Input" id="testCase1Label" class="form-label">Test Case 1<span class="form-required">*</span></label><br>
                        <input name="testCase1Input" type="text" id="testCase1Input" class="form-input"></input><br>
                        <label for="testCase2Input" id="testCase2Label" class="form-label">Test Case 2<span class="form-required">*</span></label><br>
                        <input name="testCase2Input" type="text" id="testCase2Input" class="form-input"></input><br>
                        <input type="button" id="testCaseButton" class="button" value="Add Test Case" onclick="extraTestCase();"></input>
                    </div>

                    <div class="test-solution-div">
                        <label for="testCase1Solution" id="testCase1SolutionLabel" class="form-label">Test Case 1 Expected Solution<span class="form-required">*</span></label><br>
                        <input name="testCase1Solution" type="text" id="testCase1Solution" class="form-input"></input><br>
                        <label for="testCase2Solution" id="testCase2SolutionLabel" class="form-label">Test Case 2 Expected Solution<span class="form-required">*</span></label><br>
                        <input name="testCase2Solution" type="text" id="testCase2Solution" class="form-input"></input><br>
                        <input type="button" id="removeTestCaseButton" class="button" value="Remove Test Case" onclick="removeTestCase();"></input><br>
                    </div>
                </div>
                <input type="hidden" id="form-request" value="5">
                <input type="submit" id="form-button" class="center" value="SUBMIT" >
            </form>
        </div>

        <div class="question-table">
            <div class="dash-table-area">
                <div class="dash-title"><h1 id='dash-table-title'>Question List</h1></div>
                <div class="dash-searchbar">
                    <div class="searchbar-select searchbar-element">
                        <select name="resultsAmount" id='results-amount' onchange="updateDisplayAmount()">
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="-1">All</option>
                        </select>
                        <p id='records-text'>records per page</p>
                    </div>
                    <div class="searchbar-search searchbar-element">
                        <p id='search-text'>Search: </p>
                        <input type="text" id='dash-search-input' onkeyup='loadTables()'>
                    </div>
                </div>
                <div class="dash-table-div">
                    <p class="disabled" id='table-empty-records'>No records</p>
                    <table id='table'><script> loadTables(); </script></table>
                    <div class="table-legend">
                        <div class="legend-text">
                            <p id='table-display-legend'></p>
                        </div>
                        <div class="legend-buttons" id='legend-buttons-container'></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>