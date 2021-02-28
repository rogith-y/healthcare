pragma solidity ^0.5.16;

contract HealthCare {
    address private hospitalAdmin;
    address private labAdmin;

    struct Record {
        uint256 ID;
        uint256 price;
        uint256 signatureCount;
        string testName;
        string date;
        string hospitalName;
        bool isValue;
        address pAddr;
        mapping(address => uint256) signatures;
        bool isApproved;
        bool requestAnswered;
        string imageHash;
    }

    struct PRecord {
        uint256 mobileNum;
        string patientName;
        string dob;
        string bloodgroup;
        bool isValue;
     }
    modifier signOnly {
        require(msg.sender == hospitalAdmin || msg.sender == labAdmin);
        _;
    }

    constructor() public {
        hospitalAdmin = msg.sender;
        labAdmin = 0x41b3889b82E06B0434da6a11Aa7cCc0D641dC21c;
    }

    // Mapping to store records
    mapping(uint256 => Record) public _records;
    mapping(address => PRecord) public _precords;
    uint256[] public recordsArr;
    uint256 public recordCount;
    uint256 public precordCount;
    event recordCreated(
        uint256 ID,
        string testName,
        string date,
        string hospitalName,
        uint256 price,
        string imageHash
    );
    event precordCreated(
        string patientName,
        string dob,
        uint256 mobileNum,
        string bloodgroup
    );
    event recordSigned(
        uint256 ID,
        string testName,
        string date,
        string hospitalName,
        uint256 price
    );
    event approved(
        uint256 ID,
        bool isApproved,
        bool requestAnswered
    );
    event rejected(
        uint256 ID,
        bool isApproved,
        bool requestAnswered
    );
    // Create new record
    function newRecord(
        uint256 _ID,
        string memory _tName,
        string memory _date,
        string memory hName,
        uint256 price,
        string memory _imageHash
    ) public {
        Record storage _newrecord = _records[_ID];

        // Only allows new records to be created
        require(!_records[_ID].isValue);
        _newrecord.pAddr = msg.sender;
        _newrecord.ID = _ID;
        _newrecord.testName = _tName;
        _newrecord.date = _date;
        _newrecord.hospitalName = hName;
        _newrecord.price = price;
        _newrecord.imageHash = _imageHash;
        _newrecord.isValue = true;
        _newrecord.signatureCount = 0;
        recordCount++;
        recordsArr.push(_ID);
        emit recordCreated(_newrecord.ID, _tName, _date, hName, price, _imageHash);
    }

    function newPatientRecord(
        string memory _PName,
        string memory _dob,
        uint256 mnum,
        string memory blood
    ) public {
        PRecord storage _newrecord = _precords[msg.sender];

        // Only allows new records to be created
        _newrecord.patientName = _PName;
        _newrecord.dob = _dob;
        _newrecord.mobileNum = mnum;
        _newrecord.bloodgroup = blood;
        _newrecord.isValue = true;
        precordCount++;
        emit precordCreated(_newrecord.patientName, _dob, mnum, blood);
    }

    function ApproveBill(uint256 _ID) public{
         Record storage record = _records[_ID];
         record.isApproved = true;
         record.requestAnswered = true;
         emit approved(_ID,record.isApproved,record.requestAnswered);
    }

     function RejectBill(uint256 _ID) public{
         Record storage record = _records[_ID];
         record.isApproved = false;
         record.requestAnswered = true;
         emit rejected(_ID,record.isApproved,record.requestAnswered);
    }

    // Function to sign a record
    function signRecord(uint256 _ID) public signOnly {
        Record storage records = _records[_ID];

        // Checks the aunthenticity of the address signing it
        require(address(0) != records.pAddr);
        require(msg.sender != records.pAddr);

        // Doesn't allow the same person to sign twice
        require(records.signatures[msg.sender] != 1);

        records.signatures[msg.sender] = 1;
        records.signatureCount++;

        // Checks if the record has been signed by both the authorities to process insurance claim
        if (records.signatureCount == 2)
            emit recordSigned(
                records.ID,
                records.testName,
                records.date,
                records.hospitalName,
                records.price
            );
    }
}
