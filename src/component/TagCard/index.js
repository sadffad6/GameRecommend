import './index.scss'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TagCard({tag,isSelected,onClick}){

    const cardClass = isSelected ? 'tagCard selected' : 'tagCard';

    return(
        <>
            <div className={cardClass} onClick={() => onClick(tag)}>
                {tag}
            </div>
        </>
    )

}

export default TagCard;