import "./index.scss";
import React,{ useState, useEffect, useRef } from "react";
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
    const [gameData,setGameData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const pageSize=50;
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const loader = useRef(null); // 用于懒加载的观察器
    const [displayedData, setDisplayedData] = useState([]); // 当前展示的数据


    const fetchGameData = async (page = 1, category = "全部") =>{
        try{
            const response = await fetch(`http://127.0.0.1:8000/home/${page}`);//后端API
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data =await response.json();
            if (data.status === 200) {
                const Games = data.data;
                if (page === 1) {
                  setGameData(Games);
                  // 过滤数据后设置第一页展示的数据
                  setDisplayedData(
                    Games.slice(0, pageSize).filter((game) =>
                      selectedCategory === "全部"
                        ? true
                        : game.tags.includes(selectedCategory)
                    )
                  );
                } else {
                  setDisplayedData((prev) => [
                    ...prev,
                    ...Games.filter((game) =>
                      selectedCategory === "全部"
                        ? true
                        : game.tags.includes(selectedCategory)
                    ),
                  ]);
                }
                setHasMore(Games.length === pageSize); // 判断是否还有更多数据
              } else {
                console.error("Error in fetching data:", data.message);
              }
            
        }catch(error){
            console.error('Failed to fetch data:',error);
            
        }finally{
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGameData(currentPage, selectedCategory); // Initial data fetch
    }, [currentPage, selectedCategory]);

     // 创建 IntersectionObserver 实现懒加载
     useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLoading && hasMore) {
                setCurrentPage((prev) => prev + 1); // 翻页
            }
        });

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [isLoading, hasMore]);

    /*useEffect(() => {
        if(currentPage >1){
            loadMoreData();
        }
    },[currentPage]);*/

    const loadMoreData = () => {
        setCurrentPage((prev) => prev + 1); // 翻页
    };

    const getUniqueGames = (games) => {
        const gameIds = new Set();
        return games.filter((game) => {
            if (gameIds.has(game.game_id)) {
                return false;
            }
            gameIds.add(game.game_id);
            return true;
        });
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1); // Reset page to 1 when category changes
        setHasMore(true); // Reset hasMore to true for new category
        setDisplayedData([]); // 清空已展示的数据
    };

    /*const getGameDataByCategory = () => {
        if (selectedCategory === "全部") {
            
            return gameData;
        }
        return gameData.filter((game) => game.tags.includes(selectedCategory));
    };*/

    // 加载更多数据
    /*const loadMoreData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const filteredData = selectedCategory === "全部"
            ? gameData
            : gameData.filter((game) => game.tags.includes(selectedCategory));

            if (startIndex >= filteredData.length) {
                setHasMore(false);
                return;
            }
            setDisplayedData((prev) => [
                ...prev,
                ...filteredData.slice(startIndex, endIndex),
            ]);
            setCurrentPage((prev) => prev + 1);
    };*/
    

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
                                        {getUniqueGames(displayedData).map((game) => (
                                            
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
                                    <div
                                           
                                            style={{
                                                textAlign: "center",
                                                padding: "10px",
                                            }}
                                        >
                                            {hasMore ? (
                                                <button className="loadMore" onClick={loadMoreData} disabled={isLoading}>
                                                    {isLoading ? "加载中..." : "加载更多"}
                                                </button>
                                            ) : (
                                                <p>没有更多数据了</p>
                                            )}
                                        </div>
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