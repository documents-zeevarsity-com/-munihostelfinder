// signup.js - Complete Registration System

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userTypeUser = document.getElementById('userTypeUser');
    const userTypeAdmin = document.getElementById('userTypeAdmin');
    const signupForm = document.getElementById('signupForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const studentFields = document.getElementById('studentFields');
    const hostelOwnerFields = document.getElementById('hostelOwnerFields');
    
    // Initialize
    selectUserType('student');
    
    // Event Listeners
    userTypeUser.addEventListener('click', () => selectUserType('student'));
    userTypeAdmin.addEventListener('click', () => selectUserType('admin'));
    togglePassword.addEventListener('click', () => togglePasswordVisibility('password'));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmPassword'));
    signupForm.addEventListener('submit', handleSignup);
    
    // Real-time validation
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    
    function selectUserType(type) {
        if (type === 'student') {
            userTypeUser.classList.add('active');
            userTypeAdmin.classList.remove('active');
            studentFields.style.display = 'block';
            hostelOwnerFields.style.display = 'none';
            // clear admin-specific input when switching back to student
            document.getElementById('hostelName').value = '';
        } else {
            userTypeAdmin.classList.add('active');
            userTypeUser.classList.remove('active');
            studentFields.style.display = 'none';
            hostelOwnerFields.style.display = 'block';
            // clear student-specific input when switching to admin
            document.getElementById('studentId').value = '';
        }
        clearErrors();
    }
    
    function togglePasswordVisibility(type) {
        const input = type === 'password' ? passwordInput : confirmPasswordInput;
        const toggleBtn = type === 'password' ? togglePassword : toggleConfirmPassword;
        
        const currentType = input.getAttribute('type');
        const newType = currentType === 'password' ? 'text' : 'password';
        input.setAttribute('type', newType);
        
        const icon = toggleBtn.querySelector('i');
        icon.className = newType === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }
    
    async function handleSignup(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const isHostelAdmin = userTypeAdmin.classList.contains('active');
        const studentId = document.getElementById('studentId').value.trim();
        const hostelName = document.getElementById('hostelName').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        try {
            // Prepare user data
            const userData = {
                firstName,
                lastName,
                email,
                phone,
                password,
                role: isHostelAdmin ? 'hostel_admin' : 'user',
                studentId: isHostelAdmin ? null : (studentId || null),
                hostelName: isHostelAdmin ? hostelName : null,
                hostelId: null
            };
            
            // Create user through security manager
            const newUser = securityManager.createUser(userData);
            
            // Show success message based on role
            if (isHostelAdmin) {
                showSuccess(`
                    ✅ Account created successfully!<br><br>
                    <strong>Important:</strong> Your account needs to be activated by the system administrator.<br>
                    Please contact the administrator to assign your hostel and activate your account.<br><br>
                    You will receive an email once your account is activated.
                `);
            } else {
                showSuccess(`
                    ✅ Account created successfully!<br><br>
                    You are now logged in and will be taken to browse available hostels shortly.<br>
                `);
            }
            
            // Disable form
            const signupBtn = document.querySelector('.btn-primary');
            signupBtn.disabled = true;
            signupBtn.innerHTML = '<i class="fas fa-check"></i> Account Created';

            if (!isHostelAdmin) {
                // automatically log in the student and redirect straight to browsing page
                sessionStorage.setItem('currentUser', JSON.stringify(newUser));

                setTimeout(() => {
                    window.location.href = 'frontend.html';
                }, 1500);
            }
            
        } catch (error) {
            showError(error.message);
        }
    }
    
    function validateForm() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const isHostelAdmin = userTypeAdmin.classList.contains('active');
        const studentId = document.getElementById('studentId').value.trim();
        const hostelName = document.getElementById('hostelName').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        clearErrors();
        
        let isValid = true;
        
        // Name validation
        if (!firstName) {
            showFieldError('firstName', 'First name is required');
            isValid = false;
        }
        
        if (!lastName) {
            showFieldError('lastName', 'Last name is required');
            isValid = false;
        }
        
        // Email validation
        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Phone validation
        if (!phone) {
            showFieldError('phone', 'Phone number is required');
            isValid = false;
        } else if (!isValidPhone(phone)) {
            showFieldError('phone', 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Password validation
        if (!password) {
            showFieldError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showFieldError('password', 'Password must be at least 8 characters');
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showFieldError('password', 'Password must contain uppercase, lowercase, and numbers');
            isValid = false;
        }
        
        // Confirm password validation
        if (!confirmPassword) {
            showFieldError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        // Role-specific validation
        // Student ID is optional for regular users, but if provided it should be non-empty.
        if (!isHostelAdmin && studentId && studentId.length < 3) {
            showFieldError('studentId', 'Please enter a valid Student ID');
            isValid = false;
        }
        
        if (isHostelAdmin && !hostelName) {
            showFieldError('hostelName', 'Hostel name is required');
            isValid = false;
        }
        
        // Terms agreement
        if (!agreeTerms) {
            showError('You must agree to the Terms of Service and Privacy Policy');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        clearFieldError('password');
        
        if (password && password.length < 8) {
            showFieldError('password', 'Password must be at least 8 characters');
        } else if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            showFieldError('password', 'Password must contain uppercase, lowercase, and numbers');
        }
    }
    
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        clearFieldError('confirmPassword');
        
        if (confirmPassword && password !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match');
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 10;
    }
    
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.id = `${fieldId}-error`;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        field.classList.remove('error');
        
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.display = 'block';
        errorDiv.style.marginBottom = '1rem';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        signupForm.insertBefore(errorDiv, signupForm.querySelector('.btn-primary'));
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.display = 'block';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        signupForm.appendChild(successDiv);
    }
    
    function clearErrors() {
        document.querySelectorAll('.form-control.error').forEach(field => {
            field.classList.remove('error');
        });
        
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }
});
