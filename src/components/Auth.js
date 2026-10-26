/**
 * ==========================================================================
 * BOARDLY — AUTHENTICATION COMPONENT (SIGN IN & SIGN UP)
 * File: /src/components/Auth.js
 * Purpose: Renders dedicated full-page authentication views for Boardly,
 *          including the left-hand hero marketing panel and interactive forms
 *          for signing in and registering with client-side credential verification.
 * ==========================================================================
 */

// Import central state store for reading registered users and updating auth status
import { store } from '../state.js';

/**
 * renderAuth(state)
 * Generates the full HTML markup for either the 'login' or 'register' screen.
 * Parameters:
 *   - state: Current application state object
 * Returns:
 *   - HTML string template
 */
export function renderAuth(state) {
  // Destructure current view identifier ('login' | 'register')
  const { view } = state;

  // Left-hand hero showcase panel displaying branding, motto, and core features
  const leftHeroSection = `
    <div class="auth-hero-section">
      <!-- Brand Logo, Title and Tagline -->
      <div class="auth-hero-brand">
        <img src="/logo.svg" alt="Boardly Logo" class="auth-hero-logo" />
        <div>
          <h1 class="auth-hero-title">Boardly</h1>
          <div class="auth-hero-tagline">PLAN • ORGANIZE • ACHIEVE</div>
        </div>
      </div>

      <!-- Main Marketing Headline and Subtext -->
      <h2 class="auth-hero-heading">Supercharge your productivity & team workflow</h2>
      <p class="auth-hero-subheading">A powerful Trello-style Kanban workspace designed for seamless project tracking, task management, and team collaboration.</p>

      <!-- Key Feature Cards -->
      <div class="auth-feature-list">
        <!-- Feature 1: Drag and Drop -->
        <div class="auth-feature-card">
          <div class="feature-icon-badge blue-badge">⚡</div>
          <div>
            <div class="feature-title">Native Drag & Drop</div>
            <div class="feature-desc">Reorder cards across custom Kanban columns smoothly.</div>
          </div>
        </div>

        <!-- Feature 2: Explorer File Tree -->
        <div class="auth-feature-card">
          <div class="feature-icon-badge purple-badge">📁</div>
          <div>
            <div class="feature-title">Explorer File Tree</div>
            <div class="feature-desc">Manage multiple project boards, folders, and code files.</div>
          </div>
        </div>

        <!-- Feature 3: Card Details and Comments -->
        <div class="auth-feature-card">
          <div class="feature-icon-badge gold-badge">💬</div>
          <div>
            <div class="feature-title">Card Details & Comments</div>
            <div class="feature-desc">Add descriptions, edit card titles, and collaborate in real-time.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Case 1: Render Sign In Screen
  if (view === 'login') {
    return `
      <div class="auth-page-container">
        <!-- Marketing Showcase Hero Panel on the Left -->
        ${leftHeroSection}

        <!-- Interactive Form Wrapper on the Right -->
        <div class="auth-form-wrapper">
          <div class="auth-box">
            <!-- Return back to the interactive Kanban board -->
            <button id="btn-back-to-website" class="btn-back-link">← Back to Website</button>
            
            <!-- Sign In Heading and Guidance -->
            <div class="auth-box-header">
              <h2>Sign In</h2>
              <p>Welcome back! Please sign in to access your workspace.</p>
            </div>

            <!-- Validation Error Alert Banner (Hidden by default) -->
            <div id="auth-error-msg" class="error-message" style="display: none;"></div>

            <!-- Login Submission Form -->
            <form id="login-form" class="stack-form">
              <!-- Email Input Field -->
              <div class="input-group">
                <label for="login-email">Email Address</label>
                <input required type="email" id="login-email" placeholder="alex@example.com" />
              </div>
              <!-- Password Input Field -->
              <div class="input-group">
                <label for="login-password">Password</label>
                <input required type="password" id="login-password" placeholder="••••••••" />
              </div>
              <!-- Submit Button -->
              <button type="submit" class="btn-primary">Sign In to Boardly</button>
            </form>

            <!-- Navigation switch to registration screen -->
            <p class="auth-footer">Need an account? <span id="link-to-register">Create a new account</span></p>
          </div>
        </div>
      </div>
    `;
  }

  // Case 2: Render Sign Up / Account Creation Screen
  if (view === 'register') {
    return `
      <div class="auth-page-container">
        <!-- Marketing Showcase Hero Panel on the Left -->
        ${leftHeroSection}

        <!-- Interactive Form Wrapper on the Right -->
        <div class="auth-form-wrapper">
          <div class="auth-box">
            <!-- Return back to the interactive Kanban board -->
            <button id="btn-back-to-website" class="btn-back-link">← Back to Website</button>

            <!-- Registration Heading and Guidance -->
            <div class="auth-box-header">
              <h2>Create an Account</h2>
              <p>Set up your Boardly workspace in seconds.</p>
            </div>

            <!-- Validation Error Alert Banner (Hidden by default) -->
            <div id="auth-error-msg" class="error-message" style="display: none;"></div>

            <!-- Registration Submission Form -->
            <form id="register-form" class="stack-form">
              <!-- First Name Field -->
              <div class="input-group">
                <label for="reg-name">First Name</label>
                <input required type="text" id="reg-name" placeholder="Alex" />
              </div>
              <!-- Last Name Field -->
              <div class="input-group">
                <label for="reg-surname">Last Name</label>
                <input required type="text" id="reg-surname" placeholder="Morgan" />
              </div>
              <!-- Email Field -->
              <div class="input-group">
                <label for="reg-email">Email Address</label>
                <input required type="email" id="reg-email" placeholder="alex@example.com" />
              </div>
              <!-- Password Field -->
              <div class="input-group">
                <label for="reg-password">Password</label>
                <input required type="password" id="reg-password" placeholder="••••••••" />
              </div>
              <!-- Confirm Password Field -->
              <div class="input-group">
                <label for="reg-confirm">Confirm Password</label>
                <input required type="password" id="reg-confirm" placeholder="••••••••" />
              </div>
              <!-- Submit Button -->
              <button type="submit" class="btn-primary">Create Your Workspace</button>
            </form>

            <!-- Navigation switch to login screen -->
            <p class="auth-footer">Already have an account? <span id="link-to-login">Log in</span></p>
          </div>
        </div>
      </div>
    `;
  }

  // Fallback if not an auth view
  return '';
}

/**
 * attachAuthEvents(container)
 * Binds form submissions, validation checks, and view transitions for the Auth screen.
 * Parameters:
 *   - container: The DOM element containing the rendered auth markup (#app)
 */
export function attachAuthEvents(container) {
  // 1. Back to Workspace button: switches view back to main kanban board
  const backBtn = container.querySelector('#btn-back-to-website');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      store.setState({ view: 'website' });
    });
  }

  // 2. Switch link to Register view
  const toRegisterLink = container.querySelector('#link-to-register');
  if (toRegisterLink) {
    toRegisterLink.addEventListener('click', () => {
      store.setState({ view: 'register' });
    });
  }

  // 3. Switch link to Login view
  const toLoginLink = container.querySelector('#link-to-login');
  if (toLoginLink) {
    toLoginLink.addEventListener('click', () => {
      store.setState({ view: 'login' });
    });
  }

  // 4. Handle Login Form Submission
  const loginForm = container.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent standard browser page reload
      
      // Read user input values
      const email = container.querySelector('#login-email').value;
      const password = container.querySelector('#login-password').value;
      const errorDiv = container.querySelector('#auth-error-msg');

      // Fetch stored user profile from central state
      const { registeredUser } = store.getState();

      // Check if any user account has been registered yet
      if (!registeredUser) {
        errorDiv.textContent = 'No account found. Please create one first.';
        errorDiv.style.display = 'block'; // Make error visible
        return;
      }

      // Verify email and password credentials
      if (email === registeredUser.email && password === registeredUser.password) {
        // Successful login: update state to logged in and redirect to workspace
        store.setState({ isLoggedIn: true, view: 'website' });
      } else {
        // Failed login: display error message
        errorDiv.textContent = 'Invalid email or password.';
        errorDiv.style.display = 'block';
      }
    });
  }

  // 5. Handle Registration Form Submission
  const registerForm = container.querySelector('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent standard browser page reload
      
      // Read all input fields
      const name = container.querySelector('#reg-name').value;
      const surname = container.querySelector('#reg-surname').value;
      const email = container.querySelector('#reg-email').value;
      const password = container.querySelector('#reg-password').value;
      const confirm = container.querySelector('#reg-confirm').value;
      const errorDiv = container.querySelector('#auth-error-msg');

      // Validate matching passwords
      if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match!';
        errorDiv.style.display = 'block'; // Make error visible
        return;
      }

      // Create new user record object
      const newUser = { name, surname, email, password };
      
      // Save new user to state and LocalStorage, log them in, and switch to website view
      store.setState({
        registeredUser: newUser,
        isLoggedIn: true,
        view: 'website'
      });
    });
  }
}
