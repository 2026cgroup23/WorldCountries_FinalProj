namespace WorldCountriesApi.Models
{
    public class ChangePasswordRequest
    {
        string newPassword = "";

        public ChangePasswordRequest()
        {
        }

        public ChangePasswordRequest(string newPassword)
        {
            NewPassword = newPassword;
        }

        public string NewPassword
        {
            get => newPassword;
            set => newPassword = value;
        }
    }
}