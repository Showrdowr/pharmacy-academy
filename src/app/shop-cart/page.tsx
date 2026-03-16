
import { redirect } from 'next/navigation';

// Redirect shop-cart to checkout page
export default function ShopCartPage() {
    redirect('/checkout');
}
