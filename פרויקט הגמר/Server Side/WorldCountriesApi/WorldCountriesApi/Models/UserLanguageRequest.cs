namespace WorldCountriesApi.Models
{
    public class UserLanguageRequest
    {
        int languageId;
        int levelId;

        public UserLanguageRequest()
        {
        }

        public UserLanguageRequest(int languageId, int levelId)
        {
            LanguageId = languageId;
            LevelId = levelId;
        }

        public int LanguageId
        {
            get => languageId;
            set => languageId = value;
        }

        public int LevelId
        {
            get => levelId;
            set => levelId = value;
        }
    }
}