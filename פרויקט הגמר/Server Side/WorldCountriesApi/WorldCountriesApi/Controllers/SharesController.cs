using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SharesController :
        ControllerBase
    {
        [HttpGet]
        public IActionResult GetShares(
            [FromQuery] string? searchText = null,
            [FromQuery] int? countryId = null,
            [FromQuery] int? userId = null,
            [FromQuery] byte? shareType = null,
            [FromQuery] byte? rating = null,
            [FromQuery] string? sortDirection = "desc")
        {
            try
            {
                if (
                    countryId.HasValue &&
                    countryId.Value <= 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Country id must be greater than zero."
                    });
                }

                if (
                    userId.HasValue &&
                    userId.Value <= 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "User id must be greater than zero."
                    });
                }

                if (
                    shareType.HasValue &&
                    shareType.Value != 1 &&
                    shareType.Value != 2 &&
                    shareType.Value != 3
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Share type must be 1, 2 or 3."
                    });
                }

                if (
                    rating.HasValue &&
                    (
                        rating.Value < 1 ||
                        rating.Value > 5
                    )
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Rating must be between 1 and 5."
                    });
                }

                string normalizedSortDirection = string.IsNullOrWhiteSpace(sortDirection) ? "desc" : sortDirection.Trim().ToLower();

                if (
                    normalizedSortDirection != "asc" &&
                    normalizedSortDirection != "desc"
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Sort direction must be asc or desc."
                    });
                }

                DBservices dbs =
                    new DBservices();

                List<Share> shares =
                    dbs.GetShares(
                        searchText,
                        countryId,
                        userId,
                        shareType,
                        rating,
                        normalizedSortDirection
                    );

                return Ok(new
                {
                    success = true,
                    totalShares =
                        shares.Count,
                    shares = shares
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
        public IActionResult GetShareById(
            int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Share id must be greater than zero."
                    });
                }

                DBservices dbs =
                    new DBservices();

                Share? share =
                    dbs.GetShareById(id);

                if (share == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Share was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    share = share
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
        public IActionResult CreateShare(
            [FromBody]
            CreateShareRequest request)
        {
            try
            {
                string? validationMessage =
                    ValidateCreateRequest(
                        request
                    );

                if (validationMessage != null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            validationMessage
                    });
                }

                DBservices dbs =
                    new DBservices();

                int newShareId =
                    dbs.CreateShare(request);

                if (newShareId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Share was not created."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Share was created successfully.",
                    shareId =
                        newShareId
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
        public IActionResult UpdateShare(
            int id,
            [FromBody]
            UpdateShareRequest request)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Share id must be greater than zero."
                    });
                }

                string? validationMessage =
                    ValidateUpdateRequest(
                        request
                    );

                if (validationMessage != null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            validationMessage
                    });
                }

                DBservices dbs =
                    new DBservices();

                int rowsAffected =
                    dbs.UpdateShare(
                        id,
                        request
                    );

                if (rowsAffected <= 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Share was not found or was not updated."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Share was updated successfully."
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
        public IActionResult DeleteShare(
            int id,
            [FromQuery] int actorUserId)
        {
            try
            {
                if (
                    id <= 0 ||
                    actorUserId <= 0
                )
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Share id and actor user id must be greater than zero."
                    });
                }

                DBservices dbs =
                    new DBservices();

                int rowsAffected =
                    dbs.DeleteShare(
                        id,
                        actorUserId
                    );

                if (rowsAffected <= 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            "Share was not found or was not deleted."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Share was deleted successfully."
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


        private string? ValidateCreateRequest(
            CreateShareRequest request)
        {
            if (
                request.UserId <= 0 ||
                request.CountryId <= 0
            )
            {
                return
                    "User id and country id must be greater than zero.";
            }

            if (
                request.ShareType != 1 &&
                request.ShareType != 2 &&
                request.ShareType != 3
            )
            {
                return
                    "Share type must be 1, 2 or 3.";
            }

            if (
                string.IsNullOrWhiteSpace(
                    request.Content
                )
            )
            {
                return
                    "Share content is required.";
            }

            if (
                request.Content.Trim().Length >
                1000
            )
            {
                return
                    "Share content may contain up to 1000 characters.";
            }

            if (
                request.Rating.HasValue &&
                (
                    request.Rating.Value < 1 ||
                    request.Rating.Value > 5
                )
            )
            {
                return
                    "Rating must be between 1 and 5.";
            }

            return null;
        }


        private string? ValidateUpdateRequest(
            UpdateShareRequest request)
        {
            if (
                request.ActorUserId <= 0 ||
                request.CountryId <= 0
            )
            {
                return
                    "Actor user id and country id must be greater than zero.";
            }

            if (
                request.ShareType != 1 &&
                request.ShareType != 2 &&
                request.ShareType != 3
            )
            {
                return
                    "Share type must be 1, 2 or 3.";
            }

            if (
                string.IsNullOrWhiteSpace(
                    request.Content
                )
            )
            {
                return
                    "Share content is required.";
            }

            if (
                request.Content.Trim().Length >
                1000
            )
            {
                return
                    "Share content may contain up to 1000 characters.";
            }

            if (
                request.Rating.HasValue &&
                (
                    request.Rating.Value < 1 ||
                    request.Rating.Value > 5
                )
            )
            {
                return
                    "Rating must be between 1 and 5.";
            }

            return null;
        }
    }
}