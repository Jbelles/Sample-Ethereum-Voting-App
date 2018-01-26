pragma solidity ^0.4.2;
//import "./usingOraclize.sol";

contract Voting  /*is usingOraclize*/ {
    struct candidate{
        address candidateAddress;
        bytes32 candidateName;
        bytes32 candidateEmail;
    }
    mapping (address=>uint) public votesReceived;
    bytes32 public electionName;
    uint public startDate;
    uint public endDate;
    address public Winner; 
    bytes32 public WinnerAddress;
    bytes32 public WinnerName;
    mapping (uint => candidate) public candidateList;
    address[] public voterList;
    bool wasWinnerNotified = false;
    uint numCandidates = 0;
    mapping (address=>uint)  public votesSent;


    function Voting(bytes32 title, uint start, uint end){
        electionName = title;
        startDate = start;
        endDate = end;
        //OAR = OraclizeAddrResolverI(address(this));
        //oraclize_query(end, "URL", "");
    }

    event Winner(address candidateAddress, bytes32 name, bytes32 email);
    event Voter(address voterAddress);
    function winnerNotified(){
        if(block.timestamp < endDate) throw;
        if(wasWinnerNotified == false)
         wasWinnerNotified = true;
    }
    function isWinnerNotified() returns (bool){
        if(block.timestamp < endDate) throw;
        return wasWinnerNotified;
    }
    function getWinner() returns (address, bytes32, bytes32){
        if(block.timestamp < endDate) throw;
        return (Winner, WinnerAddress, WinnerName);
    }
    function declareWinner() {
        //can't have a winner if it hasn't ended
        if(block.timestamp < endDate) throw;
        //someone won
        if(Winner != 0x0) throw;

        uint max = 0;
        candidate storage winner;
        candidate storage c;
        for(uint i = 0; i < numCandidates; i++){
            c = candidateList[i+1];
            if(votesReceived[c.candidateAddress] > max)
            {
                winner = c;
                max = votesReceived[c.candidateAddress];
            }
        }
        Winner(c.candidateAddress, c.candidateName, c.candidateEmail);
        Winner = winner.candidateAddress;
        WinnerAddress = winner.candidateEmail;
        WinnerName = winner.candidateName;
    }

   // function __callback(bytes32 myid, string result) {
    //    if (msg.sender != oraclize_cbAddress()) throw;
   //         declareWinner();
  //  }
    function getBlockTimestamp() returns (uint){
        return block.timestamp;
    }
    function getNumCandidates() returns (uint){
        return numCandidates;
    }
    function getCandidates() returns (address[]){
        address[] list;
        candidate storage c;
        for(uint i = 0; i < numCandidates; i++){
            c = candidateList[i+1];
            list.push(c.candidateAddress);
        }
        return list;
    }
    function totalVotesFor(address candidateAddress) returns (uint) {
        if (validCandidate(candidateAddress) == false) throw;
        return votesReceived[candidateAddress];
    }
    function registerCandidate(bytes32 name, bytes32 email)
    {
        if(block.timestamp > startDate) throw;
        if(validCandidate(msg.sender) == true) throw;
        numCandidates += 1;
        candidateList[numCandidates] = candidate(msg.sender, name, email);
    }
    function registerVoter(){
        if(validVoter(msg.sender) != false) throw;
        voterList.push(msg.sender);
        Voter(msg.sender);
    }
    function voteForCandidate(address candidateAddress) 
    {
        if(block.timestamp < startDate || block.timestamp > endDate) throw;
        if(votesSent[msg.sender] != 0) throw;
        if (validCandidate(candidateAddress) == false) throw;
        votesSent[msg.sender] = 1;
        votesReceived[candidateAddress] += 1;
    }
 
    function validCandidate(address candidateAddress) returns (bool) 
    {
        candidate storage c;
        for(uint i = 0; i < numCandidates; i++){
            c = candidateList[i+1];
            if(c.candidateAddress == candidateAddress)
                return true;
        }
        return false;
    }
    function validVoter(address voter) returns (bool) 
    {
        for(uint i = 0; i < voterList.length; i++) {
        if (voterList[i] == voter) {
            return true;
        }
        }
        return false;
    }
}