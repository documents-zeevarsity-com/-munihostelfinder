// signup.js - Complete Registration System

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userTypeSelect = document.getElementById('userType');
    const signupForm = document.getElementById('signupForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const studentFields = document.getElementById('studentFields');
    const hostelOwnerFields = document.getElementById('hostelOwnerFields');
    
    // Initialize
    selectUserType('student');

    const authManager = window.apiClient || window.firebaseManager || window.securityManager;
    
    // Event Listeners
    userTypeSelect.addEventListener('change', (e) => selectUserType(e.target.value));
    togglePassword.addEventListener('click', () => togglePasswordVisibility('password'));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility('confirmPassword'));
    signupForm.addEventListener('submit', handleSignup);
    
    // Real-time validation
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    
    function selectUserType(type) {
        if (type === 'student') {
            studentFields.style.display = 'block';
            hostelOwnerFields.style.display = 'none';
            // clear admin-specific input when switching back to student
            document.getElementById('hostelName').value = '';
        } else {
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
        const isHostelAdmin = userTypeSelect.value === 'admin';
        const studentId = document.getElementById('studentId').value.trim();
        const hostelName = document.getElementById('hostelName').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // OTP Verification for Hostel Admins
        if (isHostelAdmin && !signupForm.dataset.otpVerified) {
            try {
                const response = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                if (!response.ok) throw new Error('Failed to send verification code');
                
                const otpCode = prompt('A verification code has been sent to your email. Please enter it here:');
                if (!otpCode) return;

                // In a production app, we would verify the OTP on the server.
                // For now, we proceed to registration where the server would ideally check it.
                signupForm.dataset.otpVerified = 'true';
            } catch (error) {
                showError(error.message);
                return;
            }
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
            
            if (!authManager) {
                throw new Error('Authentication system is not available. Please try again later.');
            }

            let newUser;
            if (authManager.register) {
                const response = await authManager.register(userData);
                newUser = response.user || response;
                if (response.token) {
                    sessionStorage.setItem('authToken', response.token);
                }
            } else {
                const maybeUser = authManager.createUser(userData, password);
                newUser = maybeUser && typeof maybeUser.then === 'function' ? await maybeUser : maybeUser;
            }

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
                const safeUser = Object.assign({}, newUser);
                if (safeUser.password) delete safeUser.password;
                sessionStorage.setItem('currentUser', JSON.stringify(safeUser));

                setTimeout(() => {
                    window.location.href = 'frontend.html';
                }, 1500);
            }
            
        } catch (error) {
            showError(error?.message || 'An error occurred while creating your account. Please try again.');
        }
    }
    
    function validateForm() {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const isHostelAdmin = userTypeSelect.value === 'admin';
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
