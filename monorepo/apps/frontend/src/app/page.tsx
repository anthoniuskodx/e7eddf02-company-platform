export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Welcome to Next.js Frontend</h1>
      <p>This is a monorepo setup with NestJS backend and Next.js frontend.</p>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Features:</h2>
        <ul>
          <li>TypeScript support</li>
          <li>GitHub Actions CI/CD</li>
          <li>Docker containerization</li>
          <li>Monorepo structure</li>
        </ul>
      </div>
    </main>
  );
}
