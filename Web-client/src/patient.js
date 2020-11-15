import React from "react";
// import ReactDOM from "react-dom";
import HealthCare from "./contracts/HealthCare.json";
import Web3 from 'web3'


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
      let precord = [];
      precord.push(await this.health.methods._precords(this.state.account).call())   
      this.setState({precords:precord})
      this.setState({isDetailsFilled:this.state.precords[0].isValue})
    }
  }
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handlePersonalClick = this.handlePersonalClick.bind(this);
    this.state = {
      recID: "",
      pname: "",
      dDate: "",
      hname: "",
      price: "",
      message: "",
      records:[],
      precords:[],
      bloodgroup:"",
      dob:"",
      patientName:"",
      mnum:"",
      isDetailsFilled:false,
    };
  }

  handleClick(event) {
    event.preventDefault();
    window.web3.eth.getCoinbase((err, account) => {
    this.setState({account:account})
    this.health.methods.newRecord(
        this.state.recID,
        this.state.pname,
        this.state.dDate,
        this.state.hname,
        this.state.price).send({ from: account}).then(()=>{ this.setState({ message: "Record created" });  window.location.reload(false);});
      })
    }

  handlePersonalClick(event) {
    event.preventDefault();
    window.web3.eth.getCoinbase((err, account) => {
      this.setState({account})
    this.health.methods.newPatientRecord(
        this.state.patientName,
        this.state.dob,
        this.state.mnum,
        this.state.bloodgroup).send({ from: account}).then(()=>{ this.setState({ message: "Record created" });  window.location.reload(false);});
      })
    }

  render() {
    return (
      <div className="container container-fluid login-conatiner">
        <div className="col-md-4">
          {this.state.isDetailsFilled ? null:
        <div className="login-form">
            <form method="post" autoComplete="off">
              <h2 className="text-center">Personal Details</h2>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.patientName}
                  onChange={event =>
                    this.setState({ patientName: event.target.value })
                  }
                  className="form-control"
                  placeholder="Name"
                />
              </div>
              <div className="form-group">
                <input
                  type="Date"
                  value={this.state.dob}
                  onChange={event =>
                    this.setState({ dob: event.target.value })
                  }
                  className="form-control"
                  placeholder="Date of Birth"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.mnum}
                  onChange={event =>
                    this.setState({ mnum: event.target.value })
                  }
                  className="form-control"
                  placeholder="Mobile Number"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={this.state.bloodgroup}
                  onChange={event =>
                    this.setState({ bloodgroup: event.target.value })
                  }
                  className="form-control"
                  placeholder="Blood Group"
                />
              </div>
              <div className="form-group">
                <button
                  className="btn btn-primary btn-block"
                  onClick={this.handlePersonalClick}
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
          </div>}
          <div className="login-form">
            <form method="post" autoComplete="off">
              <h2 className="text-center">Bill Details</h2>
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
                  placeholder="Test Name"
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
            <h2 className="text-center">Bill Records</h2>
            <table class="table table-bordered table-dark table-striped">
              <thead>
              <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Hospital Name</th>
                  <th>Price</th>
                  <th>Approved</th>
              </tr>
              </thead>
              <tbody>
                {this.state.records.map((record)=>{
                 return(record.pAddr === this.state.account ?
                   <tr>
                     <td>{record.ID}</td>
                     <td>{record.testName}</td>
                     <td>{record.date}</td>
                     <td>{record.hospitalName}</td>
                     <td>{record.price}</td>
                     <td>({record.signatureCount}/2)</td>
                   </tr>:<div>asd</div>
                 )
                })}
              </tbody>
            </table>
            <h2 className="text-center">Personal Record</h2>
            <table class="table table-bordered table-dark table-striped">
              <thead>
              <tr>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Mobile Number</th>
                  <th>Blood Group</th>
                </tr>
              </thead>
              <tbody>
                {this.state.precords.map((record)=>{
                 return(
                   <tr>
                     <td>{record.patientName}</td>
                     <td>{record.dob}</td>
                     <td>{record.mobileNum}</td>
                     <td>{record.bloodgroup}</td>
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
