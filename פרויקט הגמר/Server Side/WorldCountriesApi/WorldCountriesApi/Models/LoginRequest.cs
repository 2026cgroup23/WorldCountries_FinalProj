namespace WorldCountriesApi.Models
{
    public class LoginRequest
    {
        string email = "";
        string password = "";

        public LoginRequest()
        {
        }

        public LoginRequest(string email, string password)
        {
            Email = email;
            Password = password;
        }

        public string Email
        {
            get => email;
            set => email = value;
        }

        public string Password
        {
            get => password;
            set => password = value;
        }
    }
}