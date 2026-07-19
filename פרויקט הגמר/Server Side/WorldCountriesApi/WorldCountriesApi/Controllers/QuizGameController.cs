using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizGameController : ControllerBase
    {
        // Maps the short game key sent by the client to the quiz title
        // that is seeded in the Quizzes table (see QuizGame_Setup.sql).
        private static string? ResolveQuizTitle(string game)
        {
            string value = (game ?? "").Trim().ToLower();

            if (value == "clash")
            {
                return "Country Clash";
            }

            if (value == "mystery")
            {
                return "Mystery Country";
            }

            if (value == "locate")
            {
                return "Locate the Country";
            }

            return null;
        }

        [HttpPost("attempt")]
        public IActionResult SaveAttempt(
            [FromBody] QuizAttemptRequest request)
        {
            try
            {
                string? quizTitle = ResolveQuizTitle(request.Game);

                if (quizTitle == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Game must be 'clash' or 'mystery'."
                    });
                }

                if (request.UserId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "User id must be greater than zero."
                    });
                }

                if (request.Score < 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Score cannot be negative."
                    });
                }

                int totalQuestions =
                    request.TotalQuestions < 1
                        ? 1
                        : request.TotalQuestions;

                int correctAnswers =
                    request.CorrectAnswers < 0
                        ? 0
                        : request.CorrectAnswers;

                int timeTaken =
                    request.TimeTakenSeconds < 0
                        ? 0
                        : request.TimeTakenSeconds;

                DBservices dbs = new DBservices();

                int attemptId = dbs.AddQuizAttempt(
                    quizTitle,
                    request.UserId,
                    request.Score,
                    correctAnswers,
                    totalQuestions,
                    timeTaken
                );

                if (attemptId <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Attempt was not saved."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Attempt saved successfully.",
                    attemptId = attemptId
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

        [HttpGet("leaderboard")]
        public IActionResult GetLeaderboard(
            [FromQuery] string game,
            [FromQuery] int top = 10)
        {
            try
            {
                string? quizTitle = ResolveQuizTitle(game);

                if (quizTitle == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Game must be 'clash' or 'mystery'."
                    });
                }

                if (top <= 0 || top > 100)
                {
                    top = 10;
                }

                DBservices dbs = new DBservices();

                List<QuizLeaderboardEntry> entries =
                    dbs.GetQuizLeaderboard(quizTitle, top);

                return Ok(new
                {
                    success = true,
                    game = game,
                    count = entries.Count,
                    leaderboard = entries
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
