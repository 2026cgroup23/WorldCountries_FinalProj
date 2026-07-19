using System.Data;
using System.Data.SqlClient;
using WorldCountriesApi.Models;

namespace WorldCountriesApi.Data
{
    public class DBservices
    {
        string connectionString;

        public DBservices()
        {
            connectionString =
                "Data Source=Media.ruppin.ac.il;Initial Catalog=igroup123_test2;User ID=igroup123;Password=igroup123_84275;TrustServerCertificate=True";
        }

        public SqlConnection Connect()
        {
            SqlConnection con = new SqlConnection(connectionString);
            con.Open();
            return con;
        }

        private SqlCommand CreateCommandWithStoredProcedure(
            string storedProcedureName,
            SqlConnection connection,
            Dictionary<string, object>? parameters)
        {
            SqlCommand command = new SqlCommand();

            command.Connection = connection;
            command.CommandText = storedProcedureName;
            command.CommandTimeout = 10;
            command.CommandType = CommandType.StoredProcedure;

            if (parameters != null)
            {
                foreach (KeyValuePair<string, object> parameter in parameters)
                {
                    command.Parameters.AddWithValue(
                        parameter.Key,
                        parameter.Value ?? DBNull.Value);
                }
            }

            return command;
        }

        // USERS
        public int RegisterUser(User user)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@FullName", user.FullName);
            parameters.Add("@Email", user.Email);
            parameters.Add("@PasswordHash", user.PasswordHash);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_RegisterUser",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public User? LoginUser(string email, string password)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@Email", email);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_LoginUser",
                connection,
                parameters);

            try
            {
                SqlDataReader dataReader = command.ExecuteReader();

                User? user = null;

                if (dataReader.Read())
                {
                    user = new User();

                    user.UserId =
                        Convert.ToInt32(dataReader["UserId"]);

                    user.FullName =
                        dataReader["FullName"].ToString() ?? "";

                    user.Email =
                        dataReader["Email"].ToString() ?? "";

                    user.PasswordHash =
                        dataReader["PasswordHash"].ToString() ?? "";

                    user.RoleId =
                        Convert.ToInt32(dataReader["RoleId"]);

                    user.RoleName =
                        user.RoleId == 2 ? "Admin" : "User";

                    user.IsLocked =
                        Convert.ToBoolean(dataReader["IsLocked"]);

                    user.CanShare =
                        Convert.ToBoolean(dataReader["CanShare"]);

                    user.CreatedAt =
                        Convert.ToDateTime(dataReader["CreatedAt"]);

                    if (dataReader["UpdatedAt"] != DBNull.Value)
                    {
                        user.UpdatedAt =
                            Convert.ToDateTime(dataReader["UpdatedAt"]);
                    }

                    if (dataReader["LastLoginAt"] != DBNull.Value)
                    {
                        user.LastLoginAt =
                            Convert.ToDateTime(dataReader["LastLoginAt"]);
                    }
                }

                dataReader.Close();
                connection.Close();

                if (user == null)
                {
                    AddLoginHistory(null, email, false);
                    return null;
                }

                if (user.PasswordHash != password)
                {
                    AddLoginHistory(user.UserId, email, false);
                    return null;
                }

                if (user.IsLocked)
                {
                    AddLoginHistory(user.UserId, email, false);
                    return null;
                }

                UpdateLastLogin(user.UserId);
                AddLoginHistory(user.UserId, email, true);
                user.LastLoginAt = DateTime.Now;

                user.PasswordHash = "";

                return user;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public User? GetUserById(int userId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_GetUserById",
                connection,
                parameters);

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(CommandBehavior.CloseConnection);

                if (dataReader.Read())
                {
                    User user = new User();

                    user.UserId =
                        Convert.ToInt32(dataReader["UserId"]);

                    user.FullName =
                        dataReader["FullName"].ToString() ?? "";

                    user.Email =
                        dataReader["Email"].ToString() ?? "";

                    user.RoleId =
                        Convert.ToInt32(dataReader["RoleId"]);

                    user.RoleName =
                        dataReader["RoleName"].ToString() ?? "";

                    user.IsLocked =
                        Convert.ToBoolean(dataReader["IsLocked"]);

                    user.CanShare =
                        Convert.ToBoolean(dataReader["CanShare"]);

                    user.CreatedAt =
                        Convert.ToDateTime(dataReader["CreatedAt"]);

                    if (dataReader["UpdatedAt"] != DBNull.Value)
                    {
                        user.UpdatedAt =
                            Convert.ToDateTime(dataReader["UpdatedAt"]);
                    }

                    if (dataReader["LastLoginAt"] != DBNull.Value)
                    {
                        user.LastLoginAt =
                            Convert.ToDateTime(dataReader["LastLoginAt"]);
                    }

                    return user;
                }

                return null;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public List<User> GetAllUsers()
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_GetAllUsers",
                connection,
                null);

            List<User> users = new List<User>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(CommandBehavior.CloseConnection);

                while (dataReader.Read())
                {
                    User user = new User();

                    user.UserId =
                        Convert.ToInt32(dataReader["UserId"]);

                    user.FullName =
                        dataReader["FullName"].ToString() ?? "";

                    user.Email =
                        dataReader["Email"].ToString() ?? "";

                    user.RoleId =
                        Convert.ToInt32(dataReader["RoleId"]);

                    user.RoleName =
                        dataReader["RoleName"].ToString() ?? "";

                    user.IsLocked =
                        Convert.ToBoolean(dataReader["IsLocked"]);

                    user.CanShare =
                        Convert.ToBoolean(dataReader["CanShare"]);

                    user.CreatedAt =
                        Convert.ToDateTime(dataReader["CreatedAt"]);

                    if (dataReader["LastLoginAt"] != DBNull.Value)
                    {
                        user.LastLoginAt =
                            Convert.ToDateTime(dataReader["LastLoginAt"]);
                    }

                    users.Add(user);
                }

                return users;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int UpdateUser(User user)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", user.UserId);
            parameters.Add("@FullName", user.FullName);
            parameters.Add("@Email", user.Email);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_UpdateUser",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int ChangePassword(
            int userId,
            string newPasswordHash)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@NewPasswordHash", newPasswordHash);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_ChangePassword",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int SetUserLockStatus(
            int userId,
            bool isLocked)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@IsLocked", isLocked);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_SetUserLockStatus",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int SetUserSharePermission(
            int userId,
            bool canShare)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@CanShare", canShare);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_SetUserSharePermission",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int UpdateLastLogin(int userId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_UpdateLastLogin",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int AddLoginHistory(
            int? userId,
            string emailAttempted,
            bool wasSuccessful)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@UserId",
                userId.HasValue
                    ? userId.Value
                    : DBNull.Value);

            parameters.Add("@EmailAttempted", emailAttempted);
            parameters.Add("@WasSuccessful", wasSuccessful);

            SqlCommand command = CreateCommandWithStoredProcedure(
                "sp_AddLoginHistory",
                connection,
                parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int DeleteUser(int userId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_DeleteUser",
                    connection,
                    parameters);

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        // COUNTRIES IMPORT
        public int ImportCountries(
            List<CountryImport> countries)
        {
            int importedCountries = 0;

            SqlConnection connection = Connect();

            try
            {
                foreach (CountryImport country in countries)
                {
                    // לא מכניסים מדינות שאין להן Cca3
                    if (string.IsNullOrWhiteSpace(country.Cca3))
                    {
                        continue;
                    }

                    int? continentId = null;

                    if (!string.IsNullOrWhiteSpace(country.Continent))
                    {
                        continentId = UpsertContinent(
                            country.Continent,
                            connection
                        );
                    }

                    int countryId = UpsertCountry(
                        country,
                        continentId,
                        connection
                    );

                    if (countryId <= 0)
                    {
                        continue;
                    }

                    // מוחקים קשרים קודמים כדי שהייבוא יהיה מעודכן
                    ClearCountryRelations(
                        countryId,
                        connection
                    );

                    // הכנסת השפות וקישורן למדינה
                    foreach (LanguageImport language in country.Languages)
                    {
                        if (
                            string.IsNullOrWhiteSpace(language.LanguageCode) ||
                            string.IsNullOrWhiteSpace(language.LanguageName)
                        )
                        {
                            continue;
                        }

                        int languageId = UpsertLanguage(
                            language,
                            connection
                        );

                        if (languageId > 0)
                        {
                            AddCountryLanguage(
                                countryId,
                                languageId,
                                connection
                            );
                        }
                    }

                    // הכנסת המטבעות וקישורם למדינה
                    foreach (CurrencyImport currency in country.Currencies)
                    {
                        if (
                            string.IsNullOrWhiteSpace(currency.CurrencyCode) ||
                            string.IsNullOrWhiteSpace(currency.CurrencyName)
                        )
                        {
                            continue;
                        }

                        UpsertCurrency(
                            currency,
                            connection
                        );

                        AddCountryCurrency(
                            countryId,
                            currency.CurrencyCode,
                            connection
                        );
                    }

                    importedCountries++;
                }

                return importedCountries;
            }
            finally
            {
                if (connection.State == ConnectionState.Open)
                {
                    connection.Close();
                }
            }
        }

        // CONTINENT
        private int UpsertContinent(
            string continentName,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@ContinentName",
                continentName
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_UpsertContinent",
                    connection,
                    parameters
                );

            object? result = command.ExecuteScalar();

            if (
                result == null ||
                result == DBNull.Value
            )
            {
                return 0;
            }

            return Convert.ToInt32(result);
        }


        // LANGUAGE
        private int UpsertLanguage(
            LanguageImport language,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@LanguageCode",
                language.LanguageCode
            );

            parameters.Add(
                "@LanguageName",
                language.LanguageName
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_UpsertLanguage",
                    connection,
                    parameters
                );

            object? result = command.ExecuteScalar();

            if (
                result == null ||
                result == DBNull.Value
            )
            {
                return 0;
            }

            return Convert.ToInt32(result);
        }

        // CURRENCY
        private void UpsertCurrency(
            CurrencyImport currency,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@CurrencyCode",
                currency.CurrencyCode
            );

            parameters.Add(
                "@CurrencyName",
                currency.CurrencyName
            );

            parameters.Add(
                "@CurrencySymbol",
                string.IsNullOrWhiteSpace(currency.CurrencySymbol)
                    ? DBNull.Value
                    : currency.CurrencySymbol
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_UpsertCurrency",
                    connection,
                    parameters
                );

            command.ExecuteScalar();
        }

        // COUNTRY
        private int UpsertCountry(
            CountryImport country,
            int? continentId,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@Cca2",
                string.IsNullOrWhiteSpace(country.Cca2)
                    ? DBNull.Value
                    : country.Cca2
            );

            parameters.Add(
                "@Cca3",
                country.Cca3
            );

            parameters.Add(
                "@CommonName",
                country.CommonName
            );

            parameters.Add(
                "@OfficialName",
                string.IsNullOrWhiteSpace(country.OfficialName)
                    ? DBNull.Value
                    : country.OfficialName
            );

            parameters.Add(
                "@Capital",
                string.IsNullOrWhiteSpace(country.Capital)
                    ? DBNull.Value
                    : country.Capital
            );

            parameters.Add(
                "@ContinentId",
                continentId.HasValue
                    ? continentId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Region",
                string.IsNullOrWhiteSpace(country.Region)
                    ? DBNull.Value
                    : country.Region
            );

            parameters.Add(
                "@Subregion",
                string.IsNullOrWhiteSpace(country.Subregion)
                    ? DBNull.Value
                    : country.Subregion
            );

            parameters.Add(
                "@Population",
                country.Population
            );

            parameters.Add(
                "@Area",
                country.Area
            );

            parameters.Add(
                "@FlagUrl",
                string.IsNullOrWhiteSpace(country.FlagUrl)
                    ? DBNull.Value
                    : country.FlagUrl
            );

            parameters.Add(
                "@GoogleMapsUrl",
                string.IsNullOrWhiteSpace(country.GoogleMapsUrl)
                    ? DBNull.Value
                    : country.GoogleMapsUrl
            );

            parameters.Add(
                "@Latitude",
                country.Latitude.HasValue
                    ? country.Latitude.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Longitude",
                country.Longitude.HasValue
                    ? country.Longitude.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@IsIndependent",
                country.IsIndependent.HasValue
                    ? country.IsIndependent.Value
                    : DBNull.Value
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_UpsertCountry",
                    connection,
                    parameters
                );

            object? result = command.ExecuteScalar();

            if (
                result == null ||
                result == DBNull.Value
            )
            {
                return 0;
            }

            return Convert.ToInt32(result);
        }


        // CLEAR COUNTRY RELATIONS
        private void ClearCountryRelations(
            int countryId,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@CountryId",
                countryId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_ClearCountryRelations",
                    connection,
                    parameters
                );

            command.ExecuteScalar();
        }


        // COUNTRY LANGUAGE
        private void AddCountryLanguage(
            int countryId,
            int languageId,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@CountryId",
                countryId
            );

            parameters.Add(
                "@LanguageId",
                languageId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_AddCountryLanguage",
                    connection,
                    parameters
                );

            command.ExecuteScalar();
        }


        // COUNTRY CURRENCY
        private void AddCountryCurrency(
            int countryId,
            string currencyCode,
            SqlConnection connection)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@CountryId",
                countryId
            );

            parameters.Add(
                "@CurrencyCode",
                currencyCode
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_AddCountryCurrency",
                    connection,
                    parameters
                );

            command.ExecuteScalar();
        }

        // USER PREFERENCES
        public List<Continent> GetAllContinents()
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetAllContinents",
                    connection,
                    null
                );

            List<Continent> continents =
                new List<Continent>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    Continent continent =
                        new Continent();

                    continent.ContinentId =
                        Convert.ToInt32(
                            dataReader["ContinentId"]
                        );

                    continent.ContinentName =
                        dataReader["ContinentName"]
                            .ToString() ?? "";

                    continents.Add(continent);
                }

                return continents;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public List<Language> GetAllLanguages()
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetAllLanguages",
                    connection,
                    null
                );

            List<Language> languages =
                new List<Language>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    Language language =
                        new Language();

                    language.LanguageId =
                        Convert.ToInt32(
                            dataReader["LanguageId"]
                        );

                    language.LanguageCode =
                        dataReader["LanguageCode"]
                            .ToString() ?? "";

                    language.LanguageName =
                        dataReader["LanguageName"]
                            .ToString() ?? "";

                    languages.Add(language);
                }

                return languages;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public List<LanguageLevel> GetAllLanguageLevels()
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetAllLanguageLevels",
                    connection,
                    null
                );

            List<LanguageLevel> levels =
                new List<LanguageLevel>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    LanguageLevel level =
                        new LanguageLevel();

                    level.LevelId =
                        Convert.ToInt32(
                            dataReader["LevelId"]
                        );

                    level.LevelName =
                        dataReader["LevelName"]
                            .ToString() ?? "";

                    level.LevelOrder =
                        Convert.ToInt32(
                            dataReader["LevelOrder"]
                        );

                    levels.Add(level);
                }

                return levels;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        // USER PREFERRED CONTINENTS

        public List<UserPreferredContinent>
            GetUserPreferredContinents(int userId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetUserPreferredContinents",
                    connection,
                    parameters
                );

            List<UserPreferredContinent> continents =
                new List<UserPreferredContinent>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    UserPreferredContinent continent =
                        new UserPreferredContinent();

                    continent.UserId =
                        Convert.ToInt32(
                            dataReader["UserId"]
                        );

                    continent.ContinentId =
                        Convert.ToInt32(
                            dataReader["ContinentId"]
                        );

                    continent.ContinentName =
                        dataReader["ContinentName"]
                            .ToString() ?? "";

                    continent.AddedAt =
                        Convert.ToDateTime(
                            dataReader["AddedAt"]
                        );

                    continents.Add(continent);
                }

                return continents;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int AddUserPreferredContinent(
            int userId,
            int continentId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@ContinentId", continentId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_AddUserPreferredContinent",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int DeleteUserPreferredContinent(
            int userId,
            int continentId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@ContinentId", continentId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_DeleteUserPreferredContinent",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        // USER LANGUAGES

        public List<UserLanguage>
            GetUserLanguages(int userId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetUserLanguages",
                    connection,
                    parameters
                );

            List<UserLanguage> languages =
                new List<UserLanguage>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    UserLanguage language =
                        new UserLanguage();

                    language.UserId =
                        Convert.ToInt32(
                            dataReader["UserId"]
                        );

                    language.LanguageId =
                        Convert.ToInt32(
                            dataReader["LanguageId"]
                        );

                    language.LanguageCode =
                        dataReader["LanguageCode"]
                            .ToString() ?? "";

                    language.LanguageName =
                        dataReader["LanguageName"]
                            .ToString() ?? "";

                    language.LevelId =
                        Convert.ToInt32(
                            dataReader["LevelId"]
                        );

                    language.LevelName =
                        dataReader["LevelName"]
                            .ToString() ?? "";

                    language.LevelOrder =
                        Convert.ToInt32(
                            dataReader["LevelOrder"]
                        );

                    language.AddedAt =
                        Convert.ToDateTime(
                            dataReader["AddedAt"]
                        );

                    if (
                        dataReader["UpdatedAt"] !=
                        DBNull.Value
                    )
                    {
                        language.UpdatedAt =
                            Convert.ToDateTime(
                                dataReader["UpdatedAt"]
                            );
                    }

                    languages.Add(language);
                }

                return languages;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        public int AddOrUpdateUserLanguage(
            int userId,
            int languageId,
            int levelId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@LanguageId", languageId);
            parameters.Add("@LevelId", levelId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_AddOrUpdateUserLanguage",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        public int DeleteUserLanguage(
            int userId,
            int languageId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@UserId", userId);
            parameters.Add("@LanguageId", languageId);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_DeleteUserLanguage",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public AdminStatistics GetAdminStatistics()
        {
            SqlConnection connection =
                Connect();

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetAdminStatistics",
                    connection,
                    null
                );

            AdminStatistics statistics =
                new AdminStatistics();

            try
            {
                SqlDataReader reader =
                    command.ExecuteReader();

                if (reader.Read())
                {
                    statistics.DailyLogins =
                        Convert.ToInt32(
                            reader["DailyLogins"]
                        );

                    statistics.ImportedCountries =
                        Convert.ToInt32(
                            reader["ImportedCountries"]
                        );

                    statistics.SavedCountries =
                        Convert.ToInt32(
                            reader["SavedCountries"]
                        );

                    statistics.CreatedShares =
                        Convert.ToInt32(
                            reader["CreatedShares"]
                        );
                }

                reader.Close();

                return statistics;
            }
            finally
            {
                connection.Close();
            }
        }

        // COUNTRIES CRUD, SEARCH, FILTER AND SORT
        public List<Country> GetCountries(
            string? searchText = null,
            int? continentId = null,
            int? languageId = null,
            string? currencyCode = null,
            long? minPopulation = null,
            long? maxPopulation = null,
            double? minArea = null,
            double? maxArea = null,
            string sortBy = "name",
            string sortDirection = "asc")
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@SearchText",
                string.IsNullOrWhiteSpace(searchText)
                    ? DBNull.Value
                    : searchText
            );

            parameters.Add(
                "@ContinentId",
                continentId.HasValue
                    ? continentId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@LanguageId",
                languageId.HasValue
                    ? languageId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@CurrencyCode",
                string.IsNullOrWhiteSpace(currencyCode)
                    ? DBNull.Value
                    : currencyCode
            );

            parameters.Add(
                "@MinPopulation",
                minPopulation.HasValue
                    ? minPopulation.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@MaxPopulation",
                maxPopulation.HasValue
                    ? maxPopulation.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@MinArea",
                minArea.HasValue
                    ? minArea.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@MaxArea",
                maxArea.HasValue
                    ? maxArea.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@SortBy",
                string.IsNullOrWhiteSpace(sortBy)
                    ? "name"
                    : sortBy.ToLower()
            );

            parameters.Add(
                "@SortDirection",
                string.IsNullOrWhiteSpace(sortDirection)
                    ? "asc"
                    : sortDirection.ToLower()
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetCountries",
                    connection,
                    parameters
                );

            List<Country> countries =
                new List<Country>();

            try
            {
                SqlDataReader reader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (reader.Read())
                {
                    Country country =
                        ReadCountryFromDataReader(reader);

                    countries.Add(country);
                }

                return countries;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public Country? GetCountryById(int countryId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@CountryId",
                countryId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetCountryById",
                    connection,
                    parameters
                );

            try
            {
                SqlDataReader reader =
                    command.ExecuteReader();

                Country? country = null;

                // Result set 1:
                // Country details
                if (reader.Read())
                {
                    country =
                        ReadCountryFromDataReader(reader);
                }

                if (country == null)
                {
                    reader.Close();
                    connection.Close();

                    return null;
                }

                // Result set 2:
                // Country languages
                if (reader.NextResult())
                {
                    while (reader.Read())
                    {
                        Language language =
                            new Language();

                        language.LanguageId =
                            Convert.ToInt32(
                                reader["LanguageId"]
                            );

                        language.LanguageCode =
                            reader["LanguageCode"]
                                .ToString() ?? "";

                        language.LanguageName =
                            reader["LanguageName"]
                                .ToString() ?? "";

                        country.Languages.Add(language);
                    }
                }

                // Result set 3:
                // Country currencies
                if (reader.NextResult())
                {
                    while (reader.Read())
                    {
                        CurrencyImport currency =
                            new CurrencyImport();

                        currency.CurrencyCode =
                            reader["CurrencyCode"]
                                .ToString() ?? "";

                        currency.CurrencyName =
                            reader["CurrencyName"]
                                .ToString() ?? "";

                        currency.CurrencySymbol =
                            reader["CurrencySymbol"] ==
                            DBNull.Value
                                ? ""
                                : reader["CurrencySymbol"]
                                    .ToString() ?? "";

                        country.Currencies.Add(currency);
                    }
                }

                reader.Close();
                connection.Close();

                return country;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        public int CreateCountry(
            CreateCountryRequest request)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                CreateCountryParameters(request);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_CreateCountry",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        public int UpdateCountry(
            int countryId,
            UpdateCountryRequest request)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                CreateCountryParameters(request);

            parameters.Add(
                "@CountryId",
                countryId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_UpdateCountry",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        public int DeleteCountry(int countryId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@CountryId",
                countryId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_DeleteCountry",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        private Country ReadCountryFromDataReader(
            SqlDataReader reader)
        {
            Country country =
                new Country();

            country.CountryId =
                Convert.ToInt32(
                    reader["CountryId"]
                );

            country.Cca2 =
                reader["Cca2"] == DBNull.Value
                    ? null
                    : reader["Cca2"].ToString();

            country.Cca3 =
                reader["Cca3"].ToString() ?? "";

            country.CommonName =
                reader["CommonName"].ToString() ?? "";

            country.OfficialName =
                reader["OfficialName"] == DBNull.Value
                    ? null
                    : reader["OfficialName"].ToString();

            country.Capital =
                reader["Capital"] == DBNull.Value
                    ? null
                    : reader["Capital"].ToString();

            country.ContinentId =
                reader["ContinentId"] == DBNull.Value
                    ? null
                    : Convert.ToInt32(
                        reader["ContinentId"]
                    );

            country.ContinentName =
                reader["ContinentName"] == DBNull.Value
                    ? null
                    : reader["ContinentName"].ToString();

            country.Region =
                reader["Region"] == DBNull.Value
                    ? null
                    : reader["Region"].ToString();

            country.Subregion =
                reader["Subregion"] == DBNull.Value
                    ? null
                    : reader["Subregion"].ToString();

            country.Population =
                Convert.ToInt64(
                    reader["Population"]
                );

            country.Area =
                Convert.ToDouble(
                    reader["Area"]
                );

            country.FlagUrl =
                reader["FlagUrl"] == DBNull.Value
                    ? null
                    : reader["FlagUrl"].ToString();

            country.GoogleMapsUrl =
                reader["GoogleMapsUrl"] == DBNull.Value
                    ? null
                    : reader["GoogleMapsUrl"].ToString();

            country.Latitude =
                reader["Latitude"] == DBNull.Value
                    ? null
                    : Convert.ToDecimal(
                        reader["Latitude"]
                    );

            country.Longitude =
                reader["Longitude"] == DBNull.Value
                    ? null
                    : Convert.ToDecimal(
                        reader["Longitude"]
                    );

            country.IsIndependent =
                reader["IsIndependent"] == DBNull.Value
                    ? null
                    : Convert.ToBoolean(
                        reader["IsIndependent"]
                    );

            country.IsActive =
                Convert.ToBoolean(
                    reader["IsActive"]
                );

            country.ImportedAt =
                Convert.ToDateTime(
                    reader["ImportedAt"]
                );

            if (
                reader["UpdatedAt"] !=
                DBNull.Value
            )
            {
                country.UpdatedAt =
                    Convert.ToDateTime(
                        reader["UpdatedAt"]
                    );
            }

            return country;
        }

        private Dictionary<string, object>
            CreateCountryParameters(
                CreateCountryRequest request)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@Cca2",
                string.IsNullOrWhiteSpace(request.Cca2)
                    ? DBNull.Value
                    : request.Cca2
            );

            parameters.Add(
                "@Cca3",
                request.Cca3
            );

            parameters.Add(
                "@CommonName",
                request.CommonName
            );

            parameters.Add(
                "@OfficialName",
                string.IsNullOrWhiteSpace(
                    request.OfficialName
                )
                    ? DBNull.Value
                    : request.OfficialName
            );

            parameters.Add(
                "@Capital",
                string.IsNullOrWhiteSpace(
                    request.Capital
                )
                    ? DBNull.Value
                    : request.Capital
            );

            parameters.Add(
                "@ContinentId",
                request.ContinentId.HasValue
                    ? request.ContinentId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Region",
                string.IsNullOrWhiteSpace(
                    request.Region
                )
                    ? DBNull.Value
                    : request.Region
            );

            parameters.Add(
                "@Subregion",
                string.IsNullOrWhiteSpace(
                    request.Subregion
                )
                    ? DBNull.Value
                    : request.Subregion
            );

            parameters.Add(
                "@Population",
                request.Population
            );

            parameters.Add(
                "@Area",
                request.Area
            );

            parameters.Add(
                "@FlagUrl",
                string.IsNullOrWhiteSpace(
                    request.FlagUrl
                )
                    ? DBNull.Value
                    : request.FlagUrl
            );

            parameters.Add(
                "@GoogleMapsUrl",
                string.IsNullOrWhiteSpace(
                    request.GoogleMapsUrl
                )
                    ? DBNull.Value
                    : request.GoogleMapsUrl
            );

            parameters.Add(
                "@Latitude",
                request.Latitude.HasValue
                    ? request.Latitude.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Longitude",
                request.Longitude.HasValue
                    ? request.Longitude.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@IsIndependent",
                request.IsIndependent.HasValue
                    ? request.IsIndependent.Value
                    : DBNull.Value
            );

            return parameters;
        }

        private Dictionary<string, object>
            CreateCountryParameters(
                UpdateCountryRequest request)
        {
            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@Cca2",
                string.IsNullOrWhiteSpace(request.Cca2)
                    ? DBNull.Value
                    : request.Cca2
            );

            parameters.Add(
                "@Cca3",
                request.Cca3
            );

            parameters.Add(
                "@CommonName",
                request.CommonName
            );

            parameters.Add(
                "@OfficialName",
                string.IsNullOrWhiteSpace(
                    request.OfficialName
                )
                    ? DBNull.Value
                    : request.OfficialName
            );

            parameters.Add(
                "@Capital",
                string.IsNullOrWhiteSpace(
                    request.Capital
                )
                    ? DBNull.Value
                    : request.Capital
            );

            parameters.Add(
                "@ContinentId",
                request.ContinentId.HasValue
                    ? request.ContinentId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Region",
                string.IsNullOrWhiteSpace(
                    request.Region
                )
                    ? DBNull.Value
                    : request.Region
            );

            parameters.Add(
                "@Subregion",
                string.IsNullOrWhiteSpace(
                    request.Subregion
                )
                    ? DBNull.Value
                    : request.Subregion
            );

            parameters.Add(
                "@Population",
                request.Population
            );

            parameters.Add(
                "@Area",
                request.Area
            );

            parameters.Add(
                "@FlagUrl",
                string.IsNullOrWhiteSpace(
                    request.FlagUrl
                )
                    ? DBNull.Value
                    : request.FlagUrl
            );

            parameters.Add(
                "@GoogleMapsUrl",
                string.IsNullOrWhiteSpace(
                    request.GoogleMapsUrl
                )
                    ? DBNull.Value
                    : request.GoogleMapsUrl
            );

            parameters.Add(
                "@Latitude",
                request.Latitude.HasValue
                    ? request.Latitude.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Longitude",
                request.Longitude.HasValue
                    ? request.Longitude.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@IsIndependent",
                request.IsIndependent.HasValue
                    ? request.IsIndependent.Value
                    : DBNull.Value
            );

            return parameters;
        }

        // USER COUNTRY LISTS
        public List<UserCountryList> GetUserCountryLists(
            int userId,
            byte? listType = null)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@UserId",
                userId
            );

            parameters.Add(
                "@ListType",
                listType.HasValue
                    ? listType.Value
                    : DBNull.Value
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetUserCountryLists",
                    connection,
                    parameters
                );

            List<UserCountryList> countries =
                new List<UserCountryList>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    UserCountryList item =
                        ReadUserCountryListFromDataReader(
                            dataReader
                        );

                    countries.Add(item);
                }

                return countries;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public UserCountryList? GetUserCountryListStatus(
            int userId,
            int countryId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@UserId",
                userId
            );

            parameters.Add(
                "@CountryId",
                countryId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetUserCountryListStatus",
                    connection,
                    parameters
                );

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                if (dataReader.Read())
                {
                    UserCountryList item =
                        new UserCountryList();

                    item.UserId =
                        Convert.ToInt32(
                            dataReader["UserId"]
                        );

                    item.CountryId =
                        Convert.ToInt32(
                            dataReader["CountryId"]
                        );

                    item.ListType =
                        Convert.ToByte(
                            dataReader["ListType"]
                        );

                    item.AddedAt =
                        Convert.ToDateTime(
                            dataReader["AddedAt"]
                        );

                    return item;
                }

                return null;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int AddOrUpdateUserCountryList(
            UserCountryListRequest request)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@UserId",
                request.UserId
            );

            parameters.Add(
                "@CountryId",
                request.CountryId
            );

            parameters.Add(
                "@ListType",
                request.ListType
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_AddOrUpdateUserCountryList",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        public int DeleteUserCountryList(
            int userId,
            int countryId)
        {
            SqlConnection connection;

            try
            {
                connection = Connect();
            }
            catch (Exception)
            {
                throw;
            }

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@UserId",
                userId
            );

            parameters.Add(
                "@CountryId",
                countryId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_DeleteUserCountryList",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }
        private UserCountryList ReadUserCountryListFromDataReader(
            SqlDataReader dataReader)
        {
            UserCountryList item =
                new UserCountryList();

            item.UserId =
                Convert.ToInt32(
                    dataReader["UserId"]
                );

            item.CountryId =
                Convert.ToInt32(
                    dataReader["CountryId"]
                );

            item.ListType =
                Convert.ToByte(
                    dataReader["ListType"]
                );

            item.AddedAt =
                Convert.ToDateTime(
                    dataReader["AddedAt"]
                );

            item.Cca3 =
                dataReader["Cca3"].ToString() ?? "";

            item.CommonName =
                dataReader["CommonName"].ToString() ?? "";

            item.Population =
                Convert.ToInt64(
                    dataReader["Population"]
                );

            item.Area =
                Convert.ToDouble(
                    dataReader["Area"]
                );

            if (dataReader["Cca2"] != DBNull.Value)
            {
                item.Cca2 =
                    dataReader["Cca2"].ToString();
            }

            if (
                dataReader["OfficialName"] !=
                DBNull.Value
            )
            {
                item.OfficialName =
                    dataReader["OfficialName"]
                        .ToString();
            }

            if (dataReader["Capital"] != DBNull.Value)
            {
                item.Capital =
                    dataReader["Capital"].ToString();
            }

            if (
                dataReader["ContinentId"] !=
                DBNull.Value
            )
            {
                item.ContinentId =
                    Convert.ToInt32(
                        dataReader["ContinentId"]
                    );
            }

            if (
                dataReader["ContinentName"] !=
                DBNull.Value
            )
            {
                item.ContinentName =
                    dataReader["ContinentName"]
                        .ToString();
            }

            if (dataReader["Region"] != DBNull.Value)
            {
                item.Region =
                    dataReader["Region"].ToString();
            }

            if (
                dataReader["Subregion"] !=
                DBNull.Value
            )
            {
                item.Subregion =
                    dataReader["Subregion"].ToString();
            }

            if (dataReader["FlagUrl"] != DBNull.Value)
            {
                item.FlagUrl =
                    dataReader["FlagUrl"].ToString();
            }

            if (
                dataReader["GoogleMapsUrl"] !=
                DBNull.Value
            )
            {
                item.GoogleMapsUrl =
                    dataReader["GoogleMapsUrl"]
                        .ToString();
            }

            if (
                dataReader["Latitude"] !=
                DBNull.Value
            )
            {
                item.Latitude =
                    Convert.ToDecimal(
                        dataReader["Latitude"]
                    );
            }

            if (
                dataReader["Longitude"] !=
                DBNull.Value
            )
            {
                item.Longitude =
                    Convert.ToDecimal(
                        dataReader["Longitude"]
                    );
            }

            if (
                dataReader["IsIndependent"] !=
                DBNull.Value
            )
            {
                item.IsIndependent =
                    Convert.ToBoolean(
                        dataReader["IsIndependent"]
                    );
            }

            return item;
        }

        // SHARES
        public List<Share> GetShares(
            string? searchText = null,
            int? countryId = null,
            int? userId = null,
            byte? shareType = null,
            byte? rating = null,
            string sortDirection = "desc")
        {
            SqlConnection connection =
                Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@SearchText",
                string.IsNullOrWhiteSpace(searchText)
                    ? DBNull.Value
                    : searchText.Trim()
            );

            parameters.Add(
                "@CountryId",
                countryId.HasValue
                    ? countryId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@UserId",
                userId.HasValue
                    ? userId.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@ShareType",
                shareType.HasValue
                    ? shareType.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@Rating",
                rating.HasValue
                    ? rating.Value
                    : DBNull.Value
            );

            parameters.Add(
                "@SortDirection",
                sortDirection
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetShares",
                    connection,
                    parameters
                );

            List<Share> shares =
                new List<Share>();

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (dataReader.Read())
                {
                    shares.Add(
                        ReadShareFromDataReader(
                            dataReader
                        )
                    );
                }

                return shares;
            }
            catch
            {
                connection.Close();
                throw;
            }
        }
        public Share? GetShareById(
            int shareId)
        {
            SqlConnection connection =
                Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@ShareId",
                shareId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetShareById",
                    connection,
                    parameters
                );

            try
            {
                SqlDataReader dataReader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                if (dataReader.Read())
                {
                    return ReadShareFromDataReader(
                        dataReader
                    );
                }

                return null;
            }
            catch
            {
                connection.Close();
                throw;
            }
        }
        public int CreateShare(
            CreateShareRequest request)
        {
            SqlConnection connection =
                Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@UserId",
                request.UserId
            );

            parameters.Add(
                "@CountryId",
                request.CountryId
            );

            parameters.Add(
                "@ShareType",
                request.ShareType
            );

            parameters.Add(
                "@Content",
                request.Content
            );

            parameters.Add(
                "@Rating",
                request.Rating.HasValue
                    ? request.Rating.Value
                    : DBNull.Value
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_CreateShare",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch
            {
                connection.Close();
                throw;
            }
        }
        public int UpdateShare(
            int shareId,
            UpdateShareRequest request)
        {
            SqlConnection connection =
                Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@ShareId",
                shareId
            );

            parameters.Add(
                "@ActorUserId",
                request.ActorUserId
            );

            parameters.Add(
                "@CountryId",
                request.CountryId
            );

            parameters.Add(
                "@ShareType",
                request.ShareType
            );

            parameters.Add(
                "@Content",
                request.Content
            );

            parameters.Add(
                "@Rating",
                request.Rating.HasValue
                    ? request.Rating.Value
                    : DBNull.Value
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_UpdateShare",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch
            {
                connection.Close();
                throw;
            }
        }
        public int DeleteShare(
            int shareId,
            int actorUserId)
        {
            SqlConnection connection =
                Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add(
                "@ShareId",
                shareId
            );

            parameters.Add(
                "@ActorUserId",
                actorUserId
            );

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_DeleteShare",
                    connection,
                    parameters
                );

            try
            {
                object? result =
                    command.ExecuteScalar();

                connection.Close();

                if (
                    result == null ||
                    result == DBNull.Value
                )
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch
            {
                connection.Close();
                throw;
            }
        }
        private Share ReadShareFromDataReader(
            SqlDataReader dataReader)
        {
            Share share =
                new Share();

            share.ShareId =
                Convert.ToInt32(
                    dataReader["ShareId"]
                );

            share.UserId =
                Convert.ToInt32(
                    dataReader["UserId"]
                );

            share.FullName =
                dataReader["FullName"]
                    .ToString() ?? "";

            share.RoleId =
                Convert.ToInt32(
                    dataReader["RoleId"]
                );

            share.RoleName =
                dataReader["RoleName"]
                    .ToString() ?? "";

            share.CanShare =
                Convert.ToBoolean(
                    dataReader["CanShare"]
                );

            share.CountryId =
                Convert.ToInt32(
                    dataReader["CountryId"]
                );

            share.Cca3 =
                dataReader["Cca3"]
                    .ToString() ?? "";

            share.CommonName =
                dataReader["CommonName"]
                    .ToString() ?? "";

            share.ShareType =
                Convert.ToByte(
                    dataReader["ShareType"]
                );

            share.Content =
                dataReader["Content"]
                    .ToString() ?? "";

            share.CreatedAt =
                Convert.ToDateTime(
                    dataReader["CreatedAt"]
                );

            share.IsDeleted =
                Convert.ToBoolean(
                    dataReader["IsDeleted"]
                );

            if (dataReader["Cca2"] != DBNull.Value)
            {
                share.Cca2 =
                    dataReader["Cca2"].ToString();
            }

            if (
                dataReader["OfficialName"] !=
                DBNull.Value
            )
            {
                share.OfficialName =
                    dataReader["OfficialName"]
                        .ToString();
            }

            if (
                dataReader["Capital"] !=
                DBNull.Value
            )
            {
                share.Capital =
                    dataReader["Capital"].ToString();
            }

            if (
                dataReader["FlagUrl"] !=
                DBNull.Value
            )
            {
                share.FlagUrl =
                    dataReader["FlagUrl"].ToString();
            }

            if (
                dataReader["ContinentId"] !=
                DBNull.Value
            )
            {
                share.ContinentId =
                    Convert.ToInt32(
                        dataReader["ContinentId"]
                    );
            }

            if (
                dataReader["ContinentName"] !=
                DBNull.Value
            )
            {
                share.ContinentName =
                    dataReader["ContinentName"]
                        .ToString();
            }

            if (
                dataReader["Rating"] !=
                DBNull.Value
            )
            {
                share.Rating =
                    Convert.ToByte(
                        dataReader["Rating"]
                    );
            }

            if (
                dataReader["UpdatedAt"] !=
                DBNull.Value
            )
            {
                share.UpdatedAt =
                    Convert.ToDateTime(
                        dataReader["UpdatedAt"]
                    );
            }

            return share;
        }

        // QUIZ GAMES (Country Clash / Mystery Country)
        public int AddQuizAttempt(
            string quizTitle,
            int userId,
            int score,
            int correctAnswers,
            int totalQuestions,
            int timeTakenSeconds)
        {
            SqlConnection connection = Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@QuizTitle", quizTitle);
            parameters.Add("@UserId", userId);
            parameters.Add("@Score", score);
            parameters.Add("@CorrectAnswers", correctAnswers);
            parameters.Add("@TotalQuestions", totalQuestions);
            parameters.Add("@TimeTakenSeconds", timeTakenSeconds);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_AddQuizAttempt",
                    connection,
                    parameters
                );

            try
            {
                object? result = command.ExecuteScalar();

                connection.Close();

                if (result == null || result == DBNull.Value)
                {
                    return 0;
                }

                return Convert.ToInt32(result);
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

        public List<QuizLeaderboardEntry> GetQuizLeaderboard(
            string quizTitle,
            int topN)
        {
            SqlConnection connection = Connect();

            Dictionary<string, object> parameters =
                new Dictionary<string, object>();

            parameters.Add("@QuizTitle", quizTitle);
            parameters.Add("@TopN", topN);

            SqlCommand command =
                CreateCommandWithStoredProcedure(
                    "sp_GetQuizLeaderboard",
                    connection,
                    parameters
                );

            List<QuizLeaderboardEntry> entries =
                new List<QuizLeaderboardEntry>();

            try
            {
                SqlDataReader reader =
                    command.ExecuteReader(
                        CommandBehavior.CloseConnection
                    );

                while (reader.Read())
                {
                    QuizLeaderboardEntry entry =
                        new QuizLeaderboardEntry();

                    entry.UserId =
                        Convert.ToInt32(reader["UserId"]);

                    entry.FullName =
                        reader["FullName"].ToString() ?? "";

                    entry.BestScore =
                        Convert.ToInt32(reader["BestScore"]);

                    entry.Attempts =
                        Convert.ToInt32(reader["Attempts"]);

                    entries.Add(entry);
                }

                return entries;
            }
            catch (Exception)
            {
                connection.Close();
                throw;
            }
        }

    }
}