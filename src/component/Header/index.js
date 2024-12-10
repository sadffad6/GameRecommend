import "./index.scss";

import { useState } from "react";

function Avatar({defaultSrc}) {

    const [src,setSrc] = useState(defaultSrc);
  
    const handleImageUpload = (newSrc) => {
      setSrc(newSrc);
  };
  
    const style={
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: '1px solid #BEBEBE ',
      backgroundImage: `url(${src})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      marginRight: '10px',
      marginTop: '5px'
    }
    return(
      <div className="avatar" style={style}></div>
    );
  }

function Header() {
    return (
        <nav className="navBar">
            <a className="title" href="/">GameRecommend</a>
                <ul className="navLinks">
                    <li><a href="/">主页</a></li>
                    <li><a href="/">游戏推荐</a></li>
                    <li><a href="/">关于</a></li>
                </ul>
                <div className="avatar">
    <Avatar defaultSrc="https://img.moegirl.org.cn/moehime.jpg" />
    </div>
        </nav>
    )
}

export default Header;