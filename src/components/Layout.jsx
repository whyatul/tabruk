import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col font-sans relative">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
}
