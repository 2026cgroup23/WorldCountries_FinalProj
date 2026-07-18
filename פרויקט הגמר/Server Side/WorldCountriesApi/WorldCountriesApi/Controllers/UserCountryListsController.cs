using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserCountryListsController :
        ControllerBase
    {
        [HttpGet("{userId}")]
        public IActionResult GetUserCountryLists(
            int userId,
            [FromQuery] byte? listType = null)
        {
            try
            {
                if (userId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "User id must be greater than zero."
                    });
                }

                if (
                    listType.HasValue &&
                    listType.Value != 1 &&
                    listType.Value != 2
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "List type must be 1 or 2."
                    });
                }

                DBservices dbs =
                    new DBservices();

                List<UserCountryList> countries =
                    dbs.GetUserCountryLists(
                        userId,
                        listType
                    );

                return Ok(new
                {
                    success = true,
                    totalCountries =
                        countries.Count,
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


        [HttpGet("{userId}/countries/{countryId}")]
        public IActionResult GetCountryListStatus(
            int userId,
            int countryId)
        {
            try
            {
                if (
                    userId <= 0 ||
                    countryId <= 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "User id and country id must be greater than zero."
                    });
                }

                DBservices dbs =
                    new DBservices();

                UserCountryList? item =
                    dbs.GetUserCountryListStatus(
                        userId,
                        countryId
                    );

                return Ok(new
                {
                    success = true,
                    isSaved = item != null,
                    listType =
                        item?.ListType,
                    addedAt =
                        item?.AddedAt
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
        public IActionResult AddOrUpdateCountryList(
            [FromBody]
            UserCountryListRequest request)
        {
            try
            {
                if (
                    request.UserId <= 0 ||
                    request.CountryId <= 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "User id and country id must be greater than zero."
                    });
                }

                if (
                    request.ListType != 1 &&
                    request.ListType != 2
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "List type must be 1 or 2."
                    });
                }

                DBservices dbs =
                    new DBservices();

                int rowsAffected =
                    dbs.AddOrUpdateUserCountryList(
                        request
                    );

                if (rowsAffected <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Country list was not updated."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Country list was updated successfully.",
                    listType =
                        request.ListType
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


        [HttpDelete("{userId}/{countryId}")]
        public IActionResult DeleteCountryList(
            int userId,
            int countryId)
        {
            try
            {
                if (
                    userId <= 0 ||
                    countryId <= 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "User id and country id must be greater than zero."
                    });
                }

                DBservices dbs =
                    new DBservices();

                int rowsAffected =
                    dbs.DeleteUserCountryList(
                        userId,
                        countryId
                    );

                if (rowsAffected <= 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Country was not found in the user list."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Country was removed from the user list successfully."
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