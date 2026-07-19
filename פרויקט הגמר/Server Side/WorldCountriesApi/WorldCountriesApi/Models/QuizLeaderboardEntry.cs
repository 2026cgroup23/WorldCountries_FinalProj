namespace WorldCountriesApi.Models
{
    public class QuizLeaderboardEntry
    {
        public int UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public int BestScore { get; set; }

        public int Attempts { get; set; }
    }
}
