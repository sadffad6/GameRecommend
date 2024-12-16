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

const RatingStars =({rating,onHover,onClick,isInteractive})=>{
    return (
        <div 
            className="rating-stars"
            onMouseLeave={isInteractive ? onHover.bind(null, null) : undefined}
        >
            {[...Array(10)].map((_, index) => {
                const starIndex = index + 1;
                const isFilled = starIndex <= rating;
                return (
                    <span
                        key={starIndex}
                        className={`star ${isFilled ? 'filled' : 'empty'}`}
                        onMouseEnter={isInteractive ? () => onHover(starIndex) : undefined}
                        onClick={isInteractive ? () => onClick(starIndex) : undefined}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
}

function Game() {
    const {gameId} = useParams();
    const [gameData,setGameData] = useState([]);
    const [rating,setRating] = useState(0);
    const [tempRating,setTempRating] = useState(0);
    const [loading, setLoading] = useState(true); // 是否正在加载
    const [error, setError] = useState(null); // 是否发生错误
    const [comments, setComments] = useState([]); // 存储评论列表
    const [newComment, setNewComment] = useState(""); // 新评论内容
    const [newRating, setNewRating] = useState(""); // 新评分
    const [userName, setUserName] = useState(""); // 用户名

    const handleClick=(index)=>{
        setNewRating(index);
    };

    const handleMouseEnter = (index) => {
        setTempRating(index); // 显示临时评分提示
    };

    const handleMouseLeave=()=>{
        setTempRating(null);
    }

    const handleReset=()=>{
        setNewRating(0);
        setTempRating(null);
    }

    useEffect(()=>{
        const fetchData = async () => {
            try{
                const token=localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found. Please log in.');
                }
                const response = await fetch(`http://127.0.0.1:8000/detail/${gameId}/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });

                const data=await response.json();

                console.log('Response data:', data); // 检查返回的数据
                if(data && data.status === 200){
                    
                    const selectedData =data.data.game_details;
                    const tags = data.data.tags||[];
                    const formattedData = {
                        ...selectedData,
                        tags
                    };
                    setGameData(formattedData);
                }else {
                    throw new Error('Unexpected response structure.');
                }
                
            }catch(error){
                console.error('Error fetching data:', error.message);
                setError(error.message);
                setGameData(analogGameData[0]); // 设置备用数据
            }finally {
                setLoading(false); // 加载完成
            }
        };

    fetchData();
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
        if (!introduction) {
            return <p>正在加载...</p>; // 如果描述为空或未加载，显示占位内容
        }
        return (
            <>
                {introduction.split("\\r', '").map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}
            </>
        );
    };

    useEffect(() => {
        const fetchComments = async () => {
            try{
                const token=localStorage.getItem('token');
                const response =await fetch(`http://127.0.0.1:8000/detail/${gameId}/`,{
                    headers:{
                        'Authorization': `Token ${token}`,
                    }
                    }
                );
                const data = await response.json();//用axios的时候不用写这一步
                setComments(data.data.comments);

                //获取用户名

            }catch (error) {
                setError(error);
            }
        };
        fetchComments();
    },[gameId]);

    const handleNewComment =async()=>{
        try{
            const token=localStorage.getItem('token');
            if(!newComment||!newComment.trim()){
                alert('请输入评论内容');
                return;
            }
            const response=await axios.post(`http://127.0.0.1:8000/detail/${gameId}/`,{
                comment:newComment,user_rating:newRating
            },{
                headers:{
                    'Authorization': `Token ${token}`,
                }
            });

            const newCommentObject = {
                user_id:response.data.user_id,
                username:userName,
                comment: newComment,
                user_rating: newRating,
                timestamp: new Date().toISOString(),
            }

            // 更新本地 state，无需重新 fetch
            setComments((prevComments) => [newCommentObject, ...prevComments]);

            setNewComment("");
            setNewRating(0);

            // 等待一段时间，比如500毫秒

            /*const response = await axios.get(`http://127.0.0.1:8000/detail/${gameId}/`, {
                headers: { Authorization: `Token ${token}` },
              });

              setComments(response.data.comments);*/

        }catch(error){
            setError(error);
        }
    }

    const handleInputChange = (e) => {
        const textarea = e.target;
        // 重置高度以便正确计算内容高度
        textarea.style.height = "auto";
        // 根据内容调整高度
        textarea.style.height = `${textarea.scrollHeight}px`;
        setNewComment(textarea.value); // 更新状态
    };
    
    

    if (loading) {
        return <p>加载中...</p>;
    }
    
    if (error) {
        return <p>发生错误：{error.message || '未知错误'}</p>;
    }

    

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
                                            {(gameData.tags || []).map((tag) => (
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
                                <div className="gameDetailCommentContent">
                                {comments&&comments.length>0 ? (
                                        comments.map((comment,index)=>(
                                            <div key={index}className="commentItem">
                                                <div className="userRatingRec">
                                                    <strong>{comment.username}</strong> <RatingStars rating={comment.user_rating} isInteractive={false} />
                                                </div>
                                                <div className="userCommentRec">{comment.comment}</div>
                                                <div className="commentTimeStamp">{new Date(comment.timestamp).toLocaleString()}</div>
                                            </div>
                                        ))
                                    ):(
                                    <p>暂无评论</p>
                                        ) }
                                </div>
                            </div>
                            <div className="gameDetailUserRating">
                                <div className="gameDetailUserRatingSticky">
                                    <div className="gameDetailUserRatingTitle">我的评价</div>
                                    <div className="gameDetailUserRatingValue">
                                        <div className="addComment">
                                            <textarea
                                                className="addCommentInput"
                                                value={newComment}
                                                onChange={handleInputChange}
                                                placeholder="输入你的评论"
                                            />
                                        </div>
                                        <RatingStars
                                            rating={tempRating !== null ? tempRating : newRating}
                                            onHover={handleMouseEnter}
                                            onClick={handleClick}
                                            isInteractive={true}
                                        />
                                        <div className="ratingDisplay">
                                            <div className="ratingDisplayScore">{tempRating !== null ? `${tempRating}/10` : newRating > 0 ? `${newRating}/10` : ''}</div>
                                            <button className="ratingCancel" onClick={handleReset}>重置评分</button>
                                        </div>
                                        <div className="commentUpload">
                                            <button className="ratingSubmit" onClick={handleNewComment}>提交</button>
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