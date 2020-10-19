const todoContainer = document.querySelector('#todos')
const navigationContainer = document.querySelector('#todo-nav-container')

const addTodoBtn = document.querySelector('#addTodoBtn')
const modalElement = document.querySelector('#addTodoModal')

class App{
	constructor(todoContainer, navigationContainer) {
		this.todos = []
		this.todoContainer = todoContainer
		this.navigationContainer = navigationContainer

		this.currentNav = navigationContainer.firstElementChild.dataset.nav

		this.setEventListeners()
		this.navigate(this.currentNav)
	}

	setEventListeners() {
		this.todoContainer.addEventListener('click', e => {
			if(e.target.classList.contains('todo-toggle-desc')) e.target.parentElement.parentElement.parentElement.classList.toggle('show')
			else if(e.target.classList.contains('todo-checkbox')) this.toggleCompleted(e.target.parentElement.parentElement.parentElement.dataset.id)
			else if(e.target.classList.contains('todo-delete')) this.deleteTodo(this.findTodo(e.target.parentElement.parentElement.parentElement.dataset.id))
		})

		this.navigationContainer.addEventListener('click', e => {
			if(e.target.classList.contains('todo-nav')) {
				this.navigate(e.target.dataset.nav)
				
				for (const child of this.navigationContainer.children) {
					child.classList.remove('selected')
				}

				e.target.classList.add('selected')
			}
		})
	}

	navigate(to) {
		if(this[to]) {
			this[to]()
			this.currentNav = to
		} else {
			throw new Error('Navigation error')
		}
	}

	addTodo(name, time, desc) {
		this.todos.push(new Todo(name, time, desc))
		this.navigate(this.currentNav)
	}

	findTodo(id) {
		return this.todos.find(todo => todo.id === id)
	}

	toggleCompleted(id) {
		const todo = this.todos.find(todo => todo.id === parseInt(id))
		todo.completed = !todo.completed
		this.navigate(this.currentNav)
	}

	deleteTodo(todo) {
		this.todos.splice(this.todos.indexOf(todo), 1)
		this.navigate(this.currentNav)
	}

	all() {
		todoContainer.innerHTML = ''

		if(this.todos.length < 1) return this.setEmpty()

		this.todos.forEach(todo => {
			todo.createElement()
		})
	}

	uncompleted() {
		todoContainer.innerHTML = ''

		if(this.todos.length < 1) return this.setEmpty()

		this.todos.forEach(todo => {
			if(!todo.completed) todo.createElement()
		})
	}

	completed() {
		todoContainer.innerHTML = ''
		if(this.todos.length < 1) return this.setEmpty()

		this.todos.forEach(todo => {
			if(todo.completed) todo.createElement()
		})
	}

	setEmpty() {
		todoContainer.innerHTML = ''

		const div = document.createElement('div')
		div.classList.add('none')
		div.textContent = 'There are no todo to display'
		todoContainer.appendChild(div)
	}
}

class Todo{
	constructor(name, time, desc) {
		this.id = Date.now()
		this.name = name
		this.time = time
		this.desc = desc
		this.completed = false

		this.createElement()
	}

	createElement() {
		const todoDiv = document.createElement('div')
		todoDiv.classList.add('todo')
		todoDiv.dataset.id = this.id
		const hour = parseInt(this.time.slice(0, 2))
		let formattedTime

		if(hour === 0) {
			formattedTime = `${hour + 12}${this.time.slice(2, 5)} AM`
		} else if(hour === 12) {
			formattedTime = `${this.time} PM`	
		} else if(hour > 0 && hour < 12) {
			formattedTime = `${this.time} AM`
		} else {
			formattedTime = `${hour - 12 < 10? `0${hour - 12}` : hour - 12}${this.time.slice(2, 5)} PM`
		}

		todoDiv.innerHTML = `
			<div class="todo-main">
				<div class="todo-info">
					<div class="todo-name">
						${this.name}
					</div>
					<div class="todo-time">
						• <em>${formattedTime}</em>
					</div>
				</div>
				<div class="todo-actions">
					<button class="todo-toggle-desc">
						<i class="icon fa fa-chevron-down"></i>
					</button>
					<input type="checkbox" class="todo-checkbox"${this.completed ? " checked" : ''}>
					<button class="todo-delete">
						<i class="icon fa fa-trash"></i>
					</button>
				</div>
			</div>
			<div class="todo-desc">
				${this.desc}
			</div>
		`
		todoContainer.appendChild(todoDiv)
	}
}

const createModal = (modalElement, modalTriggerElement, onSubmit) => {
	const nameInput = modalElement.querySelector('#nameInput')
	const timeInput = modalElement.querySelector('#timeInput')
	const descInput = modalElement.querySelector('#descInput')
	const errorElement = modalElement.querySelector('#errorMessage')

	const submitBtn = modalElement.querySelector('.btn-submit')
	const cancelBtn = modalElement.querySelector('.btn-cancel')

	const resetField = function () {
		nameInput.value = ''
		timeInput.value = ''
		descInput.value = ''
	}

	modalTriggerElement.addEventListener('click', e => {
		modalElement.classList.toggle('open')
	})

	cancelBtn.addEventListener('click', e => {
		modalElement.classList.toggle('open')
		resetField()
	})

	submitBtn.addEventListener('click', e => {
		if(!nameInput.value || !timeInput.value || !descInput.value) {
			errorElement.textContent = 'Fill the input field'
			errorElement.style.opacity = 1
			const timeout = setTimeout(() => {
				errorElement.style.opacity = 0
				clearTimeout(timeout)
			}, 5000)
		} else {
			onSubmit({ name : nameInput.value, time : timeInput.value, desc : descInput.value })
			modalElement.classList.toggle('open')
			resetField()
		}
	})
}

const app = new App(todoContainer, navigationContainer)

createModal(modalElement, addTodoBtn, (result) => {
	const { name, time, desc } = result
	app.addTodo(name, time, desc)
})