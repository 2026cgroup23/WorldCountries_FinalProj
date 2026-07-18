namespace WorldCountriesApi.Models
{
    public class UpdateUserRequest
    {
        string fullName = "";
        string email = "";

        public UpdateUserRequest()
        {
        }

        public UpdateUserRequest(
            string fullName,
            string email)
        {
            FullName = fullName;
            Email = email;
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
    }
}