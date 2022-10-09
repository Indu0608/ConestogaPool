document.querySelectorAll('.register-passwords').forEach(item => {
    item.addEventListener('keyup', (e) => {
        let passwords = document.querySelectorAll('.register-passwords')
        let passwordenter = document.getElementById("passwordenter")
        let passwordreenter = document.getElementById("passwordreenter")
        passwordenter.setAttribute("class", "fa-solid fa-check-double text-danger")
        passwordreenter.setAttribute("class", "fa-solid fa-check-double text-danger")
        document.querySelector('#register-btn').setAttribute('disabled', "")
        if(passwords[0].value == "" && passwords[1].value == ""){
            passwordenter.setAttribute("class", "fa-solid fa-check-double text-danger")
            passwordreenter.setAttribute("class", "fa-solid fa-check-double text-danger")
            document.querySelector('#register-btn').setAttribute('disabled', "")
        }
        if (passwords[0].value === passwords[1].value){
            console.log("passwords matches")
            document.querySelector('#register-btn').removeAttribute('disabled')
            passwordreenter.setAttribute("class", "fa-solid fa-check-double text-success")
            passwordenter.setAttribute("class", "fa-solid fa-check-double text-success")
        } else {
            document.querySelector('#register-btn').setAttribute('disabled', "")
        }
    })
})