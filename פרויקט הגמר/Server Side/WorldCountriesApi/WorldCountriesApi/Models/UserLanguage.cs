namespace WorldCountriesApi.Models
{
    public class UserLanguage
    {
        public int UserId { get; set; }

        public int LanguageId { get; set; }

        public string LanguageCode { get; set; } = "";

        public string LanguageName { get; set; } = "";

        public int LevelId { get; set; }

        public string LevelName { get; set; } = "";

        public int LevelOrder { get; set; }

        public DateTime AddedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}