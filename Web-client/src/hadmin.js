import React from "react";
// import ReactDOM from "react-dom";
import HealthCare from "./contracts/HealthCare.json";
import Web3 from "web3";
export default class Hadmin extends React.Component {

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
      const recordCount = await this.health.methods.recordCount().call()
      let recordArr = [];
      let record = [];
      for(let i=0;i<recordCount;i++)
      {
        recordArr.push(await this.health.methods.recordsArr(i).call())
      }
      for(let i=0;i<recordArr.length;i++)
      {
        record.push(await this.health.methods._records(recordArr[i]).call())  
      }
      this.setState({records:record})
    }
  }

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      recID: "",
      message: "",
      records:[]
    };
  }

  async handleClick(event) {
    event.preventDefault();
    window.web3.eth.getCoinbase((err, account) => {
      this.health.methods
      .signRecord(this.state.recID)
      .send({ from: account }).then(()=>{this.setState({ message: "Record approved!" }); this.loadBlockchainData();
    this.setState({
      recID: ""
    })}); 
    })
    }

  render() {
    return (
      <div className="container container-fluid login-conatiner">
        <div className="col-md-4">
          <h3 className="text-center">Hospital Admin</h3>
          <div className="login-form">
            <h4 className="text-center">Approve Medical Record</h4>
            <div className="form-group">
              <input
                type="number"
                value={this.state.recID}
                onChange={event => this.setState({ recID: event.target.value })}
                className="form-control"
                placeholder="ID"
              />
              <br />
            </div>
            <div className="form-group">
              <button
                className="btn btn-primary btn-block"
                onClick={this.handleClick}
              >
                Approve
              </button>
            </div>
            {this.state.message && (
              <p className="alert alert-danger fade in">{this.state.message}</p>
            )}
          </div>
        </div>
        <div className="col-md-6 col-md-offset-2">
          <div className="c-list">
            <h2 className="text-center">Records</h2>
            <table class="table table-bordered table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Hospital Name</th>
                  <th>Price</th>
                  <th>Patient Bill Document</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {this.state.records.map((record)=>{
                 return(
                   <tr>
                     <td>{record.ID}</td>
                     <td>{record.testName}</td>
                     <td>{record.date}</td>
                     <td>{record.hospitalName}</td>
                     <td>{record.price}</td>
                     <td><a href={`http://ipfs.infura.io/ipfs/${record.imageHash}`} target='_blank'>View Document</a></td>
                     <td>({record.signatureCount}/2)</td>
                   </tr>
                 ) 
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
