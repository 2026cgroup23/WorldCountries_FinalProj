namespace WorldCountriesApi.Models
{
    public class SetUserSharePermissionRequest
    {
        bool canShare;

        public SetUserSharePermissionRequest()
        {
        }

        public SetUserSharePermissionRequest(bool canShare)
        {
            CanShare = canShare;
        }

        public bool CanShare
        {
            get => canShare;
            set => canShare = value;
        }
    }
}