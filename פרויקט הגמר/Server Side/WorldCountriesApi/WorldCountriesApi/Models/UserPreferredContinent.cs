namespace WorldCountriesApi.Models
{
    public class UserPreferredContinent
    {
        public int UserId { get; set; }

        public int ContinentId { get; set; }

        public string ContinentName { get; set; } = "";

        public DateTime AddedAt { get; set; }
    }
}