namespace WorldCountriesApi.Models
{
    public class PreferredContinentRequest
    {
        int continentId;

        public PreferredContinentRequest()
        {
        }

        public PreferredContinentRequest(int continentId)
        {
            ContinentId = continentId;
        }

        public int ContinentId
        {
            get => continentId;
            set => continentId = value;
        }
    }
}