pragma solidity ^0.4.19;

contract ERC20MKM {

    string public constant name = "ERC20MKM";
    string public constant symbol = "MKM";
    uint8 public constant decimals = 2;  
    uint256 public constant tokenPrice = 1000000000000000000; 
   
    address ERCowner; //#1
    

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    event Transfer(address indexed from, address indexed to, uint tokens);


    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;
    
    uint256 totalSupply_;

    using SafeMath for uint256;


   constructor(uint256 total) public {  
	totalSupply_ = total;
	balances[address(this)] = totalSupply_;
	ERCowner = msg.sender; //#2
    }  

    function buy(uint256 _amount) external payable {
    // e.g. the buyer wants 100 tokens, needs to send 500 wei
    require(msg.value == _amount * tokenPrice, 'Need to send exact amount of wei');
    
    /*
        * sends the requested amount of tokens
        * from this contract address
        * to the buyer
        */
    transfer(msg.sender, _amount);
    }

    function getBal() public view returns(uint256) {
        // returns balance of contract in wei
        return address(this).balance;
    }

    function totalSupply() public view returns (uint256) {
	return totalSupply_;
    }
    
    function balanceOf(address tokenOwner) public view returns (uint) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint numTokens) payable public returns (bool) {
        require(numTokens <= balances[address(this)], 'contract broke');
        balances[address(this)] = balances[address(this)].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(address(this), receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint numTokens) public returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint numTokens) public returns (bool) {
        require(numTokens <= balances[owner]);    
        require(numTokens <= allowed[owner][msg.sender]);
    
        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
    
    //#3
    function close() public { 
        require(msg.sender == ERCowner);
        selfdestruct(msg.sender); 
     }
 
}

library SafeMath { 
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }
    
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
}