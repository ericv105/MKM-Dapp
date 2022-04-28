// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16;
pragma experimental ABIEncoderV2;

contract Marketplace {
  uint kbIds;
  uint _kbSold;
  uint _customIds;
  uint _customSold;

  // address public owner;

  // constructor() {
  //   owner = msg.sender;
  // }

  struct Listing {
    uint id;
    address payable seller;
    address payable owner;
    uint price;
  }

  struct Custom {
      uint id;
      address payable requester;
      address payable acceptor;
      uint price;
  }

  mapping(uint => Listing) idToListing;
  mapping(uint => Custom) idToCustom;

  event Listed (
    uint indexed id,
    address seller,
    address owner,
    uint price
  );

  function createListing(uint price) public payable{
    require(price > 0, "Please set price > 0");

    kbIds = kbIds + 1;
    uint idx = kbIds;

    idToListing[idx] = Listing(
      idx, address(uint160(msg.sender)), address(uint160(0)), price
    );

    emit Listed (idx, msg.sender, address(0), price);
  }
  
  function createSale(uint id) public payable {
    uint price = idToListing[id].price;

    require(msg.value == price, "Pay the correct amount");

    idToListing[id].seller.transfer(msg.value);
    idToListing[id].owner = address(uint160(msg.sender));
    _kbSold += 1;
  }

  function requestCustom() public payable {
    require(msg.value > 0);
    _customIds += 1;
    uint id = _customIds;

    idToCustom[id] = Custom(
        id, address(uint160(msg.sender)), address(uint160(0)), msg.value 
    );
  }

  function acceptCustom(uint id) public payable {
    uint price = idToCustom[id].price;
    idToCustom[id].acceptor = address(uint160(msg.sender));
    idToCustom[id].acceptor.transfer(price);
    _customSold += 1;

  }

  function getKbs() public view returns (Listing[] memory) {
    uint itemCount = kbIds;
    uint unsoldCt = itemCount - _kbSold;
    uint currentIndex = 0;

    Listing[] memory kbs = new Listing[](unsoldCt);
    for (uint i = 0; i < itemCount; i++){
      if (idToListing[i+1].owner == address(0)){
        uint currentId = idToListing[i+1].id;
        Listing storage currentItem = idToListing[currentId];
        kbs[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }

    return kbs;
  }

  function getCt() view public returns (uint){
    return kbIds;
  }

  function getMyKbs() public view returns (Listing[] memory){
    uint totalItemCount = kbIds;
    uint itemCount = 0;
    uint currentIndex = 0;

    for(uint i = 0; i < totalItemCount; i++){
      if(idToListing[i+1].owner == msg.sender){
        itemCount += 1;
      }
    }

    Listing[] memory kbs = new Listing[](itemCount);
    for (uint i = 0; i < totalItemCount; i++){
      if (idToListing[i+1].owner == msg.sender){
        uint currentId = idToListing[i+1].id;
        Listing storage currentItem = idToListing[currentId];
        kbs[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return kbs;
  }
} 