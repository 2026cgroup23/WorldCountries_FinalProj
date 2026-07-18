namespace WorldCountriesApi.Models
{
    public class UserCountryList
    {
        public int UserId { get; set; }

        public int CountryId { get; set; }

        public byte ListType { get; set; }

        public DateTime AddedAt { get; set; }

        public string? Cca2 { get; set; }

        public string Cca3 { get; set; } =
            string.Empty;

        public string CommonName { get; set; } =
            string.Empty;

        public string? OfficialName { get; set; }

        public string? Capital { get; set; }

        public int? ContinentId { get; set; }

        public string? ContinentName { get; set; }

        public string? Region { get; set; }

        public string? Subregion { get; set; }

        public long Population { get; set; }

        public double Area { get; set; }

        public string? FlagUrl { get; set; }

        public string? GoogleMapsUrl { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public bool? IsIndependent { get; set; }
    }
}