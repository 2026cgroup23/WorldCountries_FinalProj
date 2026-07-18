namespace WorldCountriesApi.Models
{
    public class LanguageImport
    {
        string languageCode = "";
        string languageName = "";

        public LanguageImport()
        {
        }

        public LanguageImport(string languageCode, string languageName)
        {
            LanguageCode = languageCode;
            LanguageName = languageName;
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