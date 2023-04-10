<?php

require_once('router.php');

// Login routes
get('',                         'views/index.php');
get('/',                        'views/index.php');
get('/login',                   'views/index.php');

// Login requests
post('/login/query',            'model/query-database.php');

// Student routes
get('/student',                 '/views/student/student.php');
get('/exam',                    '/views/student/takeExam.php');

// Student requests
// TODO

// Teacher routes
get('/teacher',                 '/views/teacher/teacher.php');
get('/create',                  '/views/teacher/createExam.php');
get('/questions',               '/views/teacher/createQuestion.php');
get('/review',                  'views/teacher/reviewExam.php');

// Teacher requests
// TODO

// POST
post('/post',                   'controller/request-model.php');

// Unknown request or page
any('/404',                     'views/404.php');
