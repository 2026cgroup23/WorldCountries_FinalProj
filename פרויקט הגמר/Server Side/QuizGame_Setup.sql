/* ==========================================================================
   QuizGame_Setup.sql
   Run this ONCE against the project database (igroup123_test2).
   It seeds the two arcade quizzes into the existing Quizzes table and
   creates the stored procedures used by QuizGameController:
       - sp_AddQuizAttempt      (saves a finished game to QuizAttempts)
       - sp_GetQuizLeaderboard  (top players by best score for a game)
   Safe to re-run (uses IF NOT EXISTS / CREATE OR ALTER).
   ========================================================================== */

-- 1) Seed the two games as rows in the Quizzes table (matched by Title) -------
IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Title = N'Country Clash')
BEGIN
    INSERT INTO Quizzes (Title, Description, TimeLimitSeconds, IsActive)
    VALUES (N'Country Clash',
            N'Higher-or-Lower duel between two countries.',
            45, 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Title = N'Mystery Country')
BEGIN
    INSERT INTO Quizzes (Title, Description, TimeLimitSeconds, IsActive)
    VALUES (N'Mystery Country',
            N'Guess the hidden country from progressive clues.',
            60, 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Title = N'Locate the Country')
BEGIN
    INSERT INTO Quizzes (Title, Description, TimeLimitSeconds, IsActive)
    VALUES (N'Locate the Country',
            N'Click the world map to locate a country (GeoGuessr-style).',
            20, 1);
END
GO

-- 2) Save one finished game into QuizAttempts --------------------------------
CREATE OR ALTER PROCEDURE sp_AddQuizAttempt
    @QuizTitle        NVARCHAR(150),
    @UserId           INT,
    @Score            INT,
    @CorrectAnswers   INT,
    @TotalQuestions   INT,
    @TimeTakenSeconds INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @QuizId INT =
        (SELECT QuizId FROM Quizzes WHERE Title = @QuizTitle);

    IF @QuizId IS NULL
    BEGIN
        RAISERROR('Unknown quiz title. Run the seed section first.', 16, 1);
        RETURN;
    END

    -- Keep the values inside the table's CHECK constraints.
    IF @TotalQuestions < 1 SET @TotalQuestions = 1;
    IF @Score < 0 SET @Score = 0;
    IF @CorrectAnswers < 0 SET @CorrectAnswers = 0;
    IF @TimeTakenSeconds < 0 SET @TimeTakenSeconds = 0;

    INSERT INTO QuizAttempts
        (UserId, QuizId, Score, CorrectAnswers, TotalQuestions,
         StartedAt, CompletedAt, TimeTakenSeconds)
    VALUES
        (@UserId, @QuizId, @Score, @CorrectAnswers, @TotalQuestions,
         DATEADD(SECOND, -@TimeTakenSeconds, GETDATE()), GETDATE(),
         @TimeTakenSeconds);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS AttemptId;
END
GO

-- 3) Leaderboard: best score per user for a given game -----------------------
CREATE OR ALTER PROCEDURE sp_GetQuizLeaderboard
    @QuizTitle NVARCHAR(150),
    @TopN      INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @QuizId INT =
        (SELECT QuizId FROM Quizzes WHERE Title = @QuizTitle);

    SELECT TOP (@TopN)
        u.UserId,
        u.FullName,
        MAX(a.Score) AS BestScore,
        COUNT(*)     AS Attempts
    FROM QuizAttempts a
    INNER JOIN Users u ON u.UserId = a.UserId
    WHERE a.QuizId = @QuizId
    GROUP BY u.UserId, u.FullName
    ORDER BY BestScore DESC, Attempts ASC;
END
GO
