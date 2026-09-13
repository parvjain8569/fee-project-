import { store } from '../state.js';

export function renderAuth(state) {
  const { view } = state;

  const leftHeroSection = `
    <div class="auth-hero-section">
      <div class="auth-hero-brand">
        <img src="/logo.png" alt="Boardly Logo" class="auth-hero-logo" />
        <div>
          <h1 class="auth-hero-title">Boardly</h1>
          <div class="auth-hero-tagline">PLAN • ORGANIZE • ACHIEVE</div>
        </div>
      </div>

      <h2 class="auth-hero-heading">Supercharge your productivity & team workflow</h2>
      <p class="auth-hero-subheading">A powerful Trello-style Kanban workspace designed for seamless project tracking, task management, and team collaboration.</p>

      <div class="auth-feature-list">
        <div class="auth-feature-card">
          <div class="feature-icon-badge blue-badge">⚡</div>
          <div>
            <div class="feature-title">Native Drag & Drop</div>
            <div class="feature-desc">Reorder cards across custom Kanban columns smoothly.</div>
          </div>
        </div>

        <div class="auth-feature-card">
          <div class="feature-icon-badge purple-badge">📁</div>
          <div>
            <div class="feature-title">Explorer File Tree</div>
            <div class="feature-desc">Manage multiple project boards, folders, and code files.</div>
          </div>
        </div>

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

  if (view === 'login') {
    return `
      <div class="auth-page-container">
        ${leftHeroSection}

        <div class="auth-form-wrapper">
          <div class="auth-box">
            <button id="btn-back-to-website" class="btn-back-link">← Back to Website</button>
            
            <div class="auth-box-header">
              <h2>Sign In</h2>
              <p>Welcome back! Please sign in to access your workspace.</p>
            </div>

            <div id="auth-error-msg" class="error-message" style="display: none;"></div>

            <form id="login-form" class="stack-form">
              <div class="input-group">
                <label for="login-email">Email Address</label>
                <input required type="email" id="login-email" placeholder="alex@example.com" />
              </div>
              <div class="input-group">
                <label for="login-password">Password</label>
                <input required type="password" id="login-password" placeholder="••••••••" />
              </div>
              <button type="submit" class="btn-primary">Sign In to Boardly</button>
            </form>

            <p class="auth-footer">Need an account? <span id="link-to-register">Create a new account</span></p>
          </div>
        </div>
      </div>
    `;
  }

  if (view === 'register') {
    return `
      <div class="auth-page-container">
        ${leftHeroSection}

        <div class="auth-form-wrapper">
          <div class="auth-box">
            <button id="btn-back-to-website" class="btn-back-link">← Back to Website</button>

            <div class="auth-box-header">
              <h2>Create an Account</h2>
              <p>Set up your Boardly workspace in seconds.</p>
            </div>

            <div id="auth-error-msg" class="error-message" style="display: none;"></div>

            <form id="register-form" class="stack-form">
              <div class="input-group">
                <label for="reg-name">First Name</label>
                <input required type="text" id="reg-name" placeholder="Alex" />
              </div>
              <div class="input-group">
                <label for="reg-surname">Last Name</label>
                <input required type="text" id="reg-surname" placeholder="Morgan" />
              </div>
              <div class="input-group">
                <label for="reg-email">Email Address</label>
                <input required type="email" id="reg-email" placeholder="alex@example.com" />
              </div>
              <div class="input-group">
                <label for="reg-password">Password</label>
                <input required type="password" id="reg-password" placeholder="••••••••" />
              </div>
              <div class="input-group">
                <label for="reg-confirm">Confirm Password</label>
                <input required type="password" id="reg-confirm" placeholder="••••••••" />
              </div>
              <button type="submit" class="btn-primary">Create Your Workspace</button>
            </form>

            <p class="auth-footer">Already have an account? <span id="link-to-login">Log in</span></p>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

export function attachAuthEvents(container) {
  const backBtn = container.querySelector('#btn-back-to-website');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      store.setState({ view: 'website' });
    });
  }

  const toRegisterLink = container.querySelector('#link-to-register');
  if (toRegisterLink) {
    toRegisterLink.addEventListener('click', () => {
      store.setState({ view: 'register' });
    });
  }

  const toLoginLink = container.querySelector('#link-to-login');
  if (toLoginLink) {
    toLoginLink.addEventListener('click', () => {
      store.setState({ view: 'login' });
    });
  }

  // Handle Login submission
  const loginForm = container.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value;
      const password = container.querySelector('#login-password').value;
      const errorDiv = container.querySelector('#auth-error-msg');

      const { registeredUser } = store.getState();

      if (!registeredUser) {
        errorDiv.textContent = 'No account found. Please create one first.';
        errorDiv.style.display = 'block';
        return;
      }

      if (email === registeredUser.email && password === registeredUser.password) {
        store.setState({ isLoggedIn: true, view: 'website' });
      } else {
        errorDiv.textContent = 'Invalid email or password.';
        errorDiv.style.display = 'block';
      }
    });
  }

  // Handle Register submission
  const registerForm = container.querySelector('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#reg-name').value;
      const surname = container.querySelector('#reg-surname').value;
      const email = container.querySelector('#reg-email').value;
      const password = container.querySelector('#reg-password').value;
      const confirm = container.querySelector('#reg-confirm').value;
      const errorDiv = container.querySelector('#auth-error-msg');

      if (password !== confirm) {
        errorDiv.textContent = 'Passwords do not match!';
        errorDiv.style.display = 'block';
        return;
      }

      const newUser = { name, surname, email, password };
      store.setState({
        registeredUser: newUser,
        isLoggedIn: true,
        view: 'website'
      });
    });
  }
}
