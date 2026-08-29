// import React, { useState } from 'react';
// import { Register, Login } from './login'; 
// import Website from './website'; // <-- This is the missing line that caused the crash!
// import './App.css';

// export default function App() {
//   const [view, setView] = useState('register'); 
  
//   const [registeredUser, setRegisteredUser] = useState(null);

//   if (view === 'register') {
//     return <Register onRegister={(user) => { setRegisteredUser(user); setView('login'); }} navigateToLogin={() => setView('login')} />;
//   }
  
//   if (view === 'login') {
//     return <Login registeredUser={registeredUser} onLogin={() => setView('workspace')} navigateToRegister={() => setView('register')} />;
//   }

//   return <Website registeredUser={registeredUser} onLogout={() => setView('login')} />;
// }
import React, { useState } from 'react';
import { Register, Login, Welcome } from './Login';
import Website from './Website';
import './App.css';

export default function App() {

  const [view, setView] = useState('welcome');
  const [registeredUser, setRegisteredUser] = useState(null);

  // WELCOME PAGE
  if (view === 'welcome') {
    return (
      <Welcome
        onStart={() => setView('login')}
      />
    );
  }

  // REGISTER PAGE
  if (view === 'register') {
    return (
      <Register
        onRegister={(user) => {
          setRegisteredUser(user);
          setView('login');
        }}
        navigateToLogin={() => setView('login')}
      />
    );
  }

  // LOGIN PAGE
  if (view === 'login') {
    return (
      <Login
        registeredUser={registeredUser}
        onLogin={() => setView('workspace')}
        navigateToRegister={() => setView('register')}
      />
    );
  }

  // WORKSPACE
  return (
    <Website
      registeredUser={registeredUser}
      onLogout={() => setView('login')}
    />
  );
}