namespace WorldCountriesApi.Models
{
    public class CurrencyImport
    {
        string currencyCode = "";
        string currencyName = "";
        string currencySymbol = "";

        public CurrencyImport()
        {
        }

        public CurrencyImport(string currencyCode, string currencyName, string currencySymbol)
        {
            CurrencyCode = currencyCode;
            CurrencyName = currencyName;
            CurrencySymbol = currencySymbol;
        }

        public string CurrencyCode
        {
            get => currencyCode;
            set => currencyCode = value;
        }

        public string CurrencyName
        {
            get => currencyName;
            set => currencyName = value;
        }

        public string CurrencySymbol
        {
            get => currencySymbol;
            set => currencySymbol = value;
        }
    }
}