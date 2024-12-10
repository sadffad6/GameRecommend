import Header from "../../component/Header";
import StarRating from "../../component/StarRating";

import React from "react";
import axios from "axios";
import './index.scss';
import {useEffect,useState} from "react";
import {useParams}from 'react-router-dom';

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

function Game() {
    const {gameId} = useParams();
    const [gameData,setGameData] = useState(analogGameData[0]);
    const [rating,setRating] = useState(0);
    const [tempRating,setTempRating] = useState(0);

    const handleClick=(index)=>{
        setRating(index);
    };

    const handleMouseEnter = (index) => {
        setTempRating(index); // 显示临时评分提示
    };

    const handleMouseLeave=()=>{
        setTempRating(null);
    }

    const handleReset=()=>{
        setRating(0);
        setTempRating(null);
    }

    useEffect(()=>{
        axios.get('')//后端API
        .then((response)=>{
            const selectedData =response.data.find(game =>game.game_id === gameId);
            if(selectedData){
                setGameData(selectedData);
            }else{
                setGameData(analogGameData[0]);
            }
        })
        .catch((error)=>{
            setGameData(analogGameData[0]);
        }
        );
    },[gameId]);

    const backgroundStyle = {
        backgroundImage: `url(${gameData.game_cover})`,
        backgroundSize: 'stretch',
        backgroundPosition: 'center',
        zIndex: -3,
        position:'fixed, left: 0px, top: 0px, right: 0px, bottom: 0px',
        width: '100%', // 添加模糊效果
    };

    const renderIntroduction = (introduction) => {
        return introduction.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ));
    };

    return(
        <>
            <Header/>
            <div className="gameDetail">
                <div className="gameDetailContainer">
                    <div className="gameDetailUpper"style={backgroundStyle}>
                        <div className="gameDetailUpperInner">
                            <img className="gameCover" src={gameData.game_cover}alt={`Cover for ${gameData.game_name}`}style={{width:'auto',height:'350px'}}/>
                            <div className="gameDetailUpperText">
                                <div className="gameDetailTextContent">
                                <div className="gameTitle">{gameData.game_name}
                                <p className="gameTitleRecBottom"></p>
                                </div>
                                <div className="gameDetailUpperTextDescription">
                                    <div className="gameDescription">
                                    {renderIntroduction(gameData.game_description)}
                                    </div>
                                    <div className="gameDetailUppeerIncludingPlatform">
                                        <div className="gameDetailPlatform">平台：{gameData.game_platform}</div>
                                    <div className="gameDetailUpperTextDescriptionFooter">
                                        <div className="gameDetailTags">
                                            {gameData.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                                        </div>
                                        <div className="gameDetailDeveloper">{gameData.developer}</div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                            <div className="gameDetailUpperRight">
                                <div className="gameDetailRating">
                                    评分
                                </div><div className="gameDetailRatingValue">
                                {gameData.game_rating}<StarRating score={gameData.game_rating}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="gameDetailLower">
                        <div className="gameDetailLowerInner">
                            <div className="gameDetailComment">
                                <div className="gameDetailCommentTitle">评论</div>
                            </div>
                            <div className="gameDetailUserRating">
                                <div className="gameDetailUserRatingSticky">
                                    <div className="gameDetailUserRatingTitle">我的评分</div>
                                    <div className="gameDetailUserRatingValue">
                                        <div className="rating-stars"
                                        onMouseLeave={handleMouseLeave}>
                                            {[...Array(10)].map((_, index) => {
                                                const starIndex = index + 1;
                                                const isFilled = starIndex <= (tempRating !== null ? tempRating : rating); // 根据当前悬停或确认的评分显示星星
                                                return (
                                                    <span
                                                        key={starIndex}
                                                        className={`star ${isFilled ? 'filled' : 'empty'}`}
                                                        onMouseEnter={() => handleMouseEnter(starIndex)}
                                                        onClick={() => handleClick(starIndex)}
                                                    >
                                                        ★
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <div className="ratingDisplay">
                                            <div className="ratingDisplayScore">{tempRating !== null ? `${tempRating}/10` : rating > 0 ? `${rating}/10` : ''}</div>
                                            <button className="ratingCancel" onClick={handleReset}>重置评分</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Game;