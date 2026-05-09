import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import ResultsDashboard from './components/results/ResultsDashboard';
import ComparisonDashboard from './components/results/ComparisonDashboard';
import { useAudit } from './hooks/useAudit';

function App() {
  const { state, audit, reset } = useAudit();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {state.status === 'idle' || state.status === 'loading' || state.status === 'error' ? (
          <HeroSection 
            onAudit={audit} 
            loading={state.status === 'loading'} 
            error={state.status === 'error' ? state.message : undefined} 
          />
        ) : null}

        {state.status === 'success' && state.data.length === 1 && (
          <ResultsDashboard data={state.data[0]} onNewAudit={reset} />
        )}
        
        {state.status === 'success' && state.data.length === 2 && (
          <ComparisonDashboard data1={state.data[0]} data2={state.data[1]} onNewAudit={reset} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
