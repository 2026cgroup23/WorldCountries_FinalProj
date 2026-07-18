namespace WorldCountriesApi.Models
{
    public class CreateShareRequest
    {
        public int UserId { get; set; }

        public int CountryId { get; set; }

        public byte ShareType { get; set; }

        public string Content { get; set; } =
            string.Empty;

        public byte? Rating { get; set; }
    }
}