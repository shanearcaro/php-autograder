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

/*
 * ================
 *  Code directory
 * ================
 * Request Number - Description
 *      Recieving variables
 *      Returning variables
 * 
 * 0 - Login request
 *      username, password
 *      user_id, position
 * 
 * 1 - Insert question
 *      user_id, questiontype, difficulty, constraint, question, tc1, an1, tc2, an2, tc3, an3, tc4, an4, tc5, an5
 *      insertionStatus
 * 
 * 2 - Select questions created by a teacher
 *      user_id
 *      question_id, created, question_type, difficulty, question_text, tc1, an1, tc2, an2, tc3, an3, tc4, an4, tc5, an5
 *
 * 3 - Insert exam
 *      user_id, title, points, question_count
 *      insertionStatus
 * 
 * 4 - Insert -1 exam score (when student started exam)
 *      user_id, exam_id
 *      insertionStatus
 * 
 * 5 - Select exam questions
 *      exam_id
 *      question_id, question_text, questionPoints
 * 
 * 6 - Update score (by StudentExams.submission_id)
 *      submission_id, score
 *      insertionStatus
 * 
 * 7 - Update score (by user_id and exam_id)
 *      user_id, exam_id, score
 *      insertionStatus 
 * 
 * 8 - Select completed exam
 *      submission_id
 *      question_id, answer, questionPoints, created, question_text, tc1, an1, tc2, an2, tc3, an3, tc4, an4, tc5, an5
 *
 * 9 - Select name
 *      user_id
 *      name
 * 
 * 10 - Select teachers exam (given user id teachers, sent user id and name is students)
 *      user_id
 *      submission_id, user_id, exam_id, score, name
 * 
 * 11 - Select students exam (sent name is teachers name) (aka selectExamsStudent.php)
 *      user_id
 *      exam_id, points, question_count, creator_id, name
 * 
 * 12 - Select exam submissions (given user id students, sent name is teachers) (points is out-of-XX) (aka selectStudentExams.php)
 *      user_id
 *      submission_id, name, user_id, exam_id, score, points
 * 
 * 13 - Insert completed exam //TODO: NEEDS WORK
 *      submission_id, question_id, answer, question_count, result1, result2, result3, result4, result5, score, comment
 *      insertionStatus
 * 
 * 14 - Select exam results //TODO: NEEDS WORK
 *      user_id
 *      submission_id, question_id, answer, result1, result2, result3, result4, result5, score, comment,\\
 *          \\studentGrade, questionPoints, question_text, tc1, an1, tc2, an2, tc3, an3, tc4, an4, tc5, an5, points
 */

switch($request_code) {
    case 0:
        $query = $pdo->prepare("SELECT user_id, position FROM Users WHERE name = ? AND password= ?");
        $query->execute([$data->{'username'}, $data->{'password'}]);
        break;

    case 1:
        $query = $pdo->prepare("INSERT INTO Questions (creator_id, question_type, difficulty, constraint, question_text, 
        tc1, an1, tc2, an2, tc3, an3, tc4, an4, tc5, an5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?. ?)");

        $query->execute([$data->{'user_id'}, $data->{'questiontype'}, $data->{'difficulty'}, $data->{'constraint'}, 
        $data->{'question_text'}, $data->{'tc1'}, $data->{'an1'}, $data->{'tc2'}, $data->{'an2'}, $data->{'tc3'}, 
        $data->{'an3'}, $data->{'tc4'}, $data->{'an4'}, $data->{'tc5'}, $data->{'an5'}]);

        break;

    case 2:
        $query = $pdo->prepare("SELECT question_id, created, question_type, difficulty, question_text, tc1, an1, 
        tc2, an2, tc3, an3, tc4, an4, tc5, an5 FROM Questions WHERE creator_id= ? ");

        $query->execute([$data->{'user_id'}]);
        break;

    case 3:
        $query = $pdo->prepare("INSERT INTO Exams (creator_id, title, points, question_count) VALUES (?, ?, ?, ?)");
        $query->execute([$data->{'user_id'}, $data->{'title'}, $data->{'points'}, $data->{'question_count'}]);
        break;

    case 4:
        $query = $pdo->prepare("INSERT INTO StudentExams (user_id, exam_id, score) VALUES (?, ?, -1)");
        $query->execute([$data->{'user_id'}, $data->{'exam_id'}]);
        break;

    case 5:
        $query = $pdo->prepare("SELECT q.question_id, q.question_text, eq.questionPoints FROM ExamQuestions as eq 
        INNER JOIN Exams AS e ON eq.exam_id=e.exam_id 
        INNER JOIN Questions AS q ON eq.question_id=q.question_id 
        WHERE e.exam_id= ? ");

        $query->execute([$data->{'exam_id'}]);
        break;

    case 6:
        $query = $pdo->prepare("UPDATE StudentExams SET score = ? WHERE submission_id= ? ");
        $query->execute([$data->{'score'}, $data->{'submission_id'}]);
        break;

    case 7:
        $query = $pdo->prepare("UPDATE StudentExams SET score = ? WHERE user_id = ? and exam_id = ? ");
        $query->execute([$data->{'score'}, $data->{'user_id'}, $data->{'exam_id'}]);
        break;

    case 8:
        $query = $pdo->prepare("SELECT ce.submission_id, ce.question_id, ce.answer, eq.questionPoints, q.question_text, 
        q.tc1, q.an1, q.tc2, q.an2, q.tc3, q.an3, q.tc4, q.an4, q.tc5, q.an5 FROM CompletedExam AS ce 
        INNER JOIN StudentExams AS se ON ce.submission_id=se.submission_id 
        INNER JOIN ExamQuestions AS eq ON se.exam_id=eq.exam_id AND ce.question_id=eq.question_id 
        INNER JOIN Questions AS q ON ce.question_id=q.question_id 
        WHERE ce.submission_id= ? ");

        $query->execute([$data->{'submission_id'}]);
        break;

    case 9:
        $query = $pdo->prepare("SELECT name FROM Users WHERE user_id = ? ");
        $query->execute([$data->{'submission_id'}]);
        break;

    case 10:
        $query = $pdo->prepare("SELECT se.submission_id, se.user_id, se.exam_id, e.score, u.name FROM StudentExams AS se 
        INNER JOIN Exams AS e on se.exam_id=e.exam_id 
        INNER JOIN Users AS u on se.user_id=u.user_id 
        WHERE se.score=-1 AND e.creator_id = ? 
        ORDER BY se.examID ASC");

        $query->execute([$data->{'user_id'}]);
        break;

    case 11:
        $query = $pdo->prepare("SELECT e.exam_id, e.points, e.question_count, e.creator_id, u.name FROM Exams as e 
        INNER JOIN Users as u ON u.user_id=e.creator_id 
        WHERE exam_id NOT IN (
            SELECT sei.exam_id FROM Exams AS ei JOIN StudentExams AS sei ON ei.exam_id=sei.exam_id 
            WHERE sei.user_id = ? 
        )
        ORDER BY e.exam_id ASC;");

        $query->execute([$data->{'user_id'}]);
        break;
    
    case 12:
        $query = $pdo->prepare("SELECT se.submission_id, u.name, se.user_id, se.exam_id, se.score, e.points FROM StudentExams AS se
        INNER JOIN Exams AS e on se.exam_id=e.exam_id
        INNER JOIN Users AS u ON e.creator_id=u.user_id
        WHERE se.score != -1 AND se.user_id = ?
        ORDER BY se.exam_id ASC");
        $query->execute([$data->{'user_id'}]);
        break;
    
    case 13: //TODO: NEEDS WORK
        $query = $pdo->prepare("SELECT * from Users");
        $query->execute([$data->{'submission_id'}]);
        break;
    
    case 14: //TODO: NEEDS WORK
        $query = $pdo->prepare("SELECT * from users");
        $query->execute([$data->{'submission_id'}]);
        break;
    
}

$response = $query->fetch();
echo json_encode($response);
