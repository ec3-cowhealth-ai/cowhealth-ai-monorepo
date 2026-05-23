import { RegisterForm } from '@features/auth/components/RegisterForm';

export const RegisterPage = () => (
  <div
    style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--s-4)',
      background: 'var(--bg-app)',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg-elev-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        padding: 'var(--s-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-4)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--t-h1)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          CowHealth AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--s-1)' }}>
          Crie sua conta
        </p>
      </div>

      <RegisterForm />
    </div>
  </div>
);
