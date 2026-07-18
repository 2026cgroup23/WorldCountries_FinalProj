using System.Net.Http.Headers;
using System.Text.Json;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Services
{
    public class CountryImportService
    {
        IConfiguration configuration;

        public CountryImportService(
            IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public async Task<List<CountryImport>> GetAllCountries()
        {
            string? baseUrl =
                configuration["RestCountries:BaseUrl"];

            string? apiKey =
                configuration["RestCountries:ApiKey"];

            if (string.IsNullOrEmpty(baseUrl))
            {
                throw new Exception(
                    "REST Countries BaseUrl was not found."
                );
            }

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new Exception(
                    "REST Countries ApiKey was not found."
                );
            }

            List<CountryImport> countries =
                new List<CountryImport>();

            using HttpClient client =
                new HttpClient();

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    apiKey
                );

            string fields =
                "names.common," +
                "names.official," +
                "codes.alpha_2," +
                "codes.alpha_3," +
                "capitals," +
                "continents," +
                "region," +
                "subregion," +
                "population," +
                "area.kilometers," +
                "flag.url_png," +
                "links.google_maps," +
                "coordinates.lat," +
                "coordinates.lng," +
                "classification.sovereign," +
                "languages," +
                "currencies";

            int limit = 25;
            int offset = 0;
            bool more = true;

            while (more)
            {
                string url =
                    baseUrl +
                    "?response_fields=" +
                    Uri.EscapeDataString(fields) +
                    "&limit=" +
                    limit +
                    "&offset=" +
                    offset;

                HttpResponseMessage response =
                    await client.GetAsync(url);

                string json =
                    await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception(
                        "REST Countries API error. " +
                        "Status code: " +
                        (int)response.StatusCode +
                        ". Response: " +
                        json
                    );
                }

                using JsonDocument document =
                    JsonDocument.Parse(json);

                JsonElement root =
                    document.RootElement;

                if (
                    !root.TryGetProperty(
                        "data",
                        out JsonElement data
                    )
                )
                {
                    throw new Exception(
                        "The API response does not contain data."
                    );
                }

                if (
                    !data.TryGetProperty(
                        "objects",
                        out JsonElement objects
                    ) ||
                    objects.ValueKind !=
                    JsonValueKind.Array
                )
                {
                    throw new Exception(
                        "The API response does not contain countries."
                    );
                }

                foreach (
                    JsonElement countryJson
                    in objects.EnumerateArray()
                )
                {
                    CountryImport country =
                        ConvertJsonToCountryImport(
                            countryJson
                        );

                    countries.Add(country);
                }

                more =
                    GetMoreValue(data);

                offset += limit;
            }

            return countries;
        }

        private bool GetMoreValue(
            JsonElement data)
        {
            if (
                !data.TryGetProperty(
                    "meta",
                    out JsonElement meta
                )
            )
            {
                return false;
            }

            if (
                meta.TryGetProperty(
                    "more",
                    out JsonElement moreJson
                )
            )
            {
                if (
                    moreJson.ValueKind ==
                    JsonValueKind.True
                )
                {
                    return true;
                }

                if (
                    moreJson.ValueKind ==
                    JsonValueKind.False
                )
                {
                    return false;
                }
            }

            return false;
        }

        private CountryImport ConvertJsonToCountryImport(
            JsonElement countryJson)
        {
            CountryImport country =
                new CountryImport();

            if (
                countryJson.TryGetProperty(
                    "codes",
                    out JsonElement codes
                )
            )
            {
                country.Cca2 =
                    GetStringValue(
                        codes,
                        "alpha_2"
                    );

                country.Cca3 =
                    GetStringValue(
                        codes,
                        "alpha_3"
                    );
            }

            if (
                countryJson.TryGetProperty(
                    "names",
                    out JsonElement names
                )
            )
            {
                country.CommonName =
                    GetStringValue(
                        names,
                        "common"
                    );

                country.OfficialName =
                    GetStringValue(
                        names,
                        "official"
                    );
            }

            country.Capital =
                GetCapitalName(countryJson);

            country.Continent =
                GetFirstStringFromArray(
                    countryJson,
                    "continents"
                );

            country.Region =
                GetStringValue(
                    countryJson,
                    "region"
                );

            country.Subregion =
                GetStringValue(
                    countryJson,
                    "subregion"
                );

            country.Population =
                GetLongValue(
                    countryJson,
                    "population"
                );

            if (
                countryJson.TryGetProperty(
                    "area",
                    out JsonElement area
                )
            )
            {
                country.Area =
                    GetDoubleValue(
                        area,
                        "kilometers"
                    );
            }

            if (
                countryJson.TryGetProperty(
                    "flag",
                    out JsonElement flag
                )
            )
            {
                country.FlagUrl =
                    GetStringValue(
                        flag,
                        "url_png"
                    );
            }

            if (
                countryJson.TryGetProperty(
                    "links",
                    out JsonElement links
                )
            )
            {
                country.GoogleMapsUrl =
                    GetStringValue(
                        links,
                        "google_maps"
                    );
            }

            if (
                countryJson.TryGetProperty(
                    "coordinates",
                    out JsonElement coordinates
                )
            )
            {
                country.Latitude =
                    GetNullableDoubleValue(
                        coordinates,
                        "lat"
                    );

                country.Longitude =
                    GetNullableDoubleValue(
                        coordinates,
                        "lng"
                    );
            }

            if (
                countryJson.TryGetProperty(
                    "classification",
                    out JsonElement classification
                )
            )
            {
                country.IsIndependent =
                    GetNullableBoolValue(
                        classification,
                        "sovereign"
                    );
            }

            country.Languages =
                GetLanguages(countryJson);

            country.Currencies =
                GetCurrencies(countryJson);

            return country;
        }

        private string GetCapitalName(
            JsonElement countryJson)
        {
            if (
                !countryJson.TryGetProperty(
                    "capitals",
                    out JsonElement capitals
                ) ||
                capitals.ValueKind !=
                JsonValueKind.Array
            )
            {
                return "";
            }

            foreach (
                JsonElement capital
                in capitals.EnumerateArray()
            )
            {
                if (
                    capital.ValueKind ==
                    JsonValueKind.Object &&
                    capital.TryGetProperty(
                        "name",
                        out JsonElement name
                    ) &&
                    name.ValueKind ==
                    JsonValueKind.String
                )
                {
                    return name.GetString() ?? "";
                }
            }

            return "";
        }

        private List<LanguageImport> GetLanguages(
            JsonElement countryJson)
        {
            List<LanguageImport> languages =
                new List<LanguageImport>();

            if (
                !countryJson.TryGetProperty(
                    "languages",
                    out JsonElement languagesJson
                ) ||
                languagesJson.ValueKind !=
                JsonValueKind.Array
            )
            {
                return languages;
            }

            foreach (
                JsonElement languageJson
                in languagesJson.EnumerateArray()
            )
            {
                if (
                    languageJson.ValueKind !=
                    JsonValueKind.Object
                )
                {
                    continue;
                }

                LanguageImport language =
                    new LanguageImport();

                language.LanguageCode =
                    GetFirstAvailableString(
                        languageJson,
                        "iso639_3",
                        "iso639_1",
                        "bcp47",
                        "code"
                    );

                language.LanguageName =
                    GetFirstAvailableString(
                        languageJson,
                        "name",
                        "english_name",
                        "native_name"
                    );

                if (
                    language.LanguageCode != "" ||
                    language.LanguageName != ""
                )
                {
                    languages.Add(language);
                }
            }

            return languages;
        }

        private List<CurrencyImport> GetCurrencies(
            JsonElement countryJson)
        {
            List<CurrencyImport> currencies =
                new List<CurrencyImport>();

            if (
                !countryJson.TryGetProperty(
                    "currencies",
                    out JsonElement currenciesJson
                ) ||
                currenciesJson.ValueKind !=
                JsonValueKind.Array
            )
            {
                return currencies;
            }

            foreach (
                JsonElement currencyJson
                in currenciesJson.EnumerateArray()
            )
            {
                if (
                    currencyJson.ValueKind !=
                    JsonValueKind.Object
                )
                {
                    continue;
                }

                CurrencyImport currency =
                    new CurrencyImport();

                currency.CurrencyCode =
                    GetFirstAvailableString(
                        currencyJson,
                        "code",
                        "currency_code",
                        "iso_code"
                    );

                currency.CurrencyName =
                    GetFirstAvailableString(
                        currencyJson,
                        "name",
                        "english_name",
                        "currency_name"
                    );

                currency.CurrencySymbol =
                    GetFirstAvailableString(
                        currencyJson,
                        "symbol",
                        "currency_symbol"
                    );

                if (
                    currency.CurrencyCode != "" ||
                    currency.CurrencyName != ""
                )
                {
                    currencies.Add(currency);
                }
            }

            return currencies;
        }

        private string GetFirstAvailableString(
            JsonElement element,
            params string[] propertyNames)
        {
            foreach (
                string propertyName
                in propertyNames
            )
            {
                string value =
                    GetStringValue(
                        element,
                        propertyName
                    );

                if (value != "")
                {
                    return value;
                }
            }

            return "";
        }

        private string GetStringValue(
            JsonElement element,
            string propertyName)
        {
            if (
                element.ValueKind ==
                JsonValueKind.Object &&
                element.TryGetProperty(
                    propertyName,
                    out JsonElement property
                ) &&
                property.ValueKind ==
                JsonValueKind.String
            )
            {
                return property.GetString() ?? "";
            }

            return "";
        }

        private string GetFirstStringFromArray(
            JsonElement element,
            string propertyName)
        {
            if (
                element.TryGetProperty(
                    propertyName,
                    out JsonElement array
                ) &&
                array.ValueKind ==
                JsonValueKind.Array
            )
            {
                foreach (
                    JsonElement item
                    in array.EnumerateArray()
                )
                {
                    if (
                        item.ValueKind ==
                        JsonValueKind.String
                    )
                    {
                        return item.GetString() ?? "";
                    }
                }
            }

            return "";
        }

        private long GetLongValue(
            JsonElement element,
            string propertyName)
        {
            if (
                element.TryGetProperty(
                    propertyName,
                    out JsonElement property
                ) &&
                property.ValueKind ==
                JsonValueKind.Number &&
                property.TryGetInt64(
                    out long value
                )
            )
            {
                return value;
            }

            return 0;
        }

        private double GetDoubleValue(
            JsonElement element,
            string propertyName)
        {
            if (
                element.TryGetProperty(
                    propertyName,
                    out JsonElement property
                ) &&
                property.ValueKind ==
                JsonValueKind.Number &&
                property.TryGetDouble(
                    out double value
                )
            )
            {
                return value;
            }

            return 0;
        }

        private double? GetNullableDoubleValue(
            JsonElement element,
            string propertyName)
        {
            if (
                element.TryGetProperty(
                    propertyName,
                    out JsonElement property
                ) &&
                property.ValueKind ==
                JsonValueKind.Number &&
                property.TryGetDouble(
                    out double value
                )
            )
            {
                return value;
            }

            return null;
        }

        private bool? GetNullableBoolValue(
            JsonElement element,
            string propertyName)
        {
            if (
                element.TryGetProperty(
                    propertyName,
                    out JsonElement property
                )
            )
            {
                if (
                    property.ValueKind ==
                    JsonValueKind.True
                )
                {
                    return true;
                }

                if (
                    property.ValueKind ==
                    JsonValueKind.False
                )
                {
                    return false;
                }
            }

            return null;
        }
    }
}