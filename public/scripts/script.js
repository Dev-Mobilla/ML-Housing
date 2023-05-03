document.addEventListener('DOMContentLoaded', () => {
    let checkYes = document.getElementById('myCheckYes');
    let form = document.querySelector('#form');
    if (checkYes.checked == false) {
        Array.from(form.elements).forEach(formElement => {
            if (formElement.type != "radio") {
                formElement.disabled = true
            }
        })
        // document.getElementById('buttonSbmt').disabled = true
    }
    // document.getElementById('buttonSbmt').disabled = true
})
let valid = false
const phoneInputField = document.querySelector("#phone");
const phoneInput = window.intlTelInput(phoneInputField, {
    utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});
const errorMsg = document.querySelector("#mobileInvalid");

const errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];


let phoneInputFiledClassList = phoneInputField.classList


const reset = () => {
    phoneInputField.classList.remove("is-invalid");
    errorMsg.innerHTML = "";
};

// on blur: validate
//MOBILE NUMBER
phoneInputField.addEventListener('blur', () => {
    reset();
    if (phoneInputField.value.trim()) {
        console.log(phoneInput.isValidNumber());
        if (phoneInput.isValidNumber()) {

            phoneInputField.classList.remove("is-invalid");
            errorMsg.style.display = "none";
            errorMsg.innerHTML = "";
            document.querySelector(".btn").disabled = false

        } else {

            phoneInputField.classList.add("is-invalid");

            errorMsg.style.display = "block";
            errorMsg.style.fontStyle = "italic"

            document.querySelector(".btn").disabled = true

            const errorCode = phoneInput.getValidationError();
            errorMsg.innerHTML = errorMap[errorCode];

            toast("Please input a valid phone number")

        }
    }
});
phoneInputField.addEventListener('change', reset);
phoneInputField.addEventListener('keyup', reset);

//RADIO BUTTON
function checkBox() {
    var checkBox = document.getElementById("myCheckNo");
    var text = document.getElementById("text");
    form = document.querySelector('#form');

    //if No
    if (checkBox.checked == true) {
        text.style.display = "block";
        text.style.color = 'red';
        Array.from(form.elements).forEach(formElement => {
            if (formElement.type != 'radio') {
                formElement.disabled = true
            } else {
                formElement.disabled = false
            }
        });
        //if yes
    } else {

        document.getElementById('buttonSbmt').disabled = true
        text.style.display = "none";
        Array.from(form.elements).forEach(formElement => {
            if (formElement.tagName != 'BUTTON') {
                formElement.disabled = false
            }
        });
    }
}

//MONTHLY INCOME
function onkeydownAmount() {
    let key = event.key

    let invalidInputs = ["e", "E", "+", "-"];
    let numbers = (/^[-+]?[0-9]*\.?[0-9]*$/.test(key))


    let isInclude = invalidInputs.includes(key);

    if (isInclude) {
        return event.preventDefault();
    } else if (numbers || key == "Backspace") {
        return event.key
    } else {
        return event.preventDefault();
    }

}

//MONTHLY INCOME
function amountChange(event) {

    let amount;
    let grossIncome = document.getElementById('grossIncome')

    if (event == null || event == '') {
        amount = event
    } else {

        amount = parseFloat(event.replace(/,/g, ''))

    }

    grossIncome.value = amount.toLocaleString("en", { useGrouping: true, minimumFractionDigits: 2 })
}

//DATE OF BIRTH
function datePick(birthdate) {

    var today = new Date();
    var birthDate = new Date(birthdate);
    var age = today.getFullYear() - birthDate.getFullYear();

    var m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    let birthdateErrorMsg = document.getElementById('birthdateError');
    let submtBtn = document.getElementById('buttonSbmt');
    let birthInput = document.getElementById('dateBirth');

    let birthInptClssList = birthInput.classList

    if (age < 21) {
        // birthdateErrorMsg.style.display = 'block';
        submtBtn.disabled = true
        birthInptClssList.add('is-invalid')
        toast("Please Input a valid Birth Date");
        valid = false

    } else {
        // birthdateErrorMsg.style.display = 'none'
        birthInptClssList.remove('is-invalid')
        submtBtn.disabled = false
        valid = true
    }
}

form.addEventListener('submit', (event) => {

    if (!validateData()) {
        console.log('not validated');
        event.preventDefault();
        event.stopPropagation();
    }else{
        console.log('validated');
        applyLoan(event.target)
        event.preventDefault();
    }

   
    // const form = new FormData(e.target);
    // console.log('FORM', form);
    // const formula = form.get("formula");
})
function toast(message) {

    const toastLiveExample = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastLiveExample)

    let toastBody = document.getElementById('toast-body')

    toastBody.innerText = message
    toastBody.style.fontWeight = 'bold'

    toast.show()
}

function validateData() {
    let birthdate = document.getElementById('dateBirth').value;

    datePick(birthdate)

    if (valid) {
        return true
    }
    
    if(phoneInputField.value.trim()) {
        console.log('dsfd');
        if (phoneInput.isValidNumber()) {
            return true 
        }
    }

    return false
    // Array.from(form.elements).forEach(formElement => {

    //     if (formElement.type === 'date') {
    //         datePick(formElement.value)
        
    //     }else{
    //         console.log('sff');
    //         applyLoan(formElement)
    //     }
    //     // if (formElement.tagName != 'BUTTON') {
    //     //     formElement.disabled = false
    //     // }
    // });
}
function applyLoan(form) {

    let formData = new FormData(form);
    let data = {}

    data.firstname = formData.get('firstname');
    data.middlename = formData.get('middlename');
    data.lastname = formData.get('lastname');
    data.civil_status = formData.get('civil_status');
    data.birth_date = formData.get('birth_date');
    data.name_of_mother = formData.get('name_of_mother');
    data.gender = formData.get('gender');
    data.gross_monthly_income = formData.get('gross_monthly_income');
    data.source_of_funds = formData.get('source_of_funds');
    data.country = formData.get('country');
    data.province = formData.get('province');
    data.city = formData.get('city');
    data.barangay = formData.get('barangay');
    data.houseNo = formData.get('houseNo');
    data.length_of_stay = formData.get('length_of_stay');
    data.residence_type = formData.get('residence_type');
    data.mobile_number = formData.get('mobile_number');
    data.email = formData.get('email');

    let overlayContainer = document.getElementById('overlay-container');

    overlayContainer.style.display = 'block'

    $.ajax({
        type: 'POST',
        url: '/api/apply-loan',
        data: data,
        success: function(data) {
          console.log(data);
          if (data.code == 1) {
              document.getElementById('form').reset();
              overlayContainer.style.display = 'none';
            setTimeout(() => {
                window.location.href = '/web/success';
            }, 1000);
          }
        },
        error: function(error){
            console.log(error);
            overlayContainer.style.display = 'none';
        }
    });
}

let footerYear = document.getElementById('footer-year');

let year = new Date().getFullYear();

footerYear.innerText = year
