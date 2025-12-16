pragma solidity ^0.8.20;

contract SimpleBank {
    mapping(address => uint256) private balances;
    
    event AccountCreated(address indexed owner);
    event Deposit(address indexed owner, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);

    function createAccount() public {
        require(balances[msg.sender] == 0, "Compte existe deja");
        balances[msg.sender] = 0;
        emit AccountCreated(msg.sender);
    }

    function deposit() public payable {
        require(msg.value > 0, "Montant doit etre > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Solde insuffisant");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}
