namespace WorldCountriesApi.Models
{
    public class Language
    {
        int languageId;
        string languageCode = "";
        string languageName = "";

        public Language()
        {
        }

        public Language(int languageId, string languageCode, string languageName)
        {
            LanguageId = languageId;
            LanguageCode = languageCode;
            LanguageName = languageName;
        }

        public int LanguageId
        {
            get => languageId;
            set => languageId = value;
        }

        public string LanguageCode
        {
            get => languageCode;
            set => languageCode = value;
        }

        public string LanguageName
        {
            get => languageName;
            set => languageName = value;
        }
    }
}