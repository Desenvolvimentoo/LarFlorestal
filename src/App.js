import RoutesApp from './Routes/routes';
import { AuthProvider } from './contexts/auth';

const App = () => {
    return (
        <AuthProvider>
            <RoutesApp />
        </AuthProvider>
    );
};

export default App;
