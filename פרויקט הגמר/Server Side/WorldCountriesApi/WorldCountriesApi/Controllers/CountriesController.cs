using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;
using WorldCountriesApi.Services;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountriesController : ControllerBase
    {
        IConfiguration configuration;

        public CountriesController(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        // TEST
        [HttpGet("test-all-countries")]
        public async Task<IActionResult> TestAllCountries()
        {
            try
            {
                CountryImportService service =
                    new CountryImportService(configuration);

                List<CountryImport> countries =
                    await service.GetAllCountries();

                return Ok(new
                {
                    success = true,
                    message =
                        "All countries were imported successfully.",
                    totalCountries = countries.Count,
                    countries = countries
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpPost("import-to-database")]
        public async Task<IActionResult> ImportToDatabase()
        {
            try
            {
                CountryImportService service =
                    new CountryImportService(configuration);

                List<CountryImport> countries =
                    await service.GetAllCountries();

                DBservices dbs =
                    new DBservices();

                int importedCountries =
                    dbs.ImportCountries(countries);

                return Ok(new
                {
                    success = true,
                    message =
                        "Countries were imported into the database successfully.",
                    receivedFromApi =
                        countries.Count,
                    importedToDatabase =
                        importedCountries,
                    skippedCountries =
                        countries.Count - importedCountries
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet]
        public IActionResult GetCountries(
            [FromQuery] string? searchText = null,
            [FromQuery] int? continentId = null,
            [FromQuery] int? languageId = null,
            [FromQuery] string? currencyCode = null,
            [FromQuery] long? minPopulation = null,
            [FromQuery] long? maxPopulation = null,
            [FromQuery] double? minArea = null,
            [FromQuery] double? maxArea = null,
            [FromQuery] string sortBy = "name",
            [FromQuery] string sortDirection = "asc")
        {
            try
            {
                DBservices dbs =
                    new DBservices();

                List<Country> countries =
                    dbs.GetCountries(
                        searchText,
                        continentId,
                        languageId,
                        currencyCode,
                        minPopulation,
                        maxPopulation,
                        minArea,
                        maxArea,
                        sortBy,
                        sortDirection
                    );

                return Ok(new
                {
                    success = true,
                    totalCountries = countries.Count,
                    countries = countries
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetCountryById(int id)
        {
            try
            {
                DBservices dbs =
                    new DBservices();

                Country? country =
                    dbs.GetCountryById(id);

                if (country == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Country was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    country = country
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        [HttpPost]
        public IActionResult CreateCountry(
            [FromBody] CreateCountryRequest request)
        {
            try
            {
                if (
                    string.IsNullOrWhiteSpace(request.Cca3) ||
                    string.IsNullOrWhiteSpace(request.CommonName)
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "CCA3 and common name are required."
                    });
                }

                if (
                    request.Population < 0 ||
                    request.Area < 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Population and area cannot be negative."
                    });
                }

                DBservices dbs =
                    new DBservices();

                int countryId =
                    dbs.CreateCountry(request);

                if (countryId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Country was not created."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Country was created successfully.",
                    countryId = countryId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        [HttpPut("{id}")]
        public IActionResult UpdateCountry(
            int id,
            [FromBody] UpdateCountryRequest request)
        {
            try
            {
                if (
                    string.IsNullOrWhiteSpace(request.Cca3) ||
                    string.IsNullOrWhiteSpace(request.CommonName)
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "CCA3 and common name are required."
                    });
                }

                if (
                    request.Population < 0 ||
                    request.Area < 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Population and area cannot be negative."
                    });
                }

                DBservices dbs =
                    new DBservices();

                int rowsAffected =
                    dbs.UpdateCountry(
                        id,
                        request
                    );

                if (rowsAffected <= 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Country was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Country was updated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteCountry(int id)
        {
            try
            {
                DBservices dbs =
                    new DBservices();

                int rowsAffected =
                    dbs.DeleteCountry(id);

                if (rowsAffected <= 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Country was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Country was deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}