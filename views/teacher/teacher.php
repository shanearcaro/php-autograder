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
    <link rel="Stylesheet" href="style/teacher/teacher.css?<?php echo time();?>">
    <?php include(dirname(__FILE__, 3) . "/style/includes/stylesheets.php");?>
    <script type="text/javascript" src="scripts/render-table.js??<?php echo time();?>"></script>
    <script type="text/javascript" src="scripts/authenticate-user.js??<?php echo time();?>"></script>
    <script type="text/javascript" src="scripts/review.js??<?php echo time();?>"></script>
    <title>Teacher Portal</title>
</head>
<body onload="onLoad()">
    <?php include(dirname(__FILE__, 3) . "/views/includes/header.php");?>
    <div class="content-area">
        <p class="disabled" id="table-rc">2</p>
        <div class="content-panel">
            <div class="panel-list-area">
                <ul class="panel-list">
                    <div class="panel-div panel-hover"><li class="panel-element" id='panel-dashboard' onclick="window.location.href='/questions'">QUESTION</li></div>
                    <div class="panel-div panel-hover"><li class="panel-element" id='panel-exam' onclick="window.location.href='/create'">CREATE EXAM</li></div>
                    <div class="panel-div"><button class="panel-element button" id='logout-button' onclick="logout()">LOG OUT</button></div>
                </ul>
            </div>
        </div>
        <div class="content-dash">
            <?php include(dirname(__FILE__, 3) . "/views/includes/table.php");?>
        </div>
    </div>
</body>
</html>