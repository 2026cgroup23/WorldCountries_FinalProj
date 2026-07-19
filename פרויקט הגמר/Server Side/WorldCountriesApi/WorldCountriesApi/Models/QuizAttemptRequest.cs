namespace WorldCountriesApi.Models
{
    public class QuizAttemptRequest
    {
        // "clash" or "mystery"
        public string Game { get; set; } = string.Empty;

        public int UserId { get; set; }

        public int Score { get; set; }

        public int CorrectAnswers { get; set; }

        public int TotalQuestions { get; set; }

        public int TimeTakenSeconds { get; set; }
    }
}
