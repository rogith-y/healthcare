import React from "react";
// import ReactDOM from "react-dom";
import HealthCare from "./contracts/HealthCare.json";
import Web3 from 'web3'
import './load.css'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host:'ipfs.infura.io',port:5001,protocol:'https'})

export default class Patient extends React.Component {
  async componentWillMount() {
    window.ethereum.enable();
    this.setState({loading:true})
    await this.loadWeb3();
    await this.loadBlockchainData().then(()=>this.setState({loading:false}));
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
    this.handleFileClick = this.handleFileClick.bind(this);
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
      buffer: null,
      imageHash:null,
      canSubmit:true,
      loading:false
    };
  }

  handleClick(event) {
    event.preventDefault();
    this.setState({loading:true})
    window.web3.eth.getCoinbase((err, account) => {
    this.setState({account:account})
    this.health.methods.newRecord(
        this.state.recID,
        this.state.pname,
        this.state.dDate,
        this.state.hname,
        this.state.price,
        this.state.imageHash
        ).send({ from: account}).then(()=>{ this.setState({ message: "Record created" });  this.loadBlockchainData(); 
        this.setState({
        recID: "",
        pname: "",
        dDate: "",
        hname: "",
        price: "",
        imageHash:null,
        canSubmit:true,
        loading:false
      })
      setTimeout(()=>{this.setState({message:""}) }, 3000);
      this.fileInput.value=""
    });
      })
    }

 async handleFileClick(event){
    event.preventDefault();
    const hash = await ipfs.add(this.state.buffer)
    this.setState({imageHash:hash.path},()=>{alert("File upload complete!");this.setState({canSubmit:false})})
  }
  handlePersonalClick(event) {
    event.preventDefault();
    this.setState({loading:true})
    window.web3.eth.getCoinbase((err, account) => {
      this.setState({account})
    this.health.methods.newPatientRecord(
        this.state.patientName,
        this.state.dob,
        this.state.mnum,
        this.state.bloodgroup).send({ from: account}).then(()=>{ this.setState({ message: "Record created" });  this.loadBlockchainData();
      this.setState({
        bloodgroup:"",
        dob:"",
        patientName:"",
        mnum:"",
        loading:false
      })
      setTimeout(()=>{this.setState({message:""}) }, 3000);
      });
      })
    }

    captureFile = (event) => {
      event.preventDefault()
      const file = event.target.files[0];
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        this.setState({ buffer:Buffer(reader.result) })
      }
    }

  render() {
    return (
      <div className="container container-fluid login-conatiner">
        {this.state.loading?
        <div class="loading-container">
        <div class="loading-spin"></div>
        &nbsp; &nbsp; &nbsp; Processing Your Request...
        </div>:null
        } 
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
                  type="number"
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
                <p className="alert alert-success fade in">
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
                  type="number"
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
                  type="number"
                  value={this.state.price}
                  onChange={event =>
                    this.setState({ price: event.target.value })
                  }
                  className="form-control"
                  placeholder="Price"
                />
              </div>
              <div className="form-group">
                <input
                  type="file"
                  ref={ref=> this.fileInput = ref}
                  onChange={this.captureFile}
                  className="form-control"
                />
                </div>
                <div className="form-group">
                <input type="button" class = "btn btn-primary" onClick={this.handleFileClick} value="Upload"/>
              </div>
              <div className="form-group">
                <button
                  className="btn btn-primary btn-block"
                  onClick={this.handleClick} disabled={this.state.canSubmit}
                >
                  Submit
                </button>
              </div>
              {this.state.message && (
                <p className="alert alert-success fade in">
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
            <table class="table table-bordered table-dark table-striped table-hover">
              <thead>
              <tr>
                  <th>ID</th>
                  <th>Test Name</th>
                  <th>Date</th>
                  <th>Hospital Name</th>
                  <th>Price</th>
                  <th>Bill Document</th>
                  <th>Admins Approval</th>
                  <th>Insurance Claim status</th>
              </tr>
              </thead>
              <tbody>
                {this.state.records.map((record)=>{
                  console.log(record)
                 return(record.pAddr === this.state.account ?
                   <tr>
                     <td>{record.ID}</td>
                     <td>{record.testName}</td>
                     <td>{record.date}</td>
                     <td>{record.hospitalName}</td>
                     <td>{record.price}</td>
                     <td><a href={`http://ipfs.infura.io/ipfs/${record.imageHash}`} target='_blank'>View Document</a></td>
                     <td>({record.signatureCount}/2)</td>
                     <td>{record.isApproved === "1" ?"Approved":record.isApproved === "2" ? "Rejected":"Pending"}</td>
                   </tr>:null
                 )
                })}
              </tbody>
            </table>
            <h2 className="text-center">Personal Record</h2>
            <table class="table table-bordered table-dark table-striped table-hover">
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
