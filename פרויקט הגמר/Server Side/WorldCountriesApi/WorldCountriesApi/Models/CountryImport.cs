namespace WorldCountriesApi.Models
{
    public class CountryImport
    {
        string cca2 = "";
        string cca3 = "";
        string commonName = "";
        string officialName = "";
        string capital = "";
        string continent = "";
        string region = "";
        string subregion = "";
        long population;
        double area;
        string flagUrl = "";
        string googleMapsUrl = "";
        double? latitude;
        double? longitude;
        bool? isIndependent;

        List<LanguageImport> languages =
            new List<LanguageImport>();

        List<CurrencyImport> currencies =
            new List<CurrencyImport>();

        public CountryImport()
        {
        }

        public CountryImport(string cca2, string cca3, string commonName, string officialName, string capital, string continent, string region, string subregion, long population, double area, string flagUrl, string googleMapsUrl, double? latitude, double? longitude, bool? isIndependent, List<LanguageImport> languages, List<CurrencyImport> currencies)
        {
            Cca2 = cca2;
            Cca3 = cca3;
            CommonName = commonName;
            OfficialName = officialName;
            Capital = capital;
            Continent = continent;
            Region = region;
            Subregion = subregion;
            Population = population;
            Area = area;
            FlagUrl = flagUrl;
            GoogleMapsUrl = googleMapsUrl;
            Latitude = latitude;
            Longitude = longitude;
            IsIndependent = isIndependent;
            Languages = languages;
            Currencies = currencies;
        }

        public string Cca2
        {
            get => cca2;
            set => cca2 = value;
        }

        public string Cca3
        {
            get => cca3;
            set => cca3 = value;
        }

        public string CommonName
        {
            get => commonName;
            set => commonName = value;
        }

        public string OfficialName
        {
            get => officialName;
            set => officialName = value;
        }

        public string Capital
        {
            get => capital;
            set => capital = value;
        }

        public string Continent
        {
            get => continent;
            set => continent = value;
        }

        public string Region
        {
            get => region;
            set => region = value;
        }

        public string Subregion
        {
            get => subregion;
            set => subregion = value;
        }

        public long Population
        {
            get => population;
            set => population = value;
        }

        public double Area
        {
            get => area;
            set => area = value;
        }

        public string FlagUrl
        {
            get => flagUrl;
            set => flagUrl = value;
        }

        public string GoogleMapsUrl
        {
            get => googleMapsUrl;
            set => googleMapsUrl = value;
        }

        public double? Latitude
        {
            get => latitude;
            set => latitude = value;
        }

        public double? Longitude
        {
            get => longitude;
            set => longitude = value;
        }

        public bool? IsIndependent
        {
            get => isIndependent;
            set => isIndependent = value;
        }

        public List<LanguageImport> Languages
        {
            get => languages;
            set => languages = value;
        }

        public List<CurrencyImport> Currencies
        {
            get => currencies;
            set => currencies = value;
        }
    }
}