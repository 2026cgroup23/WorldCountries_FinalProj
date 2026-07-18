using WorldCountriesApi.Data;

namespace WorldCountriesApi.Models
{
    public class User
    {
        int userId;
        string fullName = "";
        string email = "";
        string passwordHash = "";
        int roleId;
        string roleName = "";
        bool isLocked = false;
        bool canShare = true;
        DateTime createdAt;
        DateTime? updatedAt;
        DateTime? lastLoginAt;

        public User()
        {
        }

        public User(int userId, string fullName, string email, string passwordHash, int roleId, string roleName, bool isLocked, bool canShare, DateTime createdAt, DateTime? updatedAt, DateTime? lastLoginAt)
        {
            UserId = userId;
            FullName = fullName;
            Email = email;
            PasswordHash = passwordHash;
            RoleId = roleId;
            RoleName = roleName;
            IsLocked = isLocked;
            CanShare = canShare;
            CreatedAt = createdAt;
            UpdatedAt = updatedAt;
            LastLoginAt = lastLoginAt;
        }

        public int UserId
        {
            get => userId;
            set => userId = value;
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

        public string PasswordHash
        {
            get => passwordHash;
            set => passwordHash = value;
        }

        public int RoleId
        {
            get => roleId;
            set => roleId = value;
        }

        public string RoleName
        {
            get => roleName;
            set => roleName = value;
        }

        public bool IsLocked
        {
            get => isLocked;
            set => isLocked = value;
        }

        public bool CanShare
        {
            get => canShare;
            set => canShare = value;
        }

        public DateTime CreatedAt
        {
            get => createdAt;
            set => createdAt = value;
        }

        public DateTime? UpdatedAt
        {
            get => updatedAt;
            set => updatedAt = value;
        }

        public DateTime? LastLoginAt
        {
            get => lastLoginAt;
            set => lastLoginAt = value;
        }

    }
}