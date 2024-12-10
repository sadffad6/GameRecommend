import './index.scss';

function GameCard({gameId,gameName,gamePlatform,gameRating,gameCover,developer,tags}) {
    function getRatingLabel(rating) {
        if (rating === 10) return 'essential';
        if (rating >= 8) return 'superb';
        if (rating >= 6) return 'good';
        if (rating >= 4) return 'fair';
        if (rating >= 2) return 'poor';
        return 'terrible';
      }

    return(
        <a href={`/game/${gameId}`} className="gameCardLink">
            <div className="gameCard">
                <div className="gameCardContent">
                    <div className="gameCardContentLeft">
                        <div className="gameCardPlatform">
                            {gamePlatform}
                        </div>
                        <div className="gameCardTitle">{gameName}</div>
                        <div className="gameCardContentFooter">
                        <div className="gameCardTags">
                            {tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                        
                        <div className="gameCardDeveloper">
                            {developer}
                        </div>
                        </div>
                        
                        
                    </div>
                    <div className="gameCardContentRight">
                            <div className="gameCardRating">
                            <div className="gameCardRatingRing">
                                <svg width="48" height="48" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" stroke="grey" strokeWidth="10" fill="none" />
                                    <circle cx="50" cy="50" r="45" stroke="red" strokeWidth="10" fill="none" 
                                    style={{ strokeDasharray: `282.743, 282.743`, 
                                        strokeDashoffset: `${(10 - gameRating) * 28.2743}`,
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: '50% 50%',
                                    }}/>
                                    <text x="50" y="50" dominantBaseline="central" textAnchor="middle" fill="black">
                                    {gameRating}
                                    </text>
                                </svg>
                            </div>
                            </div> 
                            <div className="gameCardRatingInfo">
                            {getRatingLabel(gameRating)}
                            </div>

                    </div>
                </div>
                <div >
                    <img src={gameCover} alt={gameName}className="gameCardImage"/>
                </div>
            </div>
        </a>
    )
}

export default GameCard;