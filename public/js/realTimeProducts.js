const socket = io()

const form = document.getElementById('add-prod')
const btnForm = document.getElementById('btn-form')
const productsContainer = document.getElementById('listadoProductos')

const newProd = e => {
	e.preventDefault();
	const data = new FormData(form);
	const prod = {
		title: data.get('title'),
		description: data.get('description'),
		price: data.get('price'),
		category: data.get('category'),
		code: data.get('code'),
		stock: data.get('stock'),
    status: true,
    thunbnail: ""
	};

  socket.emit('addProd', prod);
	form.reset()
};

btnForm.addEventListener('click', newProd)


const delProd = async e => socket.emit('delProd', e.target.id)
document.addEventListener('click', e => e.target.matches('.btn-del') && delProd(e));

socket.on('getAllProducts', (products) => {
  productsContainer.innerHTML = products.map((prod) => `<div class="product-item">
    <p>Id: ${prod._id}</p>
    <p>Title: ${prod.title}</p>
    <p>Description: ${prod.description}</p>
    <p>Price: ${prod.price}</p>
    <p>Status: ${prod.status}</p>
    <p>Code: ${prod.code}</p>
    <p>Stock: ${prod.stock}</p>
    <button id=${prod._id} class='btn-del'>Eliminar</button>
    </div>`).join('');
    }
)