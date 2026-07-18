namespace WorldCountriesApi.Models
{
    public class AdminStatistics
    {
        int dailyLogins;
        int importedCountries;
        int savedCountries;
        int createdShares;

        public AdminStatistics()
        {
        }

        public AdminStatistics(
            int dailyLogins,
            int importedCountries,
            int savedCountries,
            int createdShares)
        {
            DailyLogins = dailyLogins;
            ImportedCountries = importedCountries;
            SavedCountries = savedCountries;
            CreatedShares = createdShares;
        }

        public int DailyLogins
        {
            get
            {
                return dailyLogins;
            }

            set
            {
                dailyLogins = value;
            }
        }

        public int ImportedCountries
        {
            get
            {
                return importedCountries;
            }

            set
            {
                importedCountries = value;
            }
        }

        public int SavedCountries
        {
            get
            {
                return savedCountries;
            }

            set
            {
                savedCountries = value;
            }
        }

        public int CreatedShares
        {
            get
            {
                return createdShares;
            }

            set
            {
                createdShares = value;
            }
        }
    }
}