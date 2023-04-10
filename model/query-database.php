<?php
require_once('vendor/autoload.php');

// Read credentials
$dotenv = Dotenv\Dotenv::createImmutable(dirname(__DIR__, 1));
$dotenv->load();

// Create connection string
$dsn = "mysql:host={$_ENV['HOST']};dbname={$_ENV['DATABASE']};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Try connection
try {
     $pdo = new PDO($dsn, $_ENV['NAME'], $_ENV['PASS'], $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

// Get variables and request code
$data = json_decode(file_get_contents('php://input'));
$request_code = $data->{'request'};

/**
 * ================
 *  Code directory
 * ================
 * Request Number - Description
 *     [Recieving variables]
 *     [Returning variables]
 * 
 * 0 - Authenticate login
 *     [username, password]
 *     [user_id, position]
 * 
 * 1 - Select student tables
 *     []
 *     [studentexam_id, exam_id, user_id, title, points, e.date, score, se.date]
 * 
 * 2 - Select teacher exams
 *     [userid]
 *     [examid, userid, title, points, score, name, ]
 * 
 * 3 - Delete Exam
 *     [userid, examid, studentid]
 *     []
 * 
 * 4 - Get exam questions
 *     [studentexam_id]
 *     [studentexam_id, examid, questionid, points, text, difficulty]
 * 
 * 5 - Update exam questions with answer
 *     [studentexamid, questionid, answer]
 *     []
 * 
 * 6 - Update student exam score
 *     [userid, examid, score]
 *     []
 * 
 * 7 - Get all student exam questions, testcases, and student answers.
 *     [studentexamid]
 *     [studentexamid, questionid, points, answer, testcaseid, case, answer, case_answer] 
 * 
 * 15 - Get student points
 *      [studentexamid]
 * 8 - Get all created questions
 *     []
 *     [question_id, text]
 * 
 * 9 - Store newly created exam and return last exam Id
 *     [userid, title, points, date]
 *     [exam_id]
 * 
 * 10 - Create student Exams for every new exam created
 *      [examid]
 *      []
 * 
 * 11 - Store exam questions
 *     [questionid, points, examid]
 *     []
 * 
 * 12 - Get All Created Questions
 *     []
 *     [questionid, text, difficulty, constraint]
 * 
 * 13 - Store created question and return the question_id
 *     [text, difficulty, constraint, category]
 *     [question_id]
 * 
 * 14 - Store Test Cases
 *      [questionid, testCase(2..5)]
 *      []
 * 
 * 17 - Grab all exam questions
 *      [studentexam_id, answer, comment]
 *      [question_id]
 * 
 * 20 - Grab all testcases for exam
 *      [question_id]
 *      [studentexam_id]
 * 
 * 30 - Get test case answers 
 *      [testcase_id, studentexam_id]
 *      [autoresult, points, score] 
 * 
 * 31 - Update Autograde Scores
 *      [studentexam_id, testcase_id, score]
 *      []
 */

//  Execute queries based on request 
switch($request_code) {
    case 0:
        $query = $pdo->prepare(
            "SELECT user_id, position 
            FROM Users 
            WHERE username = ? AND password= ?");
        $query->execute([$data->{'username'}, $data->{'password'}]);
        break;

    case 1:
        $query = $pdo->prepare(
            "SELECT se.studentexam_id, e.exam_id, e.user_id, e.title, e.points, e.date, u.name, se.score, se.date 
            FROM Exams AS e 
            INNER JOIN StudentExams AS se ON e.exam_id = se.exam_id 
            INNER JOIN Users AS u ON e.user_id = u.user_id
            WHERE se.user_id = ?
            ORDER BY e.exam_id ASC");
        $query->execute([$data->{'userid'}]);
        break;

    case 2:
        $query = $pdo->prepare(
            "SELECT se.studentexam_id, e.exam_id, se.user_id, e.title, e.points, e.date, u.name, se.score
            FROM Exams as e
            INNER JOIN StudentExams AS se on e.exam_id = se.exam_id
            INNER JOIN Users AS u ON se.user_id = u.user_id
            WHERE e.user_id = ?
            ORDER BY e.exam_id ASC");
        $query->execute([$data->{'userid'}]);
        break;

    case 3:
        $query = $pdo->prepare(
            "DELETE FROM ExamQuestions
            WHERE studentexam_id = ?");
        $query->execute([$data->{'studentexamid'}]);

        $query = $pdo->prepare(
            "DELETE FROM StudentExams 
            WHERE studentexam_id = ?");
        $query->execute([$data->{'studentexamid'}]);

        /**
         * Return true here and exit, don't want to use the default
         * functionality since it will always return false here
         */
        echo json_encode(true);
        exit();

    case 4:
        $query = $pdo->prepare(
            "SELECT se.studentexam_id, se.exam_id, eq.question_id, eq.points, q.text, q.difficulty, e.title
            FROM StudentExams AS se
            INNER JOIN Exams AS e ON se.exam_id = e.exam_id
            INNER JOIN ExamQuestions AS eq ON se.studentexam_id = eq.studentexam_id
            INNER JOIN Questions AS q on eq.question_id = q.question_id
            WHERE se.studentexam_id = ?
            ORDER BY eq.question_id");
        $query->execute([$data->{'studentexamid'}]);
        break;

    case 5:
        $query = $pdo->prepare(
            "UPDATE ExamQuestions AS eq
            INNER JOIN StudentExams AS se ON eq.studentexam_id = se.studentexam_id
            SET eq.answer = ?
            WHERE se.studentexam_id = ? AND eq.question_id = ?");
        $query->execute([$data->{'answer'}, $data->{'studentexamid'}, $data->{'questionid'}]);

        /**
         * Return true here and exit, don't want to use the default
         * functionality since it will always return false here
         */
        echo json_encode(true);
        exit();

    case 6:
        $query = $pdo->prepare(
            "UPDATE StudentExams
            SET score = ?
            WHERE studentexam_id = ?");
        $query->execute([$data->{'score'}, $data->{'studentexamid'}]);

        /**
         * Return true here and exit, don't want to use the default
         * functionality since it will always return false here
         */
        echo json_encode(true);
        exit();

    case 7:
        $query = $pdo->prepare(
            "SELECT se.studentexam_id, eq.question_id, eq.points, eq.answer, q.text, q.difficulty, q.constraint, tc.testcase_id, tc.case, tc.answer AS case_answer
            FROM StudentExams AS se
            INNER JOIN ExamQuestions AS eq ON se.studentexam_id = eq.studentexam_id
            INNER JOIN Questions AS q ON eq.question_id = q.question_id
            INNER JOIN Testcases AS tc ON q.question_id = tc.question_id
            WHERE se.studentexam_id = ?
            ORDER BY eq.question_id");
        $query->execute([$data->{'studentexamid'}]);
        break;
    case 8:
        $query = $pdo->prepare(
            "SELECT *
            FROM Questions as q");
        $query->execute();
        break;
    case 9:
        $query = $pdo->prepare(
            "INSERT INTO Exams (exam_id, user_id, title, points, date)
            VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP)");
        $query->execute([$data->{'userid'}, $data->{'title'}, $data->{'points'}]);
        $query = $pdo->lastInsertId();
        echo json_encode($query);
        exit();
    case 10:
            $query = $pdo->prepare(
                "INSERT INTO StudentExams (studentexam_id, user_id, exam_id, score, date)
                SELECT NULL, Users.user_id, ?, -1, CURRENT_TIMESTAMP
                FROM Users
                WHERE Users.position = 'student'");
            $query->execute([$data->{'examid'}]);
            break;
    case 11:
        $query = $pdo->prepare(
            "INSERT INTO ExamQuestions (studentexam_id, question_id, points, answer, comment)
            SELECT StudentExams.studentexam_id, ?, ?, NULL, NULL
            FROM StudentExams
            WHERE StudentExams.exam_id=?");
        $query->execute([$data->{'questionid'}, $data->{'points'}, $data->{'examid'}]);
        break;
    case 12:
        $query = $pdo->prepare(
            "SELECT * FROM
            Questions");
        $query->execute();
        echo json_encode(true);
        exit();
    case 13:
        $query = $pdo->prepare(
            "INSERT INTO Questions (question_id, text, difficulty, `constraint`, category)
            VALUES (NULL, ?, ?, ?, ?)");
        if($data->{'constraint'} == "NULL")
            $data->{'constraint'} = NULL;
        $query->execute([$data->{'text'}, $data->{'difficulty'}, $data->{'constraint'}, $data->{'category'}]);
        $query = $pdo->lastInsertId();
        echo json_encode($query);
        exit();
    case 14:
        $query = $pdo->prepare(
            "INSERT INTO Testcases (testcase_id, question_id, `case`, answer)
            VALUES (NULL, ?, ?, ?)");
            $query->execute([$data->{'questionid'}, $data->{'case'}, $data->{'answer'}]);

    case 17:
        $query = $pdo->prepare(
            "SELECT eq.question_id, q.text, eq.points, eq.answer, eq.comment 
            FROM ExamQuestions as eq
            INNER JOIN Questions as q
            WHERE  eq.studentexam_id = ? AND eq.question_id = q.question_id");
        $query->execute([$data->{'studentexamid'}]);
        break;
    case 20:
        $query = $pdo->prepare(
            "SELECT `case`, answer, testcase_id 
            FROM Testcases
            WHERE question_id = ?");
        $query->execute([$data->{'questionid'}]);
        break;
    case 30:
        $query = $pdo->prepare(
            "SELECT autoresult, points, score
            FROM Autograde
            WHERE studentexam_id = ? AND testcase_id = ?");
        $query->execute([$data->{'studentexamid'}, $data->{'testcaseid'}]);
        break;
    case 31:
        $query = $pdo->prepare(
            "UPDATE Autograde
            SET score = ?
            WHERE studentexam_id = ? AND testcase_id = ?");
        $query->execute([$data->{'score'}, $data->{'studentexamid'}, $data->{'testcaseid'}]);
        break
        exit();
    case 15:
        $query = $pdo->prepare(
            "SELECT eq.question_id, eq.points
            FROM StudentExams AS se
            INNER JOIN ExamQuestions AS eq ON se.studentexam_id = eq.studentexam_id
            WHERE se.studentexam_id = ?
            ORDER BY eq.question_id");
        $query->execute([$data->{'studentexamid'}]);
        break;
    case 19:
        $query = $pdo->prepare(
            "INSERT INTO `Autograde` (`studentexam_id`, `testcase_id`, `autoresult`, `points`, `score`) 
            VALUES (?, ?, ?, ?, ?)"
        );
        $query->execute([$data->{'studentexamid'}, $data->{'testcaseid'}, $data->{'autoresult'}, $data->{'points'}, $data->{'score'}]);
        exit();
}       

// Fetch data and return
$response = $query->fetchAll();
echo json_encode($query->rowCount() == 0 ? false : $response);