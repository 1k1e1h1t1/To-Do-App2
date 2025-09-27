let input = document.getElementById('task-input')
let addBtn = document.getElementById('add-btn')
let list = document.getElementById('task-list')


function formatDateTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}


function createTaskElement(text) {
    let li = document.createElement('li')
    li.className = 'item'

    let toggle = document.createElement('button')
    toggle.className = 'toggle'
    toggle.title = 'Позначити як виконане'

    let contentWrapper = document.createElement('div')
    contentWrapper.className = 'task-content'

    let title = document.createElement('span')
    title.className = 'title'
    title.textContent = text

    let datetime = document.createElement('span')
    datetime.className = 'datetime'
    datetime.textContent = formatDateTime(new Date())

    let actions = document.createElement('div')
    actions.className = 'actions'

    let del = document.createElement('button')
    del.className = 'delete'
    del.textContent = '🗑️ Видалити'
    del.title = 'Видалити задачу'


    toggle.onclick = function () {
        li.classList.toggle('done')
        // Зберігаємо стан у localStorage
        saveTasksToLocalStorage()
    }

    del.onclick = function () {
        li.classList.add('deleting')
        setTimeout(() => {
            if (li.parentNode) {
                list.removeChild(li)
                saveTasksToLocalStorage()
            }
        }, 300)
    }


    title.ondblclick = function() {
        editTask(title)
    }


    contentWrapper.appendChild(title)
    contentWrapper.appendChild(datetime)
    actions.appendChild(del)
    li.appendChild(toggle)
    li.appendChild(contentWrapper)
    li.appendChild(actions)

    return li
}


function editTask(titleElement) {
    const currentText = titleElement.textContent
    const input = document.createElement('input')
    input.type = 'text'
    input.value = currentText
    input.className = 'edit-input'


    titleElement.parentNode.replaceChild(input, titleElement)
    input.focus()
    input.select()


    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            saveEdit(input, titleElement)
        } else if (e.key === 'Escape') {
            cancelEdit(input, titleElement, currentText)
        }
    }

    input.onblur = function() {
        saveEdit(input, titleElement)
    }
}

function saveEdit(input, titleElement) {
    const newText = input.value.trim()
    if (newText !== '') {
        titleElement.textContent = newText
    }
    input.parentNode.replaceChild(titleElement, input)
    saveTasksToLocalStorage()
}

function cancelEdit(input, titleElement, originalText) {
    titleElement.textContent = originalText
    input.parentNode.replaceChild(titleElement, input)
}


function addTask() {
    let text = input.value.trim()
    if (text === '') {
        // Анімація пустого поля
        input.classList.add('shake')
        setTimeout(() => input.classList.remove('shake'), 300)
        return
    }

    let li = createTaskElement(text)
    list.prepend(li)
    input.value = ''


    saveTasksToLocalStorage()


    li.style.opacity = '0'
    li.style.transform = 'translateY(-20px)'
    setTimeout(() => {
        li.style.opacity = '1'
        li.style.transform = 'translateY(0)'
    }, 10)
}


function saveTasksToLocalStorage() {
    const tasks = []
    document.querySelectorAll('.item').forEach(item => {
        tasks.push({
            text: item.querySelector('.title').textContent,
            done: item.classList.contains('done'),
            datetime: item.querySelector('.datetime').textContent
        })
    })
    localStorage.setItem('tasks', JSON.stringify(tasks))
}


function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks)
        tasks.forEach(task => {
            let li = createTaskElement(task.text)
            if (task.done) {
                li.classList.add('done')
            }

            li.querySelector('.datetime').textContent = task.datetime
            list.appendChild(li)
        })
    }
}


function clearCompletedTasks() {
    const completedTasks = document.querySelectorAll('.item.done')
    if (completedTasks.length === 0) return

    completedTasks.forEach(task => {
        task.classList.add('deleting')
        setTimeout(() => {
            if (task.parentNode) {
                list.removeChild(task)
                saveTasksToLocalStorage()
            }
        }, 300)
    })
}


function addClearButton() {
    const clearBtn = document.createElement('button')
    clearBtn.textContent = '🧹 Очистити виконані'
    clearBtn.className = 'clear-btn'
    clearBtn.onclick = clearCompletedTasks

    const app = document.querySelector('.app')
    app.appendChild(clearBtn)
}


addBtn.onclick = addTask

input.onkeydown = function (e) {
    if (e.key === 'Enter') addTask()
}


window.addEventListener('load', function() {
    loadTasksFromLocalStorage()
    addClearButton()
    input.focus()


    document.querySelectorAll('.item').forEach(item => {
        item.style.opacity = '0'
        item.style.transform = 'translateY(20px)'
        setTimeout(() => {
            item.style.opacity = '1'
            item.style.transform = 'translateY(0)'
        }, 100)
    })
})


const style = document.createElement('style')
style.textContent = `
    .shake {
        animation: shake 0.3s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .item {
        transition: all 0.3s ease;
    }
    
    .deleting {
        opacity: 0 !important;
        transform: translateX(100%) !important;
        transition: all 0.3s ease;
    }
    
    .edit-input {
        width: 100%;
        padding: 8px;
        border: 2px solid var(--primary);
        border-radius: 8px;
        font-size: 16px;
        outline: none;
    }
    
    .clear-btn {
        margin-top: 20px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        border: none;
        border-radius: 15px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .clear-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
`
document.head.appendChild(style)