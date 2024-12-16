import './index.scss';
import React, { useState, useEffect,useRef } from 'react';
import Header from '../../component/Header';
import GameCard from '../../component/GameCard';
import axios from 'axios';


const GameRecommend = () => {
    const [gameRecommendList, setGameRecommendList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const pageSize=50;
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const loader = useRef(null); // 用于懒加载的观察器

    
        

        const fetchGameRecommend = async (page = 1) => {
            try{
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://127.0.0.1:8000/recommend/${page}`,{
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                })

                const data = response.data.data;

                if(response.status === 200){
                    if (page === 1) {
                        setGameRecommendList(data);
                    } else {
                        setGameRecommendList((prevData) => [...prevData, ...data]);
                    }
                    setHasMore(data.length === pageSize);

                }
    
            }catch(error){
                console.log(error);
                setError(error.message);
            }finally{
                setIsLoading(false);
            }
        };

    useEffect(()=>{
        fetchGameRecommend();
    },[]);

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

    useEffect(() => {
            if(currentPage >1){
                fetchGameRecommend(currentPage);
            }
    },[currentPage]);

    return(
        <div className="gameRecommend">
            <Header/>
            <div className="gameRecommendContent">
                <div className="gameRecommendTitle">您的个性化游戏推荐</div>
                <div className="gameRecommendList">
                    {isLoading?(
                        <p>Loading...</p>
                    ):(<>
                        <ul>
                            {gameRecommendList ? (gameRecommendList.map((game) =>(
                                <GameCard
                                key={game.game_id}
                                gameId={game.game_id} 
                                gameName={game.game_name} 
                                gameRating={game.game_rating}
                                gamePlatform={game.game_platform} 
                                gameCover={game.game_cover} 
                                developer={game.developer} 
                                tags={game.tags}
                                />
                            ))
                            ):(
                                <p>暂无推荐</p>
                            )}
                        </ul>
                            <div
                            ref={loader}
                            style={{
                                textAlign: "center",
                                padding: "10px",
                            }}
                        >
                            {hasMore ? "加载更多..." : "没有更多数据了"}
                        </div>
                        </>
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default GameRecommend;