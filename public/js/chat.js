const socket = io()

let userName

Swal.fire({
  title: 'Ingrese su correo electrónico',
  input: 'text',
  inputValidator: (value)=>{
    if (!value){
      return 'Tiene que ingresar un correo electrónico'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
          return 'Ingrese un correo electrónico válido';
    }
  } 
}).then (data =>{
  userName=data.value
socket.emit('newUser', userName)
})

const inputData=document.getElementById("inputData")
const outputData=document.getElementById("outputData")

inputData.addEventListener('keyup', (event)=>{
  if (event.key === 'Enter'){
    if (inputData.value.trim().length>0)
    {
      socket.emit('message', {user:userName, message: inputData.value})
      inputData.value=""
    }
  }
})

socket.on('messageLogs', data => {
  let messages = ''
  data.forEach(message => {
    messages += `<b>${message.user}: </b>  ${message.message} <br/>`
  })
  outputData.innerHTML = messages
})

// socket.on('newConnection', data=>{
//   outputData.innerHTML = data
// })

socket.on('notification', user=>{
  Swal.fire({
    text: `${user} se conectó`,
    toast: true,
    position: 'top-right',
  })
})