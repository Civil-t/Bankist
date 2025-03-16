'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Tapiwa Chimbwanda',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const loginCredentials = document.querySelector('.credentials');

// Container elements
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

// Button elements
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

// Input elements
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
*/

/////////////////////////////////////////////////

// >>>>>> DISPLAY FUNCTIONS

//Display movements from an array dynamically

function dipslalMvmnts(movements, sort = false) {
  // Sorting functionality ->  slice creates a copy - sort method does not mutate the original

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  // clear any previously displayed data before displaying new data
  containerMovements.innerHTML = '';

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const movementHtml = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
                <div class="movements__value">${mov}€</div>
              </div>       
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', movementHtml);
  });
}

// Calculate and display  movements balance

function displayBalance(acc) {
  // new property to store the balance
  acc.balance = acc.movements.reduce((acc, cur) => {
    return acc + cur;
  }, 0);
  labelBalance.textContent = `${acc.balance}€`;
}

// Display summary of total deposits,  withdrawals and interest

function displaySummary(acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const outgoing = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);

  // interest of 20% is calculated on every deposit
  const interest = acc.movements
    .filter(deposit => deposit > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(inter => inter > 1) // exclude interest less than 1 eur
    .reduce((acc, inter) => acc + inter, 0);

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${Math.abs(outgoing)}€`;
  labelSumInterest.textContent = `${interest}€`;
}

// Dislay User Interface
function updateUI(currentAccount) {
  dipslalMvmnts(currentAccount.movements);
  displaySummary(currentAccount);
  displayBalance(currentAccount);
}

// MAP Method to create new property username = owner inials

function createUsernames(accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .split(' ')
      .map(name => name[0])
      .join('')
      .toLowerCase();
  });
}

createUsernames(accounts);

// >>>>>>>>> EVENT HANDLERS

// Login Implementation and handle form submission

let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // prevent default form submission behaviour (refreshing)
  e.preventDefault();
  currentAccount = accounts.find(
    acc => inputLoginUsername.value === acc.username
  );

  // Authentication -> check if username and pin matches
  if (Number(inputLoginPin.value) === currentAccount.pin) {
    // display account owner
    labelWelcome.textContent = `Welcome, ${currentAccount.owner.split(' ')[0]}`;

    // display dashboard details and hide login credentials
    containerApp.style.opacity = 100;
    loginCredentials.style.display = 'none';

    updateUI(currentAccount);

    // Clear username and pin input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // remove cursor focus
  }
});

// Transfer funds form submission event handler

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  // find receiver account
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Send amount if conditions are satisfied
  const amount = Number(inputTransferAmount.value);

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // update movements
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
  }
  inputTransferAmount.value = inputTransferTo.value = '';
  updateUI(currentAccount);
});

// Loan funds event handler

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  // Some method -> return true if "ANY" elemnt satisfies condition (true if "ANY" of the deposits in movement array are at least 10% of requested loan amount)
  if (
    amount > 0 &&
    currentAccount.movements.some(amnt => amnt >= amount * 0.1)
  ) {
    // approve and add amount
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
});

// Close Account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    // find index of current account
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    //  delete account
    accounts.splice(index, 1);

    inputCloseUsername.value = inputClosePin.value = '';

    containerApp.style.opacity = 0;
  }
});

// Sorting event handler

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  dipslalMvmnts(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/*
// flat method -> reduces nested arrays into a single array

const allMovements = accounts.map(acc => acc.movements);
const movsTogether = allMovements.flat();
const grandBalance = movsTogether.reduce((acc, amnt) => acc + amnt, 0);
console.log(grandBalance);

const grandBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, amnt) => acc + amnt, 0);

console.log(grandBalance);

// flatMap -> combination of flat and map methods (maps an array then flattens)

const grandBalance = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, amnt) => acc + amnt, 0);

console.log(grandBalance);

*/
