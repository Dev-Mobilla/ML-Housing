// JavaScript Document
document.addEventListener('DOMContentLoaded', () => {
    //    let checkYes = document.getElementById('myCheckYes');
    //    let form = document.querySelector('#form');
    //    if (checkYes.checked == false) {
    //        Array.from(form.elements).forEach(formElement => {
    //            if (formElement.type != "radio") {
    //                formElement.disabled = true
    //            }
    //        })
    document.getElementById('submitBtn').disabled = true
    //    }
    // document.getElementById('buttonSbmt').disabled = true
})

function selectAppType(applicationType) {
    console.log(applicationType)
    var checkBoxNo = document.getElementById("myCheckNo");
    var form = document.querySelector('#form');
    var text = document.getElementById("text-no");

    if (checkBoxNo.checked == true && applicationType.toLowerCase() !== 'condo' && applicationType !== '') {
        text.style.display = "block";
        text.style.color = 'red';
        Array.from(form.elements).forEach(formElement => {
            if (formElement.type != 'radio' && formElement.name.toLowerCase() != 'applicationtype') {
                formElement.disabled = true
                toast('Application type not applicable. Applicable type for non-filipino residents is condo only.')
            } else {
                formElement.disabled = false
            }
        });

    } else if (checkBoxNo.checked == true && applicationType.toLowerCase() === 'condo' && applicationType !== '') {
        document.getElementById('submitBtn').disabled = true
        text.style.display = "none";
        Array.from(form.elements).forEach(formElement => {
            if (formElement.tagName != 'BUTTON') {
                formElement.disabled = false
            }
        });
    }
    else {

        document.getElementById('submitBtn').disabled = true
        Array.from(form.elements).forEach(formElement => {
            if (formElement.tagName != 'BUTTON') {
                formElement.disabled = false
            }
        });
    }


}

let resident = ''

let valid = false
const phoneInputField = document.querySelector("#mobile");
const phoneInput = window.intlTelInput(phoneInputField, {
    utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});

const errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

// on blur: validate
//MOBILE NUMBER
phoneInputField.addEventListener('blur', () => {
    if (phoneInputField.value.trim()) {
        if (phoneInput.isValidNumber()) {

            document.querySelector(".btn").disabled = false

        } else {

            document.querySelector(".btn").disabled = true

            const errorCode = phoneInput.getValidationError();

            toast(`${errorMap[errorCode]}. Please input a valid phone number.`)

        }
    }
});
//phoneInputField.addEventListener('change', reset);
//phoneInputField.addEventListener('keyup', reset);

//RADIO BUTTON
function checkBox() {
    var checkBox = document.getElementById("myCheckNo");
    var text = document.getElementById("text-no");
    var form = document.querySelector('#form');

    var applicationType = document.getElementById('applicationType').value;

    //if No
    if (checkBox.checked == true && applicationType.toLowerCase() !== 'condo' && applicationType !== '') {
        text.style.display = "block";
        text.style.color = 'red';
        Array.from(form.elements).forEach(formElement => {
            if (formElement.type != 'radio' && formElement.name.toLowerCase() != 'applicationtype') {
                formElement.disabled = true
                toast('Application type not applicable. Applicable type for non-filipino residents is condo only.')
            } else {
                formElement.disabled = false
            }
        });
        resident = 'No'

        //if yes
    } else if (checkBox.checked == true && applicationType.toLowerCase() === 'condo' && applicationType !== '') {
        document.getElementById('submitBtn').disabled = true
        text.style.display = "none";
        Array.from(form.elements).forEach(formElement => {
            if (formElement.tagName != 'BUTTON') {
                formElement.disabled = false
            }
        });
        resident = 'No'
    }
    else {

        document.getElementById('submitBtn').disabled = true
        text.style.display = "none";
        Array.from(form.elements).forEach(formElement => {
            if (formElement.tagName != 'BUTTON') {
                formElement.disabled = false
            }
        });
        resident = 'Yes'
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
    let grossIncome = document.getElementById('monthlyIncome')

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

    let submtBtn = document.getElementById('submitBtn');

    if (age < 21) {
        // birthdateErrorMsg.style.display = 'block';
        submtBtn.disabled = true
        toast("You must be over 21 years old. Please Input a valid Birth Date.");
        valid = false

    } else {
        // birthdateErrorMsg.style.display = 'none'
        submtBtn.disabled = false
        valid = true
    }
}

form.addEventListener('submit', (event) => {
    console.log('validate data', validateData())

    if (!validateData()) {
        console.log('not validated');
        event.preventDefault();
        event.stopPropagation();
    } else {
        console.log('validated');
        applyLoan(event.target)
        event.preventDefault();
    }

})
function toast(message) {

    const toastLiveExample = document.getElementById('liveToast')
    const toast = new bootstrap.Toast(toastLiveExample)

    let toastBody = document.getElementById('toast-body')

    toastBody.innerText = message
    toastBody.style.fontWeight = 'bold'
    toastBody.style.color = 'white'

    toast.show();
}

function validateData() {
    let birthdate = document.getElementById('birthdate').value;
    let confirm_email = document.getElementById('confirmemail').value;

    datePick(birthdate)
    let emailConfirm = confirmEmail(confirm_email);

    let validatePhone = validateNumber()

    if (valid && emailConfirm && validatePhone) {
        return true
    }
    //	toast('Please make sure to fill out all fields.')
    return false
}
let footerYear = document.getElementById('footer-year');

let year = new Date().getFullYear();

footerYear.innerText = year

function validateNumber() {

    if (phoneInputField.value.trim()) {
        if (phoneInput.isValidNumber()) {
            return true

        } else {


            const errorCode = phoneInput.getValidationError();

            toast(`${errorMap[errorCode]}. Please input a valid phone number.`)

            return false
        }
    }
}
function confirmEmail(confirmEmail) {
    let email = document.getElementById('email').value;

    let emailMatch = confirmEmail === email;

    if (emailMatch) {

        return true
    }
    else {

        toast("Email doesn't match. Make sure to confirm your email address.")
        return false;
    }


}

function applyLoan(form) {

    let formData = new FormData(form);
    let data = {}

    data.firstname = formData.get('firstname');
    data.middlename = formData.get('middlename');
    data.lastname = formData.get('lastname');
    data.civil_status = formData.get('civil_status');
    data.birth_date = formData.get('birthdate');
    data.name_of_mother = formData.get('motherName');
    data.gender = formData.get('gender');
    data.gross_monthly_income = formData.get('income');
    data.source_of_funds = formData.get('source_of_funds');
    data.country = formData.get('country');
    data.province = formData.get('province');
    data.city = formData.get('city');
    data.barangay = formData.get('barangay');
    data.houseNo = formData.get('houseno');
    data.length_of_stay = formData.get('length_of_stay');
    data.residence_type = formData.get('residence_type');
    data.mobile_number = formData.get('mobileno');
    data.email = formData.get('email');
    data.confirmEmail = formData.get('confirmemail');
    data.applicationType = formData.get('applicationType');
    data.resident = resident;

    let overlayContainer = document.getElementById('overlay-container');

    overlayContainer.style.display = 'block'

    $.ajax({
        type: 'POST',
        url: '/api/apply-loan',
        data: data,
        success: function (data) {
            if (data.code == 1) {
                document.getElementById('form').reset();
                overlayContainer.style.display = 'none';
                setTimeout(() => {
                    window.location.href = '/web/success';
                }, 800);
            }
        },
        error: function (error) {
            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:8080/web/error';
            }, 800);
            overlayContainer.style.display = 'none';
        }
    });
}

