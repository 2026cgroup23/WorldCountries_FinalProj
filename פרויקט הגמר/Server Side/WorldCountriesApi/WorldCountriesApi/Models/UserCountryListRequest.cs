namespace WorldCountriesApi.Models
{
    public class UserCountryListRequest
    {
        public int UserId { get; set; }

        public int CountryId { get; set; }

        public byte ListType { get; set; }
    }
}