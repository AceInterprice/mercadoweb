$(document).ready(function(){
	"use strict";
    
        /*==================================
* Author        : "ThemeSINE"
* Template Name : Zombiz HTML Template
* Version       : 1.0
==================================== */




        /*=========== TABLE OF CONTENTS ===========
1. Scroll To Top 
2. hcsticky 
3. Counter
4. owl carousel
5. vedio player
6. animation support
======================================*/

    // 1. Scroll To Top 
		$(window).on('scroll',function () {
			if ($(this).scrollTop() > 600) {
				$('.return-to-top').fadeIn();
			} else {
				$('.return-to-top').fadeOut();
			}
		});
		$('.return-to-top').on('click',function(){
				$('html, body').animate({
				scrollTop: 0
			}, 1500);
			return false;
		});
	
	
	// 2 . hcsticky 

		$('#menu').hcSticky();


	// 3. counter
		$(window).on('load', function(){	
			$('.counter').counterUp({
				delay: 10,
				time: 3000
			});	
		});
	
	
	// 4. owl carousel

		// i. .team-carousel 
	
		
		var owl=$('.team-carousel');
		owl.owlCarousel({
			items:4,
			margin:0,
			
			loop:true,
			autoplay:true,
			smartSpeed:500,
			
			//nav:false,
			//navText:["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"],
			
			dots:false,
			autoplayHoverPause:true,
		
			responsiveClass:true,
				responsive:{
					0:{
						items:1
					},
					640:{
						items:2
					},
					768:{
						items:3
					},
					992:{
						items:4
					}
				}
			
			
		});

		// ii. .client (carousel)
		
		$('#client').owlCarousel({
			items:5,
			loop:true,
			smartSpeed: 1000,
			autoplay:true,
			dots:false,
			autoplayHoverPause:true,
			responsive:{
					0:{
						items:2
					},
					415:{
						items:2
					},
					600:{
						items:3
					},
					1000:{
						items:5
					}
				}
			});
			
			
			$('.play').on('click',function(){
				owl.trigger('play.owl.autoplay',[1000])
			})
			$('.stop').on('click',function(){
				owl.trigger('stop.owl.autoplay')
			})

		// iii.  testimonial
		
		$("#testemonial-carousel").owlCarousel({
			items: 1,
			autoplay: true,
			loop: true,
			dots:true,
			mouseDrag:true,
			nav:false,
			smartSpeed:1000,
			transitionStyle:"fade",
			animateIn: 'fadeIn',
			animateOut: 'fadeOutLeft'
			// navText:["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"]
		});

	// 5. vedio player
		$('.vedio-play-icon').magnificPopup({
			
			type:'video'
		
		});	

	// 6. animation support

        $(window).load(function(){

            $(".single-slide-item-content h2, .single-slide-item-content p").removeClass("animated fadeInUp").css({'opacity':'0'});
            $(".single-slide-item-content button").removeClass("animated fadeInLeft").css({'opacity':'0'});
        });

        $(window).load(function(){

            $(".single-slide-item-content h2, .single-slide-item-content p").addClass("animated fadeInUp").css({'opacity':'0'});
            $(".single-slide-item-content button").addClass("animated fadeInLeft").css({'opacity':'0'});

        });
		
});	
//////////////////////////////////////////////////////
//Función para agregar un producto al carrito
function agregarProducto(nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let producto = { nombre: nombre, precio: precio };
    carrito.push(producto);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarMensaje("¡Producto agregado al carrito!");
    actualizarContador();
}

// Función para mostrar mensaje temporalmente
function mostrarMensaje(mensaje) {
    var mensajeContainer = document.getElementById('mensajeContainer');
    var cartMessage = document.getElementById('cartMessage');
    if (mensajeContainer && cartMessage) {
        cartMessage.textContent = mensaje;
        mensajeContainer.style.display = 'block';
        setTimeout(() => {
            mensajeContainer.style.display = 'none';
        }, 2000);
    }
}

// Función para actualizar el contador del carrito
function actualizarContador() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let contador = document.querySelector('.contador');
    if (contador) {
        contador.textContent = carrito.length;
    }
}

// Función para mostrar productos en la página del carrito
function mostrarProductosEnCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let productList = document.getElementById('cartProductList');
    if (productList) {
        productList.innerHTML = '';
        carrito.forEach((producto, index) => {
            let li = document.createElement('li');
            li.textContent = `${producto.nombre} - $${producto.precio}`;
            productList.appendChild(li);
        });
    }
}
///////////////////////////////////////////////////////////////
// Función para confirmar compra
function confirmarCompra() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length > 0) {
        alert("Compra confirmada");
        // Enviar datos del carrito a la tabla Compras
        guardarProductosEnTabla(carrito);
        localStorage.removeItem('carrito');
        actualizarContador();
        mostrarProductosEnCarrito();
    } else {
        alert("El carrito está vacío");
    }
    console.log(carrito);
}

function guardarProductosEnTabla(productos) {
    productos.forEach(producto => {
        const { nombre, precio } = producto;

        const formData = {
            nombre_producto: nombre,
            precio: precio
        };

        // Enviar los datos al servidor usando fetch
        fetch('/guardar-compra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Producto guardado en la tabla Compras");
            } else {
                console.error("Error al guardar producto en la tabla Compras:", data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

// Ejecutar solo en la página de productos
if (document.querySelector('.team')) {
    document.querySelectorAll('.cart-button').forEach(button => {
        button.addEventListener('click', (event) => {
            let card = event.target.closest('.card');
            let nombre = card.querySelector('.brand h2').textContent;
            let precio = card.querySelector('.price').dataset.price;
            agregarProducto(nombre, precio);
        });
    });
}

// Ejecutar solo en la página del carrito
if (document.getElementById('cartProductList')) {
    mostrarProductosEnCarrito();
    document.getElementById('checkoutButton').addEventListener('click', confirmarCompra);
}

// Actualizar el contador en ambas páginas
document.addEventListener('DOMContentLoaded', actualizarContador);
///////////////////////////////////////////////////////////////////////
// Validar registro
function validateForm() {
    
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Verificar que todos los campos estén llenos
    if (!nombre || !apellido || !email || !direccion || !telefono || !password || !confirmPassword) {
        alert("Por favor, llene todos los campos del formulario.");
        return false;
    }

    // Validar nombre y apellido
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!nameRegex.test(nombre)) {
        alert("El nombre solo debe contener letras y ciertos caracteres especiales.");
        return false;
    }

    if (!nameRegex.test(apellido)) {
        alert("El apellido solo debe contener letras y ciertos caracteres especiales.");
        return false;
    }

    // Validar teléfono
    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(telefono)) {
        alert("El teléfono debe contener exactamente 10 dígitos.");
        return false;
    }

    // Validar contraseña y confirmación de contraseña
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return false;
    }

    const formData = {
        nombre: nombre,
        apellido: apellido,
        email: email,
        direccion: direccion,
        telefono: telefono,
        password: password
    };

    // Enviar los datos al servidor usando fetch
    fetch('/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirigir a la página de perfil si la respuesta es exitosa
            window.location.href = 'inicio_Sesion.html';
        } else {
            // Mostrar mensaje de error si algo sale mal
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registrado Correctamente.');
    });

    return false; // Evitar el envío del formulario de forma tradicional
}
/////////////////////////////////////////////////////////////
// Mostrar datos de perfil al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const nombre = localStorage.getItem('nombre');
    const apellido = localStorage.getItem('apellido');
    const email = localStorage.getItem('email');
    const telefono = localStorage.getItem('telefono');
    const direccion = localStorage.getItem('direccion');

    if (nombre) {
        document.getElementById('Pnombre').value = nombre;
    }
    if (apellido) {
        document.getElementById('Papellido').value = apellido;
    }
    if (email) {
        document.getElementById('Pemail').value = email;
    }
    if (telefono) {
        document.getElementById('Ptelefono').value = telefono;
    }
    if (direccion) {
        document.getElementById('Pdireccion').value = direccion;
    }
});

// Guardar datos del perfil en localStorage al enviar el formulario
document.querySelector('.profile-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('Pnombre').value;
    const apellido = document.getElementById('Papellido').value;
    const email = document.getElementById('Pemail').value;
    const telefono = document.getElementById('Ptelefono').value;
    const direccion = document.getElementById('Pdireccion').value;

    localStorage.setItem('nombre', nombre);
    localStorage.setItem('apellido', apellido);
    localStorage.setItem('email', email);
    localStorage.setItem('telefono', telefono);
    localStorage.setItem('direccion', direccion);

    // Opcional: mostrar mensaje de éxito u otra acción

    // Evitar el envío del formulario
    return false;
});