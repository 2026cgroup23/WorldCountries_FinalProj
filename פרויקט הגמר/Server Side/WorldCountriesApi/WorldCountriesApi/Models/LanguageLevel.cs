namespace WorldCountriesApi.Models
{
    public class LanguageLevel
    {
        int levelId;
        string levelName = "";
        int levelOrder;

        public LanguageLevel()
        {
        }

        public LanguageLevel(int levelId, string levelName, int levelOrder)
        {
            LevelId = levelId;
            LevelName = levelName;
            LevelOrder = levelOrder;
        }

        public int LevelId
        {
            get => levelId;
            set => levelId = value;
        }

        public string LevelName
        {
            get => levelName;
            set => levelName = value;
        }

        public int LevelOrder
        {
            get => levelOrder;
            set => levelOrder = value;
        }
    }
}