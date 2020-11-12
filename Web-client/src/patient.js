import React from "react";
import ReactDOM from "react-dom";
import HealthCare from "./contracts/HealthCare.json";
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'

export default class Patient extends React.Component {
  async componentWillMount() {
    window.ethereum.enable();
    await this.loadWeb3();
    await this.loadBlockchainData();
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = HealthCare.networks[networkId]
    if(networkData) {
      this.health = new web3.eth.Contract(HealthCare.abi, networkData.address)
      const rec = await this.health.methods._records(2).call()
      console.log(rec)
    }
  }
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      recID: "",
      pname: "",
      dDate: "",
      hname: "",
      price: "",
      message: ""
    };
  }

  handleClick(event) {
    event.preventDefault();
    
    this.health.methods.newRecord(
        this.state.recID,
        this.state.pname,
        this.state.dDate,
        this.state.hname,
        this.state.price).send({ from: "0xBA231F92186ba87985A50600e72e6a2D1E9fcb7C"});
    this.setState({ message: "Record created" });
  }

  render() {
    return (
      <div className="container container-fluid login-conatiner">
        <div className="col-md-4">
          <div className="login-form">
            <form method="post" autoComplete="off">
              <h2 className="text-center">New Record</h2>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.recID}
                  onChange={event =>
                    this.setState({ recID: event.target.value })
                  }
                  className="form-control"
                  placeholder="ID"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.pname}
                  onChange={event =>
                    this.setState({ pname: event.target.value })
                  }
                  className="form-control"
                  placeholder="Name"
                />
              </div>
              <div className="form-group">
                <input
                  type="Date"
                  value={this.state.dDate}
                  onChange={event =>
                    this.setState({ dDate: event.target.value })
                  }
                  className="form-control"
                  placeholder="Date"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.hname}
                  onChange={event =>
                    this.setState({ hname: event.target.value })
                  }
                  className="form-control"
                  placeholder="Hospital Name"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.price}
                  onChange={event =>
                    this.setState({ price: event.target.value })
                  }
                  className="form-control"
                  placeholder="Price"
                />
              </div>
              <div className="form-group">
                <button
                  className="btn btn-primary btn-block"
                  onClick={this.handleClick}
                >
                  Submit
                </button>
              </div>
              {this.state.message && (
                <p className="alert alert-danger fade in">
                  {this.state.message}
                </p>
              )}
              <div className="clearfix" />
            </form>
          </div>
        </div>

        <div className="col-md-6 col-md-offset-2">
          <div className="c-list">
            <h2 className="text-center">Records</h2>
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Hospital Name</th>
                  <th>Price</th>
                  <th>Sign Count</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
