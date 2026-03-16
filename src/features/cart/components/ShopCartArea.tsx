"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import { useLanguage } from '@/features/i18n';

const ShopCartArea = () => {
    const { t } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [quantity2, setQuantity2] = useState(1);

    const increment = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const decrement = () => {
        setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    };


    const increment2 = () => {
        setQuantity2((prevQuantity2) => prevQuantity2 + 1);
    };

    const decrement2 = () => {
        setQuantity2((prevQuantity2) => (prevQuantity2 > 1 ? prevQuantity2 - 1 : 1));
    };




    return (
        <>
            <div className="cart-section section-padding">
                <div className="container">
                    <div className="cart-list-area">
                        <div className="table-responsive">
                            <table className="table common-table">
                                <thead data-aos="fade-down">
                                    <tr>
                                        <th className="text-center">{t('สินค้า', 'Product')}</th>
                                        <th className="text-center">{t('ราคา', 'Price')}</th>
                                        <th className="text-center">{t('จำนวน', 'Quantity')}</th>
                                        <th className="text-center">{t('ยอดรวมย่อย', 'Subtotal')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-items-center py-3">
                                        <td>
                                            <div className="cart-item-thumb d-flex align-items-center gap-4">
                                                <i className="fas fa-times"></i>
                                                <img className="w-100" src="assets/img/courses/01.jpg" alt="product" />
                                                <span className="head text-nowrap">{t('เภสัชวิทยาคลินิกเบื้องต้น', 'Clinical Pharmacology Basics')}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="price-usd">
                                                ฿1,500 {t('บาท', 'THB')}
                                            </span>
                                        </td>
                                        <td className="price-quantity text-center">
                                            <div className="quantity d-inline-flex align-items-center justify-content-center gap-1 py-2 px-4 border n50-border_20 text-sm">




                                                <button className="quantityDecrement" onClick={decrement2}>
                                                    <i className="fal fa-minus"></i>
                                                </button>
                                                <input
                                                    type="text"
                                                    value={quantity2}
                                                    className="quantityValue"
                                                    readOnly
                                                />
                                                <button className="quantityIncrement" onClick={increment2}>
                                                    <i className="fal fa-plus"></i>
                                                </button>

                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="price-usd">
                                                ฿1,500 {t('บาท', 'THB')}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="align-items-center py-3">
                                        <td>
                                            <div className="cart-item-thumb d-flex align-items-center gap-4">
                                                <i className="fas fa-times"></i>
                                                <img className="w-100" src="assets/img/courses/02.jpg" alt="product" />
                                                <span className="head text-nowrap">{t('การบริบาลผู้ป่วยเบาหวาน', 'Diabetes Patient Care')}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="price-usd">
                                                ฿1,800 {t('บาท', 'THB')}
                                            </span>
                                        </td>
                                        <td className="price-quantity text-center">
                                            <div className="quantity d-inline-flex align-items-center justify-content-center gap-1 py-2 px-4 border n50-border_20 text-sm">


                                                <button className="quantityDecrement" onClick={decrement}>
                                                    <i className="fal fa-minus"></i>
                                                </button>
                                                <input
                                                    type="text"
                                                    value={quantity}
                                                    className="quantityValue"
                                                    readOnly
                                                />
                                                <button className="quantityIncrement" onClick={increment}>
                                                    <i className="fal fa-plus"></i>
                                                </button>

                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="price-usd">
                                                ฿1,800 {t('บาท', 'THB')}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>


            <div className="cart-total-area section-padding pt-0">
                <div className="container">
                    <div className="cart-total-items">
                        <h3>{t('รวมตะกร้า', 'Cart Totals')}</h3>
                        <ul>
                            <li>
                                {t('ยอดรวมย่อย', 'Subtotal')} <span className="subtotal">฿3,300 {t('บาท', 'THB')}</span>
                            </li>
                            <li>
                                {t('ยอดรวม', 'Total')} <span className="price">฿3,300 {t('บาท', 'THB')}</span>
                            </li>
                        </ul>
                        <Link href="/checkout" className="theme-btn">{t('ดำเนินการชำระเงิน', 'Proceed to Checkout')}</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShopCartArea;