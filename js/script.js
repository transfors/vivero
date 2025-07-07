document.addEventListener("DOMContentLoaded", () => {
    // Cargar productos desde API
    fetch("https://fakestoreapi.com/products")
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById("productos-container");
            if (contenedor) {
                data.forEach(producto => {
                    contenedor.innerHTML += `
                    <figure class="producto card">
                        <img src="${producto.image}" alt="${producto.title}">
                        <figcaption>
                            <ul>
                                <li class="planta">${producto.title}</li>
                                <li class="precio">Precio: ${producto.price.toFixed(2)}</li>
                                <li>
                                    <button
                                        type="button"
                                        class="agregar-api-carrito"
                                        data-id="${producto.id}"
                                        data-nombre="${producto.title}"
                                        data-precio="${producto.price.toFixed(2)}">
                                        Agregar
                                    </button>
                                </li>
                            </ul>
                        </figcaption>
                    </figure>`;
                });
            }
        })
        .catch(error => {
            console.error("Error al obtener productos:", error);
            const contenedor = document.getElementById("productos-container");
            if (contenedor) {
                contenedor.innerHTML = "<p>Hubo un problema al cargar los productos.</p>";
            }
        });

    // Elementos del DOM
    const btnVaciar = document.getElementById('vaciar-carrito');
    const btnPagar = document.getElementById('pagar-carrito');
    const listaCarrito = document.getElementById('lista-carrito');
    const resumenCarrito = document.getElementById('resumen-carrito');
    const formPago = document.getElementById('form-pago');
    const botonesCarrito = document.getElementById('botones-carrito');
    const modalEl = document.getElementById('modalCarrito');

    // Inicializa el modal de Bootstrap
    const modalBootstrap = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

    // Flag para controlar alert de pago exitoso usando sessionStorage
    const PAGO_EXITOSO_KEY = "pagoExitoso";
    sessionStorage.setItem(PAGO_EXITOSO_KEY, "false");

    // Listener único para el evento hidden.bs.modal
    if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
            if (sessionStorage.getItem(PAGO_EXITOSO_KEY) === "true") {
                setTimeout(() => {
                    alert('✅ El pago fue efectuado con éxito.\n🙏 ¡Gracias por su compra!');
                    sessionStorage.setItem(PAGO_EXITOSO_KEY, "false");
                }, 150);
            }
        });
    }

    // Cargar carrito al iniciar la página
    cargarCarrito();

    // Escuchar botones de productos locales
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        boton.addEventListener('click', (event) => agregarProducto(event, true));
    });

    // Vaciar carrito
    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            localStorage.removeItem('carrito');
            cargarCarrito();
        });
    }

    // Botón "Enviar pago"
    if (btnPagar && formPago && listaCarrito && resumenCarrito && botonesCarrito) {
        btnPagar.addEventListener('click', () => {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            if (carrito.length === 0) {
                alert("⚠️ El carrito está vacío. Agregá productos antes de pagar.");
                return;
            }

            formPago.style.display = 'block';
            listaCarrito.style.display = 'none';
            resumenCarrito.style.display = 'none';
            botonesCarrito.style.display = 'none';

            const productosTexto = carrito.map(p => `- ${p.nombre} x${p.cantidad}`).join('\n');
            const mensajeTextArea = document.getElementById('mensaje');
            if (mensajeTextArea) {
                mensajeTextArea.value = `Productos comprados:\n${productosTexto}`;
            }
        });
    }

    // Cancelar pago
    const cancelarPago = document.getElementById('cancelar-pago');
    if (cancelarPago && formPago && listaCarrito && resumenCarrito && botonesCarrito) {
        cancelarPago.addEventListener('click', () => {
            formPago.style.display = 'none';
            listaCarrito.style.display = 'block';
            resumenCarrito.style.display = 'flex';
            botonesCarrito.style.display = 'flex';
        });
    }

    // Enviar formulario de pago
    if (formPago && listaCarrito && resumenCarrito && botonesCarrito && modalBootstrap) {
        formPago.addEventListener('submit', (e) => {
            e.preventDefault();

            formPago.submit();

            localStorage.removeItem('carrito');
            cargarCarrito();

            formPago.style.display = 'none';
            listaCarrito.style.display = 'block';
            resumenCarrito.style.display = 'flex';
            botonesCarrito.style.display = 'flex';

            sessionStorage.setItem(PAGO_EXITOSO_KEY, "true");
            modalBootstrap.hide();
        });
    }
});

// Escucha dinámica para productos cargados por API
document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("agregar-api-carrito")) {
        const id = e.target.getAttribute("data-id");
        const nombre = e.target.getAttribute("data-nombre");
        const precio = parseFloat(e.target.getAttribute("data-precio"));

        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const existente = carrito.find(producto => producto.id === id);

        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push({ id, nombre, precio, cantidad: 1 });
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        cargarCarrito();

        const modalEl = document.getElementById('modalCarrito');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
});

// Función para agregar productos
function agregarProducto(event, showModal = false) {
    const id = event.target.getAttribute('data-id');
    const nombre = event.target.getAttribute('data-nombre');
    const precio = parseFloat(event.target.getAttribute('data-precio'));

    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existente = carrito.find(producto => producto.id === id);

    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    cargarCarrito();

    if (showModal) {
        const modalEl = document.getElementById('modalCarrito');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
}

// Carga el carrito desde localStorage y lo muestra en la interfaz
function cargarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");
    const totalCarrito = document.getElementById("total-carrito");
    const contador = document.getElementById("cart-counter");

    if (!listaCarrito || !totalCarrito || !contador) return;

    listaCarrito.innerHTML = "";
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((producto, index) => {
        const precio = parseFloat(producto.precio);
        const subtotal = precio * producto.cantidad;
        total += subtotal;
        cantidadTotal += producto.cantidad;

        const li = document.createElement("li");
        li.classList.add("list-group-item");

li.innerHTML = `
  <div class="d-flex justify-content-between align-items-center w-100">
    <div class="d-flex align-items-center gap-3 flex-grow-1">
      <input type="number" 
             id="quantity-${producto.id}" 
             name="quantity-${producto.id}" 
             min="0" 
             max="100" 
             value="${producto.cantidad}"
             class="form-control text-center input-cantidad"
             onchange="actualizarCantidadDesdeInput(${index}, this.value)"
             onwheel="event.preventDefault();">
      <div class="d-flex flex-column">
        <span class="nombre-producto">${producto.nombre}</span>
        <span class="text-emphasis fw-semibold small precio-producto">$${subtotal.toFixed(2)}</span>
      </div>
    </div>
    <button class="btn btn-sm btn-danger ms-3" onclick="eliminarProducto(${index})" title="Eliminar">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
`;

        listaCarrito.appendChild(li);
    });

    totalCarrito.textContent = `$ ${total.toFixed(2)}`;
    contador.textContent = cantidadTotal;
}

// Elimina un producto específico del carrito por su índice
function eliminarProducto(index) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    cargarCarrito();
}

// Esta función es crucial para que los cambios en el input type="number" se reflejen
function actualizarCantidadDesdeInput(index, value) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let nuevaCantidad = parseInt(value);

    // Si el valor es inválido o menor que 0, lo ajustamos a 0
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
        nuevaCantidad = 0;
    }
    // Opcional: limitar a un máximo, como 100
    if (nuevaCantidad > 40) {
        nuevaCantidad = 40;
    }

    if (carrito[index]) {
        if (nuevaCantidad === 0) {
            eliminarProducto(index); // Elimina si la cantidad es 0
        } else {
            carrito[index].cantidad = nuevaCantidad;
            localStorage.setItem("carrito", JSON.stringify(carrito));
            cargarCarrito(); // Recarga para actualizar la vista
        }
    }
}

function traer() {
  const contenido = document.getElementById("contenido");

  fetch('https://randomuser.me/api?results=20')
    .then(res => res.json())
    .then(res => {
      const users = res.results;
      contenido.innerHTML = users.map(user => `
        <div class="card mx-auto p-4 shadow-sm mb-3" style="max-width: 300px;">
          <img src="${user.picture.large}" alt="Foto de ${user.name.first}" class="img-fluid rounded-circle mb-3">
          <h5>${user.name.first} ${user.name.last}</h5>
          <p class="mb-1"><strong>Email:</strong> ${user.email}</p>
          <p><strong>País:</strong> ${user.location.country}</p>
        </div>
      `).join('');
    })
    .catch(error => {
      console.error('Error al obtener los datos:', error);
      contenido.innerHTML = `<p class="text-danger">Error al cargar los usuarios</p>`;
    });    
}

document.addEventListener("DOMContentLoaded", traer);