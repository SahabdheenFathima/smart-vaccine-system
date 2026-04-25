import React, { Component } from "react";

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      password: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name, email, password } = this.state;
    console.log(name, email, password);
    fetch("http://localhost:5001/register", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userRegister");
        if (data.status === "ok") {
          alert("Registration Successful");
          window.location.href = "./sign-in";
        } else {
          alert("Registration Failed. Try Again.");
        }
      });
  }

  render() {
    return (
      <div className="form-container">
        <form onSubmit={this.handleSubmit} className="form-box">
          <h2>Create an Account!</h2>
          <h1>Sign Up</h1>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              onChange={(e) => this.setState({ name: e.target.value })}
            />
          </div>
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
          <button type="submit" className="submit-btn">Sign Up</button>
          <p>Already have an account? <a href="/sign-in">Login</a></p>
        </form>
      </div>
    );
  }
}
