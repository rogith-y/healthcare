import React from 'react';
//import './insurance.css';
import HealthCare from "./contracts/HealthCare.json";
import Web3 from "web3";

 export default class Insurance extends React.Component{
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

  handleApprove(event){
    event.preventDefault();
    let id = event.target.value;
    window.web3.eth.getCoinbase((err, account) => {
      this.setState({account:account})
      this.health.methods.ApproveBill(id).send({ from: account}).then(()=>{this.loadBlockchainData()});
        })
  }
  
  handleReject(event){
    event.preventDefault();
    let id = event.target.value;
    window.web3.eth.getCoinbase((err, account) => {
      this.setState({account:account})
      this.health.methods.RejectBill(id).send({ from: account}).then(()=>{this.loadBlockchainData()});
        })
  }
  
  constructor(props) {
    super(props);
    this.handleApprove = this.handleApprove.bind(this);
    this.handleReject = this.handleReject.bind(this);
    this.state = {
      records:[]
    };
  }
   render(){
     return(
      <div className="col-md-12">
      <h3  className="text-center">Insurance Page</h3>
      <div className="c-list">
      <h2 className="text-center">Approved Records</h2>
        <table class="table table-bordered table-striped table-hover">
        <thead>
             <tr>
                <th>ID</th>
                <th>Test Name</th>
                <th>Date</th>
                <th>Hospital Name</th>
                <th>Price</th>
                <th>Patient Bill Document</th>
                <th>Admins Approval</th>
                <th></th>
             </tr>
             </thead>
             <tbody>
                {this.state.records.map((record)=>{
                 return(record.signatureCount==="2" && record.isApproved === "0" ?
                   <tr>
                     <td>{record.ID}</td>
                     <td>{record.testName}</td>
                     <td>{record.date}</td>
                     <td>{record.hospitalName}</td>
                     <td>{record.price}</td>
                     <td><a href={`http://ipfs.infura.io/ipfs/${record.imageHash}`} target='_blank'>View Document</a></td>
                     <td>({record.signatureCount}/2) Approved</td>
                     <td><button type="button" value={record.ID} class="btn btn-success" onClick={this.handleApprove}>Approve</button>  <button class="btn btn-danger" type="button" value={record.ID} onClick={this.handleReject}>Reject</button></td>
                   </tr>:null
                 ) 
                })}
             </tbody>
          </table>
         </div>
       </div>
     );
   }
 }

