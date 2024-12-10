import "./index.scss";
import React,{ useState, useEffect } from "react";
import Header from "../../component/Header";
import GameFilter from "../../component/GameFilter";
import GameCard from "../../component/GameCard";

const analogGameData=[
    {
        "game_id": 1,
            "game_name": "Red Dead Redemption 2",
            "game_platform": "PlayStation",
            "game_rating": 9.7,
            "game_cover": "https://img3.doubanio.com/lpic/s29756927.jpg",
            "developer": "Rockstar",
            "game_description": "这是一款非常经典的动作冒险游戏",
            "tags": [
                "射击",
                "冒险",
                "动作"
            ]
    }
]

function Home() {

    const [selectedCategory, setSelectedCategory] = useState("全部");
    const [gameData,setGameData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGameData = async () =>{
        try{
            const response = await fetch('');//后端API
            const data =await response.json();
            setGameData(data);
            setIsLoading(false);
        }catch(error){
            console.error('Failed to fetch data:',error);
            setIsLoading(false);
        }
    };
    fetchGameData();
},[]);
    useEffect(() => {
        setIsLoading(false);
    },[]);



    const handleCategorySelect= (category) => {
      setSelectedCategory(category);  
    };

    const getGameDataByCategory = () => {
        if (selectedCategory === "全部") {
            return gameData.filter(game => game.tags.includes(selectedCategory));
        }
        // 如果需要，可以在这里添加根据类别筛选游戏的逻辑
        // 例如，如果 analogGameData 是一个对象，可以这样筛选：
        // return analogGameData[category] || [];
        return [];
    };

    

    return (
        <div className="homePage">
            <Header />
            <div className="mainContentContainer">
            <div className="mainContent">
                <div className="mainContentLeft">
                    <div className="gameListTitle">
                        游戏排行
                    </div>
                    <hr />
                    <div className="gameList">
                    <GameFilter onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory} />
        <hr />
                    <div className="gameListContent">
                    {isLoading ? (
                        <p>Loading...</p>
                        ) :  (
                        <>
                            <div className="gameListHeader"></div>
                            <ul>
                                        {getGameDataByCategory().map((game) => (
                                            
                                            <GameCard 
                                            key={game.game_id}
                                            gameId={game.game_id} 
                                            gameName={game.game_name} 
                                            gameRating={game.game_rating}
                                            gamePlatform={game.game_platform} 
                                            gameCover={game.game_cover} 
                                            developer={game.developer} 
                                            tags={game.tags} />
                                        ))}
                                    </ul>
                        </>
                        
                        )}
                    </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

export default Home;