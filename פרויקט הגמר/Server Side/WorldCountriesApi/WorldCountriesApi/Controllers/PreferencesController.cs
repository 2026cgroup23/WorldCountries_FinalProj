using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PreferencesController : ControllerBase
    {
        DBservices db = new DBservices();

        // GENERAL DATA

        [HttpGet("continents")]
        public IActionResult GetAllContinents()
        {
            return Ok(db.GetAllContinents());
        }

        [HttpGet("languages")]
        public IActionResult GetAllLanguages()
        {
            return Ok(db.GetAllLanguages());
        }

        [HttpGet("language-levels")]
        public IActionResult GetAllLanguageLevels()
        {
            return Ok(db.GetAllLanguageLevels());
        }

        // USER PREFERRED CONTINENTS

        [HttpGet("{userId}/continents")]
        public IActionResult GetUserPreferredContinents(int userId)
        {
            return Ok(db.GetUserPreferredContinents(userId));
        }

        [HttpPost("{userId}/continents")]
        public IActionResult AddUserPreferredContinent(
            int userId,
            PreferredContinentRequest request)
        {
            int result =
                db.AddUserPreferredContinent(
                    userId,
                    request.ContinentId
                );

            if (result == 0)
            {
                return BadRequest(
                    "Could not add preferred continent."
                );
            }

            return Ok(
                "Preferred continent added successfully."
            );
        }

        [HttpDelete("{userId}/continents/{continentId}")]
        public IActionResult DeleteUserPreferredContinent(
            int userId,
            int continentId)
        {
            int result =
                db.DeleteUserPreferredContinent(
                    userId,
                    continentId
                );

            if (result == 0)
            {
                return BadRequest(
                    "Could not delete preferred continent."
                );
            }

            return Ok(
                "Preferred continent deleted successfully."
            );
        }

        // USER LANGUAGES

        [HttpGet("{userId}/languages")]
        public IActionResult GetUserLanguages(
            int userId)
        {
            return Ok(
                db.GetUserLanguages(userId)
            );
        }

        [HttpPost("{userId}/languages")]
        public IActionResult AddOrUpdateUserLanguage(
            int userId,
            UserLanguageRequest request)
        {
            int result =
                db.AddOrUpdateUserLanguage(
                    userId,
                    request.LanguageId,
                    request.LevelId
                );

            if (result == 0)
            {
                return BadRequest(
                    "Could not save language."
                );
            }

            return Ok(
                "Language saved successfully."
            );
        }

        [HttpDelete("{userId}/languages/{languageId}")]
        public IActionResult DeleteUserLanguage(
            int userId,
            int languageId)
        {
            int result =
                db.DeleteUserLanguage(
                    userId,
                    languageId
                );

            if (result == 0)
            {
                return BadRequest(
                    "Could not delete language."
                );
            }

            return Ok(
                "Language deleted successfully."
            );
        }
    }
}