namespace WorldCountriesApi.Models
{
    public class Continent
    {
        int continentId;
        string continentName = "";

        public Continent()
        {
        }

        public Continent(int continentId, string continentName)
        {
            ContinentId = continentId;
            ContinentName = continentName;
        }

        public int ContinentId
        {
            get => continentId;
            set => continentId = value;
        }

        public string ContinentName
        {
            get => continentName;
            set => continentName = value;
        }
    }
}