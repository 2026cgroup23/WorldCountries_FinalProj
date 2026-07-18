-- 1. טבלאות בסיס ומשתמשים

-- ניהול סוגי המשתמשים במערכת 
CREATE TABLE Roles
(
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- הטבלה המרכזית של משתמשי המערכת
CREATE TABLE Users
(
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    IsLocked BIT NOT NULL DEFAULT 0,
    CanShare BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    LastLoginAt DATETIME2 NULL,

    CONSTRAINT FK_Users_Roles
        FOREIGN KEY (RoleId)
        REFERENCES Roles(RoleId)
);
GO

-- מתעדת כל ניסיון התחברות, כולל הדוא״ל שנוסה, המשתמש כאשר זוהה, מועד הניסיון והאם הצליח
CREATE TABLE LoginHistory
(
    LoginId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    EmailAttempted NVARCHAR(150) NOT NULL,
    LoginDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    WasSuccessful BIT NOT NULL,

    CONSTRAINT FK_LoginHistory_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId)
);
GO

-- 2. טבלאות מדינות ונתוני עזר

-- טבלה המכילה את כל היבשות בעולם
CREATE TABLE Continents
(
    ContinentId INT IDENTITY(1,1) PRIMARY KEY,
    ContinentName NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- טבלה המכילה את כל השפות במערכת
CREATE TABLE Languages
(
    LanguageId INT IDENTITY(1,1) PRIMARY KEY,
    LanguageCode NVARCHAR(10) NOT NULL UNIQUE,
    LanguageName NVARCHAR(100) NOT NULL UNIQUE
);
GO

-- שומרת את רמות השליטה הקבועות בשפה ואת סדר הצגתן
CREATE TABLE LanguageLevels
(
    LevelId INT IDENTITY(1,1) PRIMARY KEY,
    LevelName NVARCHAR(50) NOT NULL UNIQUE,
    LevelOrder INT NOT NULL UNIQUE
);
GO

-- הטבלה המרכזית של כל מדינות העולם
CREATE TABLE Countries
(
    CountryId INT IDENTITY(1,1) PRIMARY KEY,
    Cca2 NVARCHAR(2) NULL,
    Cca3 NVARCHAR(3) NOT NULL UNIQUE,
    CommonName NVARCHAR(100) NOT NULL,
    OfficialName NVARCHAR(200) NULL,
    Capital NVARCHAR(150) NULL,
    ContinentId INT NULL,
    Region NVARCHAR(100) NULL,
    Subregion NVARCHAR(100) NULL,
    Population BIGINT NOT NULL DEFAULT 0,
    Area FLOAT NOT NULL DEFAULT 0,
    FlagUrl NVARCHAR(500) NULL,
    GoogleMapsUrl NVARCHAR(500) NULL,
    Latitude DECIMAL(9,6) NULL,
    Longitude DECIMAL(9,6) NULL,
    IsIndependent BIT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    ImportedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT FK_Countries_Continents
        FOREIGN KEY (ContinentId)
        REFERENCES Continents(ContinentId),

    CONSTRAINT CHK_Countries_Population
        CHECK (Population >= 0),

    CONSTRAINT CHK_Countries_Area
        CHECK (Area >= 0)
);
GO

-- טבלה המכילה את כל המטבעות
CREATE TABLE Currencies
(
    CurrencyCode NVARCHAR(10) PRIMARY KEY,
    CurrencyName NVARCHAR(100) NOT NULL,
    CurrencySymbol NVARCHAR(20) NULL
);
GO

-- טבלת קשר בין מדינות לשפות
CREATE TABLE CountryLanguages
(
    CountryId INT NOT NULL,
    LanguageId INT NOT NULL,

    CONSTRAINT PK_CountryLanguages
        PRIMARY KEY (CountryId, LanguageId),

    CONSTRAINT FK_CountryLanguages_Countries
        FOREIGN KEY (CountryId)
        REFERENCES Countries(CountryId),

    CONSTRAINT FK_CountryLanguages_Languages
        FOREIGN KEY (LanguageId)
        REFERENCES Languages(LanguageId)
);
GO

-- טבלת קשר בין מדינות למטבעות
CREATE TABLE CountryCurrencies
(
    CountryId INT NOT NULL,
    CurrencyCode NVARCHAR(10) NOT NULL,

    CONSTRAINT PK_CountryCurrencies
        PRIMARY KEY (CountryId, CurrencyCode),

    CONSTRAINT FK_CountryCurrencies_Countries
        FOREIGN KEY (CountryId)
        REFERENCES Countries(CountryId),

    CONSTRAINT FK_CountryCurrencies_Currencies
        FOREIGN KEY (CurrencyCode)
        REFERENCES Currencies(CurrencyCode)
);
GO

-- 3. טבלאות העדפות משתמש

-- שומרת את היבשות המועדפות של כל משתמש ואת מועד ההוספה
CREATE TABLE UserPreferredContinents
(
    UserId INT NOT NULL,
    ContinentId INT NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_UserPreferredContinents
        PRIMARY KEY (UserId, ContinentId),

    CONSTRAINT FK_UserPreferredContinents_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_UserPreferredContinents_Continents
        FOREIGN KEY (ContinentId)
        REFERENCES Continents(ContinentId)
);
GO

-- שומרת את השפות שכל משתמש יודע ואת רמת השליטה שלו.
CREATE TABLE UserLanguages
(
    UserId INT NOT NULL,
    LanguageId INT NOT NULL,
    LevelId INT NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,

    CONSTRAINT PK_UserLanguages
        PRIMARY KEY (UserId, LanguageId),

    CONSTRAINT FK_UserLanguages_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_UserLanguages_Languages
        FOREIGN KEY (LanguageId)
        REFERENCES Languages(LanguageId),

    CONSTRAINT FK_UserLanguages_LanguageLevels
        FOREIGN KEY (LevelId)
        REFERENCES LanguageLevels(LevelId)
);
GO

-- 4. טבלאות רשימות אישיות

-- טבלת קשר בין משתמשים למדינות
CREATE TABLE UserCountryLists
(
    UserId INT NOT NULL,
    CountryId INT NOT NULL,
    ListType TINYINT NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_UserCountryLists
        PRIMARY KEY (UserId, CountryId),

    CONSTRAINT FK_UserCountryLists_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_UserCountryLists_Countries
        FOREIGN KEY (CountryId)
        REFERENCES Countries(CountryId),

    CONSTRAINT CHK_UserCountryLists_ListType
        CHECK (ListType IN (1, 2))
);
GO

-- 5. טבלת שיתופים

-- שומרת שיתופי משתמשים על מדינות. כוללת סוג שיתוף, תוכן, דירוג ומחיקה לוגית.
CREATE TABLE Shares
(
    ShareId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    CountryId INT NOT NULL,
    ShareType TINYINT NOT NULL,
    Content NVARCHAR(1000) NOT NULL,
    Rating TINYINT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,

    CONSTRAINT FK_Shares_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_Shares_Countries
        FOREIGN KEY (CountryId)
        REFERENCES Countries(CountryId),

    CONSTRAINT CHK_Shares_ShareType
        CHECK (ShareType IN (1, 2, 3)),

    CONSTRAINT CHK_Shares_Rating
        CHECK (Rating IS NULL OR Rating BETWEEN 1 AND 5)
);
GO

-- 6. טבלאות חידונים

-- שומרת חידונים, תיאור, מגבלת זמן וסטטוס פעיל
CREATE TABLE Quizzes
(
    QuizId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    TimeLimitSeconds INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,

    CONSTRAINT CHK_Quizzes_TimeLimit
        CHECK (TimeLimitSeconds > 0)
);
GO

-- שומרת את שאלות החידונים ואת סדר הופעתן
CREATE TABLE QuizQuestions
(
    QuestionId INT IDENTITY(1,1) PRIMARY KEY,
    QuizId INT NOT NULL,
    QuestionText NVARCHAR(500) NOT NULL,
    QuestionOrder INT NOT NULL,

    CONSTRAINT FK_QuizQuestions_Quizzes
        FOREIGN KEY (QuizId)
        REFERENCES Quizzes(QuizId),

    CONSTRAINT UQ_QuizQuestions_Quiz_Order
        UNIQUE (QuizId, QuestionOrder),

    CONSTRAINT CHK_QuizQuestions_Order
        CHECK (QuestionOrder > 0)
);
GO

-- שומרת תשובות אפשריות לכל שאלה ומסמנת את התשובה הנכונה
CREATE TABLE QuizAnswers
(
    AnswerId INT IDENTITY(1,1) PRIMARY KEY,
    QuestionId INT NOT NULL,
    AnswerText NVARCHAR(300) NOT NULL,
    IsCorrect BIT NOT NULL DEFAULT 0,

    CONSTRAINT FK_QuizAnswers_QuizQuestions
        FOREIGN KEY (QuestionId)
        REFERENCES QuizQuestions(QuestionId)
);
GO

-- שומרת ניסיונות חידון, ציון, מספר תשובות נכונות וזמני ביצוע
CREATE TABLE QuizAttempts
(
    AttemptId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    QuizId INT NOT NULL,
    Score INT NOT NULL DEFAULT 0,
    CorrectAnswers INT NOT NULL DEFAULT 0,
    TotalQuestions INT NOT NULL,
    StartedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL,
    TimeTakenSeconds INT NULL,

    CONSTRAINT FK_QuizAttempts_Users
        FOREIGN KEY (UserId)
        REFERENCES Users(UserId),

    CONSTRAINT FK_QuizAttempts_Quizzes
        FOREIGN KEY (QuizId)
        REFERENCES Quizzes(QuizId),

    CONSTRAINT CHK_QuizAttempts_Score
        CHECK (Score >= 0),

    CONSTRAINT CHK_QuizAttempts_CorrectAnswers
        CHECK (CorrectAnswers >= 0),

    CONSTRAINT CHK_QuizAttempts_TotalQuestions
        CHECK (TotalQuestions > 0),

    CONSTRAINT CHK_QuizAttempts_AnswersRange
        CHECK (CorrectAnswers <= TotalQuestions),

    CONSTRAINT CHK_QuizAttempts_TimeTaken
        CHECK (TimeTakenSeconds IS NULL OR TimeTakenSeconds >= 0)
);
GO

-- 7. נתוני התחלה קבועים

-- מוסיף את תפקידי המערכת ורמות השליטה הקבועות בשפה
INSERT INTO Roles (RoleName)
VALUES
('User'),
('Admin');
GO

INSERT INTO LanguageLevels (LevelName, LevelOrder)
VALUES
('Beginner', 1),
('Intermediate', 2),
('Advanced', 3),
('Native', 4);
GO


------------------------------------------------------------------------------------------



-- 8. פרוצדורות ניהול משתמשים

-- רושמת משתמש חדש לאחר בדיקה שהדוא״ל אינו קיים, ומשייכת אותו כברירת מחדל לתפקיד User
CREATE OR ALTER PROCEDURE sp_RegisterUser
    @FullName NVARCHAR(100),
    @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM Users
        WHERE Email = @Email
    )
    BEGIN
        RAISERROR('Email already exists.', 16, 1);
        RETURN;
    END

    INSERT INTO Users
    (
        FullName,
        Email,
        PasswordHash,
        RoleId
    )
    VALUES
    (
        @FullName,
        @Email,
        @PasswordHash,
        1
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NewUserId;
END;
GO

-- מחזירה את פרטי המשתמש וה־PasswordHash לפי דוא״ל לצורך אימות התחברות
CREATE OR ALTER PROCEDURE sp_LoginUser
    @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserId,
        FullName,
        Email,
        PasswordHash,
        RoleId,
        IsLocked,
        CanShare,
        CreatedAt,
        UpdatedAt,
        LastLoginAt
    FROM Users
    WHERE Email = @Email;
END;
GO

-- מחזירה את פרטי המשתמש ואת שם התפקיד לפי מזהה
CREATE OR ALTER PROCEDURE sp_GetUserById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        U.UserId,
        U.FullName,
        U.Email,
        U.RoleId,
        R.RoleName,
        U.IsLocked,
        U.CanShare,
        U.CreatedAt,
        U.UpdatedAt,
        U.LastLoginAt
    FROM Users U
    INNER JOIN Roles R
        ON U.RoleId = R.RoleId
    WHERE U.UserId = @UserId;
END;
GO

-- מעדכנת שם מלא ודוא״ל ומונעת שימוש בדוא״ל של משתמש אחר
CREATE OR ALTER PROCEDURE sp_UpdateUser
    @UserId INT,
    @FullName NVARCHAR(100),
    @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM Users
        WHERE Email = @Email
          AND UserId <> @UserId
    )
    BEGIN
        RAISERROR('Email already belongs to another user.', 16, 1);
        RETURN;
    END

    UPDATE Users
    SET
        FullName = @FullName,
        Email = @Email,
        UpdatedAt = GETDATE()
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מעדכנת PasswordHash, לאחר בדיקת קיום המשתמש ושהסיסמה החדשה שונה מהנוכחית
CREATE OR ALTER PROCEDURE sp_ChangePassword
    @UserId INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR('User was not found.', 16, 1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
          AND PasswordHash = @NewPasswordHash
    )
    BEGIN
        RAISERROR(
            'New password must be different from the current password.',
            16,
            1
        );

        RETURN;
    END;

    UPDATE Users
    SET
        PasswordHash = @NewPasswordHash,
        UpdatedAt = GETDATE()
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מחזירה את כל המשתמשים עם פרטי התפקיד וההרשאות
CREATE OR ALTER PROCEDURE sp_GetAllUsers
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        U.UserId,
        U.FullName,
        U.Email,
        U.RoleId,
        R.RoleName,
        U.IsLocked,
        U.CanShare,
        U.CreatedAt,
        U.LastLoginAt
    FROM Users U
    INNER JOIN Roles R
        ON U.RoleId = R.RoleId
    ORDER BY U.CreatedAt DESC;
END;
GO

-- נועלת משתמש או מסירה נעילה ומעדכנת UpdatedAt
CREATE OR ALTER PROCEDURE sp_SetUserLockStatus
    @UserId INT,
    @IsLocked BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET
        IsLocked = @IsLocked,
        UpdatedAt = GETDATE()
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מאפשרת או חוסמת הרשאת יצירת שיתופים ומעדכנת UpdatedAt
CREATE OR ALTER PROCEDURE sp_SetUserSharePermission
    @UserId INT,
    @CanShare BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET
        CanShare = @CanShare,
        UpdatedAt = GETDATE()
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מעדכנת את זמן ההתחברות המוצלחת האחרון
CREATE OR ALTER PROCEDURE sp_UpdateLastLogin
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET LastLoginAt = GETDATE()
    WHERE UserId = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מוסיפה רשומת ניסיון התחברות ומחזירה את מזהה הרשומה
CREATE OR ALTER PROCEDURE sp_AddLoginHistory
    @UserId INT = NULL,
    @EmailAttempted NVARCHAR(150),
    @WasSuccessful BIT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO LoginHistory
    (
        UserId,
        EmailAttempted,
        WasSuccessful
    )
    VALUES
    (
        @UserId,
        @EmailAttempted,
        @WasSuccessful
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NewLoginId;
END;
GO

-- מוחקת משתמש ואת הרשומות התלויות בו בתוך טרנזקציה
CREATE OR ALTER PROCEDURE sp_DeleteUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR('User was not found.', 16, 1);
        RETURN;
    END;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM UserLanguages
        WHERE UserId = @UserId;

        DELETE FROM UserPreferredContinents
        WHERE UserId = @UserId;

        DELETE FROM LoginHistory
        WHERE UserId = @UserId;

        DELETE FROM QuizAttempts
        WHERE UserId = @UserId;

        DELETE FROM Shares
        WHERE UserId = @UserId;

        DELETE FROM UserCountryLists
        WHERE UserId = @UserId;

        DELETE FROM Users
        WHERE UserId = @UserId;

        DECLARE @RowsAffected INT =
            @@ROWCOUNT;

        COMMIT TRANSACTION;

        SELECT
            @RowsAffected AS RowsAffected;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        DECLARE @ErrorMessage NVARCHAR(4000);

        SET @ErrorMessage =
            ERROR_MESSAGE();

        RAISERROR(
            @ErrorMessage,
            16,
            1
        );
    END CATCH;
END;
GO

-- 9. פרוצדורות לוח מנהל

-- מחזירה נתוני לוח מנהל: התחברויות יומיות, מדינות פעילות, מדינות שמורות ושיתופים פעילים
CREATE OR ALTER PROCEDURE sp_GetAdminStatistics
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (
            SELECT COUNT(*)
            FROM LoginHistory
            WHERE WasSuccessful = 1
              AND CAST(LoginDate AS DATE) =
                  CAST(GETDATE() AS DATE)
        ) AS DailyLogins,

        (
            SELECT COUNT(*)
            FROM Countries
            WHERE IsActive = 1
        ) AS ImportedCountries,

        (
            SELECT COUNT(*)
            FROM UserCountryLists
        ) AS SavedCountries,

        (
            SELECT COUNT(*)
            FROM Shares
            WHERE IsDeleted = 0
        ) AS CreatedShares;
END;
GO

-- 10. פרוצדורות העדפות משתמש ונתוני עזר

-- מחזירה את כל היבשות לפי שם
CREATE OR ALTER PROCEDURE sp_GetAllContinents
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        ContinentId,
        ContinentName
    FROM Continents
    ORDER BY ContinentName;
END;
GO

-- מחזירה את כל השפות לפי שם
CREATE OR ALTER PROCEDURE sp_GetAllLanguages
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        LanguageId,
        LanguageCode,
        LanguageName
    FROM Languages
    ORDER BY LanguageName;
END;
GO

-- מחזירה את רמות השפה לפי LevelOrder
CREATE OR ALTER PROCEDURE sp_GetAllLanguageLevels
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        LevelId,
        LevelName,
        LevelOrder
    FROM LanguageLevels
    ORDER BY LevelOrder;
END;
GO

-- מחזירה את היבשות המועדפות של משתמש
CREATE OR ALTER PROCEDURE sp_GetUserPreferredContinents
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UPC.UserId,
        UPC.ContinentId,
        C.ContinentName,
        UPC.AddedAt
    FROM UserPreferredContinents UPC
    INNER JOIN Continents C
        ON UPC.ContinentId = C.ContinentId
    WHERE UPC.UserId = @UserId
    ORDER BY C.ContinentName;
END;
GO

-- מוסיפה יבשת מועדפת לאחר בדיקת המשתמש, היבשת והיעדר כפילות
CREATE OR ALTER PROCEDURE sp_AddUserPreferredContinent
    @UserId INT,
    @ContinentId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR('User was not found.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Continents
        WHERE ContinentId = @ContinentId
    )
    BEGIN
        RAISERROR('Continent was not found.', 16, 1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM UserPreferredContinents
        WHERE UserId = @UserId
          AND ContinentId = @ContinentId
    )
    BEGIN
        RAISERROR('Continent is already selected by the user.', 16, 1);
        RETURN;
    END;

    INSERT INTO UserPreferredContinents
    (
        UserId,
        ContinentId
    )
    VALUES
    (
        @UserId,
        @ContinentId
    );

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מסירה יבשת מרשימת ההעדפות של המשתמש
CREATE OR ALTER PROCEDURE sp_DeleteUserPreferredContinent
    @UserId INT,
    @ContinentId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM UserPreferredContinents
    WHERE UserId = @UserId
      AND ContinentId = @ContinentId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מחזירה את שפות המשתמש, רמות השליטה ותאריכי ההוספה והעדכון
CREATE OR ALTER PROCEDURE sp_GetUserLanguages
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UL.UserId,
        UL.LanguageId,
        L.LanguageCode,
        L.LanguageName,
        UL.LevelId,
        LL.LevelName,
        LL.LevelOrder,
        UL.AddedAt,
        UL.UpdatedAt
    FROM UserLanguages UL
    INNER JOIN Languages L
        ON UL.LanguageId = L.LanguageId
    INNER JOIN LanguageLevels LL
        ON UL.LevelId = LL.LevelId
    WHERE UL.UserId = @UserId
    ORDER BY
        L.LanguageName,
        LL.LevelOrder;
END;
GO

-- מוסיפה שפה למשתמש או מעדכנת את רמת השליטה אם הקשר כבר קיים
CREATE OR ALTER PROCEDURE sp_AddOrUpdateUserLanguage
    @UserId INT,
    @LanguageId INT,
    @LevelId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR('User was not found.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Languages
        WHERE LanguageId = @LanguageId
    )
    BEGIN
        RAISERROR('Language was not found.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM LanguageLevels
        WHERE LevelId = @LevelId
    )
    BEGIN
        RAISERROR('Language level was not found.', 16, 1);
        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM UserLanguages
        WHERE UserId = @UserId
          AND LanguageId = @LanguageId
    )
    BEGIN
        UPDATE UserLanguages
        SET
            LevelId = @LevelId,
            UpdatedAt = GETDATE()
        WHERE UserId = @UserId
          AND LanguageId = @LanguageId;
    END
    ELSE
    BEGIN
        INSERT INTO UserLanguages
        (
            UserId,
            LanguageId,
            LevelId
        )
        VALUES
        (
            @UserId,
            @LanguageId,
            @LevelId
        );
    END;

    SELECT 1 AS RowsAffected;
END;
GO

-- מסירה שפה מרשימת השפות של המשתמש
CREATE OR ALTER PROCEDURE sp_DeleteUserLanguage
    @UserId INT,
    @LanguageId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM UserLanguages
    WHERE UserId = @UserId
      AND LanguageId = @LanguageId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- 11. פרוצדורות ייבוא מדינות

-- מחזירה יבשת קיימת או מוסיפה יבשת חדשה ומחזירה את מזהה היבשת
CREATE OR ALTER PROCEDURE sp_UpsertContinent
    @ContinentName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ContinentId INT;

    SELECT @ContinentId = ContinentId
    FROM Continents
    WHERE ContinentName = @ContinentName;

    IF @ContinentId IS NULL
    BEGIN
        INSERT INTO Continents (ContinentName)
        VALUES (@ContinentName);

        SET @ContinentId = CAST(SCOPE_IDENTITY() AS INT);
    END;

    SELECT @ContinentId AS ContinentId;
END;
GO

-- מוסיפה או מעדכנת שפה לפי קוד השפה ומחזירה את מזהה השפה
CREATE OR ALTER PROCEDURE sp_UpsertLanguage
    @LanguageCode NVARCHAR(10),
    @LanguageName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @LanguageId INT;

    SELECT @LanguageId = LanguageId
    FROM Languages
    WHERE LanguageCode = @LanguageCode;

    IF @LanguageId IS NULL
    BEGIN
        INSERT INTO Languages (LanguageCode, LanguageName)
        VALUES (@LanguageCode, @LanguageName);

        SET @LanguageId = CAST(SCOPE_IDENTITY() AS INT);
    END
    ELSE
    BEGIN
        UPDATE Languages
        SET LanguageName = @LanguageName
        WHERE LanguageId = @LanguageId;
    END;

    SELECT @LanguageId AS LanguageId;
END;
GO

-- מוסיפה או מעדכנת מטבע לפי קוד המטבע
CREATE OR ALTER PROCEDURE sp_UpsertCurrency
    @CurrencyCode NVARCHAR(10),
    @CurrencyName NVARCHAR(100),
    @CurrencySymbol NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM Currencies
        WHERE CurrencyCode = @CurrencyCode
    )
    BEGIN
        UPDATE Currencies
        SET
            CurrencyName = @CurrencyName,
            CurrencySymbol = @CurrencySymbol
        WHERE CurrencyCode = @CurrencyCode;
    END
    ELSE
    BEGIN
        INSERT INTO Currencies
        (
            CurrencyCode,
            CurrencyName,
            CurrencySymbol
        )
        VALUES
        (
            @CurrencyCode,
            @CurrencyName,
            @CurrencySymbol
        );
    END;

    SELECT @CurrencyCode AS CurrencyCode;
END;
GO

-- מוסיפה או מעדכנת מדינה לפי קוד CCA3 ומחזירה את מזהה המדינה
CREATE OR ALTER PROCEDURE sp_UpsertCountry
    @Cca2 NVARCHAR(2) = NULL,
    @Cca3 NVARCHAR(3),
    @CommonName NVARCHAR(100),
    @OfficialName NVARCHAR(200) = NULL,
    @Capital NVARCHAR(150) = NULL,
    @ContinentId INT = NULL,
    @Region NVARCHAR(100) = NULL,
    @Subregion NVARCHAR(100) = NULL,
    @Population BIGINT,
    @Area FLOAT,
    @FlagUrl NVARCHAR(500) = NULL,
    @GoogleMapsUrl NVARCHAR(500) = NULL,
    @Latitude DECIMAL(9,6) = NULL,
    @Longitude DECIMAL(9,6) = NULL,
    @IsIndependent BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CountryId INT;

    SELECT @CountryId = CountryId
    FROM Countries
    WHERE Cca3 = @Cca3;

    IF @CountryId IS NULL
    BEGIN
        INSERT INTO Countries
        (
            Cca2,
            Cca3,
            CommonName,
            OfficialName,
            Capital,
            ContinentId,
            Region,
            Subregion,
            Population,
            Area,
            FlagUrl,
            GoogleMapsUrl,
            Latitude,
            Longitude,
            IsIndependent,
            IsActive
        )
        VALUES
        (
            @Cca2,
            @Cca3,
            @CommonName,
            @OfficialName,
            @Capital,
            @ContinentId,
            @Region,
            @Subregion,
            @Population,
            @Area,
            @FlagUrl,
            @GoogleMapsUrl,
            @Latitude,
            @Longitude,
            @IsIndependent,
            1
        );

        SET @CountryId =
            CAST(SCOPE_IDENTITY() AS INT);
    END
    ELSE
    BEGIN
        UPDATE Countries
        SET
            Cca2 = @Cca2,
            CommonName = @CommonName,
            OfficialName = @OfficialName,
            Capital = @Capital,
            ContinentId = @ContinentId,
            Region = @Region,
            Subregion = @Subregion,
            Population = @Population,
            Area = @Area,
            FlagUrl = @FlagUrl,
            GoogleMapsUrl = @GoogleMapsUrl,
            Latitude = @Latitude,
            Longitude = @Longitude,
            IsIndependent = @IsIndependent,
            IsActive = 1,
            UpdatedAt = GETDATE()
        WHERE CountryId = @CountryId;
    END;

    SELECT @CountryId AS CountryId;
END;
GO

-- מוחקת את קשרי השפות והמטבעות של מדינה לפני יצירת קשרים מעודכנים
CREATE OR ALTER PROCEDURE sp_ClearCountryRelations
    @CountryId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM CountryLanguages
    WHERE CountryId = @CountryId;

    DELETE FROM CountryCurrencies
    WHERE CountryId = @CountryId;

    SELECT 1 AS Result;
END;
GO

-- יוצרת קשר בין מדינה לשפה, רק אם שני הצדדים קיימים והקשר אינו קיים
CREATE OR ALTER PROCEDURE sp_AddCountryLanguage
    @CountryId INT,
    @LanguageId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
    )
    BEGIN
        RAISERROR(
            'Country was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Languages
        WHERE LanguageId = @LanguageId
    )
    BEGIN
        RAISERROR(
            'Language was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM CountryLanguages
        WHERE CountryId = @CountryId
          AND LanguageId = @LanguageId
    )
    BEGIN
        INSERT INTO CountryLanguages
        (
            CountryId,
            LanguageId
        )
        VALUES
        (
            @CountryId,
            @LanguageId
        );
    END;

    SELECT 1 AS RowsAffected;
END;
GO

-- יוצרת קשר בין מדינה למטבע, רק אם שני הצדדים קיימים והקשר אינו קיים
CREATE OR ALTER PROCEDURE sp_AddCountryCurrency
    @CountryId INT,
    @CurrencyCode NVARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
    )
    BEGIN
        RAISERROR(
            'Country was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Currencies
        WHERE CurrencyCode = @CurrencyCode
    )
    BEGIN
        RAISERROR(
            'Currency was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM CountryCurrencies
        WHERE CountryId = @CountryId
          AND CurrencyCode = @CurrencyCode
    )
    BEGIN
        INSERT INTO CountryCurrencies
        (
            CountryId,
            CurrencyCode
        )
        VALUES
        (
            @CountryId,
            @CurrencyCode
        );
    END;

    SELECT 1 AS RowsAffected;
END;
GO

-- 12. פרוצדורות ניהול מדינות

-- מחזירה מדינות פעילות עם חיפוש, סינונים ומיון
CREATE OR ALTER PROCEDURE sp_GetCountries
    @SearchText NVARCHAR(200) = NULL,
    @ContinentId INT = NULL,
    @LanguageId INT = NULL,
    @CurrencyCode NVARCHAR(10) = NULL,
    @MinPopulation BIGINT = NULL,
    @MaxPopulation BIGINT = NULL,
    @MinArea FLOAT = NULL,
    @MaxArea FLOAT = NULL,
    @SortBy NVARCHAR(30) = 'name',
    @SortDirection NVARCHAR(4) = 'asc'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        C.CountryId,
        C.Cca2,
        C.Cca3,
        C.CommonName,
        C.OfficialName,
        C.Capital,
        C.ContinentId,
        CT.ContinentName,
        C.Region,
        C.Subregion,
        C.Population,
        C.Area,
        C.FlagUrl,
        C.GoogleMapsUrl,
        C.Latitude,
        C.Longitude,
        C.IsIndependent,
        C.IsActive,
        C.ImportedAt,
        C.UpdatedAt
    FROM Countries C

    LEFT JOIN Continents CT
        ON C.ContinentId = CT.ContinentId

    WHERE C.IsActive = 1

      AND
      (
          @SearchText IS NULL
          OR @SearchText = ''
          OR C.CommonName LIKE '%' + @SearchText + '%'
          OR C.OfficialName LIKE '%' + @SearchText + '%'
          OR C.Capital LIKE '%' + @SearchText + '%'
          OR C.Cca2 LIKE '%' + @SearchText + '%'
          OR C.Cca3 LIKE '%' + @SearchText + '%'
      )

      AND
      (
          @ContinentId IS NULL
          OR C.ContinentId = @ContinentId
      )

      AND
      (
          @LanguageId IS NULL
          OR EXISTS
          (
              SELECT 1
              FROM CountryLanguages CL
              WHERE CL.CountryId = C.CountryId
                AND CL.LanguageId = @LanguageId
          )
      )

      AND
      (
          @CurrencyCode IS NULL
          OR @CurrencyCode = ''
          OR EXISTS
          (
              SELECT 1
              FROM CountryCurrencies CC
              WHERE CC.CountryId = C.CountryId
                AND CC.CurrencyCode = @CurrencyCode
          )
      )

      AND
      (
          @MinPopulation IS NULL
          OR C.Population >= @MinPopulation
      )

      AND
      (
          @MaxPopulation IS NULL
          OR C.Population <= @MaxPopulation
      )

      AND
      (
          @MinArea IS NULL
          OR C.Area >= @MinArea
      )

      AND
      (
          @MaxArea IS NULL
          OR C.Area <= @MaxArea
      )

    ORDER BY
        CASE
            WHEN @SortBy = 'name'
             AND @SortDirection = 'asc'
            THEN C.CommonName
        END ASC,

        CASE
            WHEN @SortBy = 'name'
             AND @SortDirection = 'desc'
            THEN C.CommonName
        END DESC,

        CASE
            WHEN @SortBy = 'population'
             AND @SortDirection = 'asc'
            THEN C.Population
        END ASC,

        CASE
            WHEN @SortBy = 'population'
             AND @SortDirection = 'desc'
            THEN C.Population
        END DESC,

        CASE
            WHEN @SortBy = 'area'
             AND @SortDirection = 'asc'
            THEN C.Area
        END ASC,

        CASE
            WHEN @SortBy = 'area'
             AND @SortDirection = 'desc'
            THEN C.Area
        END DESC,

        C.CommonName ASC;
END;
GO

-- מחזירה שלוש קבוצות נתונים: פרטי מדינה, שפות ומטבעות
CREATE OR ALTER PROCEDURE sp_GetCountryById
    @CountryId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        C.CountryId,
        C.Cca2,
        C.Cca3,
        C.CommonName,
        C.OfficialName,
        C.Capital,
        C.ContinentId,
        CT.ContinentName,
        C.Region,
        C.Subregion,
        C.Population,
        C.Area,
        C.FlagUrl,
        C.GoogleMapsUrl,
        C.Latitude,
        C.Longitude,
        C.IsIndependent,
        C.IsActive,
        C.ImportedAt,
        C.UpdatedAt
    FROM Countries C

    LEFT JOIN Continents CT
        ON C.ContinentId = CT.ContinentId

    WHERE C.CountryId = @CountryId
      AND C.IsActive = 1;

    SELECT
        L.LanguageId,
        L.LanguageCode,
        L.LanguageName
    FROM CountryLanguages CL

    INNER JOIN Languages L
        ON CL.LanguageId = L.LanguageId

    WHERE CL.CountryId = @CountryId

    ORDER BY L.LanguageName;

    SELECT
        CU.CurrencyCode,
        CU.CurrencyName,
        CU.CurrencySymbol
    FROM CountryCurrencies CC

    INNER JOIN Currencies CU
        ON CC.CurrencyCode = CU.CurrencyCode

    WHERE CC.CountryId = @CountryId

    ORDER BY CU.CurrencyName;
END;
GO

-- מוסיפה מדינה לאחר בדיקת CCA3 ייחודי וקיום היבשת
CREATE OR ALTER PROCEDURE sp_CreateCountry
    @Cca2 NVARCHAR(2) = NULL,
    @Cca3 NVARCHAR(3),
    @CommonName NVARCHAR(100),
    @OfficialName NVARCHAR(200) = NULL,
    @Capital NVARCHAR(150) = NULL,
    @ContinentId INT = NULL,
    @Region NVARCHAR(100) = NULL,
    @Subregion NVARCHAR(100) = NULL,
    @Population BIGINT,
    @Area FLOAT,
    @FlagUrl NVARCHAR(500) = NULL,
    @GoogleMapsUrl NVARCHAR(500) = NULL,
    @Latitude DECIMAL(9,6) = NULL,
    @Longitude DECIMAL(9,6) = NULL,
    @IsIndependent BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE Cca3 = @Cca3
    )
    BEGIN
        RAISERROR(
            'Country with this CCA3 already exists.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ContinentId IS NOT NULL
        AND NOT EXISTS
        (
            SELECT 1
            FROM Continents
            WHERE ContinentId = @ContinentId
        )
    )
    BEGIN
        RAISERROR(
            'Continent was not found.',
            16,
            1
        );

        RETURN;
    END;

    INSERT INTO Countries
    (
        Cca2,
        Cca3,
        CommonName,
        OfficialName,
        Capital,
        ContinentId,
        Region,
        Subregion,
        Population,
        Area,
        FlagUrl,
        GoogleMapsUrl,
        Latitude,
        Longitude,
        IsIndependent,
        IsActive
    )
    VALUES
    (
        @Cca2,
        @Cca3,
        @CommonName,
        @OfficialName,
        @Capital,
        @ContinentId,
        @Region,
        @Subregion,
        @Population,
        @Area,
        @FlagUrl,
        @GoogleMapsUrl,
        @Latitude,
        @Longitude,
        @IsIndependent,
        1
    );

    SELECT
        CAST(SCOPE_IDENTITY() AS INT)
        AS NewCountryId;
END;
GO

-- מעדכנת מדינה, בודקת קיום וייחודיות CCA3 ומעדכנת UpdatedAt
CREATE OR ALTER PROCEDURE sp_UpdateCountry
    @CountryId INT,
    @Cca2 NVARCHAR(2) = NULL,
    @Cca3 NVARCHAR(3),
    @CommonName NVARCHAR(100),
    @OfficialName NVARCHAR(200) = NULL,
    @Capital NVARCHAR(150) = NULL,
    @ContinentId INT = NULL,
    @Region NVARCHAR(100) = NULL,
    @Subregion NVARCHAR(100) = NULL,
    @Population BIGINT,
    @Area FLOAT,
    @FlagUrl NVARCHAR(500) = NULL,
    @GoogleMapsUrl NVARCHAR(500) = NULL,
    @Latitude DECIMAL(9,6) = NULL,
    @Longitude DECIMAL(9,6) = NULL,
    @IsIndependent BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
    )
    BEGIN
        RAISERROR(
            'Country was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE Cca3 = @Cca3
          AND CountryId <> @CountryId
    )
    BEGIN
        RAISERROR(
            'CCA3 belongs to another country.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ContinentId IS NOT NULL
        AND NOT EXISTS
        (
            SELECT 1
            FROM Continents
            WHERE ContinentId = @ContinentId
        )
    )
    BEGIN
        RAISERROR(
            'Continent was not found.',
            16,
            1
        );

        RETURN;
    END;

    UPDATE Countries
    SET
        Cca2 = @Cca2,
        Cca3 = @Cca3,
        CommonName = @CommonName,
        OfficialName = @OfficialName,
        Capital = @Capital,
        ContinentId = @ContinentId,
        Region = @Region,
        Subregion = @Subregion,
        Population = @Population,
        Area = @Area,
        FlagUrl = @FlagUrl,
        GoogleMapsUrl = @GoogleMapsUrl,
        Latitude = @Latitude,
        Longitude = @Longitude,
        IsIndependent = @IsIndependent,
        IsActive = 1,
        UpdatedAt = GETDATE()
    WHERE CountryId = @CountryId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מבצעת מחיקה לוגית באמצעות IsActive = 0
CREATE OR ALTER PROCEDURE sp_DeleteCountry
    @CountryId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
          AND IsActive = 1
    )
    BEGIN
        RAISERROR(
            'Country was not found or is already deleted.',
            16,
            1
        );

        RETURN;
    END;

    UPDATE Countries
    SET
        IsActive = 0,
        UpdatedAt = GETDATE()
    WHERE CountryId = @CountryId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- 13. פרוצדורות רשימות אישיות

-- מחזירה את רשימות המדינות של המשתמש, עם אפשרות סינון לפי סוג רשימה
CREATE OR ALTER PROCEDURE sp_GetUserCountryLists
    @UserId INT,
    @ListType TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR(
            'User was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ListType IS NOT NULL
        AND @ListType NOT IN (1, 2)
    )
    BEGIN
        RAISERROR(
            'List type must be 1 or 2.',
            16,
            1
        );

        RETURN;
    END;

    SELECT
        UCL.UserId,
        UCL.CountryId,
        UCL.ListType,
        UCL.AddedAt,

        C.Cca2,
        C.Cca3,
        C.CommonName,
        C.OfficialName,
        C.Capital,
        C.ContinentId,
        CT.ContinentName,
        C.Region,
        C.Subregion,
        C.Population,
        C.Area,
        C.FlagUrl,
        C.GoogleMapsUrl,
        C.Latitude,
        C.Longitude,
        C.IsIndependent

    FROM UserCountryLists UCL

    INNER JOIN Countries C
        ON UCL.CountryId = C.CountryId

    LEFT JOIN Continents CT
        ON C.ContinentId = CT.ContinentId

    WHERE UCL.UserId = @UserId

      AND C.IsActive = 1

      AND
      (
          @ListType IS NULL
          OR UCL.ListType = @ListType
      )

    ORDER BY UCL.AddedAt DESC;
END;
GO

-- בודקת האם מדינה שמורה אצל משתמש ובאיזה סוג רשימה
CREATE OR ALTER PROCEDURE sp_GetUserCountryListStatus
    @UserId INT,
    @CountryId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        UserId,
        CountryId,
        ListType,
        AddedAt
    FROM UserCountryLists
    WHERE UserId = @UserId
      AND CountryId = @CountryId;
END;
GO

-- מוסיפה מדינה לרשימה או מעבירה אותה בין סוגי הרשימות
CREATE OR ALTER PROCEDURE sp_AddOrUpdateUserCountryList
    @UserId INT,
    @CountryId INT,
    @ListType TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    IF @ListType NOT IN (1, 2)
    BEGIN
        RAISERROR(
            'List type must be 1 or 2.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR(
            'User was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
          AND IsActive = 1
    )
    BEGIN
        RAISERROR(
            'Country was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM UserCountryLists
        WHERE UserId = @UserId
          AND CountryId = @CountryId
    )
    BEGIN
        UPDATE UserCountryLists
        SET
            ListType = @ListType,
            AddedAt = GETDATE()
        WHERE UserId = @UserId
          AND CountryId = @CountryId;
    END
    ELSE
    BEGIN
        INSERT INTO UserCountryLists
        (
            UserId,
            CountryId,
            ListType
        )
        VALUES
        (
            @UserId,
            @CountryId,
            @ListType
        );
    END;

    SELECT 1 AS RowsAffected;
END;
GO

-- מסירה מדינה מרשימות המשתמש.
CREATE OR ALTER PROCEDURE sp_DeleteUserCountryList
    @UserId INT,
    @CountryId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM UserCountryLists
    WHERE UserId = @UserId
      AND CountryId = @CountryId;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- 14. פרוצדורות שיתופים

-- מחזירה שיתופים פעילים עם חיפוש, סינונים ומיון לפי תאריך
CREATE OR ALTER PROCEDURE sp_GetShares
    @SearchText NVARCHAR(200) = NULL,
    @CountryId INT = NULL,
    @UserId INT = NULL,
    @ShareType TINYINT = NULL,
    @Rating TINYINT = NULL,
    @SortDirection NVARCHAR(4) = 'desc'
AS
BEGIN
    SET NOCOUNT ON;

    IF
    (
        @ShareType IS NOT NULL
        AND @ShareType NOT IN (1, 2, 3)
    )
    BEGIN
        RAISERROR(
            'Share type must be 1, 2 or 3.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @Rating IS NOT NULL
        AND @Rating NOT BETWEEN 1 AND 5
    )
    BEGIN
        RAISERROR(
            'Rating must be between 1 and 5.',
            16,
            1
        );

        RETURN;
    END;

    SELECT
        S.ShareId,
        S.UserId,
        U.FullName,
        U.RoleId,
        R.RoleName,
        U.CanShare,

        S.CountryId,
        C.Cca2,
        C.Cca3,
        C.CommonName,
        C.OfficialName,
        C.Capital,
        C.FlagUrl,
        C.ContinentId,
        CT.ContinentName,

        S.ShareType,
        S.Content,
        S.Rating,
        S.CreatedAt,
        S.UpdatedAt,
        S.IsDeleted

    FROM Shares S

    INNER JOIN Users U
        ON S.UserId = U.UserId

    INNER JOIN Roles R
        ON U.RoleId = R.RoleId

    INNER JOIN Countries C
        ON S.CountryId = C.CountryId

    LEFT JOIN Continents CT
        ON C.ContinentId = CT.ContinentId

    WHERE S.IsDeleted = 0

      AND C.IsActive = 1

      AND
      (
          @SearchText IS NULL
          OR @SearchText = ''
          OR S.Content LIKE '%' + @SearchText + '%'
          OR U.FullName LIKE '%' + @SearchText + '%'
          OR C.CommonName LIKE '%' + @SearchText + '%'
          OR C.OfficialName LIKE '%' + @SearchText + '%'
      )

      AND
      (
          @CountryId IS NULL
          OR S.CountryId = @CountryId
      )

      AND
      (
          @UserId IS NULL
          OR S.UserId = @UserId
      )

      AND
      (
          @ShareType IS NULL
          OR S.ShareType = @ShareType
      )

      AND
      (
          @Rating IS NULL
          OR S.Rating = @Rating
      )

    ORDER BY
        CASE
            WHEN LOWER(@SortDirection) = 'asc'
            THEN S.CreatedAt
        END ASC,

        CASE
            WHEN LOWER(@SortDirection) <> 'asc'
            THEN S.CreatedAt
        END DESC,

        S.ShareId DESC;
END;
GO

-- מחזירה שיתוף פעיל בודד עם פרטי המשתמש והמדינה
CREATE OR ALTER PROCEDURE sp_GetShareById
    @ShareId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        S.ShareId,
        S.UserId,
        U.FullName,
        U.RoleId,
        R.RoleName,
        U.CanShare,

        S.CountryId,
        C.Cca2,
        C.Cca3,
        C.CommonName,
        C.OfficialName,
        C.Capital,
        C.FlagUrl,
        C.ContinentId,
        CT.ContinentName,

        S.ShareType,
        S.Content,
        S.Rating,
        S.CreatedAt,
        S.UpdatedAt,
        S.IsDeleted

    FROM Shares S

    INNER JOIN Users U
        ON S.UserId = U.UserId

    INNER JOIN Roles R
        ON U.RoleId = R.RoleId

    INNER JOIN Countries C
        ON S.CountryId = C.CountryId

    LEFT JOIN Continents CT
        ON C.ContinentId = CT.ContinentId

    WHERE S.ShareId = @ShareId
      AND S.IsDeleted = 0
      AND C.IsActive = 1;
END;
GO

-- יוצרת שיתוף לאחר בדיקות משתמש, הרשאה, מדינה, סוג, תוכן ודירוג
CREATE OR ALTER PROCEDURE sp_CreateShare
    @UserId INT,
    @CountryId INT,
    @ShareType TINYINT,
    @Content NVARCHAR(1000),
    @Rating TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
    )
    BEGIN
        RAISERROR(
            'User was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
          AND IsLocked = 1
    )
    BEGIN
        RAISERROR(
            'User account is locked.',
            16,
            1
        );

        RETURN;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM Users
        WHERE UserId = @UserId
          AND CanShare = 0
    )
    BEGIN
        RAISERROR(
            'User is not allowed to publish shares.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
          AND IsActive = 1
    )
    BEGIN
        RAISERROR(
            'Country was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF @ShareType NOT IN (1, 2, 3)
    BEGIN
        RAISERROR(
            'Share type must be 1, 2 or 3.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @Content IS NULL
        OR LEN(LTRIM(RTRIM(@Content))) = 0
    )
    BEGIN
        RAISERROR(
            'Share content is required.',
            16,
            1
        );

        RETURN;
    END;

    IF LEN(@Content) > 1000
    BEGIN
        RAISERROR(
            'Share content may contain up to 1000 characters.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @Rating IS NOT NULL
        AND @Rating NOT BETWEEN 1 AND 5
    )
    BEGIN
        RAISERROR(
            'Rating must be between 1 and 5.',
            16,
            1
        );

        RETURN;
    END;

    INSERT INTO Shares
    (
        UserId,
        CountryId,
        ShareType,
        Content,
        Rating
    )
    VALUES
    (
        @UserId,
        @CountryId,
        @ShareType,
        LTRIM(RTRIM(@Content)),
        @Rating
    );

    SELECT
        CAST(SCOPE_IDENTITY() AS INT)
        AS NewShareId;
END;
GO

-- מעדכנת שיתוף לבעלים או למנהל בלבד, לאחר בדיקות הרשאה ותקינות
CREATE OR ALTER PROCEDURE sp_UpdateShare
    @ShareId INT,
    @ActorUserId INT,
    @CountryId INT,
    @ShareType TINYINT,
    @Content NVARCHAR(1000),
    @Rating TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ShareOwnerId INT;
    DECLARE @ActorRoleName NVARCHAR(50);
    DECLARE @ActorCanShare BIT;
    DECLARE @ActorIsLocked BIT;

    SELECT
        @ShareOwnerId = UserId
    FROM Shares
    WHERE ShareId = @ShareId
      AND IsDeleted = 0;

    IF @ShareOwnerId IS NULL
    BEGIN
        RAISERROR(
            'Share was not found.',
            16,
            1
        );

        RETURN;
    END;

    SELECT
        @ActorRoleName = R.RoleName,
        @ActorCanShare = U.CanShare,
        @ActorIsLocked = U.IsLocked
    FROM Users U

    INNER JOIN Roles R
        ON U.RoleId = R.RoleId

    WHERE U.UserId = @ActorUserId;

    IF @ActorRoleName IS NULL
    BEGIN
        RAISERROR(
            'User was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF @ActorIsLocked = 1
    BEGIN
        RAISERROR(
            'User account is locked.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ActorUserId <> @ShareOwnerId
        AND @ActorRoleName <> 'Admin'
    )
    BEGIN
        RAISERROR(
            'User is not allowed to update this share.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ActorRoleName <> 'Admin'
        AND @ActorCanShare = 0
    )
    BEGIN
        RAISERROR(
            'User is not allowed to publish shares.',
            16,
            1
        );

        RETURN;
    END;

    IF NOT EXISTS
    (
        SELECT 1
        FROM Countries
        WHERE CountryId = @CountryId
          AND IsActive = 1
    )
    BEGIN
        RAISERROR(
            'Country was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF @ShareType NOT IN (1, 2, 3)
    BEGIN
        RAISERROR(
            'Share type must be 1, 2 or 3.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @Content IS NULL
        OR LEN(LTRIM(RTRIM(@Content))) = 0
    )
    BEGIN
        RAISERROR(
            'Share content is required.',
            16,
            1
        );

        RETURN;
    END;

    IF LEN(@Content) > 1000
    BEGIN
        RAISERROR(
            'Share content may contain up to 1000 characters.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @Rating IS NOT NULL
        AND @Rating NOT BETWEEN 1 AND 5
    )
    BEGIN
        RAISERROR(
            'Rating must be between 1 and 5.',
            16,
            1
        );

        RETURN;
    END;

    UPDATE Shares
    SET
        CountryId = @CountryId,
        ShareType = @ShareType,
        Content = LTRIM(RTRIM(@Content)),
        Rating = @Rating,
        UpdatedAt = GETDATE()
    WHERE ShareId = @ShareId
      AND IsDeleted = 0;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- מבצעת מחיקה לוגית של שיתוף לבעלים או למנהל בלבד
CREATE OR ALTER PROCEDURE sp_DeleteShare
    @ShareId INT,
    @ActorUserId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ShareOwnerId INT;
    DECLARE @ActorRoleName NVARCHAR(50);
    DECLARE @ActorCanShare BIT;
    DECLARE @ActorIsLocked BIT;

    SELECT
        @ShareOwnerId = UserId
    FROM Shares
    WHERE ShareId = @ShareId
      AND IsDeleted = 0;

    IF @ShareOwnerId IS NULL
    BEGIN
        RAISERROR(
            'Share was not found or is already deleted.',
            16,
            1
        );

        RETURN;
    END;

    SELECT
        @ActorRoleName = R.RoleName,
        @ActorCanShare = U.CanShare,
        @ActorIsLocked = U.IsLocked
    FROM Users U

    INNER JOIN Roles R
        ON U.RoleId = R.RoleId

    WHERE U.UserId = @ActorUserId;

    IF @ActorRoleName IS NULL
    BEGIN
        RAISERROR(
            'User was not found.',
            16,
            1
        );

        RETURN;
    END;

    IF @ActorIsLocked = 1
    BEGIN
        RAISERROR(
            'User account is locked.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ActorUserId <> @ShareOwnerId
        AND @ActorRoleName <> 'Admin'
    )
    BEGIN
        RAISERROR(
            'User is not allowed to delete this share.',
            16,
            1
        );

        RETURN;
    END;

    IF
    (
        @ActorRoleName <> 'Admin'
        AND @ActorCanShare = 0
    )
    BEGIN
        RAISERROR(
            'User is not allowed to publish shares.',
            16,
            1
        );

        RETURN;
    END;

    UPDATE Shares
    SET
        IsDeleted = 1,
        UpdatedAt = GETDATE()
    WHERE ShareId = @ShareId
      AND IsDeleted = 0;

    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO
