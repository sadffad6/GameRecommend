import './index.scss'
import Header from '../../component/Header';
import TagCard from '../../component/TagCard';
import {useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'


function TagChoose() {
    const tagList = [
        '冒险', '动作', '动作冒险', '即时战略', '卡牌', '大型多人在线', '射击', '文字冒险', '格斗', '模拟', '益智', '第一人称射击', '模拟', '策略', '其他'
    ]

    const developerList =[
        'UbisoftMontrealStudios', 'RockstarGames', 'SquareEnix', 'Nintendo', 'Sega', 'Capcom',
                'KonamiCorporation',  'CDProjektREDSp.zo.o.', 'ParadoxInteractiveAB'
    ]

    const [tagMapping, setTagMapping] = useState({});
    const [developerMapping, setDeveloperMapping] = useState({});
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedDevelopers, setSelectedDevelopers] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchMapping = async ()=>  {
            try{
                const token=localStorage.getItem('token');
                const response =await axios.get('http://localhost:8000/userpreference/',{
                    headers:{
                        'Authorization':  `Token ${token}`,
                    }
                });
                if(response.status === 200){
                    const tagMap={};
                    const devMap={};
                    response.data.types.forEach(type=>{
                        if(tagList.includes(type.type_name)){
                            tagMap[type.type_name]=type.type_id;
                        }
                    });
                    response.data.developers.forEach(dev => {
                        if (developerList.includes(dev.name)) {
                            devMap[dev.name] = dev.id;
                        }
                    });

                    setTagMapping(tagMap);
                    setDeveloperMapping(devMap);
                }

            }catch(error){
                console.log(error);
            }
        }
        fetchMapping();
    },[]);

    const handleTagClick = (tag,type) =>{
        if(type === 'tag'){
            setSelectedTags(prev=>
                prev.includes(tag)?prev.filter(item =>item !== tag) : [...prev, tag]);
        }else if (type === 'developer') {
            setSelectedDevelopers(prev =>
                prev.includes(tag) ? prev.filter(item => item !== tag) : [...prev, tag]
            );
        }
    };

    const enterHomePage = async () => {
        
        const gameTypes = selectedTags
        .filter(tag => tagMapping[tag]!== undefined)
        .map(tag => tagMapping[tag]);

        const developers = selectedDevelopers
        .filter(developer => developerMapping[developer] !== undefined)
        .map(developer => developerMapping[developer]);

        const postData ={
            game_types: gameTypes,
            developers: developers,
        }

        try{
            const token = localStorage.getItem('token');
            const response =await axios.post(`http://localhost:8000/userpreference/`,postData,{
                headers:{
                    'Authorization': `Token ${token}`,
                }
            });
            console.log('Data submitted successfully:', response.data);
            alert('提交成功，欢迎进入主页！');
            navigate('/');

        }catch(error){
            console.error('Failed to submit data:', error);
            alert('提交失败，请稍后重试！');
        }
    }

    return (
        <div className="tagChoosePage">
            <Header/>
            <div className="tagChooseContainer">
                <div className="tagChooseRec">
                    <div className="tagChooseRecTitle">欢迎来到GameRecommend，请选择你喜欢的标签</div>
                    <div className="tagChooseRecContent">
                            <div className="typesChoose">
                                <div className="typesChooseTitle">游戏类型：</div>
                                <div className="typesChooseContent">
                            {tagList.map((tag) => {
                                return <TagCard  
                                    key={tag}
                                    tag={tag}
                                    isSelected={selectedTags.includes(tag)}
                                    onClick={() => handleTagClick(tag, 'tag')}/>
                            })
                            }</div>
                            </div>
                            <div className="developerChoose">
                                <div className="developerChooseTitle">游戏开发商：</div>
                                <div className="developerChooseContent">{developerList.map((developer) => {
                                    return <TagCard key={developer}
                                    tag={developer}
                                    isSelected={selectedDevelopers.includes(developer)}
                                    onClick={() => handleTagClick(developer, 'developer')}/>
                                })
                                }</div>
                            </div>
                    <div className="enterHomePage">
                        <button className="enterHomePageBtn" onClick={enterHomePage}>进入主页</button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TagChoose