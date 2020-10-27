# weaveid-js
Easy onboarding for decentralized apps built on [Arweave](https://arweave.org). This is the NPM module version of WeaveID. 

## Install
Install weaveid-js by running: 
```
npm install weaveid --save
```

## Usage
After installing, you can add weaveid-js to your react/vue/ts app by importing it into your JS/TS file like so: 
```
import WeaveID from 'weaveid';
```

To open the login modal and fetch a user's wallet address upon successful login, call the `openLoginModal()` method, like so:
```
window.openLoginModal().then(address => {
    // Do what you want with 'address' here!
});
```

You can also call it in 1 line using await:
```
let address = await window.openLoginModal();
// Do what you want with 'address' here!
```

## Methods
The following methods are exposed by weaveid-js:

1. **window.openLoginModal()** - Opens the WeaveID login modal. Returns a Promise containing the logged-in user's wallet's address.
2. **window.closeLoginModal()** - Closes the WeaveID login modal.
3. **window.getAddress()** = Returns a Promise containing the logged-in user's wallet's address.
4. **window.getWallet()** = Returns a Promise containing the logged-in user's wallet's JWK keyfile. 
