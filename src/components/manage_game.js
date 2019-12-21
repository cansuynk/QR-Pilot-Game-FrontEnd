import React, {useState} from 'react';
import './manage_game.css';
import { GoogleMap, withScriptjs, withGoogleMap, Marker, InfoWindow, Circle } from "react-google-maps"
import DatePicker from "react-datepicker";
import LocTracker from "./loc_tracker"
import UpdateGame from "./update_game"
import axios from "axios"
import config from "../config";

 
import "react-datepicker/dist/react-datepicker.css";
import QrReader from 'react-qr-reader'

//This structure may be changed
const area = {
    radius: 0,
    options: {
      strokeColor: "#ff0000"
    }
};

//Data Types may be changed
const data = [
    {gametype:"hint", time: "Dec 19, 2019 22:00:00", id:1, owner:true, username: 'Player1',avatar:"https://img.icons8.com/plasticine/100/000000/user-male-circle.png", score:1, lat:41.014000, lng:28.974800},
    {gametype:"hint", time: "Dec 19, 2019 22:00:00",id:2, owner:false, username: 'Player2',avatar:"https://picturepan2.github.io/spectre/img/avatar-2.png", score:2, lat:41.015000, lng:28.975000},
    {gametype:"hint", time: "Dec 19, 2019 22:00:00",id:3, owner:false, username: 'Player3',avatar:"https://picturepan2.github.io/spectre/img/avatar-4.png", score:3, lat:41.013500, lng:28.974100},
    {gametype:"hint", time: "Dec 19, 2019 22:00:00",id:4, owner:false, username: 'Player4',avatar:"https://picturepan2.github.io/spectre/img/avatar-3.png", score:4, lat:41.013000, lng:28.974900},
    {gametype:"hint", time: "Dec 19, 2019 22:00:00",id:5, owner:false, username: 'Player5',avatar:"https://picturepan2.github.io/spectre/img/avatar-1.png", score:5, lat:41.010000, lng:28.974880},
    {gametype:"hint", time: "Dec 19, 2019 22:00:00",id:6, owner:false, username: 'Player6',avatar:"https://picturepan2.github.io/spectre/img/avatar-2.png", score:6, lat:41.013000, lng:28.972500}
];
const userInfo = [
    {gametype:"time", time: "Dec 21, 2019 22:00:00",id:5, owner:false, username: 'Player5',avatar:"https://picturepan2.github.io/spectre/img/avatar-1.png", score:5, lat:41.010000, lng:28.974880}
];
//Random avatars
const avatar = [
    "https://picturepan2.github.io/spectre/img/avatar-1.png", "https://picturepan2.github.io/spectre/img/avatar-2.png", "https://picturepan2.github.io/spectre/img/avatar-3.png",
    "https://picturepan2.github.io/spectre/img/avatar-4.png", "https://picturepan2.github.io/spectre/img/avatar-5.png", "https://img.icons8.com/plasticine/100/000000/user-male-circle.png",
    "https://img.icons8.com/bubbles/50/000000/guest-male.png","https://img.icons8.com/dusk/64/000000/user-female-circle.png","https://img.icons8.com/color/48/000000/user-female-circle.png"
];

const players_temp = [
    {username: 'Player1', score: 1},
    {username: 'Player2', score: 2},
    {username: 'Player3', score: 3},
    {username: 'Player4', score: 4},
    {username: 'Player5', score: 5},
    {username: 'Player6', score: 6}, 
];

function Map(props){
    //lat lg state
    console.log(props)
   // const google=window.google;
    const [number, desc] = useState(null);
    return(
        <GoogleMap defaultZoom={15} 
            defaultCenter={{lat: parseFloat(props.lat), lng: parseFloat(props.lng)}}
            center={{
                lat: parseFloat(props.lat),
                lng: parseFloat(props.lng)
            }}
        >
        <Marker key="1" position={{lat: parseFloat(props.lat), lng: parseFloat(props.lng)}}
        onClick={()=> {
           // desc(this);
        }}
        />
        

        <Circle
            center={{
                lat: parseFloat(props.lat),
                lng: parseFloat(props.lng)
            }}
            radius={props.radius}
            options={area.options}
            />

        {number && (
            <InfoWindow position={{
                lat:number.lat , lng: number.lng
            }}
            onCloseClick={() => {
                desc(null);
            }}
            >
            <div style={{fontWeight:"bold"}}>
            <figure className="avatar">
            <img src={number.avatar} alt="Avatar">
            
            </img> 
            {number.owner?<img src="./star.png" className="avatar-icon" alt="Star"/>:null}
            </figure>
            {number.username}
            </div></InfoWindow>
        )}

        </GoogleMap>
    );
}

var countDownDate;
const WrappedMap = withScriptjs(withGoogleMap(Map));
let timee;
class AdminManage extends React.Component {
    constructor() {
        super();
        this.state = {
            gameDATA:"",
            userName: "",
            gameName:"",
            admin_name: "",
            gameId:"",
            playerNumber:0,
            totalQR:0,
            findingQR:0,
            hintContent:"Deneme",
            gameType:"",
            playerData: [],
            remainingTime:"",
            startDate: new Date(),
            x:"",
            a:"",
            newTime:"",
            qrData:"",
            qrDiv:"",
            hint:"",
            timecontent:"",
            playersData:[],
            center_lat: 0,
            center_lng: 0,
            center_radius: 0
        }
        data.sort((a, b) => Number(b.score) - Number(a.score));
        console.log("descending", data);
        this.state.playerData = data;
        this.kickPlayer = this.kickPlayer.bind(this);
        this.changeTime = this.changeTime.bind(this);
        this.handleTime = this.handleTime.bind(this);
        this.closeWarning = this.closeWarning.bind(this);

        this.myRef = React.createRef();
        this.openCamera = this.openCamera.bind(this);
        this.updateHint = this.updateHint.bind(this);
        this.handleData = this.handleData.bind(this);
        this.closeCamera = this.closeCamera.bind(this);

    }

    /*
    componentWillUnmount() {
        localStorage.removeItem("game_title")
        localStorage.removeItem("game_id")
    }
    */
    handleData(data, err){
        if (err) {
            alert("Game cannot be loaded");
            return;
        }
        this.setState({
            gameName:data.data.title
        })


        if (this.state.admin_name === "" ){
            axios({
                method: 'get',
                url: config.PROFILE_URL + data.data.adminId,
                headers: {'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")},
            }).then(res => {
                if(res.data.success) {
                    this.setState({
                        admin_name: res.data.data.username
                    })
                } else {
                    alert("Could not fetch admin info")
                }
            }).catch( err => {
                alert("You have a connection problem")
            })
        }
        
        this.setState({ 
            gameType:data.data.type, 
            totalQR:data.data.hints.hint.length,  
            findingQR: data.data.submittedQRs,
            playersData: data.data.ranking,
            playerNumber:  data.data.ranking.length-1,
            center_radius  :data.data.location.radius,
            center_lat: data.data.location.latitude,
            center_lng: data.data.location.longitude
        })
        if(data.data.type==="Standard"){
            this.setState({hint: true})
        }
        else if (userInfo[0].gametype==="Time Rush"){        
        countDownDate = new Date(userInfo[0].time).getTime();
        timee = setInterval(this.changeTime, 1000);
        }

        var latDiff = (userInfo[0].lat - this.state.center_lat)*(userInfo[0].lat - this.state.center_lat)
        var lngDiff = (userInfo[0].lng - this.state.center_lng)*(userInfo[0].lng - this.state.center_lng)
        var result = Math.sqrt(latDiff+lngDiff)*100000

        if(result > this.state.center_radius) {
            console.log("result");
            var y =<div className="toast toast-warning" style={{textAlign:'center'}}>
                <button className="btn btn-clear float-right" onClick={this.closeWarning}></button>
                    <p>Warning!!</p>
                    You are out of the area!!!
            </div>  
            this.setState({x:y})
        }
        
       
        console.log(data)
        console.log(data.data.title)
        
    }
    closeCamera(){
        var content = ""
        this.setState({qrDiv: content})
    }
    openCamera(){
        console.log("girdi");
        var content =<div className="modal active" id="modal-id">
        
        <div className="modal-container">
          <div className="modal-header">
            <button  onClick={this.closeCamera} className="btn btn-clear float-right" aria-label="Close"></button>
            <div className="modal-title h5" style={{textAlign:"center"}}>Scan The QR Code</div>
          </div>
          <div className="modal-body">
            <div className="content">
            <div className="flex-centered">
            <QrReader
                delay={300}
                onError={this.handleError}
                onScan={this.handleScan}
                style={{ width: '80%' }}
                />
            </div>
          </div>
          </div>
          <div className="modal-footer">
          <button onClick={this.closeCamera} className="btn" aria-label="Close">Close</button>
        </div>
        </div>
      </div>

      this.setState({qrDiv: content})
    }
    updateHint(){
        this.setState({findingQR: this.state.findingQR +1, qrDiv:""})
        console.log("x:"+this.state.findingQR);
    }

    handleScan = data => {
        var content=<div className="modal active" id="modal-id">
        
        <div className="modal-container">
          <div className="modal-header">
            <a href="/play-game" className="btn btn-clear float-right" aria-label="Close"></a>
            <div className="modal-title h5" style={{textAlign:"center"}}>Scan The QR Code</div>
          </div>
          <div className="modal-body">
            <div className="content">
            <div className="flex-centered" style={{textAlign:'center', color:'blue', fontWeight:'bold', fontSize:20}}>
            Congratulations! <br></br>
            You read the qr code.<br></br>
            "{data}"
            </div>
          </div>
          </div>
          <div className="modal-footer">
          <button className="btn btn-primary" onClick={this.updateHint}>Submit</button>
          &nbsp;&nbsp;
          <button className="btn" onClick={this.openCamera}>Back</button>
        </div>
        </div>
      </div>
        if (data) {
          this.setState({
            qrData: data,
            qrDiv:content
          })
        }
        console.log(this.state.qrData);
        //alert(this.state.qrData);
      }

      handleError = err => {
        console.error(err)
      }
    //Inform all users!
    handleTime(){
        clearInterval(timee);
        
        var input = this.state.a +" "+ this.state.b
        countDownDate=new Date(input).getTime();
        timee = setInterval(this.changeTime, 1000);
        console.log(input.toString())
      
    }
    changeTime(){
      
        // Get today's date and time
        var now = new Date().getTime();
            
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
            
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.setState({
            remainingTime: days + "d " + hours + "h "
            + minutes + "m " + seconds + "s "
        })
        //console.log(this.state.remainingTime);
        
        // If the count down is over, write some text 
        if (distance < 0) {
            clearInterval(timee);
            this.setState({
            remainingTime: "Game Over"
        })
        }
        const ExampleCustomInput = ({ value, onClick }) => (
            
            <button className="btn btn-sm" onClick={onClick} ref={this.myRef}>
              {value} {this.setState({a:value})}
            </button>
          );
          const ExampleCustomInput2 = ({ value, onClick }) => (
            
            <button className="btn btn-sm" onClick={onClick} ref={this.myRef}>
              {value} {this.setState({b:value})}
            </button>
          );
        const content =<div>
        Remaining time is 
        <div className="timeBox">
        {this.state.remainingTime}
        </div>
        <br/>
        <DatePicker
        showPopperArrow={true}
        selected={this.state.startDate}
        onChange={date =>  this.setState({startDate: date})}
        dateFormat="MMMM d, yyyy"
        customInput={<ExampleCustomInput />}
        />
                &nbsp;&nbsp;
        <DatePicker
            selected={this.state.startDate}
            onChange={date =>  this.setState({startDate: date})}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            customInput={<ExampleCustomInput2 />}
        />
            
            &nbsp;&nbsp;
        <button className="btn btn-primary btn-sm" onClick={this.handleTime}><i className="icon icon-edit"></i>
            Change Time
        </button>
        </div>
        this.setState({hint:false, timecontent:content})
       
    }

    closeWarning(){
        console.log("what");
        this.setState({x:""})
    }

   componentDidMount() {
       /*
        data.sort((a, b) => Number(b.score) - Number(a.score));
        console.log("descending", data);
        this.setState({playerData: data})*/

        //It can be controlled in a time interval.
        let game_title = localStorage.getItem("game_title")
        let game_id = localStorage.getItem("game_id")
        console.log(game_id)
        this.setState({ gameName: game_title, gameId:game_id  })
   }

   //Inform player!!!!
   kickPlayer(element){
       var newPlayerData = this.state.playerData;
    console.log(this.state.playerData);
     var index = this.state.playerData.findIndex(obj => obj.username===element.username);
     console.log(index);
     newPlayerData.splice(index,1);
     console.log(newPlayerData);
     this.setState({
        playerData: newPlayerData
     })
   }
 
    
    render() {
       
        return (
            //&key=AIzaSyBN9jFsxQ7fF3czjlbT359QOchyU9Cnu-s 
            <div className="flex-centered">  <LocTracker time={5000}/> <UpdateGame time={5000} gameId={this.state.gameId} onData={this.handleData} />{this.state.x}
            {this.state.qrDiv}
            <div className="card">
                 
                <div style={{color:"red", textAlign:"center", fontSize:20}} >You are the owner of the game!</div>
                <div className="header">                              
                    <p>Playing on "{this.state.gameName}" with {this.state.playerNumber} other players!</p> 
                </div> 
                <div className="container">
                <div className="columns">
                <div className="column col-8 col-xs-12">

                <div className="map"> 
                
                <WrappedMap  
                    googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBN9jFsxQ7fF3czjlbT359QOchyU9Cnu-s `}
                    loadingElement = {<div style={{height:"100%"}} />}
                    containerElement = {<div style={{height:"100%"}} />}
                    lat = {this.state.center_lat}
                    lng = {this.state.center_lng}
                    radius = {this.state.center_radius}
                    mapElement = {<div style={{height:"100%"}} />}
                />
                </div> 
                </div> 

                <div className="column col-4 col-xs-12">
                    
                    <div className="leaderboard"> 
                    <br/>
                    {this.state.hint? <div>Remaining number of QRs is {this.state.totalQR - this.state.findingQR}
                            <br></br>
                            <div className="bar bar-lg">
                            <div className="bar-item" role="progressbar" style={{width: (this.state.findingQR*100)/this.state.totalQR+'%', 
                            background: '#2196f3'}} aria-valuenow= {(this.state.findingQR*100)/this.state.totalQR} aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            </div> : this.state.timecontent}
                    <br></br>
                    Leaderboard
                    <div className="flex-centered" >
                    <ul className="menu">
                    {
                        this.state.playersData.map((item, key) =>
                        <li className="menu-item" key={item._id}>
                        
                        <div className="tile-icon">
                            
                            <figure className="avatar">
                            <img src={avatar[this.state.playersData.indexOf(item)%avatar.length]} alt="Avatar">
                            
                            </img> 
                            {item.owner?<img src="./star.png" className="avatar-icon" alt="Star"/>:null}
                            </figure>
                        </div>
                        <div className="tile-content">
                        <p className="tile-title">
                        {item.names}&nbsp;&nbsp;-&nbsp;&nbsp;<span style={{color:"#FF0000"}}>{item.scores}</span>&nbsp;
                        <button className="btn btn-error" onClick={() => this.kickPlayer(item)}>X</button>
                        </p>
                        
                        </div>
                            </li>
                    )
                    }
                    </ul>
                    </div>

                    <br/>
                    Submit a QR
                    <div className="flex-centered" >
                    <button onClick={this.openCamera}><img src="./camera.png" className="img-responsive ..." alt="..."></img></button>
                        </div>
                    <br/>
                    Hint
                    <br/>
                    <div className="popover popover-up">
                            <img src="./hint.png" className="img-responsive ..." alt="..."></img>
                            <div className="popover-container">
                                <div className="card">
                                <div className="card-header">
                                    Hint #1
                                </div>
                                <div className="card-body">
                                    {this.state.hintContent}
                                </div>
                                </div>
                            </div>
                        </div>              
                    </div> 
                </div>
                </div>
                </div>
                
            </div>
            </div>
        )
    }
}

export default AdminManage;