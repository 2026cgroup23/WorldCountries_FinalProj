using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        [HttpGet("statistics")]
        public IActionResult GetStatistics()
        {
            try
            {
                DBservices dbs =
                    new DBservices();

                AdminStatistics statistics =
                    dbs.GetAdminStatistics();

                return Ok(new
                {
                    success = true,
                    statistics = statistics
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