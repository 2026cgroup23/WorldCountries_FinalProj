using Microsoft.AspNetCore.Mvc;
using WorldCountriesApi.Data;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        [HttpPost("register")]
        public IActionResult Register(RegisterUserRequest request)
        {
            try
            {
                User user = new User();

                user.FullName = request.FullName;
                user.Email = request.Email;
                user.PasswordHash = request.Password;

                DBservices dbs = new DBservices();

                int newUserId = dbs.RegisterUser(user);

                return Ok(new
                {
                    success = true,
                    userId = newUserId,
                    message = "User registered successfully."
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

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            try
            {
                DBservices dbs = new DBservices();

                User? user = dbs.LoginUser(
                    request.Email,
                    request.Password);

                if (user == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message =
                            "Email or password is incorrect, or the user is locked."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Login completed successfully.",
                    user = user
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
        public IActionResult GetUserById(int id)
        {
            try
            {
                DBservices dbs = new DBservices();

                User? user = dbs.GetUserById(id);

                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    user = user
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
        public IActionResult GetAllUsers()
        {
            try
            {
                DBservices dbs = new DBservices();

                List<User> users = dbs.GetAllUsers();

                return Ok(new
                {
                    success = true,
                    count = users.Count,
                    users = users
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
        public IActionResult UpdateUser(
            int id,
            UpdateUserRequest request)
        {
            try
            {
                User user = new User();

                user.UserId = id;
                user.FullName = request.FullName;
                user.Email = request.Email;

                DBservices dbs = new DBservices();

                int rowsAffected = dbs.UpdateUser(user);

                if (rowsAffected == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "User details were updated successfully."
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

        [HttpPut("{id}/password")]
        public IActionResult ChangePassword(
            int id,
            ChangePasswordRequest request)
        {
            try
            {
                DBservices dbs = new DBservices();

                int rowsAffected = dbs.ChangePassword(
                    id,
                    request.NewPassword);

                if (rowsAffected == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message =
                        "Password was changed successfully."
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

        [HttpPut("{id}/lock")]
        public IActionResult SetUserLockStatus(
            int id,
            SetUserLockRequest request)
        {
            try
            {
                DBservices dbs = new DBservices();

                int rowsAffected = dbs.SetUserLockStatus(
                    id,
                    request.IsLocked);

                if (rowsAffected == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    isLocked = request.IsLocked,
                    message = request.IsLocked
                        ? "User was locked successfully."
                        : "User was unlocked successfully."
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

        [HttpPut("{id}/share-permission")]
        public IActionResult SetUserSharePermission(
            int id,
            SetUserSharePermissionRequest request)
        {
            try
            {
                DBservices dbs = new DBservices();

                int rowsAffected =
                    dbs.SetUserSharePermission(
                        id,
                        request.CanShare);

                if (rowsAffected == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    canShare = request.CanShare,
                    message = request.CanShare
                        ? "Sharing permission was enabled successfully."
                        : "Sharing permission was disabled successfully."
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
        public IActionResult DeleteUser(int id)
        {
            try
            {
                DBservices dbs = new DBservices();

                int rowsAffected = dbs.DeleteUser(id);

                if (rowsAffected == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User was not found."
                    });
                }

                return Ok(new
                {
                    success = true,
                    deletedUserId = id,
                    message = "User was deleted successfully."
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