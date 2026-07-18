namespace WorldCountriesApi.Models
{
    public class RegisterUserRequest
    {
        string fullName = "";
        string email = "";
        string password = "";

        public RegisterUserRequest()
        {
        }

        public RegisterUserRequest(string fullName, string email, string password)
        {
            FullName = fullName;
            Email = email;
            Password = password;
        }

        public string FullName
        {
            get => fullName;
            set => fullName = value;
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