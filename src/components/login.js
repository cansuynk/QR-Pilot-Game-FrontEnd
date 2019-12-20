import React,{Component} from 'react';
import {Link, NavLink} from 'react-router-dom';
import qrcode from "../qr-code.png";
import axios from "axios";
import config from "../config";

class Login extends Component{
    constructor() {
        super();

        this.state = {
            username: '',
            password: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        let target = e.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        let name = target.name;

        this.setState({
            [name]: value
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await axios({
                method: 'post',
                url: config.LOGIN_URL,
                headers: {'Content-Type': 'application/json'},
                data: {
                    username: this.state.username,
                    password: this.state.password
                }
            });

            console.log(this.state.username, this.state.password);
            console.log(res);

            if (res.data.success) {
                localStorage.setItem("userId", res.data.userId);
                localStorage.setItem("token", res.data.data.token);
                this.props.history.push("/profile");
            }
        } catch (err) {
            console.log("err", err);
        }
    }

    render() {
        return (
            <div className="App">
                <div className="App__Aside">
                    <img src={qrcode} alt="QR Icon"/>
                </div>
                <div className="App__Form">

                    <div className="PageSwitcher">
                        <NavLink to="/login" activeClassName="PageSwitcher__Item--Active" className="PageSwitcher__Item">Login </NavLink>
                        <NavLink exact to="/" activeClassName="PageSwitcher__Item--Active" className="PageSwitcher__Item">Sign Up </NavLink>
                    </div>

                    <div className="FormTitle">
                        <NavLink to="/login" activeClassName="FormTitle__Link--Active" className="FormTitle__Link">Login</NavLink> or <NavLink exact to="/" activeClassName="FormTitle__Link--Active" className="FormTitle__Link">Sign Up</NavLink>
                    </div>
                    <div className="FormCenter">
                        <form onSubmit={this.handleSubmit} className="FormFields" onSubmit={this.handleSubmit} >
                            <div className="FormField">
                                <label className="FormField__Label" htmlFor="username">Username </label>
                                <input type="text" id="username" className="FormField__Input" placeholder="Enter your username"
                                       name="username" value={this.state.username} onChange={this.handleChange}/>
                            </div>

                            <div className="FormField">
                                <label className="FormField__Label" htmlFor="password">Password </label>
                                <input type="password" id="password" className="FormField__Input" placeholder="Enter your password"
                                       name="password" value={this.state.password} onChange={this.handleChange}/>
                            </div>


                            <div className="FormField">
                                <button className="FormField__Button nr-20">Login </button> <Link to="/login/reset-password" className="FormField__Link">Forgot Password?</Link>

                            </div>
                        </form>
                    </div>
                </div>
            </div>

        );
    }
}
export default Login;
