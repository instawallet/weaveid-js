/* -------------------------------- */
// WeaveID JS Module - v1.0
// https://weaveid.io
// weaveid.io@gmail.com
// 12/08/2020
/* -------------------------------- */

// VARIABLES:
var connection;
var iframeChild;
var test_jwk;
var loginUrl = "";
var widgetCSS = `
#popup {
  display: none;
  width: 400px;
  height: 70vh;
  max-height: 700px;
  /*margin: -100px auto;*/
  background-color: white;
  z-index: 10;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.42);
  position: absolute;
  left: calc(50% - 215px);
  top: 10%;
}
#popup iframe {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  border: 0;
}
#popupdarkbg {
  position: fixed;
  z-index: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.75);
  display: none;
}
`;

// UTILITY METHODS:
function addStyle(styleString) {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

function loadStyle(url) {
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("href", url);
  document.head.appendChild(link);
}

function loadScript(url, callback = null) {
  var head = document.head;
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  // script.onreadystatechange = callback;
  script.onload = callback;
  // Fire the loading
  head.appendChild(script);
}

function loadScriptPromise(url) {
  return new Promise((resolve, reject) => {
  if(typeof Penpal !== "undefined") {
    resolve(true);
  }
  else {
    var head = document.head;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = function(args){
      resolve(true);
    };
    head.appendChild(script);
  }
  });
}

// LOGIN METHOD:
function openLoginModal(e) {
  return new Promise((resolve, reject) => {
    return loadScriptPromise("https://unpkg.com/penpal/dist/penpal.js").then(function() {
    if (e) {
      e.preventDefault();
    }
    if(!document.getElementById("popupdarkbg")) init(); // Initialize if the user forgot
    document.getElementById("popupdarkbg").style.display = "block";
    document.getElementById("popup").style.display = "block";
    var iframe = document.getElementById("popupiframe");
    if (iframe) {
      if (iframe.src !== loginUrl) {
        iframe.src = loginUrl;
      }
    } else {
      iframe = document.createElement("iframe");
      iframe.src = loginUrl;
      iframe.id = "popupiframe";
      document.getElementById("popup").appendChild(iframe);
    }

    connection = Penpal.connectToChild({
      iframe,
      // Methods the parent is exposing to the child
      methods: {
        closeModal() {
          return closeModal();
        },
        overwriteArweaveMethods() {
          return overwriteArweaveMethods();
        },
        returnAddress(addy) {
          resolve(addy); // This returns the wallet's address on first successful login
        }
      }
    });
    connection.promise.then(setChild);

    document.getElementById("popupdarkbg").onclick = function () {
      closeModal();
    };

    // This returns the wallet's address on subsequent successful login
    if(iframeChild) resolve(getAddress());
  });
 });
}

// INIT:
function init() {
  // TODO: Add ability to pass-i ncustom "arweave" obj
  // Import animate.css for animations:
  loadStyle("https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css");
  // Add style for modal:
  addStyle(widgetCSS);
  // Create modal + dark background:
  var popupdarkbg = document.createElement("div");
  popupdarkbg.id = "popupdarkbg";
  var popup = document.createElement("div");
  popup.id = "popup";
  popup.classList.add("animate__animated", "animate__fadeInUp", "animate__fast");
  var iframe = document.createElement("iframe");
  iframe.id = "popupiframe";
  popup.appendChild(iframe);
  document.body.append(popupdarkbg);
  document.body.append(popup);
  // Create login button:
  var newNode = document.createElement("button");
  newNode.innerText = "Login with WeaveID";
  newNode.id = "link";
  newNode.addEventListener("click", openLoginModal, false);
  // Add login button to location of script tag, or end of body:
  var weaveIdInclude = document.getElementById("weaveid-include");
  if (weaveIdInclude) {
    weaveIdInclude.parentNode.insertBefore(newNode, weaveIdInclude.nextSibling);
  } else {
    //document.body.appendChild(newNode);
  }
}
document.addEventListener("DOMContentLoaded", function (event) {
  if(!arweave) console.log("You must create an arweave instance before initializing WeaveID!");
  else {
    // ----------------------------------------------
    // Fetch login URL from WeaveID CommunityXYZ DAO:
    // ----------------------------------------------
    // 1. Import CommunityXYZ.js:
    loadScriptPromise("https://arweave.net/6WvCKxIxCejO505AzeNkuw6NGgE0ySo5lDNN42J2TX0").then(function() {
      var community = new Community(arweave);
      // 2. Load the WeaveID DAO:
      community.setCommunityTx("lIzeO-Yb00iGm0oWK0BCEjxtluUbck1_sH3xeStAgcg").then((response) => {
        community.getState().then((state) => {
          // 3. Fetch the WeaveID DAO settings:
          console.log("STATE = ", state);
          var settings = {};
          state.settings.forEach((value, key) => {settings[key] = value});
          // 4. Set the login URL:
          loginUrl = settings.loginURL ? settings.loginURL : "https://weaveid.io/login.html";
          // 5. Initialize WeaveID:
          init();
        });
      });
    });
  }
});

// METHODS:
window.onkeydown = function (e) {
  if (e.keyCode == 27) {
    closeModal();
    e.preventDefault();
    return;
  }
};

function closeModal() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("popupdarkbg").style.display = "none";
}

function setChild(child) {
  iframeChild = child;
}

function createTransaction(data, cb) {
  var iframeResult = iframeChild.arweaveCreateTransaction(data, cb);
  // TODO: As explained in the TODO above, this transaction is never sent. It is just used to temporarily create an object with Transactio class. Otherwise, the signMessage() method will fail.
  var dummyTx = arweave.oldCreateTransaction({ target: '1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY', quantity: arweave.ar.arToWinston('0.0005') }, test_jwk);
  return Promise.all([iframeResult, dummyTx]).then((values) => {
    var temp = values[1];
    Object.keys(values[0]).forEach(function(key) {
      temp[key] = values[0][key];
    });
    return new Promise(function (resolve, reject) { resolve(temp); });
  });
};

function overwriteArweaveMethods() {
  if (typeof arweave !== "undefined" && arweave) {
    // Dummy wallet for generating dummy object:
    // TODO: This is a temporary fix. We need to change Arweave JS so that it exposes the Transaction class!
    test_jwk = { d: "ck9wAIHqTn7nCqKvK41Mf5BfqZduLjofOwJ5JMC5JO6G386nFYPVXEAHvgHUp04d-m0aknw-VxuhYxizf4fEoeohhGVhKjqzprHDEjDUr5nxhjNg-xdlXXb5t4vl3nf9J9flmYvb9BszZhrpZbDHtuq0sV9ByR93NVwe8gqv8s_ONPG9e0ZLRXrFw_n7EDBHw0hCVwPAd4RirVmX6BNzbgevzjodixqGpHk7L18LXzMlYY2wfiktW64n-fiId0cQdtWk3xXcOHOxnEt12NoFWtY5VXxAUiCZlr9fb0BVK_NFZGZCUXa6Y64KrZyBLi0XqLIvLAIDFRvCU3FEP5SnUwwA_0DJX3X5JkFAiPkgODqjbn28elXxL-PyFxUsIkk8xlMb6EmmCa3RiK6GGCR1ZK2W0XIu9zO6wvbf7OzvI8YR5_RVXWYCmWORz-GQZdlDo4EaHzsQuy8PGMX6fZ8LG-g6gVKMEyLip5V4qP_KFZnOBYEqlHnqUblRzY2Gm5u-I1DIZMbgKlr_xfODoSIRe7jwTtDuSCTN3DxivOfIBYMlm80cuySpCiGjLPr_LdKfFxR-qBe6PXDKBNFgqCevTUDyH5DyPBPZmN5xhYmjT_fKD2z5hKDZ4euz9ujfwZjcVJ03wDjUfz2vmfCcWryH33rN1ntu-Iz9HWpfrElltGE", dp: "tnwH6efEsxA72KC58GGSCczwd9L67CrTsKhNlt_tctq_A0x9ZBDDbibE6b-udiXgSdFyPNNhf3XX87UGK1dym9XLmHEYCPBxCFqQLP9gu0Ej9Q2qZxJHIZ46Xv3XJjZe-50e6cLO9no4djz3cri9y5FNLKzMoF8S1D5aoRELb_njnA_ITXrDKcH9lHHBgzZg3K7dlafDKlHWBiRBG6G6wD4ugE7V_tzs5WSLZ42xZmlPiHgnKeCV6PKwnRBXbibl5NvJcc0eDgcCJWHSGOfqjPMOuvKSYJT0ae_iq_dclj3LX7_NMV4ARX_kROyTRXfB9bYaOuUiEKpw4Jki7vRt8Q", dq: "SKpQny0mw-oY6TvJNavCYjvXZjoBJwdA_4JnaMsY7y269AYrR1CDoK1axQ2tlaLCE4XvVyXgrML-36SUS6WeuvdSdnAkfhlVRTk8-ij9Sel54cw_ReL4tPktkYOo36ZsW1zTNaTeL0byfWPx5l8YA65Fd0-QwGpcrpqo7zV70teIMW5fa14-LoIw3gXuQvZ85Y4I91CnRR6ELQ7iob72iCxC_9G8F1zaXZdpnrubPWC6iVw_3-UFmipZCmSDIoyhV8_JyTKj6E8Udd75_4EX81wX75naItg5Pyw4mP5YnzK9mwdoyDP48E6QO7a6sgCAcnIC1nWjDsEf6oyuZr0xFQ", e: "AQAB", ext: true, kty: "RSA", n: "n64e3Kx8f8cFIzcT1JcU3t9dlG9xjJWgeQOUkSeaaGo6Lf8ImbdgwZWkA3UGZrq7Ap04SaKhwDDZjposQ89k0xi_c6a3pNTAKnWyXSHNfxY0FAUD_GD_kXOySl7uF_QaRyMxGFge5-CcdSdv8zjBgoMm2eQfkBT0evGNfVA46MDzFTyUwFp70ayN3R7KpYxob6nF-1zH0LUJ8L6z5qf-b8RyOifU5lrDVuO7r-jsPNfuIMy9x0LJIi1f-H6bAkoIgDJwV_mDiZ0umVXPho7dY2T4GOmSjetUOVIqd2NmJfrmZWGI08OP9QurB06tUKN3fJKKaYO3Zq-njkLfuT6Gt1Mv3XQ6dw29JHUWpXYslMCc-TqQeAYdgzcMY4HAHr-Ws6a068FfBxHVtgjof-aFvPSbbxkgnIYhF6LUnh3gD8mZB0BUH-fU3M_7U9zDaPgGtDnxOyaCVUN3qmBHQulak8X5liBXosTml8YKkyTIwJhhWLhpy0k6kQgIZI1kPecKXrsBB1_aj-NCLXjppR97gEsOZcaezk2TSIIT-G-I0FjmUY--XynGzQpq8H6MM-4aUKrJ2_AQn0bKm2Sd8YKlsm5hP5F6IZA-sWCi1E-ilXo7zfhUIRq3Zpj-LV0iZ_UZu1o0sf3I0EMoBAsCGilo79kT3yQJxCOkErVfa2ye4pM", p: "1HB6HYnVjvTA_sit0xZ0-WklYg61rG1IQ8rg5GB_RFInD_Mymxy8uuO_Ufur_Z5jPaunvIGAiljMfoNNBCw6S1fREBnU08Pfzt4-GOGc85ptBSMH19KElVMJC7cNJruFjo1YLY30ZqGEv-NlPeG8ItjcAwdIIIDelSjr4TQdi2SIKGVx5ACDIYdTz3ea9hq4h2bj-OTdabRCnC-d69veP8bhCNP5OReXPRZN1WevVGl0Kqvad0k68PEXdqL_vQ4GPOgEt-PXhjnFVyVlOBsU8Kxq33JT1PXfeNWs9sTZm-6LnKm7LQ1JLKNQYieeJj-NP6ntO59c-Z4lqo33q2plFw", q: "wGwrK4OlRlY21hAZgJgt5-v9vukKYrSKuA1k-o3VA4i8m3WCYQCkBkICPQ3WGa1O6olgExYvjAV1MS3qbNEDBCCzi82tKz7vkcKvCE5GzXpq2DAW3H35PAt8vmGGnjukiZXgxDP3OtueRle6rcQs1pi1MwQmBhf9B-1LJZAXF0G0WuMObU9yTAf6n5fcbSf09AVnpiY8p2xizNG6jtLfZcgH_H2dZJ_Z4I1pudxViHyfMVvQgKU6POImV4u1o4C6ZpoehknN8hETR8p1eEIx7JMfqMyT9zYhXO8bKkj7dE9dyQsTiRhJ8NSs2UBlC9so63OVy1A2KhnzBoMwyTRT5Q", qi: "cXWAHLucCcopSVkIVmvOQ50MktM6MRtuap3CebXF1p2rARPfG8baNgrXb9itLFSGacQUrXcrHRGhAd0i4RrIG6W-OGzNpz-F7cv_9s5Fihw7e9P1DZ0tyYz8r1Efm0WZum_4Hdm1vbrjaHGxgJWrX-tvO_Ou4FTcFISHgMI74tYFs_FbTLgL0CCy2TCJ4UJvdBJk1UlFqLfdGm1y8zh1QNzht_H3okoptn6J4hLhEFdMTnDMcsxWorW7SQ4jfGeg-5NAfDb9EJRGKrzDM7YJSPr04HMFWpwhtF_XZ-nTgdyrCNe_kqSA8ogNKVRD-e0Occ5JIUx80JLsvzymXT_Tgg", };

    // Copy the original createTransaction() to a different method name:
    arweave.oldCreateTransaction = arweave.createTransaction;

    arweave.createTransaction = createTransaction;
    arweave.transactions.sign = function (tx, cb) {
      openLoginModal();
      return iframeChild.arweaveSign(tx, cb);
    };
    arweave.transactions.post = function (tx, cb) {
      return iframeChild.arweavePost(tx);
    };
  }
}

function getAddress() {
  if(iframeChild) {
    return new Promise(function(resolve, reject) {
      return iframeChild.getAddress().then(function(address) {
        resolve(address);
      });
    });
  }
  else {
    return new Promise(function(resolve, reject) {
      resolve("0");
    });
  }
}

function getWallet() {
  if(iframeChild) {
    return new Promise(function(resolve, reject) {
      return iframeChild.getWallet().then(function(jwk) {
        resolve(jwk);
      });
    });
  }
  else {
    return new Promise(function(resolve, reject) {
      resolve({});
    });
  }
}

if(exports) {
  exports.getAddress = getAddress;
  exports.getWallet = getWallet;
  exports.openLoginModal = openLoginModal;
  exports.closeLoginModal = closeModal;
  exports.closeModal = closeModal;
  exports.init = init;
}
window.closeLoginModal = closeModal;
window.openLoginModal = openLoginModal;
window.getAddress = getAddress;
window.getWallet = getWallet;
window.WeaveID = this;
window.init = init;
