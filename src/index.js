'use strict'

//first check localStorage
let currentLang = localStorage.language ?? document.documentElement.lang

const changeLanguage = () => {
  currentLang = currentLang === 'pl' ? 'en' : 'pl'
  document.querySelector('#language').textContent = currentLang?.toUpperCase()
  localStorage.language = currentLang

  //if user is not in onlineView we dont need to call innerHtml,
  //textContent will work great
  if (!localStorage.session) {
    //traverse through whole nested object recursively
    //and assign its key to acc[] then return acc
    let translations = Object.values(languageObject).reduce(function recur(
      acc,
      value
    ) {
      if (typeof value === 'string') {
        acc.push(value)
      }
      if (typeof value === 'object') {
        return Object.values(value).reduce(recur, acc)
      }
      return acc
    },
    [])

    const [pl, en] = [
      translations.splice(0, translations.length / 2),
      translations,
    ]

    //get visible html elements
    const elements = document.querySelectorAll('[data-translate]')
    for (let element of elements) {
      //find right text in opposite language array,
      //take its index and return value at that index in other array
      element.textContent =
        currentLang === 'pl'
          ? pl[en.findIndex(text => element.textContent === text)]
          : en[pl.findIndex(text => element.textContent === text)]
    }
  } else {
    //just render onlineView,
    //charts still need to rerender with correct data
    onlineView()
  }
}

const languageObject = {
  pl: {
    button: {
      register: 'Rejestracja',
      login: 'Logowanie',
      logout: 'Wyloguj',
      return: 'Powrót',
      createAccount: 'Zarejestruj',
      signIn: 'Zaloguj',
    },
    form: {
      field: 'Nazwa użytkownika / Email',
      username: 'Nazwa użytkownika',
      password: 'Hasło',
      email: 'Email',
      confirm: 'Potwierdź email',
      actionLogin: 'Logowanie',
      actionRegister: 'Rejestracja',
      emailFree1:
        'Podany email jest poprawny, ale nie występuje w naszej bazie danych.',
      emailFree2: 'Czy chesz stworzyć nowe konto na jego podstawie ?',
      accept: 'Tak',
      decline: 'Nie',
      error: {
        required: 'To pole jest wymagane.',
        range: 'Dozwolona długość to 6-16 znaków.',
        syntax:
          'Poprawna składnia: 5 liter, 1 liczba oraz dozwolone - _ [ ] / \\ ',
        length: 'Minimalna długość to 6 znaków.',
        email: 'Niewłaściwy mail.',
        confirm: 'Oba pola muszą być takie same.',
        login: 'Błędny login lub hasło.',
      },
    },
    chart: {
      label: 'Saldo na koniec dnia',
      yAxis: 'Saldo',
      xAxis: 'Dzień',
    },
    legend: {
      date: 'Data',
      type: 'Typ',
      description: 'Opis',
      amount: 'Kwota',
      balance: 'Saldo',
    },
    notification: 'Zaloguj się, by sprawdzić swoje transakcje.',
  },
  en: {
    button: {
      register: 'Register',
      login: 'Login',
      logout: 'Logout',
      return: 'Back',
      createAccount: 'Register',
      signIn: 'Sign in',
    },
    form: {
      field: 'Username / Email',
      username: 'Username',
      password: 'Password',
      email: 'Email',
      confirm: 'Confirm email',
      actionLogin: 'Login',
      actionRegister: 'Register',
      emailFree1:
        'The e-mail address provided is correct, but it is not in our database.',
      emailFree2: 'Would you like to create new account ?',
      accept: 'Yes',
      decline: 'No',
      error: {
        required: 'This field is required.',
        range: 'Allowed length is 6-16 characters.',
        syntax:
          'Correct structure: 5 letter, 1 number and - _ [ ] / \\ allowed.',
        length: 'Minimal length is 6 characters.',
        email: 'Invalid mail.',
        confirm: 'Fields must be equal.',
        login: 'Invalid login or password.',
      },
    },
    chart: {
      label: 'Balance at the end of the day',
      yAxis: 'Balance',
      xAxis: 'Day',
    },
    legend: {
      date: 'Date',
      type: 'Type',
      description: 'Description',
      amount: 'Amount',
      balance: 'Balance',
    },
    notification: 'You need to be signed in to view your transactions.',
  },
}

document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.querySelector('#language')
  langBtn.textContent = currentLang.toUpperCase()
  langBtn.onclick = changeLanguage
  if (localStorage.session) {
    return onlineView()
  }
  offlineView()
})

const setError = (input, msg) => {
  input.classList.add('error')
  input.parentElement.querySelector('.error-text').textContent = msg
}

const validate = input => {
  switch (input.id) {
    case 'username':
      if (!input.value) {
        return setError(input, languageObject[currentLang].form.error.required)
      }
      //made so i could show length error in reality
      //this should be in regex and would be better
      if (input.value.length < 6 || input.value.length > 16) {
        return setError(input, languageObject[currentLang].form.error.range)
      }
      //Digit in any position at least 5 characters 1 digit and can use - \ / [ ] _
      if (!/(?=.*\d)(?=[a-zA-Z]{5,})[\w-\/\\\[\]]*/.test(input.value)) {
        return setError(input, languageObject[currentLang].form.error.syntax)
      }
      break

    case 'password':
      if (!input.value) {
        return setError(input, languageObject[currentLang].form.error.required)
      }
      if (input.value.length < 6) {
        return setError(input, languageObject[currentLang].form.error.length)
      }
      break

    case 'email':
      if (!input.value) {
        return setError(input, languageObject[currentLang].form.error.required)
      }
      //allowing alias connected by [ '+'  '-' '_' '.' ]
      if (!/^[\w\+-\.]+@[a-z\.]+\.[a-z]+$/.test(input.value)) {
        return setError(input, languageObject[currentLang].form.error.email)
      }
      break
    case 'rep_email':
      if (!input.value) {
        return setError(input, languageObject[currentLang].form.error.required)
      }
      if (document.querySelector('#email').value !== input.value) {
        return setError(input, languageObject[currentLang].form.error.confirm)
      }
      break
  }
}

const createUser = userObj => {
  //localstorage.db also possible
  const database = localStorage.getItem('db')
  if (database)
    // if database exist spread across parsed localstorage and append new user at the end
    localStorage.db = JSON.stringify([...JSON.parse(localStorage.db), userObj])
  //if not just create new array with user inside
  else localStorage.db = JSON.stringify([userObj])

  //sign in user
  localStorage.setItem('session', userObj.id)

  onlineView()
}

const login = event => {
  event.preventDefault()
  //spread to array so i can use Array.some later
  const inputs = Array(...document.querySelectorAll('input'))

  //clear errors before validation ,
  //because someone might only given wrong password
  //and both inputs are error for safety reason
  inputs.forEach(el => {
    el.classList.remove('error')
    el.parentElement.lastElementChild.textContent = ''
  })

  const [field, password] = inputs

  //determine if user provided email or username
  field.id = /^[\w\+-\.]+@[a-z\.]+\.[a-z]+$/.test(field.value)
    ? 'email'
    : 'username'
  validate(field)
  validate(password)

  //if errors return
  if (inputs.some(el => el.classList.contains('error'))) return

  const hashedPassword = btoa(password.value)

  //intialize empty db if there is none
  const db = localStorage.db ? JSON.parse(localStorage.db) : []

  //find username searching with correct credentials
  let foundUser = db.find(el =>
    field.id === 'email'
      ? el.email === field.value
      : el.username === field.value
  )

  //email is valid but user was not found so we suggest making account
  if (!foundUser && field.id === 'email') {
    const app = document.querySelector('#app')
    app.innerHTML = view('emailNotTaken')
    const [accept, decline] = app.querySelectorAll('button')
    accept.addEventListener('click', () => {
      app.innerHTML = view('register')

      //fill fields given by user
      app.querySelector('#email').value = field.value
      app.querySelector('#password').value = password.value

      app
        .querySelectorAll('input')
        .forEach(input => input.addEventListener('input', onInput))

      document.querySelector('#return').addEventListener('click', () => {
        offlineView()
      })
    })
    decline.addEventListener('click', () => {
      app.innerHTML = view('login')
      app
        .querySelectorAll('input')
        .forEach(input => input.addEventListener('input', onInput))
      document.querySelector('#return').addEventListener('click', () => {
        offlineView()
      })
    })
    return
  }
  if (!foundUser) {
    setError(field, languageObject[currentLang].form.error.login)
    setError(password, languageObject[currentLang].form.error.login)
    return
  }

  if (foundUser && foundUser.password !== hashedPassword) {
    setError(field, languageObject[currentLang].form.error.login)
    setError(password, languageObject[currentLang].form.error.login)
    return
  }

  //sign in user
  localStorage.setItem('session', foundUser.id)
  onlineView()
}

const stripAlias = string => {
  //get value before @ character
  let possibleAlias = /(.*)@/.exec(string)[1]

  //if contains any of
  if (/[-\+\._]/.test(possibleAlias)) {
    //get name before alias
    let strippedMail = /(.*?)[-\+\._]/.exec(string)[1]
    //skip alias and get value after @ then append it to previous value
    strippedMail += /@(.*$)/.exec(string)[0]
    return strippedMail
  }
  //if no alias just skip
  return string
}

const register = event => {
  event.preventDefault()
  //creating array so i can use Array.some
  const inputs = Array(...document.querySelectorAll('input'))

  const [username, password, email, rep_email] = inputs
  validate(username)
  validate(password)
  validate(email)
  validate(rep_email)

  //if errors return
  if (inputs.some(el => el.classList.contains('error'))) return

  //intialize empty db if there is none
  const db = localStorage.db ? JSON.parse(localStorage.db) : []

  // get alias between symbol between alias and @
  // let alias =/[-_+.].*?@/.exec(email)[0].slice(0,-1)

  //find if email is in use
  let foundUser = db.find(
    el => stripAlias(el.email) === stripAlias(email.value)
  )

  if (foundUser) return setError(email, 'Email jest już w użyciu.')

  //find if username is in use
  foundUser = db.find(el => el.username === username.value)
  if (foundUser) return setError(username, 'Nazwa użytkownika jest zajęta')

  //email and username are not used, finalize user creation
  createUser({
    id: crypto.randomUUID(),
    username: username.value,
    password: btoa(password.value),
    email: email.value,
  })
}

const onInput = e => {
  //ignore validation on first inputs
  if (!e.target.classList.contains('error')) return
  e.target.classList.remove('error')
  e.target.parentElement.lastElementChild.textContent = ''
  validate(e.target)
}

const offlineView = () => {
  const app = document.querySelector('#app')
  app.innerHTML = view('offline')
  const actionBtns = document.querySelector('.btn-wrapper')
  actionBtns.innerHTML = `<button class="btn login" id="login"data-translate>${languageObject[currentLang].button.login}</button>
  <button class="btn register" id="register"data-translate>${languageObject[currentLang].button.register}</button>`

  for (let button of actionBtns.children) {
    button.addEventListener('click', () => {
      //unhide both at the start
      for (let btn of actionBtns.children) {
        btn.classList.remove('hidden')
      }

      //render form
      app.innerHTML = view(button.id)

      //remove errors on input
      app
        .querySelectorAll('input')
        .forEach(input => input.addEventListener('input', onInput))

      //hide buttons when form is on
      button.classList.add('hidden')

      document.querySelector('#return').addEventListener('click', () => {
        offlineView()
        document.querySelector('#language').classList.remove('hidden')
      })
    })
  }
}

const logout = () => {
  localStorage.removeItem('session')
  offlineView()
}

const swap = () => {
  const charts = document.querySelectorAll('[data-active]')
  charts.forEach(
    chart =>
      (chart.dataset.active =
        chart.dataset.active === 'true' ? 'false' : 'true')
  )
}

const onlineView = async () => {
  const app = document.querySelector('#app')
  const actionBtns = document.querySelector('.btn-wrapper')
  document.querySelector('#language').classList.remove('hidden')
  actionBtns.innerHTML = `<button class="btn logout" onclick="logout()"data-translate>${languageObject[currentLang].button.logout}</button>`
  app.innerHTML = view('online')
  const ctx1 = document.getElementById('bar-chart').getContext('2d')
  const ctx2 = document.getElementById('doughnut-chart').getContext('2d')

  //28.12.2022 Requests exhausted.

  // const data = await fetch(
  //   'https://api.jsonbin.io/v3/b/63a092ab15ab31599e2045be',
  //   {
  //     headers: {
  //       'x-access-key':
  //         '$2b$10$5pBRUbFRKdKft/b8qSQ3IeyPQgQ8CLXlvgoQA6GdpYvdWva.pOfGS',
  //     },
  //   }
  // ).then(res => res.json())

  const jsonDummy = {
    transacationTypes: {
      pl: {
        1: 'Wpływy - inne',
        2: 'Wydatki - zakupy',
        3: 'Wpływy - wynagrodzenie',
        4: 'Wydatki - inne',
      },
      en: {
        1: 'Income - other',
        2: 'Expenses - shopping',
        3: 'Income - salary',
        4: 'Expenses - other',
      },
    },
    transactions: [
      {
        date: '2022-11-11',
        amount: -231.56,
        description: 'Biedronka 13',
        balance: 4337.25,
        type: 2,
      },
      {
        date: '2022-11-15',
        amount: -231.56,
        description: 'Biedronka 13',
        balance: 4337.25,
        type: 2,
      },
      {
        date: '2022-11-14',
        amount: -231.56,
        description: 'Biedronka 13',
        balance: 4337.25,
        type: 2,
      },
      {
        date: '2022-11-13',
        amount: -231.56,
        description: 'Biedronka 13',
        balance: 4337.25,
        type: 2,
      },
      {
        date: '2022-11-12',
        amount: -231.56,
        description: 'Biedronka 13',
        balance: 4337.25,
        type: 2,
      },
      {
        date: '2022-11-12',
        amount: -31.56,
        description: 'PayU Spółka Akcyjna',
        balance: 4572.18,
        type: 4,
      },
      {
        date: '2022-11-12',
        amount: 2137.69,
        description: 'Wynagrodzenie z tytułu Umowy o Pracę',
        balance: 2420.47,
        type: 3,
      },
      {
        date: '2022-11-10',
        amount: -136,
        description: 'Lidl',
        balance: 2555.55,
        type: 2,
      },
      {
        date: '2022-11-10',
        amount: 25,
        description: 'Zrzutka na prezent dla Grażyny',
        balance: 2847.66,
        type: 1,
      },
      {
        date: '2022-11-09',
        amount: -111.11,
        description: 'Biedronka 13',
        balance: 3000,
        type: 2,
      },
      {
        date: '2022-11-09',
        amount: -78.33,
        description: 'PayU Spółka Akcyjna',
        balance: 3027.51,
        type: 4,
      },
    ],
    cardNumber: generateCardNumber(),
  }
  const data = jsonDummy
  const transactions = data.transactions
  const transactionTypes = Object.values(
    currentLang === 'pl' ? data.transacationTypes.pl : data.transacationTypes.en
  )

  //spread back to array so i can Array.reverse() later
  const uniqueDates = Array(...new Set(transactions.map(el => el.date)))

  //map through unique days and group them by dates, next since first element in array is latest saldo update we just take it's balance
  const saldo = Array(...uniqueDates)
    .map(day => transactions.filter(el => el.date === day))
    .map(group => group[0].balance)

  const textColor = `#b0c4de`
  const colors = [
    '#2ac49e',
    '#1ca94b',
    '#1f3d83',
    '#097cbf',
    '#6ed9cc',
    '#31b36d',
    '#2a4b7c',
    '#4d6ec7',
    '#77d0ad',
    '#4a7b3c',
  ]
  new Chart(ctx1, {
    type: 'bar',
    data: {
      //.reverse() because days are descending
      labels: uniqueDates.reverse(),
      datasets: [
        {
          label: languageObject[currentLang].chart.label,
          data: saldo,
          borderRadius: 4,
          //value > 0 green < red
          backgroundColor: ctx => (ctx.raw > 0 ? '#00b176' : '#c73c3e'),
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: languageObject[currentLang].chart.yAxis,
            color: textColor,
          },
          grid: {
            //highlight value 0
            color: ctx => ctx.tick.value === 0 && '#eee',
            lineWidth: 4,
            lineRadius: 10,
          },
          ticks: {
            color: textColor,
          },
          border: {
            display: false,
          },
        },
        x: {
          title: {
            display: true,
            text: languageObject[currentLang].chart.xAxis,
            color: textColor,
          },
          border: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
          },
        },
      },
    },
  })

  //create array with the same length as transactions, its value at given index will store occurrence of transactionTypes eg. chartData[n] = 2 -> transactionType(n+1) occurred 2 times
  //then calculate procentage
  const chartData = Array.from({ length: transactionTypes.length })
    .fill(0)
    .map((_, idx) =>
      Math.round(
        (transactions.filter(transaction => idx === transaction.type - 1)
          .length /
          transactions.length) *
          100
      )
    )

  new Chart(ctx2, {
    type: 'doughnut',

    data: {
      labels: transactionTypes,
      datasets: [
        {
          label: '%',
          data: chartData,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        position: 'right',
      },
      scales: {
        y: {
          border: {
            display: false,
          },
          grid: {
            display: false,
            tickLength: 0,
          },
          ticks: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
          },
        },
      },
    },
  })

  //transaction render
  const transactionList = document.querySelector('#transactions')
  const transactionListMobile = document.querySelector('#transactionsMobile')
  for (let transaction of transactions) {
    const div = document.createElement('div')
    div.className = 'transaction'
    div.innerHTML = `
  <div class="item">${transaction.date}</div>
  <div class="item "><img src='${renderIcon(transaction.type)}'/></div>
  <div class="item description">${transaction.description} <div class="type"> ${
      transactionTypes[transaction.type - 1]
    }</div></div>
  <div class="item">${transaction.amount} zł</div>
  <div class="item">${transaction.balance} zł</div>
 
    `
    transactionList.appendChild(div)

    const expandDiv = document.createElement('div')
    expandDiv.ariaExpanded = 'false'
    expandDiv.innerHTML = `
    <div class="row"><div>Data: ${
      transaction.date
    }</div><div>Kwota transakcji: ${transaction.amount} zł</div></div>
    <div> Saldo przed transakcją: ${transaction.balance} zł</div>
    <div>Opis: ${transaction.description}</div>
    <div>Typ: ${transactionTypes[transaction.type - 1]}</div>

    `
    expandDiv.className = 'transaction-details'

    const button = document.createElement('button')
    button.className = 'transaction'
    button.onclick = () => {
      const isExpanded = document.querySelector('[aria-expanded="true"]')

      //check if there is any expanded div and if
      //other that this transaction is clicked
      //this is done so i can close expanded div when clicked again on transaction
      if (isExpanded && expandDiv.ariaExpanded === 'false') {
        isExpanded.ariaExpanded = 'false'
        //grab last selected and remove its class
        document.querySelector('.selected').classList.remove('selected')
      }

      expandDiv.ariaExpanded =
        expandDiv.ariaExpanded === 'true' ? 'false' : 'true'
      if (expandDiv.ariaExpanded === 'true') {
        button.classList.add('selected')
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      } else button.classList.remove('selected')
    }
    button.innerHTML = `
    <div class="item icon"><img src='${renderIcon(transaction.type)}'/></div>
    <div class="item">${transaction.description}</div>
    <div class="item">${transaction.amount} zł</div>
    `

    transactionListMobile.append(button, expandDiv)
  }
}

const renderIcon = type => {
  let src

  switch (type) {
    case 2:
      src = '../public/basket-shopping.svg'
      break

    case 3:
      src = `../public/cash-payment-icon.svg
      `
      break
    //others
    default:
      src = `../public/money-bill-transfer.svg`
      break
  }
  return src
}

/**
 *
 * @param {string} content
 * @return changes #app's innerHTML based on content passed
 */
const view = content => {
  let html = ``

  switch (content) {
    case 'register':
      html = `<form class="form-style" onsubmit="register(event)" autocomplete="off">
      <span class="action"data-translate>${languageObject[currentLang].form.actionRegister}</span>
    <div class="wrapper">
      <label for="username"data-translate>${languageObject[currentLang].form.username}</label>
      <input type="text" id="username" />
      <div class="error-text"></div>
    </div>
    <div class="wrapper">
      <label for="password"data-translate>${languageObject[currentLang].form.password}</label>
      <input type="password" id="password" />
      <div class="error-text"></div>
    </div>
    <div class="wrapper">
      <label for="email"data-translate>${languageObject[currentLang].form.email}</label>
      <input type="text" id="email" />
      <div class="error-text"></div>

    </div>
    <div class="wrapper">
      <label for="rep_email"data-translate>${languageObject[currentLang].form.confirm}</label>
      <input type="text" id="rep_email" />
      <div class="error-text"></div>

    </div>
    <div class="submit-section">
    <button class="btn submit" data-translate>${languageObject[currentLang].button.createAccount}</button>
      <button class="btn return" id="return" type="button"data-translate>${languageObject[currentLang].button.return}</button>
      </div>
    </form>`
      break
    case 'login':
      html = `<form class="form-style" onsubmit="login(event)" autocomplete="off">
      <span class="action"data-translate>${languageObject[currentLang].form.actionLogin}</span>
      <div class="wrapper">
        <label for="field"data-translate>${languageObject[currentLang].form.field}</label>
        <input type="text" id="field" />
      <div class="error-text"></div>

      </div>
      <div class="wrapper">
        <label for="password"data-translate>${languageObject[currentLang].form.password}</label>
        <input type="password" id="password" />
      <div class="error-text"></div>
      
      </div>
    <div class="submit-section">
      <button class="btn submit"data-translate>${languageObject[currentLang].button.signIn}</button>
      <button class="btn return" id="return" type="button"data-translate>${languageObject[currentLang].button.return}</button>
      </div>
      </form>`
      break
    case 'offline':
      html = `<p class="notif"data-translate>${languageObject[currentLang].notification}</p>`
      break

    case 'online':
      html = `<div class="main-section">
      <section class="charts" id="bars">
      <button class="navigation left" onclick="swap()">
      <img src="../public/caret-left.svg"/>
      </button>
        <div class="chart-wrapper" data-active="true">
          <canvas id="bar-chart" class="bars"></canvas>
        </div>
        <div class="chart-wrapper" data-active="false">
          <canvas id="doughnut-chart" class="doughnut"></canvas>
        </div>
      <button class="navigation right"onclick="swap()">
      <img src="../public/caret-right.svg"/>
      </button>

      </section>
      <section class="transaction-list-section">
          <div class="flex-section">
          <div class="legend">
          <div class="item"data-translate>${languageObject[currentLang].legend.date}</div>
          <div class="item"data-translate>${languageObject[currentLang].legend.type}</div>
          <div class="item"data-translate>${languageObject[currentLang].legend.description}</div>
          <div class="item"data-translate>${languageObject[currentLang].legend.amount}</div>
          <div class="item"data-translate>${languageObject[currentLang].legend.balance}</div>
          </div>
            <div id="transactions" class="transaction-wrapper desktop"></div>
            <div id="transactionsMobile" class="transaction-wrapper mobile"></div>
          </div>
        </section>
    </div>`
      break

    case 'emailNotTaken':
      html = `
    <div class="suggest-section">
      <div>
        <pdata-translate>${languageObject[currentLang].form.emailFree1}</p>
        <pdata-translate>${languageObject[currentLang].form.emailFree2}</p>
      </div>
      <div class="submit-section">
         <button class="btn return"data-translate>${languageObject[currentLang].form.accept}</button>
         <button class="btn return"data-translate>${languageObject[currentLang].form.decline}</button>
      </div>
    </div>`
      break
  }

  return html
}

//GENERATORS

const generateCardNumber = () => {
  const prefixes = [4486, 4614, 4615, 4716]
  let creditCardNumber = ''

  creditCardNumber += prefixes[Math.floor(Math.random() * prefixes.length)]

  for (let i = 0; i < 12; i++) {
    creditCardNumber += Math.floor(Math.random() * 10)
  }

  return creditCardNumber
}
