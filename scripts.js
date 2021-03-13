const modal = document.querySelector('.modal-overlay')

const Modal = {

    open(){
        modal.classList.add('active')
    },
    
    close(){
        modal.classList.remove('active')
    }
}

const Storage = {
    //pegar a informação
    // JSON.parse retorna a chave "finances.transactions" que esta em string para array ou objeto
    // se nao tiver a chave retorna vazio
    get(){
        return JSON.parse(localStorage.getItem("finances.transactions")) || []
    },
    
    //guardar a informação
    //Pega a chave criada com nome "finances.transactions" que vem como string
    // JSON.stringify transforma o array em string(transactions) 
    set(transactions){
        localStorage.setItem("finances.transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(), //pega as informacoes do storage

    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    }

}

const creatItens = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = creatItens.innerHTMLTransaction(transaction)
        tr.dataset.index = index
        creatItens.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense" 
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação"></td>
        `
        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay')
                .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay')
                .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay')
                .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        creatItens.transactionsContainer.innerHTML = ''
    }

}

const Utils = {
    formatAmount(value){
        value = value * 100 
        return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "" //colocar sinal de menos
        value = String(value).replace(/\D/g, "") //tirar tudo que nao for numero
        value = Number(value) / 100 //pega o valor total e divide por 100 para tirar os 0 e por ,
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues(){
        return {
            description : Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields(){
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") { 
            throw new Error('Por favorm preencha todos os campos')
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        try{
            Form.validateFields()
            const transaction =  Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        }
        catch (error){
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach(creatItens.addTransaction) //adciona os itens corrigidos
        
        creatItens.updateBalance() //atualiza os cartoes

        Storage.set(Transaction.all) //atualizar local storage

    },

    reload(){
        creatItens.clearTransactions()
        App.init()
    },
}

App.init()