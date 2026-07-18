namespace WorldCountriesApi.Models
{
    public class Share
    {
        public int ShareId { get; set; }

        public int UserId { get; set; }

        public string FullName { get; set; } =
            string.Empty;

        public int RoleId { get; set; }

        public string RoleName { get; set; } =
            string.Empty;

        public bool CanShare { get; set; }

        public int CountryId { get; set; }

        public string? Cca2 { get; set; }

        public string Cca3 { get; set; } =
            string.Empty;

        public string CommonName { get; set; } =
            string.Empty;

        public string? OfficialName { get; set; }

        public string? Capital { get; set; }

        public string? FlagUrl { get; set; }

        public int? ContinentId { get; set; }

        public string? ContinentName { get; set; }

        public byte ShareType { get; set; }

        public string Content { get; set; } =
            string.Empty;

        public byte? Rating { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; }
    }
}