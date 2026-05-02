import React, { Component } from "react";
import "../../assets/styles/DashBord.css"; // Import the new stunning CSS

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: "",
      babyData: null,
      allBabies: [], // to hold submitted baby form data
    };
  }

  componentDidMount() {
    // Load token-based user info
    fetch("http://localhost:5001/userData", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userData");
        this.setState({ userData: data.data });

        if (data.data === "token expired") {
          alert("Session expired. Please log in again.");
          window.localStorage.clear();
          window.location.href = "./sign-in";
        }
      });

    fetch("http://localhost:5001/babies")
      .then((res) => res.json())
      .then((data) => {
        this.setState({ allBabies: data });
      })
      .catch((err) => console.error("Error fetching babies:", err));


    // Load baby form data if passed via location state
    const babyData = this.props.location?.state?.formData;
    if (babyData) {
      this.setState({ babyData });
    }
  }

  logOut = () => {
    alert("Logout successful!");
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  handleNext = () => {
    window.location.href = "/nextpage";
  };

  render() {
    const { userData, babyData } = this.state;

    return (
      <div className="dashboard-page">
        {/* Animated Background Slideshow */}
        <div className="slideshow-bg">
          <div className="slide slide-1"></div>
          <div className="slide slide-2"></div>
          <div className="slide slide-3"></div>
          <div className="slide slide-4"></div>
          <div className="slide slide-5"></div>
          <div className="slide slide-6"></div>
        </div>

        {/* Dark overlay to make text readable */}
        <div className="slideshow-overlay"></div>

        {/* Foreground Glass UI */}
        <div className="dashboard-content">
          <header className="dash-header">
            <h1 className="dash-app-title">Child Health Development</h1>
            <div className="dash-user-info">
              <span className="dash-user-name">{userData?.fullname || userData?.fname || "User"}</span>
              <button className="btn-dash btn-dash-secondary" onClick={this.logOut}>
                Log Out
              </button>
            </div>
          </header>

          <div className="dash-welcome-card">
            <h1 className="dash-welcome-title">Welcome, {userData?.fullname || userData?.fname || "User"}!</h1>
            <p className="dash-welcome-subtitle">
              Thank you for using our premium child health management system.
            </p>

            {babyData && (
              <div className="dash-submitted-data">
                <h3>Recently Submitted Details</h3>
                <ul>
                  {Object.entries(babyData).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn-dash btn-dash-primary" onClick={this.handleNext}>
              Continue to Forms
            </button>
          </div>
        </div>
      </div>
    );
  }
}
