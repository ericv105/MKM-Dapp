let imgMap = new Map()
App = {
  web3: null,
  contracts: {},
  address: "0xD47c97526AF825b9E7Ae46A172e0AeA76e393607",
  abi: [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "Listed",
      "type": "event"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "createListing",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "createSale",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "requestCustom",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "acceptCustom",
      "outputs": [],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getKbs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address payable",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            }
          ],
          "internalType": "struct Marketplace.Listing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getCt",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getMyKbs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address payable",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            }
          ],
          "internalType": "struct Marketplace.Listing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ],
  handler: null,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3 = new Web3(Web3.givenProvider);
    } else {
      App.web3 = new Web3(App.url);
    }
    ethereum.enable();
    App.populateAddress().then((r) => (App.handler = r[0]));
    return App.initContract();
  },

  initContract: function () {
    App.contracts.Marketplace = new App.web3.eth.Contract(
      App.abi,
      App.address,
      {}
    );

    App.updateListing();
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", "#sell", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      var imgName = document.getElementById("image").value.split("\\").pop();
      console.log(imgName)
      App.handleSell(jQuery("#price").val(), imgName, this);
      
    });

    $(document).on("click", "#explore", function () {
      App.populateAddress().then((r) => (App.handler = r[0]));
      App.handleGet();
    });

    // $(document).on("click", ".btn-buy", function () {
    //   App.populateAddress().then(r => App.handler = r[0]);
    //   App.handleBuy();
    // });

    $(document).on("click", ".btn-buy", App.handleBuy);
  },

  populateAddress: async function () {
    return await ethereum.request({ method: "eth_requestAccounts" });
  },

  handleGet:function(){
    App.contracts.Marketplace.methods.getCt()
    .call()
    .then((r)=>{
      // jQuery('#counter_value').text(r)
      console.log(r)
    })
  },

  handleBuy: function (event) {
    event.preventDefault();
    var kbId = parseInt($(event.target).data("id"));
    var kbPrice = parseInt($(event.target).data("price"));
    App.populateAddress().then((r) => (App.handler = r[0]));
    var option = { from: App.handler, value: kbPrice };
    App.contracts.Marketplace.methods
      .createSale(kbId)
      .send(option)
      .on("receipt", (receipt) => {
        if (receipt.status) {
          toastr.success("Purchase Succesful!");
          App.updateListing();
        }
      })
      .on("error", (err) => {
        toastr.error("Purchase Failed!");
      });
      
  },
  kbId: 0,


  handleSell: function (priceVal, imgName, x) {
    if (priceVal === "") {
      alert("Please enter a price > 0.");
      return false;
    }
    var option = { from: App.handler };
    App.contracts.Marketplace.methods
      .createListing(priceVal)
      .send(option)
      .on("receipt", (receipt) => {
        if (receipt.status) {
          App.contracts.Marketplace.methods.getCt()
          .call()
          .then((r)=>{
            imgMap.set(parseInt(r), imgName)
            console.log(imgMap.size)
          })
          
          toastr.success("Listing set at " + priceVal);
          // x.form.submit();
          App.updateListing();
        }
      })
      .on("error", (err) => {
        toastr.error("Listing Failed! Try Again.");
      })
    
  },

  updateListing: function () {
    console.log(imgMap.size)
    App.contracts.Marketplace.methods
      .getKbs()
      .call()
      .then((r) => {
        console.log(r);
        $(".row").empty(".card");
        var listingsRow = $("#listingsRow");
        var listingTemplate = $("#listingTemplate");

        for (i = 0; i <= r.length; i++) {
          var price = r[i].price + " WEI";
          var kbid = parseInt(r[i].id);
          // var imgPath = "../images/" + imgMap[kbid];
          var imgPath = "../images/" + imgMap.get(kbid);

          console.log(price, imgPath)
          listingTemplate.find(".btn-buy").attr("data-id", kbid);
          listingTemplate.find(".btn-buy").attr("data-price", r[i][3]);
          // listingTemplate.find(".card-title").text(price);
          listingTemplate.find(".card-title").text(price);
          listingTemplate.find(".card-img-top").attr("src", imgPath)

          listingsRow.append(listingTemplate.html());
        }
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
    toastr.options = {
      // toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: false,
      positionClass: "toast-bottom-full-width",
      preventDuplicates: false,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "5000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
      // }
    };
  });
});
