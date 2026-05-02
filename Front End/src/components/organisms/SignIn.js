import React, { Component } from "react";

export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password } = this.state;
    console.log(email, password);
    fetch("http://localhost:5001/login-user", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userLogin");
        if (data.status === "ok") {
          alert("Login Successful");
          window.localStorage.setItem("token", data.data);
          window.localStorage.setItem("loggedIn", true);
          window.location.href = "./userDetails";
        } else {
          alert("Invalid login, try again");
          window.location.href = "./sign-in";
        }
      });
  }

  render() {
    return (
      <div className="form-container">
        <form onSubmit={this.handleSubmit} className="form-box">
          <h2>Welcome Back!</h2>
          <h1>Log In</h1>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              onChange={(e) => this.setState({ email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              required
              onChange={(e) => this.setState({ password: e.target.value })}
            />
          </div>
          <button type="submit" className="submit-btn">Login</button>
          <p>Don't have an account? <a href="/sign-up">Sign up </a></p>
        </form>
      </div>
    );
  }
}
