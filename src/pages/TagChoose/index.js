import './index.scss'
import Header from '../../component/Header';


function TagChoose() {
    return (
        <div className="tagChoosePage">
            <Header/>
            <div className="tagChooseContainer">
                <div className="tagChooseRec">
                    <div className="tagChooseRecTitle">欢迎来到GameRecommend，请选择你喜欢的标签</div>
                </div>
            </div>
        </div>
    )
}

export default TagChoose