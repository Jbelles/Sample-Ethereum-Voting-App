// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
 
// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import Vue from 'vue'
// Import our contract artifacts and turn them into usable abstractions.
import voting_artifacts from '../../build/contracts/Voting.json'
 
var Voting = contract(voting_artifacts);
let candidates = {"Vivek": "candidate-1", "Jay": "candidate-2", "Ram": "candidate-3"};
let candidatesTest = ['0x1283102983102983', '0x1238192837918273'];



 
window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    //console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. <img draggable="false" class="emoji" alt="🙂" src="https://s0.wp.com/wp-content/mu-plugins/wpcom-smileys/twemoji/2/svg/1f642.svg"> http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }


var app = new Vue({
    el: '#app',
    data: {
        Name: "",
        Email: "",
        candidates: [],
        votes: [],
        WinnerName: "",
        WinnerEmail: "",
        WinnerAddress: "",
        Time: Math.trunc((+ new Date())/1000),
    },
    methods:{
      registerCandidate : function(Name, Email){
        var self = this;
        try{
        Voting.deployed().then(function(contractInstance) {
            //web3.eth.getBalance(web3.eth.accounts[0]).then(function(v) {console.log(v)});
            contractInstance.registerCandidate(Name, Email, {gas: 140000, from: web3.eth.accounts[0]}).then(function(){self.updateCandidates()});
              });
        } catch (err){
          console.log(err);
        }
      },
      voteForCandidate : function(candidateAddress) {
        var self = this;
        Voting.deployed().then(function(contractInstance) {
          contractInstance.voteForCandidate(candidateAddress, {gas: 140000, from: web3.eth.accounts[0]}).then(function(){self.updateCandidates()})
        });
      },
      registerVoter : function(){var self = this; Voting.deployed().then(function(contractInstance) {contractInstance.registerVoter({gas: 140000, from: web3.eth.accounts[0]}).then(function(){self.updateCandidates()});});},
      getWinner : function(){Voting.deployed().then(function(contractInstance) {contractInstance.getWinner.call({gas: 140000, from: web3.eth.accounts[0]}).then(function(v){alert("Winner: " + web3.toAscii(v[2]).replace(/\0/g, '') + "\nAddress: " + v[0] + "\nEmail: " + web3.toAscii(v[1]).replace(/\0/g, ''))});});},
      declareWinner : function(){
        var self = this;
        Voting.deployed().then(function(contractInstance){

          contractInstance.declareWinner({gas: 140000, from: web3.eth.accounts[0]}).then(function(v){

            if(v != true){
              contractInstance.getWinner.call({gas: 140000, from: web3.eth.accounts[0]}).then(function(x){
                self.WinnerName = web3.toAscii(x[2]).replace(/\0/g, '');
                self.WinnerAddress = x[0];
                self.WinnerEmail = web3.toAscii(x[1]).replace(/\0/g, '');
                if(self.WinnerName != "" && self.WinnerEmail != ""){
          fetch("https://api.sendinblue.com/v3/smtp/email", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': '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',
                        Accept: 'application/json'
                      },
                    body:  JSON.stringify({ sender: {
                            name:  self.WinnerName,
                            email:  self.WinnerEmail
                          },
                          to:[{email: self.WinnerEmail,name: self.WinnerName }]
                          ,htmlContent:"You Won the election at address: " + self.WinnerAddress + "!",subject:"You Won " + self.WinnerName + "!"})
                  }).then(async (response) => {
                                  if (await response.status == 201) {
                                    //Dont need this anymore //contractInstance.winnerNotified({gas: 140000, from: web3.eth.accounts[0]});
                                    console.log(await response.json());
                                  }
                                  else{
                                    console.log(await response.json());
                                  }
                              });
        }
              });
            }
          })
        });

      },
      updateCandidates : function (){
      var self = this;
        Voting.deployed().then(function(contractInstance) {
        contractInstance.getCandidates.call({gas: 140000, from: web3.eth.accounts[0]}).then(function(v) {
          self.candidates = v;
          self.votes = [];
          for(var i of v)
          {
            contractInstance.totalVotesFor.call(i, {gas: 140000, from: web3.eth.accounts[0]}).then(function(v) {self.votes.push(parseInt(v));})
          }
        });
      })
    },
    },
    mounted() {
      var self = this;
        window.setInterval(() => {
          self.Time = Math.trunc((+ new Date())/1000);
      },1000);
      Voting.setProvider(web3.currentProvider);

      Voting.deployed().then(function(contractInstance) {
        contractInstance.getCandidates.call({gas: 140000, from: web3.eth.accounts[0]}).then(function(v) {
          self.candidates = v;
          for(var i of v)
          {
            contractInstance.totalVotesFor.call(i, {gas: 140000, from: web3.eth.accounts[0]}).then(function(v) {self.votes.push(parseInt(v));})
          }
        });
        //Currently unsupported!
         // contractInstance.Voter({}, {fromBlock:0, toBlock:'latest'}, function(err, results){
        //  if(!err)
        //  {
        //    console.log(err) 
        //  }
      //    else
     //     {
     //       console.log(response)
    //      }
    //    });


      }
    );
    }
});
});
//      Voting.deployed().then(function(contractInstance) {contractInstance.getCandidates.call().then(function(v) {console.log(v)})});
//      Voting.deployed().then(function(contractInstance) {contractInstance.totalVotesFor.call('0x6ecbe1db9ef729cbe972c83fb886247691fb6beb').then(function(v) {console.log(v)})});
//      Voting.deployed().then(function(contractInstance) {contractInstance.registerVoter().then(function(v) {console.log(v)})});
// testrpc -m "concert load couple harbor equip island argue ramp clarify fence smart topic"