
import { Cart } from './localStorageCart.js'

async function getProductById(id){
    const resp = await fetch (`http://localhost:3000/api/products/${id}`)
    const json = await resp.json();
    return json
    }

/**
 Cette methode permet de récupèrer les produits qui sont dans le localstorage
 */
function getProductsCart()

{
    let products = [];
    products = JSON.parse(localStorage.getItem('cart'));
    // Si il y a bien dans products des items
    if(products) {
        displayAllProductsCart(products).then(
           function () {
            setTotalPrice(products.totalPrice);
            handlerDelete(products)
            handlerQuantity(products)
          }
        );
    }
}

/**
 * Cette methode permet d'afficher le prix total dans le html de la page cart
 */
function setTotalPrice(totalPrice)
{
    document.getElementById("totalPrice").innerText = totalPrice;
}

 //Création des article
 async function displayAllProductsCart(resp) 
 {
    let items = document.getElementById("cart__items");
    items.innerHTML = '';
    for( let i = 0; i < resp.products.length; i++) 
    {
        let art =  await getProductById(resp.products[i].id);
        art.color = resp.products[i].color;
        art.quantity = resp.products[i].quantity;
        items.innerHTML += htmlProductCart (art);

        setTotalPrice(art.price);

    }
 }

function htmlProductCart(article) {
    return `<article class="cart__item" data-id="${article.id}" data-color="${article.color}">
           <div class="cart__item__img">
              <img src="${article.imageUrl}" alt="${article.altTxt}">
           </div>
           <div class="cart__item__content">
           <div class="cart__item__content__description">
              <h2>${article.name}</h2>
              <p>${article.color}</p>
              <p>${article.price}</p>
           </div>
           <div class="cart__item__content__settings">
        <div class="cart__item__content__settings__quantity">
          <p>Qté : </p>
          <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${article.quantity}">
        </div>
        <div class="cart__item__content__settings__delete">
          <p class="deleteItem">Supprimer</p>
        </div>
      </div>
    </div>
  </article>`      
}


// lance la fonction
getProductsCart();
function changeQuantity(event)
{
const el = event.target;
const item = el.closest(".cart__item")
const id = item.dataset.id;
console.log("id", id)
const color = item.dataset.color;
const quantity = el.closest(".itemQuantity")
const valueQuantity = quantity.value;
console.log("number", valueQuantity)
let myCart = new Cart();
const product = {id, color, quantity };
myCart.updateQuantity(product);
// Refresh de la page Panier
location.reload();
}

function handlerQuantity() {
    const items = document.querySelectorAll(".itemQuantity");
    items.forEach((item) => {
        item.addEventListener("change", (e) => changeQuantity(e)) 
    }
    )
}


function deleteItem(event)
{
const el = event.target;
const item = el.closest(".cart__item")
console.log("item", item)
console.log("el", el)
let myCart = new Cart();
myCart.delete(item.dataset.id, item.dataset.color);
// Refresh de la page Panier
 location.reload(); 
}



function handlerDelete ()
{
    const deleteBtn = document.querySelectorAll(".deleteItem");
    deleteBtn.forEach((btn) => {
        btn.addEventListener("click", e => deleteItem(e))
        }
    )
}




const submitButton = document.getElementById('order');
submitButton.addEventListener('click', (e) => submitForm(e));

function submitForm(e) {
        e.preventDefault();
      
        if (localStorage.length === 0) {
            alert("Votre panier est vide");
            return
        }
        if (inValidateForm()) return;
        if (emailValidation()) return;


const body = makeRequestBody();
        fetch('http://localhost:3000/api/products/order', 
             {
                method: 'POST',
                body: JSON.stringify(body),
                headers: 
                {
                    'Content-Type': 'application/json'
                }})
                .then((res) => res.json())
                .then((resp) => 
                { 
                    const orderId = resp.orderId;
                    // window.location.href = "confirmation.html" + "?orderId=" + orderId;
                    return console.log(resp)
                })
                .catch((err) => console.log(err))              
    }
     // validation
function inValidateForm()
        {
            const form = document.querySelector(".cart__order__form");
            const inputs = form.querySelectorAll("input");
            inputs.forEach((input) => 
                 { 
                    if (input.value === "") 
                      {
                     alert("Veuillez remplir tous les champs");
                     return true;
                      }
                    return false;
                }
            )
        }  
function emailValidation() {
    const email = document.querySelector("#email").value;
    const regex = /^[A-Za-z0-9+_.-]+@(.+)$/
  if (regex.test(email) === false) {
    alert("Veuillez entrer un email valide");
    return true;
  }
  return false;
} 

function makeRequestBody() {
    const form = document.querySelector(".cart__order__form");
    const firtName = form.elements.firstName.value;
    const lastName = form.elements.lastName.value;
    const address  = form.elements.address.value;
    const city = form.elements.city.value;
    const email = form.elements.email.value;
    const body = 
      { 
       contact: 
         {
            firtName: firtName,
            lastName: lastName,
            address: address,
            city: city,
            email: email,
         },
    products: getIdsFromCache()
          
      }
    console.log("sdg", body);  
    return body;
}

function getIdsFromCache()
       {
         const numberOfProducts = localStorage.length;
         const ids = [];
            for (let i = 0; i < numberOfProducts; i++) {
                const key = localStorage.key(i);
                const id = key.split('_')[0];
                ids.push(id);
            }
            return ids;
       }
