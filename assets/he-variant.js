// Variables
const fieldSet = {
    color: document.querySelector('.he-color'),
    size: document.querySelector('.he-size')
}

const allVariants = document.querySelectorAll('.all-variants div')
const formHiddenId = document.querySelector('.product-variant-id')
const colorInps = document.querySelectorAll('[class^="he-var-"]')

const radioValue = document.querySelector('variant-radios input:checked')
const selectValue = document.querySelector('.select__select')

const submitButton = document.querySelector('.product-form__submit')
const cartForm = document.querySelector('.product__info-wrapper .product-form__buttons')

const defaultImage = document.querySelector('.default-imgblack img')
const otherBlackimage = document.querySelector('.hrx-except-variant-image')
let secondBlackImage;
if(otherBlackimage){
    secondBlackImage = otherBlackimage.querySelector('img')
}
const currentThumbnailImage = document.querySelector('.hrx-current-active-img img')

const otherImage = (e) => {
    let swiper = document.querySelector('.hrx-swiper-main-img').swiper
    swiper.slideTo(3)
}

const thumbnailClick = (e) => {
    const idx = e.target.closest('.default-imgblack').dataset.index

    let swiper = document.querySelector('.hrx-swiper-main-img').swiper
    swiper.slideTo(idx - 1)
} 


// Default Select = Unselected
const unselected = () => {
    if (selectValue && cartForm) {
        selectValue.value = 'Unselected'
        let blackVariant = document.querySelector('.he-var-black')
        blackVariant.checked = true
        
    }
}

// On Back From Cart
if (document.cookie.includes("cart=")) {
    setTimeout(() => {
        unselected()
    }, 500)
}


// Cart disabled on Unselected
unselected()


// Update API
const apiUpdate = (formData, item, winterItem) => {

    fetch(window.Shopify.routes.root + 'cart/update.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
        .then(response => {
            return response.json();
        }).
        then((data) => {
            // Subtotal
            let subtotal = document.querySelector('.totals__total-value')
            let total = data.items_subtotal_price / 100
            subtotal.innerText = `$${total.toFixed(2)} ${data.currency}`

            // removeItems
            item.remove()
            if (winterItem != null) {
                winterItem.remove()
            }

            // Update bubble
            let bubble = document.querySelector('.cart-count-bubble span:not(.visually-hidden)')
            bubble.innerText = data.item_count

            // If Cart Has No Item
            if (data.item_count == 0) {
                let cartItems = document.querySelector('cart-items')
                let template = `
                <div class="title-wrapper-with-link">
                    <h1 class="title title--primary">Your cart</h1>
                    <a href="/collections/all" class="underlined-link">Continue shopping</a>
                </div>
                <div class="cart__warnings">
                    <h1 class="cart__empty-text">Your cart is empty</h1>
                    <a href="/collections/all" class="button">Continue shopping</a>
                </div>`

                cartItems.className = 'page-width is-empty'
                cartItems.innerHTML = template
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Remove Addtional Product
const remove_additional_product = (e, variantID) => {

    // Show Loader
    const loader = e.target.querySelector('.loading-overlay__spinner')
    loader.classList.remove('hidden')


    let item = e.target.closest('.cart-item')

    // APi DATA
    let formData = `updates[${variantID}]=0`

    if (variantID == 44717666074783) {
        // APi DATA For Product
        formData = `updates[${variantID}]=0&updates[44711894909087]=0`

        // Additional Product Item
        let winterItem = document.querySelector('.cart-item[data-variantid="44711894909087"]')

        // Update Api
        apiUpdate(formData, item, winterItem)
    } else {
        // Update Api
        apiUpdate(formData, item, null)
    }

    e.preventDefault();
}

// Add Api
const apiAdd = (formData, form) => {
    fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // Add Item into Cart
            form.submit();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Add Addtional Product
const add_additional_product = (e) => {
    const loader = document.querySelector('.product-form__buttons .loading-overlay__spinner')
    loader.classList.remove('hidden')

    const radioValue = document.querySelector('variant-radios input:checked')
    const selectValue = document.querySelector('.select__select')
    const form = submitButton.closest('form')

    if (radioValue.value == 'Black' && selectValue.value == "Medium") {

        // API Data
        let formData = {
            'items': [{
                'id': 44711894909087,
                'quantity': 1
            }]
        };

        // Show Loader
        loader.classList.remove('hidden')

        // Api
        apiAdd(formData, form)
    } else {

        // Add Item into Cart
        form.submit();
    }

    e.preventDefault();
}

// updatePrice
const updatePrice = (selectedVariant) => {
    const price = document.querySelector('.price__container .price__regular .price-item.price-item--regular')
    let selectedVariantPrice = selectedVariant.dataset.price
    price.innerHTML = selectedVariantPrice
}

// Select Change
const selectChange = (current) => {
    const radioValue = document.querySelector('variant-radios input:checked')


    let colorValue = radioValue.value
    let sizeValue = current.value
    let findVariant = document.querySelector(`.all-variants div[data-option1="${colorValue}"][data-option2="${sizeValue}"]`)
    let variantID = findVariant.dataset.id

    // Update ID On form
    formHiddenId.value = variantID

    // Update Price
    updatePrice(findVariant)

    // Cart Disabled On Unselect

    if (sizeValue == 'Unselected') {
        cartForm.classList.add('disabled')
    } else {
        cartForm.classList.remove('disabled')
    }

}

// Radio Change
const radioChange = (current) => {
    const selectValue = document.querySelector('.select__select')

    let colorValue = current.value
    let sizeValue = selectValue.value
    let findVariant = document.querySelector(`.all-variants div[data-option1="${colorValue}"][data-option2="${sizeValue}"]`)
    let variantID = findVariant.dataset.id

    // Update ID On form
    formHiddenId.value = variantID

    // Update Price
    updatePrice(findVariant)
}

// Swatches
colorInps.forEach((single) => {
    let val = single.value.toLowerCase();
    let sliderThumb = document.querySelector(`.he-img-${val} img`)
    let label = single.nextElementSibling
    let labelSrc = label.querySelector('img')
    labelSrc.src = sliderThumb.src
})

// Image Change
const imageChange = (current) => {
    let currValue = current.value
    let swiper = document.querySelector('.hrx-swiper-main-img').swiper
    let matchDV = document.querySelector(`.hrx-swiper-main-img .he-img-${currValue.toLowerCase()}`).ariaLabel
    let matchImage = document.querySelector(`.hrx-swiper-main-img .he-img-${currValue.toLowerCase()} img`).src

    let currentIdx = matchDV.split('/')[0]

    if (current.value == "Black") {
        otherBlackimage.classList.add('show')
    } else {
        otherBlackimage.classList.remove('show')
    }

    defaultImage.src = matchImage
    swiper.slideTo(currentIdx - 1)

    
    // Update Current Image Index
    const currentThumbnailImage = document.querySelector('.hrx-current-active-img img')
    currentThumbnailImage.closest('.default-imgblack').setAttribute('data-index',currentIdx)

}

// Color Variant Change
function colorChange(e) {
    if (e.target.tagName == 'INPUT') {
        imageChange(e.target)
        radioChange(e.target)
    }
}

// Size Variant Change
const sizeChange = (e) => {
    selectChange(e.target)
}


// EventListeners
if (fieldSet.color) {
    fieldSet.color.addEventListener('click', colorChange)
}
if (fieldSet.size) {
    fieldSet.size.addEventListener('change', sizeChange)
}
if(secondBlackImage){
    secondBlackImage.addEventListener('click',otherImage)
}
if(currentThumbnailImage){
    currentThumbnailImage.addEventListener('click',thumbnailClick)
}