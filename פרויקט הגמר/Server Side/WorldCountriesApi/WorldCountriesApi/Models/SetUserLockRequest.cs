namespace WorldCountriesApi.Models
{
    public class SetUserLockRequest
    {
        bool isLocked;

        public SetUserLockRequest()
        {
        }

        public SetUserLockRequest(bool isLocked)
        {
            IsLocked = isLocked;
        }

        public bool IsLocked
        {
            get => isLocked;
            set => isLocked = value;
        }
    }
}